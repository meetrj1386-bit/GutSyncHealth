import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Weekly Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Weekly Summary</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3.8</Text>
            <Text style={styles.statLabel}>Avg Energy</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="arrow-up" size={12} color={theme.success} />
              <Text style={[styles.trendText, { color: theme.success }]}>+0.3</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.1</Text>
            <Text style={styles.statLabel}>Avg Gut</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="arrow-up" size={12} color={theme.success} />
              <Text style={[styles.trendText, { color: theme.success }]}>+0.5</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3.5</Text>
            <Text style={styles.statLabel}>Avg Mood</Text>
            <View style={styles.trendBadge}>
              <Ionicons name="remove" size={12} color={theme.textLight} />
              <Text style={styles.trendText}>0.0</Text>
            </View>
          </View>
        </View>

        <View style={styles.adherenceRow}>
          <Text style={styles.adherenceLabel}>Medication Adherence</Text>
          <Text style={styles.adherenceValue}>92%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '92%' }]} />
        </View>
      </View>

      {/* Patterns Detected */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Patterns Detected</Text>
        
        <View style={styles.patternCard}>
          <View style={[styles.patternIcon, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.patternEmoji}>☕</Text>
          </View>
          <View style={styles.patternContent}>
            <Text style={styles.patternTitle}>Coffee + Iron = Low Absorption</Text>
            <Text style={styles.patternDescription}>
              Your iron supplement works 80% better when taken 2 hours away from coffee.
            </Text>
          </View>
        </View>

        <View style={styles.patternCard}>
          <View style={[styles.patternIcon, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.patternEmoji}>🍝</Text>
          </View>
          <View style={styles.patternContent}>
            <Text style={styles.patternTitle}>Heavy Carbs → Afternoon Fatigue</Text>
            <Text style={styles.patternDescription}>
              Energy drops 2-3 hours after high-carb lunches. Try adding more protein.
            </Text>
          </View>
        </View>

        <View style={styles.patternCard}>
          <View style={[styles.patternIcon, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.patternEmoji}>💧</Text>
          </View>
          <View style={styles.patternContent}>
            <Text style={styles.patternTitle}>Hydration Boosts Your Mood</Text>
            <Text style={styles.patternDescription}>
              Your mood scores are 0.8 points higher on days with good water intake.
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Recommendations</Text>

        <TouchableOpacity style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.priorityText, { color: theme.success }]}>HIGH IMPACT</Text>
            </View>
          </View>
          <Text style={styles.recommendationTitle}>Take Iron at 2pm</Text>
          <Text style={styles.recommendationDescription}>
            Moving iron to afternoon (away from morning coffee) could improve absorption significantly.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <View style={[styles.priorityBadge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.priorityText, { color: theme.warning }]}>MEDIUM</Text>
            </View>
          </View>
          <Text style={styles.recommendationTitle}>Add Protein to Lunch</Text>
          <Text style={styles.recommendationDescription}>
            Your energy stays more stable when lunch includes 25g+ protein.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trigger Foods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Potential Trigger Foods</Text>
        
        <View style={styles.triggerRow}>
          <Text style={styles.triggerFood}>Dairy products</Text>
          <View style={styles.triggerStats}>
            <Text style={styles.triggerPercent}>65%</Text>
            <Text style={styles.triggerLabel}>bloating correlation</Text>
          </View>
        </View>

        <View style={styles.triggerRow}>
          <Text style={styles.triggerFood}>White bread</Text>
          <View style={styles.triggerStats}>
            <Text style={styles.triggerPercent}>58%</Text>
            <Text style={styles.triggerLabel}>energy dip correlation</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Based on your check-ins over the past 30 days. Consult a healthcare provider for medical advice.
        </Text>
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
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
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
    fontSize: 28,
    fontWeight: '700',
    color: theme.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    marginLeft: 2,
    color: theme.textLight,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  adherenceLabel: {
    fontSize: 14,
    color: theme.text,
  },
  adherenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 4,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  patternIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patternEmoji: {
    fontSize: 22,
  },
  patternContent: {
    flex: 1,
  },
  patternTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  patternDescription: {
    fontSize: 13,
    color: theme.textLight,
    lineHeight: 18,
  },
  recommendationCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 13,
    color: theme.textLight,
    lineHeight: 18,
  },
  triggerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  triggerFood: {
    fontSize: 14,
    color: theme.text,
  },
  triggerStats: {
    alignItems: 'flex-end',
  },
  triggerPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.error,
  },
  triggerLabel: {
    fontSize: 11,
    color: theme.textLight,
  },
  disclaimer: {
    fontSize: 11,
    color: theme.textLight,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
