import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useAuth } from '../../lib/auth';
import { useTodayCheckIn } from '../../lib/data';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, SYMPTOMS, getMoodData } from '../../lib/theme';

export default function CheckInScreen() {
  const { updateProfile, profile } = useAuth();
  const { checkIn, isLoading, saveCheckIn } = useTodayCheckIn();
  const [isSaving, setIsSaving] = useState(false);
  
  const [energy, setEnergy] = useState(5);
  const [gut, setGut] = useState(5);
  const [mood, setMood] = useState(5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Load existing check-in data
  useEffect(() => {
    if (checkIn) {
      setEnergy(checkIn.energy);
      setGut(checkIn.gut);
      setMood(checkIn.mood);
      setSelectedSymptoms(checkIn.symptoms || []);
      setNotes(checkIn.notes || '');
    }
  }, [checkIn]);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Ensure values are integers between 1-10
    const clampedEnergy = Math.max(1, Math.min(10, Math.round(energy)));
    const clampedGut = Math.max(1, Math.min(10, Math.round(gut)));
    const clampedMood = Math.max(1, Math.min(10, Math.round(mood)));
    
    console.log('📝 Saving check-in:', {
      energy: clampedEnergy,
      gut: clampedGut,
      mood: clampedMood,
      symptoms: selectedSymptoms,
      notes: notes.trim() || null,
      check_in_date: today,
    });
    
    const { error } = await saveCheckIn({
      energy: clampedEnergy,
      gut: clampedGut,
      mood: clampedMood,
      symptoms: selectedSymptoms,
      notes: notes.trim() || null,
      check_in_date: today,
    });

    if (error) {
      console.error('❌ Check-in save error:', error);
      Alert.alert('Error', `Could not save check-in: ${error.message || 'Unknown error'}. Please try again.`);
      setIsSaving(false);
      return;
    }
    
    console.log('✅ Check-in saved successfully');

    // Update streak if this is a new check-in (not an update)
    if (!checkIn) {
      const lastCheckIn = profile?.last_check_in;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastCheckIn === yesterdayStr) {
        newStreak = (profile?.streak_count || 0) + 1;
      }

      await updateProfile({
        streak_count: newStreak,
        longest_streak: Math.max(newStreak, profile?.longest_streak || 0),
        last_check_in: today,
      });
    }

    setIsSaving(false);
    router.back();
  };

  const gutMood = getMoodData(gut);
  const energyMood = getMoodData(energy);
  const moodData = getMoodData(mood);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {checkIn ? 'Update Check-in' : 'Daily Check-in'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButton}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date */}
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Sliders Section */}
        <View style={styles.slidersSection}>
          {/* Gut Health */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>🦠 Gut Feeling</Text>
              <View style={styles.sliderValueContainer}>
                <Text style={[styles.sliderNumber, { color: gutMood.color }]}>{Math.round(gut)}</Text>
                <Text style={[styles.sliderEmoji]}>{gutMood.emoji}</Text>
                <Text style={[styles.sliderValue, { color: gutMood.color }]}>
                  {gutMood.label}
                </Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={gut}
              onValueChange={setGut}
              minimumTrackTintColor={gutMood.color}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={gutMood.color}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinMax}>1</Text>
              <Text style={styles.sliderMinMax}>10</Text>
            </View>
          </View>

          {/* Energy */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>⚡ Energy Level</Text>
              <View style={styles.sliderValueContainer}>
                <Text style={[styles.sliderNumber, { color: energyMood.color }]}>{Math.round(energy)}</Text>
                <Text style={[styles.sliderEmoji]}>{energyMood.emoji}</Text>
                <Text style={[styles.sliderValue, { color: energyMood.color }]}>
                  {energyMood.label}
                </Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={energy}
              onValueChange={setEnergy}
              minimumTrackTintColor={energyMood.color}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={energyMood.color}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinMax}>1</Text>
              <Text style={styles.sliderMinMax}>10</Text>
            </View>
          </View>

          {/* Mood */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderLabel}>😊 Overall Mood</Text>
              <View style={styles.sliderValueContainer}>
                <Text style={[styles.sliderNumber, { color: moodData.color }]}>{Math.round(mood)}</Text>
                <Text style={[styles.sliderEmoji]}>{moodData.emoji}</Text>
                <Text style={[styles.sliderValue, { color: moodData.color }]}>
                  {moodData.label}
                </Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={mood}
              onValueChange={setMood}
              minimumTrackTintColor={moodData.color}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={moodData.color}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderMinMax}>1</Text>
              <Text style={styles.sliderMinMax}>10</Text>
            </View>
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Any symptoms?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply, or tap "None" if feeling good</Text>
          
          <View style={styles.symptomsGrid}>
            {/* No Symptoms Option */}
            <TouchableOpacity
              style={[
                styles.symptomChip,
                selectedSymptoms.length === 0 && styles.symptomChipNone,
              ]}
              onPress={() => setSelectedSymptoms([])}
              activeOpacity={0.7}
            >
              <Text style={styles.symptomEmoji}>✅</Text>
              <Text
                style={[
                  styles.symptomLabel,
                  selectedSymptoms.length === 0 && styles.symptomLabelNone,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>
            
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom.id);
              return (
                <TouchableOpacity
                  key={symptom.id}
                  style={[
                    styles.symptomChip,
                    isSelected && styles.symptomChipSelected,
                  ]}
                  onPress={() => toggleSymptom(symptom.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.symptomEmoji}>{symptom.emoji}</Text>
                  <Text
                    style={[
                      styles.symptomLabel,
                      isSelected && styles.symptomLabelSelected,
                    ]}
                  >
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Anything else you want to note..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* 🧠 AI Instant Summary */}
        {(gut <= 5 || selectedSymptoms.length > 0) && (
          <View style={styles.aiSummaryCard}>
            <Text style={styles.aiSummaryTitle}>🧠 AI Instant Summary</Text>
            <Text style={styles.aiSummaryText}>
              {gut <= 4 && selectedSymptoms.includes('gas') && 
                "Your gut feeling is low with gas symptoms. This often happens after high sugar or dairy. Check yesterday's meals."}
              {gut <= 4 && selectedSymptoms.includes('bloating') && !selectedSymptoms.includes('gas') &&
                "Low gut with bloating. Common causes: eating too fast, carbonated drinks, or dairy. Try peppermint tea."}
              {gut <= 4 && mood <= 4 && 
                "Low gut AND low mood are connected! 90% of serotonin is made in your gut. Improving gut health may boost mood."}
              {gut <= 5 && energy <= 4 &&
                "Low energy often links to poor digestion. Check your fiber intake and consider B12 levels."}
              {gut > 5 && selectedSymptoms.length > 0 &&
                `Moderate gut but ${selectedSymptoms.length} symptom(s). Track meals to identify triggers.`}
              {gut <= 5 && selectedSymptoms.length === 0 &&
                "Low gut score noted. Log your recent meals so we can identify potential triggers."}
            </Text>
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            Consistent daily check-ins help us identify patterns and triggers in your gut health.
            {profile?.streak_count ? ` You're on a ${profile.streak_count} day streak!` : ''}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelButton: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  dateText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  slidersSection: {
    marginBottom: Spacing.lg,
  },
  sliderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  sliderValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  sliderNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginRight: 4,
  },
  sliderEmoji: {
    fontSize: FontSizes.md,
    marginRight: 4,
  },
  sliderValue: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.xs,
  },
  sliderMinMax: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    margin: Spacing.xs,
  },
  symptomChipSelected: {
    backgroundColor: Colors.primaryFaded,
    borderColor: Colors.primary,
  },
  symptomChipNone: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  symptomEmoji: {
    fontSize: FontSizes.md,
    marginRight: Spacing.xs,
  },
  symptomLabel: {
    fontSize: FontSizes.sm,
    color: Colors.text,
  },
  symptomLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  symptomLabelNone: {
    color: Colors.success,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.text,
    minHeight: 100,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipEmoji: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.primary,
    lineHeight: 20,
  },
  aiSummaryCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  aiSummaryTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: Spacing.xs,
  },
  aiSummaryText: {
    fontSize: FontSizes.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
