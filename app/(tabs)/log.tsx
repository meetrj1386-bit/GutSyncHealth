import { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, getGutScoreColor, MEAL_TYPES } from '../../lib/theme';

const ANALYZE_FOOD_URL = 'https://ujgwbcxbglypvoztijgo.supabase.co/functions/v1/analyze-food';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  gut_score: number;
  inflammation_score?: number;
  ai_analysis: string;
  ai_tips: string[];
  source: 'ai' | 'local' | 'fallback';  // Track where data came from
}

// LOCAL NUTRITION DATABASE for estimation when AI fails
const FOOD_DATABASE: Record<string, { cal: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; gutScore: number }> = {
  // Proteins
  'chicken': { cal: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, sugar: 0, gutScore: 7 },
  'egg': { cal: 78, protein: 6, carbs: 1, fat: 5, fiber: 0, sugar: 0, gutScore: 7 },
  'fish': { cal: 150, protein: 26, carbs: 0, fat: 5, fiber: 0, sugar: 0, gutScore: 8 },
  'salmon': { cal: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, gutScore: 9 },
  'beef': { cal: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, gutScore: 5 },
  'tofu': { cal: 144, protein: 15, carbs: 4, fat: 8, fiber: 2, sugar: 1, gutScore: 7 },
  
  // Grains
  'rice': { cal: 206, protein: 4, carbs: 45, fat: 0, fiber: 1, sugar: 0, gutScore: 6 },
  'oats': { cal: 150, protein: 5, carbs: 27, fat: 3, fiber: 4, sugar: 1, gutScore: 9 },
  'bread': { cal: 79, protein: 3, carbs: 15, fat: 1, fiber: 1, sugar: 2, gutScore: 5 },
  'pasta': { cal: 220, protein: 8, carbs: 43, fat: 1, fiber: 2, sugar: 1, gutScore: 5 },
  'quinoa': { cal: 222, protein: 8, carbs: 39, fat: 4, fiber: 5, sugar: 0, gutScore: 8 },
  
  // Vegetables
  'salad': { cal: 20, protein: 2, carbs: 4, fat: 0, fiber: 2, sugar: 2, gutScore: 9 },
  'broccoli': { cal: 55, protein: 4, carbs: 11, fat: 1, fiber: 5, sugar: 2, gutScore: 9 },
  'spinach': { cal: 23, protein: 3, carbs: 4, fat: 0, fiber: 2, sugar: 0, gutScore: 9 },
  'carrot': { cal: 41, protein: 1, carbs: 10, fat: 0, fiber: 3, sugar: 5, gutScore: 8 },
  'vegetable': { cal: 50, protein: 2, carbs: 10, fat: 0, fiber: 3, sugar: 3, gutScore: 8 },
  
  // Fruits
  'apple': { cal: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, sugar: 19, gutScore: 7 },
  'banana': { cal: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, sugar: 14, gutScore: 8 },
  'bananas': { cal: 210, protein: 2, carbs: 54, fat: 1, fiber: 6, sugar: 28, gutScore: 8 },
  'berry': { cal: 85, protein: 1, carbs: 21, fat: 0, fiber: 8, sugar: 12, gutScore: 9 },
  'orange': { cal: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, sugar: 12, gutScore: 7 },
  'fruit': { cal: 80, protein: 1, carbs: 20, fat: 0, fiber: 3, sugar: 15, gutScore: 7 },
  
  // Dairy
  'milk': { cal: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12, gutScore: 4 },
  'cheese': { cal: 113, protein: 7, carbs: 0, fat: 9, fiber: 0, sugar: 0, gutScore: 4 },
  'yogurt': { cal: 100, protein: 17, carbs: 6, fat: 1, fiber: 0, sugar: 4, gutScore: 7 },
  
  // Fast food / Processed
  'pizza': { cal: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, sugar: 4, gutScore: 3 },
  'burger': { cal: 354, protein: 20, carbs: 29, fat: 17, fiber: 1, sugar: 5, gutScore: 3 },
  'fries': { cal: 365, protein: 4, carbs: 48, fat: 17, fiber: 4, sugar: 0, gutScore: 2 },
  'fried': { cal: 300, protein: 15, carbs: 20, fat: 18, fiber: 1, sugar: 2, gutScore: 3 },
  'sandwich': { cal: 350, protein: 15, carbs: 35, fat: 15, fiber: 3, sugar: 5, gutScore: 5 },
  
  // Drinks
  'coffee': { cal: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, gutScore: 5 },
  'smoothie': { cal: 200, protein: 5, carbs: 40, fat: 2, fiber: 4, sugar: 25, gutScore: 6 },
  'juice': { cal: 110, protein: 1, carbs: 26, fat: 0, fiber: 0, sugar: 22, gutScore: 4 },
  'soda': { cal: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, sugar: 39, gutScore: 1 },
  
  // Healthy
  'avocado': { cal: 234, protein: 3, carbs: 12, fat: 21, fiber: 10, sugar: 1, gutScore: 9 },
  'nuts': { cal: 170, protein: 5, carbs: 6, fat: 15, fiber: 2, sugar: 1, gutScore: 7 },
  'soup': { cal: 150, protein: 8, carbs: 20, fat: 4, fiber: 3, sugar: 4, gutScore: 7 },
};

// Estimate nutrition based on description
const estimateNutritionLocally = (description: string, mealType: string): NutritionData => {
  const lowerDesc = description.toLowerCase();
  let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0, totalSugar = 0;
  let gutScores: number[] = [];
  let matchedFoods: string[] = [];

  // Find matching foods
  for (const [food, data] of Object.entries(FOOD_DATABASE)) {
    if (lowerDesc.includes(food)) {
      totalCal += data.cal;
      totalProtein += data.protein;
      totalCarbs += data.carbs;
      totalFat += data.fat;
      totalFiber += data.fiber;
      totalSugar += data.sugar;
      gutScores.push(data.gutScore);
      matchedFoods.push(food);
    }
  }

  // If no matches, estimate by meal type
  if (matchedFoods.length === 0) {
    switch (mealType) {
      case 'breakfast':
        return { calories: 350, protein: 12, carbs: 45, fat: 12, fiber: 4, sugar: 15, gut_score: 6, ai_analysis: generateLocalAnalysis(description), ai_tips: generateLocalTips(description), source: 'local' as const };
      case 'lunch':
        return { calories: 550, protein: 25, carbs: 55, fat: 20, fiber: 6, sugar: 10, gut_score: 6, ai_analysis: generateLocalAnalysis(description), ai_tips: generateLocalTips(description), source: 'local' as const };
      case 'dinner':
        return { calories: 650, protein: 30, carbs: 60, fat: 25, fiber: 5, sugar: 8, gut_score: 6, ai_analysis: generateLocalAnalysis(description), ai_tips: generateLocalTips(description), source: 'local' as const };
      case 'snack':
        return { calories: 200, protein: 5, carbs: 25, fat: 8, fiber: 2, sugar: 12, gut_score: 5, ai_analysis: generateLocalAnalysis(description), ai_tips: generateLocalTips(description), source: 'local' as const };
      default:
        return { calories: 400, protein: 15, carbs: 45, fat: 15, fiber: 4, sugar: 10, gut_score: 6, ai_analysis: generateLocalAnalysis(description), ai_tips: generateLocalTips(description), source: 'local' as const };
    }
  }

  const avgGutScore = gutScores.length > 0 ? gutScores.reduce((a, b) => a + b, 0) / gutScores.length : 5;

  return {
    calories: Math.round(totalCal),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    fiber: Math.round(totalFiber),
    sugar: Math.round(totalSugar),
    gut_score: Math.round(avgGutScore * 10) / 10,
    ai_analysis: generateLocalAnalysis(description),
    ai_tips: generateLocalTips(description),
    source: 'local' as const,
  };
};

// Generate analysis based on content
const generateLocalAnalysis = (description: string): string => {
  const lowerDesc = description.toLowerCase();
  
  // Specific fruit analyses
  if (lowerDesc.includes('banana')) {
    return 'Bananas are excellent for gut health! Rich in prebiotic fiber and potassium. The resistant starch feeds beneficial bacteria.';
  }
  if (lowerDesc.includes('apple')) {
    return 'Apples contain pectin, a prebiotic fiber that supports gut bacteria. The skin has most of the fiber - keep it on!';
  }
  if (lowerDesc.includes('avocado')) {
    return 'Avocados are fantastic for gut health! High in fiber and healthy fats that support digestion.';
  }
  if (lowerDesc.includes('berry') || lowerDesc.includes('berries')) {
    return 'Excellent gut-friendly choice! Berries are high in fiber and antioxidants that support gut health.';
  }
  
  // Other foods
  if (lowerDesc.includes('salad') || lowerDesc.includes('vegetable') || lowerDesc.includes('greens')) {
    return 'Great choice! Vegetables are excellent for gut health. The fiber feeds beneficial bacteria.';
  }
  if (lowerDesc.includes('fried') || lowerDesc.includes('pizza') || lowerDesc.includes('burger')) {
    return 'This meal may be heavy on your gut. Fried foods can cause inflammation. Consider adding vegetables next time.';
  }
  if (lowerDesc.includes('oats') || lowerDesc.includes('oatmeal')) {
    return 'Oats are a gut superfood! Beta-glucan fiber feeds good bacteria and helps maintain steady blood sugar.';
  }
  if (lowerDesc.includes('yogurt') || lowerDesc.includes('curd')) {
    return 'Yogurt contains live probiotics that support your gut microbiome. Choose plain varieties for less sugar.';
  }
  if (lowerDesc.includes('chicken') || lowerDesc.includes('fish') || lowerDesc.includes('salmon')) {
    return 'Good protein choice. Lean proteins are easier to digest than red meat.';
  }
  if (lowerDesc.includes('dairy') || lowerDesc.includes('cheese') || lowerDesc.includes('milk')) {
    return 'Dairy can be hard to digest for some people. Monitor how you feel after this meal.';
  }
  if (lowerDesc.includes('egg')) {
    return 'Eggs are nutrient-dense and easy to digest. Great source of protein and healthy fats.';
  }
  if (lowerDesc.includes('rice')) {
    return 'Rice is easy to digest. Brown rice has more fiber and nutrients than white rice.';
  }
  
  return `Meal logged: "${description}". Track how you feel in 2-3 hours to understand its gut impact.`;
};

// Generate tips based on content
const generateLocalTips = (description: string): string[] => {
  const tips: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  if (!lowerDesc.includes('vegetable') && !lowerDesc.includes('salad') && !lowerDesc.includes('greens')) {
    tips.push('Add vegetables to increase fiber intake');
  }
  if (lowerDesc.includes('fried') || lowerDesc.includes('fries')) {
    tips.push('Try baked or grilled options for better gut health');
  }
  if (lowerDesc.includes('soda') || lowerDesc.includes('juice')) {
    tips.push('Replace sugary drinks with water or herbal tea');
  }
  if (!lowerDesc.includes('fiber') && !lowerDesc.includes('oats') && !lowerDesc.includes('berry')) {
    tips.push('Consider adding high-fiber foods like oats or berries');
  }
  
  if (tips.length === 0) {
    tips.push('Stay hydrated for optimal digestion');
    tips.push('Eat slowly to improve nutrient absorption');
  }
  
  return tips.slice(0, 3);
};

export default function LogMealScreen() {
  const { user } = useAuth();
  const [mealType, setMealType] = useState<string>('breakfast');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
      setNutritionData(null); // Reset analysis
      
      // AUTO-ANALYZE immediately after photo selection
      if (result.assets[0].base64) {
        autoAnalyzePhoto(result.assets[0].base64);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 || null);
      setNutritionData(null); // Reset analysis
      
      // AUTO-ANALYZE immediately after photo capture
      if (result.assets[0].base64) {
        autoAnalyzePhoto(result.assets[0].base64);
      }
    }
  };

  // Auto-analyze photo and identify food
  const autoAnalyzePhoto = async (base64: string) => {
    setAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('⚠️ No session, skipping auto-analyze');
        setAnalyzing(false);
        return;
      }
      
      console.log('🔄 Auto-analyzing photo...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(ANALYZE_FOOD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          description: 'Identify this food and analyze nutrition',
          meal_type: mealType,
          image_base64: base64,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.log('❌ API Error in auto-analyze');
        setAnalyzing(false);
        return;
      }
      
      const data = await response.json();
      console.log('✅ Auto-analysis response:', JSON.stringify(data, null, 2));
      
      // Get identified food name from response
      const foodName = data.foodName || data.food_name || data.analysis?.foodName || '';
      
      // Auto-fill description if we identified the food
      if (foodName && foodName.trim()) {
        setDescription(foodName.trim());
      }
      
      // Parse nutrition data
      const analysis = data.analysis || data;
      const nutritionValues = analysis.nutrition || analysis;
      
      if (data.success !== false && nutritionValues.calories > 0) {
        const nutrition: NutritionData = {
          calories: nutritionValues.calories || 0,
          protein: nutritionValues.protein || 0,
          carbs: nutritionValues.carbs || 0,
          fat: nutritionValues.fat || 0,
          fiber: nutritionValues.fiber || 0,
          sugar: nutritionValues.sugar,
          gut_score: analysis.gutScore || analysis.gut_score || data.gut_score || 5,
          inflammation_score: analysis.inflammation_score,
          ai_analysis: analysis.gutNotes || analysis.analysis || data.analysis || generateLocalAnalysis(foodName || 'meal'),
          ai_tips: Array.isArray(analysis.tips) ? analysis.tips : generateLocalTips(foodName || 'meal'),
          source: 'ai',
        };
        setNutritionData(nutrition);
      }
    } catch (error) {
      console.error('❌ Auto-analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeFood = async () => {
    if (!description.trim() && !photoBase64) {
      Alert.alert('Missing Info', 'Please add a description or photo of your meal');
      return;
    }

    setAnalyzing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.log('⚠️ No session, using local estimation');
        const nutrition = estimateNutritionLocally(description.trim(), mealType);
        setNutritionData(nutrition);
        setAnalyzing(false);
        return;
      }
      
      console.log('🔄 Calling API:', ANALYZE_FOOD_URL);
      console.log('📝 Request body:', { description: description.trim(), meal_type: mealType, has_image: !!photoBase64 });
      
      // Build request body - only include image if present
      const requestBody: any = {
        description: description.trim() || 'Analyze this meal',
        meal_type: mealType,
      };
      
      // Only add image if it exists (large images can cause network issues)
      if (photoBase64) {
        requestBody.image_base64 = photoBase64;
      }
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(ANALYZE_FOOD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      let nutrition: NutritionData;

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API Error:', response.status, errorText);
        // Use local estimation instead
        nutrition = estimateNutritionLocally(description.trim(), mealType);
      } else {
        const data = await response.json();
        console.log('✅ API Response:', JSON.stringify(data, null, 2));
        
        // Parse the AI response - handle the ACTUAL API format:
        // { success: true, analysis: { nutrition: {...}, gutScore, gutNotes, ... } }
        
        // Check for nested analysis object (actual API format)
        const analysis = data.analysis || data.result?.analysis || data;
        const nutritionData = analysis.nutrition || analysis;
        
        // Check if we got real values
        const hasRealData = data.success === true || 
                           (nutritionData.calories && nutritionData.calories > 0) ||
                           (analysis.gutScore && analysis.gutScore > 0);
        
        console.log('📊 Parsed analysis:', { hasRealData, analysis, nutritionData });
        
        if (hasRealData) {
          nutrition = {
            calories: nutritionData.calories || 0,
            protein: nutritionData.protein || 0,
            carbs: nutritionData.carbs || 0,
            fat: nutritionData.fat || 0,
            fiber: nutritionData.fiber || 0,
            sugar: nutritionData.sugar,
            gut_score: analysis.gutScore || analysis.gut_score || 5,
            inflammation_score: analysis.inflammation_score,
            ai_analysis: analysis.gutNotes || analysis.description || 
                         (typeof analysis.analysis === 'string' ? analysis.analysis : null) ||
                         generateLocalAnalysis(description.trim()),
            ai_tips: Array.isArray(analysis.tips) ? analysis.tips : 
                     Array.isArray(analysis.recommendations) ? analysis.recommendations :
                     generateLocalTips(description.trim()),
            source: 'ai',
          };
          console.log('✅ Using AI analysis:', nutrition);
        } else {
          // AI returned empty data, use local estimation
          console.log('⚠️ AI returned empty data, using local estimation');
          nutrition = estimateNutritionLocally(description.trim(), mealType);
        }
      }

      setNutritionData(nutrition);
      
      // Auto-save after successful analysis
      if (user && description.trim()) {
        try {
          const { error } = await supabase.from('meals').insert({
            user_id: user.id,
            meal_type: mealType,
            description: description.trim(),
            photo_url: photoUri,
            calories: nutrition.calories || null,
            protein: nutrition.protein || null,
            carbs: nutrition.carbs || null,
            fat: nutrition.fat || null,
            fiber: nutrition.fiber || null,
            sugar: nutrition.sugar || null,
            gut_score: nutrition.gut_score || null,
            inflammation_score: nutrition.inflammation_score || null,
            ai_analysis: nutrition.ai_analysis || null,
            ai_tips: nutrition.ai_tips || null,
            logged_at: new Date().toISOString(),
          });

          if (!error) {
            // Show success but DON'T auto-navigate - let user see results
            Alert.alert(
              '✅ Meal Saved!', 
              `Gut Score: ${nutrition.gut_score.toFixed(1)}/10\n\n${nutrition.ai_analysis}\n\nTap OK to view details or go back when ready.`,
              [{ text: 'OK' }]
            );
            return;
          }
        } catch (e) {
          console.log('Auto-save failed, user can save manually');
        }
      }
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      
      // Use local estimation instead of generic fallback
      console.log('🔄 Using local estimation due to network error');
      const localNutrition = estimateNutritionLocally(description.trim(), mealType);
      setNutritionData(localNutrition);
      
      // Show user-friendly message
      if (error.name === 'AbortError') {
        Alert.alert('Timeout', 'Analysis took too long. Using local estimates. You can still save the meal.');
      } else {
        Alert.alert('Network Issue', 'Could not connect to AI. Using local estimates based on your description.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!user) return;
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please add a description');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        meal_type: mealType,
        description: description.trim(),
        photo_url: photoUri, // In production, upload to storage first
        calories: nutritionData?.calories || null,
        protein: nutritionData?.protein || null,
        carbs: nutritionData?.carbs || null,
        fat: nutritionData?.fat || null,
        fiber: nutritionData?.fiber || null,
        gut_score: nutritionData?.gut_score || null,
        inflammation_score: nutritionData?.inflammation_score || null,
        ai_analysis: nutritionData?.ai_analysis || null,
        ai_tips: nutritionData?.ai_tips || null,
        logged_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert('Saved!', 'Meal logged successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Could not save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const gutColor = nutritionData?.gut_score ? getGutScoreColor(nutritionData.gut_score) : Colors.textMuted;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Meal</Text>
          <TouchableOpacity onPress={saveMeal} disabled={saving || !description.trim()}>
            <Text style={[styles.saveButton, (!description.trim() || saving) && styles.saveButtonDisabled]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Meal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.mealTypeButton, mealType === type.id && styles.mealTypeButtonActive]}
                  onPress={() => setMealType(type.id)}
                >
                  <Text style={styles.mealTypeEmoji}>{type.emoji}</Text>
                  <Text style={[styles.mealTypeLabel, mealType === type.id && styles.mealTypeLabelActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo (Optional)</Text>
            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <TouchableOpacity style={styles.changePhotoButton} onPress={() => { setPhotoUri(null); setPhotoBase64(null); }}>
                  <Text style={styles.changePhotoText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Text style={styles.photoButtonEmoji}>📸</Text>
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <Text style={styles.photoButtonEmoji}>🖼️</Text>
                  <Text style={styles.photoButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What did you eat? *</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="e.g., Oatmeal with berries, green smoothie, grilled chicken salad..."
              placeholderTextColor={Colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              underlineColorAndroid="transparent"
            />
          </View>

          {/* Analyze Button */}
          <TouchableOpacity 
            style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]} 
            onPress={analyzeFood}
            disabled={analyzing || !description.trim()}
          >
            {analyzing ? (
              <>
                <ActivityIndicator size="small" color={Colors.textInverse} />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Text style={styles.analyzeButtonEmoji}>✨</Text>
                <Text style={styles.analyzeButtonText}>
                  {nutritionData ? 'Re-analyze' : 'Analyze & Save'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Health Coach Analysis Results */}
          {nutritionData && (
            <View style={styles.resultsContainer}>
              {/* Gut Score Card */}
              <View style={[styles.gutScoreCard, { borderColor: gutColor }]}>
                <Text style={styles.gutScoreLabel}>🦠 Gut Score</Text>
                <Text style={[styles.gutScoreValue, { color: gutColor }]}>
                  {nutritionData.gut_score.toFixed(1)}/10
                </Text>
                <Text style={styles.gutScoreDesc}>
                  {nutritionData.gut_score >= 7 ? 'Great for gut health!' :
                   nutritionData.gut_score >= 5 ? 'Moderate impact on gut' :
                   'May affect your gut negatively'}
                </Text>
              </View>

              {/* Source Indicator + Analysis */}
              <View style={styles.analysisCard}>
                <View style={styles.analysisTitleRow}>
                  <Text style={styles.analysisTitle}>
                    {nutritionData.source === 'ai' ? '💚 Health Coach Analysis' : 
                     nutritionData.source === 'local' ? '📊 Local Estimate' : 
                     '⚠️ Fallback Estimate'}
                  </Text>
                  <View style={[styles.sourceBadge, {
                    backgroundColor: nutritionData.source === 'ai' ? Colors.success + '20' : 
                                    nutritionData.source === 'local' ? Colors.warning + '20' : 
                                    Colors.error + '20'
                  }]}>
                    <Text style={[styles.sourceBadgeText, {
                      color: nutritionData.source === 'ai' ? Colors.success : 
                             nutritionData.source === 'local' ? Colors.warning : 
                             Colors.error
                    }]}>
                      {nutritionData.source === 'ai' ? '✓ AI' : 
                       nutritionData.source === 'local' ? '📦 Local' : 
                       '⚠️ Est'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.analysisText}>{nutritionData.ai_analysis}</Text>
                {nutritionData.source !== 'ai' && (
                  <Text style={styles.sourceNote}>
                    💡 Values estimated from local database. Accuracy may vary.
                  </Text>
                )}
              </View>

              {/* Nutrition Grid */}
              <View style={styles.nutritionCard}>
                <Text style={styles.nutritionTitle}>📊 Nutrition</Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{nutritionData.calories}</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{nutritionData.protein}g</Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{nutritionData.carbs}g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{nutritionData.fat}g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                  <View style={[styles.nutritionItem, styles.fiberItem]}>
                    <Text style={[styles.nutritionValue, { color: Colors.success }]}>{nutritionData.fiber}g</Text>
                    <Text style={styles.nutritionLabel}>Fiber 🌿</Text>
                  </View>
                  {nutritionData.sugar !== undefined && (
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, nutritionData.sugar > 15 && { color: Colors.warning }]}>
                        {nutritionData.sugar}g
                      </Text>
                      <Text style={styles.nutritionLabel}>Sugar</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* AI Tips */}
              {nutritionData.ai_tips && nutritionData.ai_tips.length > 0 && (
                <View style={styles.tipsCard}>
                  <Text style={styles.tipsTitle}>💡 Tips for Better Gut Health</Text>
                  {nutritionData.ai_tips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  cancelButton: { fontSize: FontSizes.md, color: Colors.textSecondary },
  title: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text },
  saveButton: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '600' },
  saveButtonDisabled: { color: Colors.textMuted },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg },
  
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  
  mealTypeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  mealTypeButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, marginHorizontal: 2, borderRadius: BorderRadius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  mealTypeButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  mealTypeEmoji: { fontSize: 24, marginBottom: 4 },
  mealTypeLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  mealTypeLabelActive: { color: Colors.primary, fontWeight: '600' },
  
  photoButtons: { flexDirection: 'row', gap: Spacing.md },
  photoButton: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  photoButtonEmoji: { fontSize: 32, marginBottom: Spacing.xs },
  photoButtonText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  photoContainer: { position: 'relative' },
  photo: { width: '100%', height: 200, borderRadius: BorderRadius.lg },
  changePhotoButton: { position: 'absolute', top: Spacing.sm, right: Spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  changePhotoText: { color: Colors.textInverse, fontSize: FontSizes.sm },
  
  descriptionInput: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.md, color: Colors.text, minHeight: 80 },
  
  analyzeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg },
  analyzeButtonDisabled: { opacity: 0.7 },
  analyzeButtonEmoji: { fontSize: 20, marginRight: Spacing.sm },
  analyzeButtonText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '600', marginLeft: Spacing.xs },
  
  resultsContainer: { marginTop: Spacing.sm },
  
  gutScoreCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.md, borderWidth: 2, ...Shadows.md },
  gutScoreLabel: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  gutScoreValue: { fontSize: 42, fontWeight: '700' },
  gutScoreDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  
  analysisCard: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  analysisTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  analysisTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary },
  analysisText: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 22 },
  sourceBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full },
  sourceBadgeText: { fontSize: FontSizes.xs, fontWeight: '600' },
  sourceNote: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.sm, fontStyle: 'italic' },
  
  nutritionCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  nutritionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  nutritionItem: { width: '33.33%', alignItems: 'center', paddingVertical: Spacing.sm },
  fiberItem: { backgroundColor: Colors.successLight, borderRadius: BorderRadius.md, marginHorizontal: 2 },
  nutritionValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  nutritionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  
  tipsCard: { backgroundColor: Colors.warningLight, borderRadius: BorderRadius.lg, padding: Spacing.md },
  tipsTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.warning, marginBottom: Spacing.sm },
  tipText: { fontSize: FontSizes.sm, color: Colors.text, marginBottom: Spacing.xs, lineHeight: 20 },
});
