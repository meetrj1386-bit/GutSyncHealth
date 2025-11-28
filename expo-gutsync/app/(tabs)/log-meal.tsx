import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function LogMealScreen() {
  const router = useRouter();
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Context
  const [waterIntake, setWaterIntake] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [sleepQuality, setSleepQuality] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      analyzePhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      analyzePhoto(result.assets[0].uri);
    }
  };

  const analyzePhoto = async (uri: string) => {
    setAnalyzing(true);
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setAnalysis({
        foods: ['Grilled Chicken', 'Rice', 'Vegetables'],
        nutrition: { calories: 450, carbs: 45, protein: 35, fat: 12 },
        triggers: { highSugar: false, containsDairy: false },
      });
      setAnalyzing(false);
    }, 2000);
  };

  const handleLogMeal = async () => {
    if (!photo && !description.trim()) {
      Alert.alert('Add Meal', 'Please take a photo or describe your meal.');
      return;
    }

    setLoading(true);
    // API call to log meal
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Meal Logged! 🍽️', 'Your meal has been recorded.', [
        { text: 'Done', onPress: () => router.back() },
      ]);
    }, 1500);
  };

  const getMealTypeIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast': return 'sunny';
      case 'lunch': return 'partly-sunny';
      case 'dinner': return 'moon';
      case 'snack': return 'cafe';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Meal Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Type</Text>
        <View style={styles.mealTypeRow}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeButton,
                mealType === type && styles.mealTypeButtonActive,
              ]}
              onPress={() => setMealType(type)}
            >
              <Ionicons
                name={getMealTypeIcon(type)}
                size={18}
                color={mealType === type ? '#FFFFFF' : theme.text}
              />
              <Text
                style={[
                  styles.mealTypeText,
                  mealType === type && styles.mealTypeTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Photo</Text>

        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => {
                setPhoto(null);
                setAnalysis(null);
              }}
            >
              <Ionicons name="close-circle" size={28} color={theme.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <Ionicons name="camera" size={32} color={theme.primary} />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
              <Ionicons name="images" size={32} color={theme.primary} />
              <Text style={styles.photoButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Text Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Or Describe Your Meal</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Grilled chicken salad with avocado"
          multiline
          numberOfLines={3}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Analysis Loading */}
      {analyzing && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.analyzingText}>Analyzing your meal...</Text>
        </View>
      )}

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Analysis</Text>

          <Text style={styles.analysisLabel}>Detected Foods:</Text>
          <Text style={styles.analysisValue}>{analysis.foods.join(', ')}</Text>

          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{analysis.nutrition.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>
      )}

      {/* Context Questions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Context (Optional)</Text>

        <Text style={styles.contextLabel}>Water intake today?</Text>
        <View style={styles.optionRow}>
          {['low', 'medium', 'high'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                waterIntake === level && styles.optionButtonActive,
              ]}
              onPress={() => setWaterIntake(level)}
            >
              <Text
                style={[
                  styles.optionText,
                  waterIntake === level && styles.optionTextActive,
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.contextLabel}>Stress level?</Text>
        <View style={styles.optionRow}>
          {['low', 'medium', 'high'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                stressLevel === level && styles.optionButtonActive,
              ]}
              onPress={() => setStressLevel(level)}
            >
              <Text
                style={[
                  styles.optionText,
                  stressLevel === level && styles.optionTextActive,
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.contextLabel}>Sleep quality last night?</Text>
        <View style={styles.optionRow}>
          {['poor', 'okay', 'good'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                sleepQuality === level && styles.optionButtonActive,
              ]}
              onPress={() => setSleepQuality(level)}
            >
              <Text
                style={[
                  styles.optionText,
                  sleepQuality === level && styles.optionTextActive,
                ]}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Log Button */}
      <TouchableOpacity
        style={[styles.logButton, loading && styles.logButtonDisabled]}
        onPress={handleLogMeal}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            <Text style={styles.logButtonText}>Log Meal</Text>
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
    marginBottom: 12,
  },
  mealTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  mealTypeButtonActive: {
    backgroundColor: theme.primary,
  },
  mealTypeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
    color: theme.text,
  },
  mealTypeTextActive: {
    color: '#FFFFFF',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  photoButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '45%',
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.text,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  analyzingText: {
    marginTop: 12,
    color: theme.textLight,
  },
  analysisLabel: {
    fontSize: 13,
    color: theme.textLight,
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  nutritionLabel: {
    fontSize: 11,
    color: theme.textLight,
    marginTop: 2,
  },
  contextLabel: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 8,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: theme.primary,
  },
  optionText: {
    fontSize: 13,
    color: theme.text,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logButtonDisabled: {
    opacity: 0.7,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
