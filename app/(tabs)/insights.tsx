import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Weekly Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Weekly Summary</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'Energy', value: '3.8', trend: '+0.3', up: true },
            { label: 'Gut', value: '4.1', trend: '+0.5', up: true },
            { label: 'Mood', value: '3.5', trend: '0.0', up: false },
          ].map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.trendBadge}>
                <Ionicons
                  name={stat.up ? 'arrow-up' : 'remove'}
                  size={12}
                  color={stat.up ? '#27AE60' : '#9CA3AF'}
                />
                <Text style={[styles.trendText, stat.up && styles.trendUp]}>{stat.trend}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.adherenceSection}>
          <View style={styles.adherenceHeader}>
            <Text style={styles.adherenceLabel}>Medication Adherence</Text>
            <Text style={styles.adherenceValue}>92%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '92%' }]} />
          </View>
        </View>
      </View>

      {/* Patterns */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔍 Patterns Detected</Text>

        {[
          {
            emoji: '☕',
            title: 'Coffee + Iron = Low Absorption',
            description: 'Your iron works 80% better when taken 2 hours away from coffee.',
            color: '#FFEBEE',
          },
          {
            emoji: '🍝',
            title: 'Heavy Carbs → Afternoon Fatigue',
            description: 'Energy drops 2-3 hours after high-carb lunches.',
            color: '#FFF3E0',
          },
          {
            emoji: '💧',
            title: 'Hydration Boosts Mood',
            description: 'Your mood is 0.8 points higher on days with good water intake.',
            color: '#E8F5E9',
          },
        ].map((pattern, index) => (
          <View key={index} style={styles.patternCard}>
            <View style={[styles.patternIcon, { backgroundColor: pattern.color }]}>
              <Text style={styles.patternEmoji}>{pattern.emoji}</Text>
            </View>
            <View style={styles.patternContent}>
              <Text style={styles.patternTitle}>{pattern.title}</Text>
              <Text style={styles.patternDescription}>{pattern.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Recommendations</Text>

        <TouchableOpacity style={styles.recommendationCard}>
          <View style={[styles.priorityBadge, { backgroundColor: '#E8F5E9' }]}>
            <Text style={[styles.priorityText, { color: '#27AE60' }]}>HIGH IMPACT</Text>
          </View>
          <Text style={styles.recommendationTitle}>Take Iron at 2pm</Text>
          <Text style={styles.recommendationDesc}>
            Moving iron to afternoon could improve absorption significantly.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recommendationCard}>
          <View style={[styles.priorityBadge, { backgroundColor: '#FFF3E0' }]}>
            <Text style={[styles.priorityText, { color: '#F39C12' }]}>MEDIUM</Text>
          </View>
          <Text style={styles.recommendationTitle}>Add Protein to Lunch</Text>
          <Text style={styles.recommendationDesc}>
            Energy stays more stable with 25g+ protein at lunch.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trigger Foods */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ Potential Triggers</Text>

        {[
          { food: 'Dairy products', percent: '65%', effect: 'bloating' },
          { food: 'White bread', percent: '58%', effect: 'energy dip' },
        ].map((trigger, index) => (
          <View key={index} style={styles.triggerRow}>
            <Text style={styles.triggerFood}>{trigger.food}</Text>
            <View style={styles.triggerStats}>
              <Text style={styles.triggerPercent}>{trigger.percent}</Text>
              <Text style={styles.triggerEffect}>{trigger.effect}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Based on your check-ins over 30 days. Consult a healthcare provider for medical advice.
        </Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  trendUp: {
    color: '#27AE60',
  },
  adherenceSection: {
    marginTop: 8,
  },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adherenceLabel: {
    fontSize: 14,
    color: '#2D3436',
  },
  adherenceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A7C59',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A7C59',
    borderRadius: 4,
  },
  patternCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  patternIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  patternEmoji: {
    fontSize: 24,
  },
  patternContent: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  patternDescription: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
    lineHeight: 18,
  },
  recommendationCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  recommendationDesc: {
    fontSize: 13,
    color: '#636E72',
    marginTop: 4,
    lineHeight: 18,
  },
  triggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  triggerFood: {
    fontSize: 15,
    color: '#2D3436',
  },
  triggerStats: {
    alignItems: 'flex-end',
  },
  triggerPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E74C3C',
  },
  triggerEffect: {
    fontSize: 11,
    color: '#636E72',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
