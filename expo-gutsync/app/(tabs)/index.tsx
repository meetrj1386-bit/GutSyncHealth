import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const theme = {
  primary: '#4A7C59',
  secondary: '#8FB996',
  accent: '#F4A261',
  background: '#FAFDF6',
  card: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    weeklyAverages: { avg_energy: 3.8, avg_gut: 4.0, avg_mood: 3.5 },
    todaysMeals: [],
    counts: { medications: 2, supplements: 4 },
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Fetch data from API
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return theme.success;
    if (score >= 3) return theme.accent;
    return theme.error;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>Welcome! 👋</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Energy</Text>
          <Text style={[styles.statValue, { color: getScoreColor(data.weeklyAverages.avg_energy) }]}>
            {data.weeklyAverages.avg_energy}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gut</Text>
          <Text style={[styles.statValue, { color: getScoreColor(data.weeklyAverages.avg_gut) }]}>
            {data.weeklyAverages.avg_gut}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Mood</Text>
          <Text style={[styles.statValue, { color: getScoreColor(data.weeklyAverages.avg_mood) }]}>
            {data.weeklyAverages.avg_mood}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/log-meal')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="camera" size={24} color={theme.primary} />
            </View>
            <Text style={styles.actionText}>Log Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/check-in')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="heart" size={24} color={theme.accent} />
            </View>
            <Text style={styles.actionText}>Check In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/cabinet')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="medical" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Cabinet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Medicine Cabinet Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Medicine Cabinet</Text>
          <TouchableOpacity onPress={() => router.push('/cabinet')}>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cabinetSummary}>
          <View style={styles.cabinetItem}>
            <Ionicons name="medical" size={20} color={theme.primary} />
            <Text style={styles.cabinetCount}>{data.counts.medications}</Text>
            <Text style={styles.cabinetLabel}>Medications</Text>
          </View>
          <View style={styles.cabinetDivider} />
          <View style={styles.cabinetItem}>
            <Ionicons name="leaf" size={20} color={theme.secondary} />
            <Text style={styles.cabinetCount}>{data.counts.supplements}</Text>
            <Text style={styles.cabinetLabel}>Supplements</Text>
          </View>
        </View>
      </View>

      {/* Today's Meals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity onPress={() => router.push('/log-meal')}>
            <Text style={styles.seeAllText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={40} color={theme.textLight} />
          <Text style={styles.emptyText}>No meals logged today</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/log-meal')}
          >
            <Text style={styles.emptyButtonText}>Log your first meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: theme.textLight,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  seeAllText: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: theme.text,
    fontWeight: '500',
  },
  cabinetSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  cabinetItem: {
    flex: 1,
    alignItems: 'center',
  },
  cabinetCount: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    marginVertical: 4,
  },
  cabinetLabel: {
    fontSize: 12,
    color: theme.textLight,
  },
  cabinetDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.primary,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 20,
  },
});
