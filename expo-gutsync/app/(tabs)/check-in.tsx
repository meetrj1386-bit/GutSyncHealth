import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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

const emojis = ['😫', '😕', '😐', '🙂', '😊'];

export default function CheckInScreen() {
  const router = useRouter();
  const [energyScore, setEnergyScore] = useState(3);
  const [gutScore, setGutScore] = useState(3);
  const [moodScore, setMoodScore] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    setLoading(true);
    // API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Check-in Recorded! ✨',
        'Thanks for logging how you feel. This helps us learn your patterns.',
        [{ text: 'Done', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const ScoreSelector = ({
    label,
    value,
    onChange,
    icon,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    icon: string;
  }) => (
    <View style={styles.scoreSection}>
      <View style={styles.scoreLabelRow}>
        <Ionicons name={icon as any} size={20} color={theme.primary} />
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
      <View style={styles.emojiRow}>
        {emojis.map((emoji, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.emojiButton,
              value === index + 1 && styles.emojiButtonActive,
            ]}
            onPress={() => onChange(index + 1)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.emojiScore}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How are you feeling right now?</Text>
        <Text style={styles.headerSubtitle}>
          Quick check-in to track your patterns
        </Text>
      </View>

      {/* Scores */}
      <View style={styles.section}>
        <ScoreSelector
          label="Energy Level"
          value={energyScore}
          onChange={setEnergyScore}
          icon="flash"
        />

        <ScoreSelector
          label="Gut Comfort"
          value={gutScore}
          onChange={setGutScore}
          icon="fitness"
        />

        <ScoreSelector
          label="Mood"
          value={moodScore}
          onChange={setMoodScore}
          icon="happy"
        />
      </View>

      {/* Symptoms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any symptoms? (Optional)</Text>
        <View style={styles.symptomsGrid}>
          {[
            { id: 'headache', label: '🤕 Headache', icon: 'bandage' },
            { id: 'brain_fog', label: '🌫️ Brain Fog', icon: 'cloudy' },
            { id: 'bloating', label: '🎈 Bloating', icon: 'balloon' },
            { id: 'fatigue', label: '😴 Fatigue', icon: 'bed' },
            { id: 'nausea', label: '🤢 Nausea', icon: 'sad' },
            { id: 'anxiety', label: '😰 Anxiety', icon: 'alert' },
          ].map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomButton,
                symptoms.includes(symptom.id) && styles.symptomButtonActive,
              ]}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <Text style={styles.symptomText}>{symptom.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Check-in Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Energy:</Text>
          <Text style={styles.summaryValue}>{emojis[energyScore - 1]} {energyScore}/5</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gut:</Text>
          <Text style={styles.summaryValue}>{emojis[gutScore - 1]} {gutScore}/5</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Mood:</Text>
          <Text style={styles.summaryValue}>{emojis[moodScore - 1]} {moodScore}/5</Text>
        </View>
        {symptoms.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Symptoms:</Text>
            <Text style={styles.summaryValue}>{symptoms.length} reported</Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Save Check-in</Text>
          </>
        )}
      </TouchableOpacity>

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
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textLight,
    marginTop: 4,
  },
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
  },
  scoreSection: {
    marginBottom: 20,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 8,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emojiButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    minWidth: 56,
  },
  emojiButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  emoji: {
    fontSize: 28,
  },
  emojiScore: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 4,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  symptomButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    margin: 4,
  },
  symptomButtonActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: theme.error,
  },
  symptomText: {
    fontSize: 13,
    color: theme.text,
  },
  summaryCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: theme.text,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
