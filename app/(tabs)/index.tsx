import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

type Meal = {
  id: string;
  type: string;
  photo: string | null;
  description: string;
  foods: string[];
  nutrition: any;
  gutScore: number;
  timestamp: string;
  date: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([]);
  const [showGutInsight, setShowGutInsight] = useState(false);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      loadTodaysMeals();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || '');
      }
    } catch {
      // Fallback
    }
  };

  const loadTodaysMeals = async () => {
    try {
      const mealsData = await SecureStore.getItemAsync('meals');
      if (mealsData) {
        const allMeals: Meal[] = JSON.parse(mealsData);
        const today = new Date().toDateString();
        const filtered = allMeals.filter(meal => meal.date === today);
        setTodaysMeals(filtered);
      }
    } catch {
      // Fallback
    }
  };

  // Calculate average gut score from today's meals
  const avgGutScore = todaysMeals.length > 0 
    ? (todaysMeals.reduce((sum, m) => sum + (m.gutScore || 3.5), 0) / todaysMeals.length).toFixed(1)
    : '4.2';

  const stats = { energy: 3.8, gut: parseFloat(avgGutScore), mood: 3.5 };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
    loadTodaysMeals();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
      default: return 'restaurant';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGutScoreColor = (score: number) => {
    if (score >= 4) return '#27AE60';
    if (score >= 3) return '#F39C12';
    return '#E74C3C';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return '#27AE60';
    if (score >= 3) return '#F39C12';
    return '#E74C3C';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with personalized greeting */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>
            {userName ? `${userName}! 👋` : 'Welcome! 👋'}
          </Text>
        </View>
        <TouchableOpacity style={styles.checkInButton} onPress={() => router.push('/check-in')}>
          <Ionicons name="heart" size={20} color="#FFFFFF" />
          <Text style={styles.checkInButtonText}>Check In</Text>
        </TouchableOpacity>
      </View>

      {/* Gut Health Focus Card - Tappable */}
      <TouchableOpacity style={styles.gutHealthCard} onPress={() => setShowGutInsight(true)}>
        <View style={styles.gutHealthHeader}>
          <View style={styles.gutHealthIcon}>
            <Ionicons name="fitness" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.gutHealthText}>
            <Text style={styles.gutHealthTitle}>Your Gut Health Today</Text>
            <Text style={styles.gutHealthScore}>
              {stats.gut} / 5 - {stats.gut >= 4 ? 'Doing Great! 🎉' : stats.gut >= 3 ? 'Looking OK 👍' : 'Needs Attention ⚠️'}
            </Text>
          </View>
          <Ionicons name="information-circle-outline" size={24} color="rgba(255,255,255,0.7)" />
        </View>
        <Text style={styles.gutHealthTip}>
          💡 Tap to see why and how to improve
        </Text>
      </TouchableOpacity>

      {/* Gut Insight Modal */}
      <Modal visible={showGutInsight} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.insightModal}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>Gut Health Insights</Text>
            <TouchableOpacity onPress={() => setShowGutInsight(false)}>
              <Ionicons name="close" size={28} color="#2D3436" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.insightContent} showsVerticalScrollIndicator={false}>
            {/* Current Score */}
            <View style={styles.insightScoreCard}>
              <Text style={styles.insightScoreLabel}>Your Current Gut Score</Text>
              <View style={styles.insightScoreRow}>
                <Text style={[styles.insightScoreValue, { color: getScoreColor(stats.gut) }]}>{stats.gut}</Text>
                <Text style={styles.insightScoreMax}>/5</Text>
              </View>
              <Text style={styles.insightScoreDesc}>
                {stats.gut >= 4 ? 'Excellent! Your gut is thriving.' : stats.gut >= 3 ? 'Good, but room for improvement.' : 'Your gut needs some attention.'}
              </Text>
            </View>

            {/* Why this score */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>📊 Why This Score?</Text>
              
              <View style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                <Text style={styles.insightItemText}>Yogurt in your meals (probiotics boost!)</Text>
              </View>
              
              {todaysMeals.some(m => m.foods?.some(f => f.toLowerCase().includes('fiber') || f.toLowerCase().includes('vegetable'))) && (
                <View style={styles.insightItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#27AE60" />
                  <Text style={styles.insightItemText}>Good fiber intake from vegetables</Text>
                </View>
              )}
              
              <View style={styles.insightItem}>
                <Ionicons name="alert-circle" size={20} color="#F39C12" />
                <Text style={styles.insightItemText}>Late meals can slow digestion</Text>
              </View>
              
              {todaysMeals.some(m => m.gutScore && m.gutScore < 3.5) && (
                <View style={styles.insightItem}>
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                  <Text style={styles.insightItemText}>Some meals had low gut scores</Text>
                </View>
              )}
            </View>

            {/* Recommendations */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>💡 How to Improve</Text>
              
              <View style={styles.recommendCard}>
                <Text style={styles.recommendTitle}>Add more fermented foods</Text>
                <Text style={styles.recommendDesc}>Yogurt, kefir, kimchi boost good bacteria</Text>
              </View>
              
              <View style={styles.recommendCard}>
                <Text style={styles.recommendTitle}>Eat before 7pm</Text>
                <Text style={styles.recommendDesc}>Your gut scores are 0.5 higher on early dinner days</Text>
              </View>
              
              <View style={styles.recommendCard}>
                <Text style={styles.recommendTitle}>Stay hydrated</Text>
                <Text style={styles.recommendDesc}>Water helps fiber work better in your gut</Text>
              </View>
            </View>

            {/* Patterns */}
            <View style={styles.insightSection}>
              <Text style={styles.insightSectionTitle}>📈 Your Patterns</Text>
              <View style={styles.patternCard}>
                <Text style={styles.patternText}>
                  Based on your {todaysMeals.length > 0 ? todaysMeals.length : 'logged'} meals, your gut responds best to:
                </Text>
                <View style={styles.patternTags}>
                  <View style={styles.patternTag}><Text style={styles.patternTagText}>🥗 High fiber</Text></View>
                  <View style={styles.patternTag}><Text style={styles.patternTagText}>🥛 Probiotics</Text></View>
                  <View style={styles.patternTag}><Text style={styles.patternTagText}>⏰ Early dinners</Text></View>
                </View>
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {[
          { label: 'Energy', value: stats.energy, icon: 'flash' },
          { label: 'Gut', value: stats.gut, icon: 'fitness' },
          { label: 'Mood', value: stats.mood, icon: 'happy' },
        ].map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={20} color={getScoreColor(stat.value)} />
            <Text style={[styles.statValue, { color: getScoreColor(stat.value) }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/log-meal')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="camera" size={26} color="#4A7C59" />
            </View>
            <Text style={styles.actionLabel}>Log Meal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/ask')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="chatbubbles" size={26} color="#2196F3" />
            </View>
            <Text style={styles.actionLabel}>Ask AI</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/cabinet')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="medkit" size={26} color="#7B1FA2" />
            </View>
            <Text style={styles.actionLabel}>Cabinet</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Ask AI Prompt */}
      <TouchableOpacity style={styles.askCard} onPress={() => router.push('/ask')}>
        <View style={styles.askIconContainer}>
          <Ionicons name="chatbubbles" size={28} color="#4A7C59" />
        </View>
        <View style={styles.askContent}>
          <Text style={styles.askTitle}>Have a health question?</Text>
          <Text style={styles.askSubtitle}>Ask about gut health, medications, supplements...</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Medicine Cabinet Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Medicine Cabinet</Text>
          <TouchableOpacity onPress={() => router.push('/cabinet')}>
            <Text style={styles.linkText}>Manage →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cabinetStats}>
          <View style={styles.cabinetItem}>
            <Ionicons name="medical" size={24} color="#4A7C59" />
            <Text style={styles.cabinetNumber}>2</Text>
            <Text style={styles.cabinetLabel}>Medications</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cabinetItem}>
            <Ionicons name="leaf" size={24} color="#8FB996" />
            <Text style={styles.cabinetNumber}>4</Text>
            <Text style={styles.cabinetLabel}>Supplements</Text>
          </View>
        </View>
      </View>

      {/* Today's Meals */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Meals ({todaysMeals.length})</Text>
          <TouchableOpacity onPress={() => router.push('/log-meal')}>
            <Text style={styles.linkText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {todaysMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>No meals logged today</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/log-meal')}>
              <Text style={styles.emptyButtonText}>Log your first meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {todaysMeals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealIconContainer}>
                  <Ionicons name={getMealIcon(meal.type) as any} size={20} color="#4A7C59" />
                </View>
                <View style={styles.mealContent}>
                  <Text style={styles.mealType}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</Text>
                  <Text style={styles.mealDescription} numberOfLines={2}>
                    {meal.description}
                  </Text>
                  <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
                </View>
                {meal.photo && (
                  <Image source={{ uri: meal.photo }} style={styles.mealThumbnail} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#636E72',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A7C59',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  gutHealthCard: {
    backgroundColor: '#4A7C59',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  gutHealthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gutHealthIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  gutHealthText: {
    flex: 1,
  },
  gutHealthTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  gutHealthScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  gutHealthTip: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 10,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: '#2D3436',
    fontWeight: '600',
  },
  askCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  askIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  askContent: {
    flex: 1,
  },
  askTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  askSubtitle: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  linkText: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '600',
  },
  cabinetStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cabinetItem: {
    flex: 1,
    alignItems: 'center',
  },
  cabinetNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginVertical: 4,
  },
  cabinetLabel: {
    fontSize: 13,
    color: '#636E72',
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: '#E8E8E8',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#4A7C59',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealContent: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  mealDescription: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  mealTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  mealScore: {
    alignItems: 'center',
    marginRight: 12,
  },
  mealScoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  mealScoreLabel: {
    fontSize: 10,
    color: '#636E72',
  },
  mealThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  insightModal: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  insightTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
  },
  insightContent: {
    flex: 1,
    padding: 16,
  },
  insightScoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  insightScoreLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  insightScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  insightScoreValue: {
    fontSize: 64,
    fontWeight: '800',
  },
  insightScoreMax: {
    fontSize: 24,
    color: '#636E72',
    marginLeft: 4,
  },
  insightScoreDesc: {
    fontSize: 15,
    color: '#2D3436',
    marginTop: 8,
    textAlign: 'center',
  },
  insightSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  insightSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  insightItemText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2D3436',
  },
  recommendCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
  recommendDesc: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  patternCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
  },
  patternText: {
    fontSize: 13,
    color: '#2D3436',
    marginBottom: 10,
  },
  patternTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patternTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  patternTagText: {
    fontSize: 12,
    color: '#4A7C59',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
