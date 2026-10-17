import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@/constants/theme';
import ScanCard from '@/components/ScanCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import {
  getScanHistory,
  clearAllHistory,
  deleteScanResult,
} from '@/utils/storage';
import { ScanHistoryItem } from '@/types/prescription';

export default function HistoryScreen() {
  const router = useRouter();

  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = scans.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      (item.summary || '').toLowerCase().includes(query) ||
      (item.diagnosis || '').toLowerCase().includes(query)
    );
  });

  const loadData = useCallback(async () => {
    try {
      const history = await getScanHistory();
      setScans(history);
    } catch (error) {
      console.error('Failed to load scan history:', error);
      Alert.alert('Error', 'Unable to load scan history.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // ScanCard already confirms deletion, so this handler deletes directly.
  const handleDelete = async (id: string) => {
    try {
      await deleteScanResult(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete prescription:', error);
      Alert.alert('Error', 'Unable to delete this prescription.');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all scan history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllHistory();
              setScans([]);
              setSearch('');
            } catch (error) {
              console.error('Failed to clear scan history:', error);
              Alert.alert('Error', 'Unable to clear scan history.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSubtitle}>
            {scans.length > 0
              ? `${scans.length} prescription${
                  scans.length !== 1 ? 's' : ''
                } saved`
              : 'No prescriptions yet'}
          </Text>
        </View>

        {scans.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear all scan history"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={Colors.error}
            />
          </TouchableOpacity>
        )}
      </View>

      {scans.length > 0 && (
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.textTertiary}
          />

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by diagnosis or summary..."
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {scans.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No scan history"
          message="Prescriptions you scan will appear here for easy access later"
          action={
            <Button
              title="Scan a Prescription"
              onPress={() => router.push('/scan')}
              icon={
                <Ionicons
                  name="camera-outline"
                  size={18}
                  color={Colors.textInverse}
                />
              }
            />
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          message={`No prescriptions match "${search}"`}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ScanCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/detail',
                  params: { id: item.id },
                })
              }
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.h2,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
  },
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.massive,
  },
  separator: {
    height: Spacing.md,
  },
});