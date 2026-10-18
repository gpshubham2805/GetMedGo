
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { isOnboardingDone } from '@/utils/storage';

export default function Index() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.96)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;

    const entrance = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 700,
        delay: 180,
        useNativeDriver: true,
      }),
    ]);

    entrance.start();

    const timer = setTimeout(async () => {
      try {
        const done = await isOnboardingDone();

        if (active) {
          router.replace(done ? '/(tabs)/home' : '/onboarding');
        }
      } catch {
        if (active) {
          router.replace('/onboarding');
        }
      }
    }, 3500);

    return () => {
      active = false;
      clearTimeout(timer);
      entrance.stop();
      fade.stopAnimation();
      logoScale.stopAnimation();
      contentFade.stopAnimation();
    };
  }, [router, fade, logoScale, contentFade]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="GetMedGo logo"
          />
        </View>

        <Animated.View
          style={[styles.brand, { opacity: contentFade }]}
        >
          <Text style={styles.appName}>GetMedGo</Text>
          <Text style={styles.tagline}>
            Your prescription, made clearer.
          </Text>
        </Animated.View>

        <View style={styles.loading}>
          <ActivityIndicator
            size="small"
            color="#38BDF8"
          />
          <Text style={styles.loadingText}>Making Prescription Easy</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>
          YOUR HEALTH. YOUR UNDERSTANDING.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginTop: -16,
  },
  logoContainer: {
    width: 124,
    height: 124,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brand: {
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  tagline: {
    color: '#A8B7CA',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 9,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 48,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    alignItems: 'center',
    gap: 13,
  },
  footerLine: {
    width: 30,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  footerText: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
