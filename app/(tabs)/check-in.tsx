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
import * as SecureStore from 'expo-secure-store';

const ratingOptions = [
  { value: 1, label: 'Awful', color: '#E74C3C' },
  { value: 2, label: 'Bad', color: '#E67E22' },
  { value: 3, label: 'OK', color: '#F1C40F' },
  { value: 4, label: 'Good', color: '#27AE60' },
  { value: 5, label: 'Great', color: '#2ECC71' },
];

export default function CheckInScreen() {
  const router = useRouter();
  const [energy, setEnergy] = useState(3);
  const [gut, setGut] = useState(3);
  const [mood, setMood] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Save check-in data
      const checkIn = {
        id: Date.now().toString(),
        energy,
        gut,
        mood,
        symptoms,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString(),
      };
      
      const existingCheckIns = await SecureStore.getItemAsync('checkIns');
      const checkIns = existingCheckIns ? JSON.parse(existingCheckIns) : [];
      checkIns.unshift(checkIn);
      await SecureStore.setItemAsync('checkIns', JSON.stringify(checkIns.slice(0, 100)));
      
    } catch (error) {
      console.log('Error saving check-in:', error);
    }
    
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Check-in Saved! ✨', 'Thanks for logging how you feel. Keep tracking to discover patterns!', [
        { text: 'OK', onPress: () => router.push('/(tabs)') },
      ]);
    }, 500);
  };

  const ScoreSelector = ({
    label,
    value,
    onChange,
    icon,
    color,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    icon: string;
    color: string;
  }) => (
    <View style={styles.scoreSection}>
      <View style={styles.scoreLabelRow}>
        <View style={[styles.scoreLabelIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.scoreLabel}>{label}</Text>
      </View>
      <View style={styles.ratingRow}>
        {ratingOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.ratingButton,
              value === option.value && { backgroundColor: option.color, borderColor: option.color },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[
              styles.ratingText,
              value === option.value && styles.ratingTextActive,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const symptomOptions = [
    { id: 'bloating', label: '🎈 Bloating' },
    { id: 'fatigue', label: '😴 Fatigue' },
    { id: 'brain_fog', label: '🌫️ Brain Fog' },
    { id: 'headache', label: '🤕 Headache' },
    { id: 'nausea', label: '🤢 Nausea' },
    { id: 'cramps', label: '😣 Cramps' },
    { id: 'anxiety', label: '😰 Anxiety' },
    { id: 'heartburn', label: '🔥 Heartburn' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Scores */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rate how you're feeling</Text>
        <ScoreSelector label="Energy Level" value={energy} onChange={setEnergy} icon="flash" color="#F39C12" />
        <ScoreSelector label="Gut Comfort" value={gut} onChange={setGut} icon="fitness" color="#27AE60" />
        <ScoreSelector label="Mood" value={mood} onChange={setMood} icon="happy" color="#3498DB" />
      </View>

      {/* Symptoms */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Any symptoms? (Optional)</Text>
        <Text style={styles.cardSubtitle}>Tap all that apply</Text>
        <View style={styles.symptomsGrid}>
          {symptomOptions.map((symptom) => (
            <TouchableOpacity
              key={symptom.id}
              style={[styles.symptomButton, symptoms.includes(symptom.id) && styles.symptomActive]}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <Text style={styles.symptomText}>{symptom.label}</Text>
              {symptoms.includes(symptom.id) && (
                <Ionicons name="checkmark-circle" size={16} color="#E74C3C" style={styles.symptomCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 Your Check-in Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryBadge, { backgroundColor: ratingOptions[energy - 1].color }]}>
              <Text style={styles.summaryBadgeText}>{ratingOptions[energy - 1].label}</Text>
            </View>
            <Text style={styles.summaryLabel}>Energy</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryBadge, { backgroundColor: ratingOptions[gut - 1].color }]}>
              <Text style={styles.summaryBadgeText}>{ratingOptions[gut - 1].label}</Text>
            </View>
            <Text style={styles.summaryLabel}>Gut</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryBadge, { backgroundColor: ratingOptions[mood - 1].color }]}>
              <Text style={styles.summaryBadgeText}>{ratingOptions[mood - 1].label}</Text>
            </View>
            <Text style={styles.summaryLabel}>Mood</Text>
          </View>
        </View>
        {symptoms.length > 0 && (
          <Text style={styles.symptomsCount}>
            {symptoms.length} symptom{symptoms.length > 1 ? 's' : ''} logged
          </Text>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.submitText}>Save Check-in</Text>
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
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 16,
  },
  scoreSection: {
    marginTop: 20,
  },
  scoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabelIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 3,
    borderRadius: 12,
    backgroundColor: '#F5F7F5',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#636E72',
  },
  ratingTextActive: {
    color: '#FFFFFF',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F7F5',
    borderRadius: 20,
    margin: 4,
  },
  symptomActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  symptomText: {
    fontSize: 13,
    color: '#2D3436',
  },
  symptomCheck: {
    marginLeft: 4,
  },
  summaryCard: {
    backgroundColor: '#4A7C59',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 6,
  },
  summaryBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  symptomsCount: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7C59',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
