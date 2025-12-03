import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../lib/auth';
import { Colors } from '../lib/theme';

const INTRO_SEEN_KEY = 'gutsync_intro_seen_v2';

export default function AppRouter() {
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);
  const [checkingIntro, setCheckingIntro] = useState(true);
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    checkIntroStatus();
    
    // Force ready after 5 seconds to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Force ready triggered');
      setForceReady(true);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);

  const checkIntroStatus = async () => {
    try {
      const seen = await SecureStore.getItemAsync(INTRO_SEEN_KEY);
      setHasSeenIntro(seen === 'true');
    } catch {
      setHasSeenIntro(false);
    } finally {
      setCheckingIntro(false);
    }
  };

  // Debug log
  useEffect(() => {
    console.log('Router state:', { isLoading, isAuthenticated, hasCompletedOnboarding, hasSeenIntro, checkingIntro, forceReady });
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, hasSeenIntro, checkingIntro, forceReady]);

  // Show loading while checking status (with timeout safety)
  if ((isLoading || checkingIntro) && !forceReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Flow:
  // 1. First time user → Show intro slides
  // 2. Not authenticated → Show login/signup
  // 3. Authenticated → Show home (skip onboarding check for now)

  // If intro check hasn't completed, default to true (skip intro)
  if (hasSeenIntro === false) {
    return <Redirect href="/(intro)" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If authenticated, go straight to tabs
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
