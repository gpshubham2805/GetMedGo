
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@/constants/theme';
import {
  ChatMessage,
  PrescriptionResult,
} from '@/types/prescription';
import { chatWithAI } from '@/utils/ai';
import {
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getActivePrescription,
  getScanResult,
  setActivePrescription,
} from '@/utils/storage';

// -----------------------------------------------------------------------------
// Animated AI logo
// -----------------------------------------------------------------------------

function AnimatedAILogo({ size = 28 }: { size?: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0.7,
            duration: 750,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [scale, glow]);

  return (
    <Animated.View
      style={[
        styles.aiLogo,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: glow,
          transform: [{ scale }],
        },
      ]}
    >
      <Ionicons
        name="sparkles"
        size={size * 0.55}
        color="#FFFFFF"
      />
    </Animated.View>
  );
}

// -----------------------------------------------------------------------------
// Chat screen
// -----------------------------------------------------------------------------

export default function ChatScreen() {
  const params = useLocalSearchParams<{
    prescriptionId?: string | string[];
    autoSummary?: string | string[];
  }>();

  const router = useRouter();

  const prescriptionId = Array.isArray(params.prescriptionId)
    ? params.prescriptionId[0]
    : params.prescriptionId;

  const autoSummary = Array.isArray(params.autoSummary)
    ? params.autoSummary[0]
    : params.autoSummary;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePrescription, setActivePrescriptionState] =
    useState<PrescriptionResult | null>(null);
  const [chatContextId, setChatContextId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');

  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Prevent duplicate automatic summaries for the same prescription
  // during this screen's lifetime.
  const processedSummaryIds = useRef<Set<string>>(new Set());
  const requestInProgress = useRef(false);
  const mountedRef = useRef(true);
  const loadRequestId = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      loadRequestId.current += 1;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Load the correct prescription and its separate conversation
  // ---------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    const requestId = ++loadRequestId.current;

    try {
      setLoadError('');

      let prescription: PrescriptionResult | null = null;

      if (prescriptionId) {
        prescription = await getScanResult(prescriptionId);

        if (prescription) {
          await setActivePrescription(prescription.id);
        } else {
          setLoadError(
            'This saved prescription could not be found. You can still ask general health questions.'
          );
        }
      } else {
        prescription = await getActivePrescription();
      }

      if (!mountedRef.current || requestId !== loadRequestId.current) {
        return;
      }

      setActivePrescriptionState(prescription);

      // Use the selected prescription's ID for its chat.
      // Without a prescription, use the separate general-chat history.
      const resolvedContextId = prescription?.id || null;

      setChatContextId(resolvedContextId);

      const history = await getChatHistory(resolvedContextId);

      if (!mountedRef.current || requestId !== loadRequestId.current) {
        return;
      }

      setMessages(history);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Generate an automatic summary when requested from a scan result.
      if (
        autoSummary === 'true' &&
        prescriptionId &&
        prescription &&
        !processedSummaryIds.current.has(prescription.id) &&
        !requestInProgress.current
      ) {
        processedSummaryIds.current.add(prescription.id);
        requestInProgress.current = true;
        setLoading(true);

        try {
          const summaryId = `summary-${prescription.id}`;

          // Check the selected prescription's history, not another chat.
          const latestHistory = await getChatHistory(resolvedContextId);

          const alreadySaved = latestHistory.some(
            (message) => message.id === summaryId
          );

          if (alreadySaved) {
            if (mountedRef.current) {
              setMessages(latestHistory);
            }
          } else {
            const prompt = [
              'Give me a brief, easy-to-understand summary of this scanned prescription.',
              'Explain the recorded diagnosis or purpose, list the medicines and their recorded instructions if available, and highlight important precautions or possible interaction warnings present in the supplied data.',
              'Do not invent missing or unreadable details, infer a dose that is not recorded, or tell me to change prescribed treatment.',
              'Mention when information is missing or uncertain and advise confirming unclear instructions with a pharmacist or prescriber.',
              'Finish by inviting me to ask questions about this prescription.',
            ].join(' ');

            const summary = await chatWithAI(
              prompt,
              prescription,
              []
            );

            if (
              !mountedRef.current ||
              requestId !== loadRequestId.current
            ) {
              return;
            }

            const summaryMessage: ChatMessage = {
              id: summaryId,
              role: 'assistant',
              content: summary,
              timestamp: new Date().toISOString(),
            };

            // Re-read before saving to reduce the chance of duplicate entries.
            const currentHistory = await getChatHistory(resolvedContextId);

            const stillNotSaved = !currentHistory.some(
              (message) => message.id === summaryId
            );

            if (stillNotSaved) {
              const updatedHistory = [
                ...currentHistory,
                summaryMessage,
              ];

              await saveChatHistory(
                updatedHistory,
                resolvedContextId
              );

              if (mountedRef.current) {
                setMessages(updatedHistory);
              }
            } else if (mountedRef.current) {
              setMessages(currentHistory);
            }
          }
        } catch (error) {
          console.error('Prescription summary error:', error);

          if (
            mountedRef.current &&
            requestId === loadRequestId.current
          ) {
            const errorMessage: ChatMessage = {
              id: `summary-error-${prescription.id}-${Date.now()}`,
              role: 'assistant',
              content:
                'I could not summarize this prescription right now. You can still ask a question or try again.',
              timestamp: new Date().toISOString(),
            };

            setMessages((current) => [...current, errorMessage]);
          }
        } finally {
          requestInProgress.current = false;

          if (mountedRef.current) {
            setLoading(false);
          }

          // Remove the one-time trigger from the route.
          if (requestId === loadRequestId.current) {
            router.setParams({ autoSummary: undefined });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);

      if (mountedRef.current && requestId === loadRequestId.current) {
        setLoadError('Could not load chat data. Please try again.');
      }
    }
  }, [prescriptionId, autoSummary, fadeAnim, router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ---------------------------------------------------------------------------
  // Send a message
  // ---------------------------------------------------------------------------

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const reply = await chatWithAI(
        text,
        activePrescription,
        updatedMessages.slice(-10)
      );

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        assistantMessage,
      ];

      setMessages(finalMessages);

      await saveChatHistory(finalMessages, chatContextId);
    } catch (error) {
      console.error('AI chat error:', error);

      const errorMessage: ChatMessage = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content:
          'Sorry, something went wrong. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        errorMessage,
      ];

      setMessages(finalMessages);

      await saveChatHistory(finalMessages, chatContextId);
    } finally {
      setLoading(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  };

  // ---------------------------------------------------------------------------
  // Clear only the current conversation
  // ---------------------------------------------------------------------------

  const handleClear = () => {
    Alert.alert(
      'Clear conversation?',
      'This will delete messages from this conversation only. Your saved prescription will not be deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearChatHistory(chatContextId);
              setMessages([]);
            } catch (error) {
              console.error('Could not clear chat:', error);
              setLoadError('Could not clear the conversation. Please try again.');
            }
          },
        },
      ]
    );
  };

  const quickQuestions = [
    'What can I take for a headache?',
    'What are common side effects of paracetamol?',
    'How can I manage a mild sore throat?',
    'Can medicines interact with each other?',
  ];

  // ---------------------------------------------------------------------------
  // Message renderer
  // ---------------------------------------------------------------------------

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    const parsedTimestamp = new Date(item.timestamp);
    const timeLabel = Number.isNaN(parsedTimestamp.getTime())
      ? ''
      : parsedTimestamp.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });

    return (
      <View
        style={[
          styles.msgRow,
          isUser ? styles.msgRowUser : styles.msgRowAI,
        ]}
      >
        {!isUser && <AnimatedAILogo size={28} />}

        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAI,
          ]}
        >
          <Text
            style={[
              styles.msgText,
              isUser ? styles.msgTextUser : styles.msgTextAI,
            ]}
          >
            {item.content}
          </Text>

          {timeLabel ? (
            <Text
              style={[
                styles.msgTime,
                isUser && { color: 'rgba(255,255,255,0.7)' },
              ]}
            >
              {timeLabel}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AnimatedAILogo size={40} />

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {activePrescription
                ? 'Prescription loaded'
                : 'General health questions'}
            </Text>
          </View>
        </View>

        {messages.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear current conversation"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {activePrescription && (
        <View style={styles.contextBadge}>
          <Ionicons
            name="documents"
            size={14}
            color={Colors.primary}
          />

          <Text style={styles.contextText} numberOfLines={1}>
            Using: {activePrescription.diagnosis || 'Scanned prescription'} (
            {activePrescription.medicines.length} medicines)
          </Text>
        </View>
      )}

      {loadError ? (
        <Text style={styles.loadError}>{loadError}</Text>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <Animated.View
            style={[
              styles.emptyContainer,
              { opacity: fadeAnim },
            ]}
          >
            <View style={styles.emptyIcon}>
              <AnimatedAILogo size={48} />
            </View>

            <Text style={styles.emptyTitle}>
              {activePrescription
                ? 'Ask about your prescription'
                : 'Ask me anything'}
            </Text>

            <Text style={styles.emptySubtitle}>
              I can explain medicines and general health topics. For
              unclear prescription instructions or personal treatment
              decisions, check with your doctor or pharmacist.
            </Text>

            <View style={styles.quickQuestions}>
              {quickQuestions.map((question) => (
                <TouchableOpacity
                  key={question}
                  style={styles.quickBtn}
                  onPress={() => setInput(question)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickBtnText}>
                    {question}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        {loading && (
          <View style={styles.typingRow}>
            <AnimatedAILogo size={28} />
            <View style={styles.typingBubble}>
              <TypingDots />
            </View>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask any health or medicine question..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={sendMessage}
            accessibilityLabel="Message input"
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={20}
              color={Colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------------------------
// Typing indicator
// -----------------------------------------------------------------------------

function TypingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const anims = [dot1, dot2, dot3];

  useEffect(() => {
    const animations = anims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.timing(anim, {
            toValue: -6,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingDots}>
      {anims.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            { transform: [{ translateY: anim }] },
          ]}
        />
      ))}
    </View>
  );
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  aiLogo: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.h4,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primarySurface,
    marginHorizontal: Spacing.xxl,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  contextText: {
    fontSize: Typography.tiny,
    color: Colors.primaryDark,
    fontWeight: Typography.medium,
    flex: 1,
  },
  loadError: {
    color: Colors.textSecondary,
    fontSize: Typography.tiny,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  quickQuestions: {
    width: '100%',
    gap: Spacing.sm,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickBtnText: {
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  messagesList: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAI: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  msgText: {
    fontSize: Typography.bodySmall,
    lineHeight: 22,
  },
  msgTextUser: {
    color: Colors.textInverse,
  },
  msgTextAI: {
    color: Colors.textPrimary,
  },
  msgTime: {
    fontSize: Typography.tiny,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.sm,
  },
  typingBubble: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
