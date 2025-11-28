import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type Meal = { id: string; type: string; photo: string | null; description: string; timestamp: string; date: string; };

export default function LogMealScreen() {
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [logging, setLogging] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [mealHistory, setMealHistory] = useState<Meal[]>([]);
  
  // Analysis state - shows INSIDE history modal
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);

  useFocusEffect(useCallback(() => { loadMeals(); }, []));

  const loadMeals = async () => {
    try {
      const data = await SecureStore.getItemAsync('meals');
      if (data) setMealHistory(JSON.parse(data));
    } catch (e) { console.log(e); }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleLog = async () => {
    if (!description.trim()) return Alert.alert('Add Meal', 'Please describe what you ate');
    setLogging(true);
    const meal: Meal = { id: Date.now().toString(), type: mealType, photo, description: description.trim(), timestamp: new Date().toISOString(), date: new Date().toDateString() };
    try {
      const existing = await SecureStore.getItemAsync('meals');
      const meals = existing ? JSON.parse(existing) : [];
      meals.unshift(meal);
      await SecureStore.setItemAsync('meals', JSON.stringify(meals.slice(0, 100)));
      setMealHistory(meals.slice(0, 100));
    } catch (e) { console.log(e); }
    setPhoto(null); setDescription(''); setMealType('lunch');
    setLogging(false);
    Alert.alert('Logged! 🎉', 'Your meal has been saved');
  };

  const openHistory = () => {
    loadMeals();
    setSelectedMeal(null);
    setNutritionData(null);
    setHistoryVisible(true);
  };

  const closeHistory = () => {
    setHistoryVisible(false);
    setSelectedMeal(null);
    setNutritionData(null);
    setAnalyzing(false);
  };

  const analyzeMeal = (meal: Meal) => {
    console.log('Analyzing meal:', meal.description);
    setSelectedMeal(meal);
    setNutritionData(null);
    setAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const result = estimateNutrition(meal.description);
      console.log('Analysis result:', result);
      setNutritionData(result);
      setAnalyzing(false);
    }, 1000);
  };

  const backToList = () => {
    setSelectedMeal(null);
    setNutritionData(null);
    setAnalyzing(false);
  };

  const estimateNutrition = (text: string) => {
    const t = text.toLowerCase();
    let cal = 300, pro = 10, carb = 35, fat = 8, gut = 3.5;
    const assumptions: string[] = [];
    
    if (t.includes('burger')) { assumptions.push('1 burger'); cal += 400; pro += 22; carb += 35; fat += 20; gut -= 0.5; }
    if (t.includes('pizza')) { assumptions.push('2 slices pizza'); cal += 450; carb += 50; fat += 18; gut -= 0.4; }
    if (t.includes('roti') || t.includes('chapati')) { assumptions.push('2 rotis'); cal += 160; carb += 32; }
    if (t.includes('rice')) { assumptions.push('1 cup rice'); cal += 200; carb += 45; }
    if (t.includes('dal') || t.includes('lentil')) { assumptions.push('1 bowl dal'); cal += 150; pro += 12; gut += 0.3; }
    if (t.includes('curry') || t.includes('sabzi')) { assumptions.push('1 serving curry'); cal += 150; fat += 8; }
    if (t.includes('yogurt') || t.includes('curd')) { assumptions.push('1 cup yogurt'); cal += 100; pro += 8; gut += 0.5; }
    if (t.includes('coke') || t.includes('cola') || t.includes('soda') || t.includes('pepsi')) { assumptions.push('250ml soft drink'); cal += 100; carb += 27; gut -= 0.4; }
    if (t.includes('chicken')) { assumptions.push('150g chicken'); cal += 200; pro += 25; }
    if (t.includes('egg')) { assumptions.push('2 eggs'); cal += 150; pro += 12; fat += 10; }
    if (t.includes('paneer')) { assumptions.push('100g paneer'); cal += 250; pro += 14; fat += 18; }
    if (t.includes('fries')) { assumptions.push('1 serving fries'); cal += 300; carb += 35; fat += 15; gut -= 0.3; }
    if (t.includes('salad')) { assumptions.push('1 bowl salad'); cal += 80; gut += 0.3; }
    if (t.includes('biryani')) { assumptions.push('1 plate biryani'); cal += 550; carb += 60; pro += 22; fat += 18; }
    if (t.includes('dosa')) { assumptions.push('2 dosas'); cal += 200; carb += 30; gut += 0.2; }
    if (t.includes('idli')) { assumptions.push('3 idlis'); cal += 180; carb += 35; gut += 0.2; }
    if (t.includes('paratha')) { assumptions.push('2 parathas'); cal += 300; carb += 40; fat += 12; }
    if (t.includes('samosa')) { assumptions.push('2 samosas'); cal += 300; carb += 30; fat += 18; gut -= 0.3; }
    if (t.includes('naan')) { assumptions.push('1 naan'); cal += 260; carb += 45; fat += 5; }
    if (t.includes('tea') || t.includes('chai')) { assumptions.push('1 cup tea'); cal += 50; }
    if (t.includes('coffee')) { assumptions.push('1 cup coffee'); cal += 30; }
    
    if (assumptions.length === 0) assumptions.push('1 regular meal');
    gut = Math.max(1, Math.min(5, gut));
    
    return { 
      assumptions, 
      nutrition: { calories: Math.round(cal), protein: Math.round(pro), carbs: Math.round(carb), fat: Math.round(fat) }, 
      gutScore: parseFloat(gut.toFixed(1)) 
    };
  };

  const getMealIcon = (type: string) => {
    const icons: any = { breakfast: 'sunny', lunch: 'partly-sunny', dinner: 'moon', snack: 'cafe' };
    return icons[type] || 'restaurant';
  };
  
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const formatDate = (d: string) => { 
    const today = new Date().toDateString(); 
    const yest = new Date(Date.now() - 86400000).toDateString(); 
    if (d === today) return 'Today'; 
    if (d === yest) return 'Yesterday'; 
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); 
  };
  
  const grouped = mealHistory.reduce((g: any, m) => { 
    if (!g[m.date]) g[m.date] = []; 
    g[m.date].push(m); 
    return g; 
  }, {});
  
  const getGutColor = (s: number) => s >= 4 ? '#27AE60' : s >= 3 ? '#F39C12' : '#E74C3C';
  
  const mealTypes = [
    { type: 'breakfast', icon: 'sunny', label: 'Breakfast' }, 
    { type: 'lunch', icon: 'partly-sunny', label: 'Lunch' }, 
    { type: 'dinner', icon: 'moon', label: 'Dinner' }, 
    { type: 'snack', icon: 'cafe', label: 'Snack' }
  ];

  // Render analysis view inside modal
  const renderAnalysisView = () => {
    if (!selectedMeal) return null;
    
    return (
      <View style={styles.analysisContainer}>
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={backToList}>
          <Ionicons name="arrow-back" size={24} color="#4A7C59" />
          <Text style={styles.backButtonText}>Back to History</Text>
        </TouchableOpacity>
        
        {analyzing ? (
          <View style={styles.analyzingBox}>
            <ActivityIndicator size="large" color="#4A7C59" />
            <Text style={styles.analyzingText}>Analyzing nutrition...</Text>
          </View>
        ) : nutritionData ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.analysisTitle}>Nutrition Estimate</Text>
            <Text style={styles.mealDesc}>"{selectedMeal.description}"</Text>
            
            <View style={styles.assumeCard}>
              <Text style={styles.assumeTitle}>📝 Our Assumptions</Text>
              <Text style={styles.assumeSubtitle}>Based on your description:</Text>
              {nutritionData.assumptions.map((a: string, i: number) => (
                <Text key={i} style={styles.assumeItem}>• {a}</Text>
              ))}
            </View>
            
            <View style={[styles.gutCard, { backgroundColor: getGutColor(nutritionData.gutScore) + '15' }]}>
              <Text style={styles.gutLabel}>Estimated Gut Impact</Text>
              <Text style={[styles.gutValue, { color: getGutColor(nutritionData.gutScore) }]}>
                {nutritionData.gutScore}/5
              </Text>
            </View>
            
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{nutritionData.nutrition.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{nutritionData.nutrition.protein}g</Text>
                <Text style={styles.nutritionLabel}>Protein</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{nutritionData.nutrition.carbs}g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{nutritionData.nutrition.fat}g</Text>
                <Text style={styles.nutritionLabel}>Fat</Text>
              </View>
            </View>
            
            <Text style={styles.disclaimer}>⚠️ These are estimates only. Actual values may vary based on portions and preparation.</Text>
          </ScrollView>
        ) : null}
      </View>
    );
  };

  // Render meal list view inside modal
  const renderListView = () => {
    return (
      <ScrollView style={styles.historyList}>
        {mealHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="restaurant-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyHistoryText}>No meals logged yet</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([date, meals]: [string, any]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayHeader}>{formatDate(date)}</Text>
              {meals.map((meal: Meal) => (
                <View key={meal.id} style={styles.historyItem}>
                  <View style={styles.mealIcon}>
                    <Ionicons name={getMealIcon(meal.type) as any} size={18} color="#4A7C59" />
                  </View>
                  <View style={styles.historyContent}>
                    <Text style={styles.historyType}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} • {formatTime(meal.timestamp)}</Text>
                    <Text style={styles.historyDesc} numberOfLines={2}>{meal.description}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.analyzeBtn} 
                    onPress={() => analyzeMeal(meal)}
                  >
                    <Ionicons name="nutrition" size={16} color="#FFF" />
                    <Text style={styles.analyzeBtnText}>Analyze</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
        <View style={{height: 40}} />
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* History Button */}
      <TouchableOpacity style={styles.historyButton} onPress={openHistory} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={20} color="#4A7C59" />
        <Text style={styles.historyButtonText}>View Meal History</Text>
        <View style={styles.historyBadge}><Text style={styles.historyBadgeText}>{mealHistory.length}</Text></View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* History Modal */}
      <Modal visible={historyVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedMeal ? 'Analysis' : 'Meal History'}
            </Text>
            <TouchableOpacity onPress={closeHistory} hitSlop={{top:15,bottom:15,left:15,right:15}}>
              <Ionicons name="close" size={28} color="#2D3436" />
            </TouchableOpacity>
          </View>
          
          {/* Show either list or analysis */}
          {selectedMeal ? renderAnalysisView() : renderListView()}
        </SafeAreaView>
      </Modal>

      {/* Meal Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Type</Text>
        <View style={styles.mealTypeRow}>
          {mealTypes.map((item) => (
            <TouchableOpacity 
              key={item.type} 
              style={[styles.mealTypeButton, mealType === item.type && styles.mealTypeActive]} 
              onPress={() => setMealType(item.type as MealType)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as any} size={20} color={mealType === item.type ? '#FFF' : '#636E72'} />
              <Text style={[styles.mealTypeText, mealType === item.type && styles.mealTypeTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo (Optional)</Text>
        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
              <Ionicons name="close-circle" size={32} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto} activeOpacity={0.7}>
              <View style={styles.photoIcon}><Ionicons name="camera" size={26} color="#4A7C59" /></View>
              <Text style={styles.photoText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={pickImage} activeOpacity={0.7}>
              <View style={styles.photoIcon}><Ionicons name="images" size={26} color="#4A7C59" /></View>
              <Text style={styles.photoText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What did you eat?</Text>
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g., 2 rotis with dal and yogurt" 
          placeholderTextColor="#9CA3AF" 
          multiline 
          numberOfLines={3} 
          value={description} 
          onChangeText={setDescription} 
        />
        <Text style={styles.tipText}>💡 Be specific for better analysis later</Text>
      </View>

      {/* Log Button */}
      <TouchableOpacity 
        style={[styles.logButton, logging && styles.logButtonDisabled]} 
        onPress={handleLog} 
        disabled={logging}
        activeOpacity={0.8}
      >
        {logging ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            <Text style={styles.logButtonText}>Log Meal</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
  historyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  historyButtonText: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: '#2D3436' },
  historyBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  historyBadgeText: { fontSize: 12, fontWeight: '700', color: '#4A7C59' },
  modalContainer: { flex: 1, backgroundColor: '#F5F7F5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#2D3436' },
  historyList: { flex: 1, padding: 16 },
  emptyHistory: { alignItems: 'center', paddingTop: 80 },
  emptyHistoryText: { marginTop: 12, fontSize: 15, color: '#9CA3AF' },
  dayGroup: { marginBottom: 24 },
  dayHeader: { fontSize: 14, fontWeight: '700', color: '#4A7C59', marginBottom: 10, marginLeft: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8 },
  mealIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyContent: { flex: 1 },
  historyType: { fontSize: 12, fontWeight: '600', color: '#636E72' },
  historyDesc: { fontSize: 14, fontWeight: '600', color: '#2D3436', marginTop: 2 },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A7C59', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  analyzeBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF', marginLeft: 5 },
  
  // Analysis styles
  analysisContainer: { flex: 1, padding: 16 },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButtonText: { fontSize: 16, fontWeight: '600', color: '#4A7C59', marginLeft: 8 },
  analyzingBox: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  analyzingText: { marginTop: 16, fontSize: 16, color: '#636E72' },
  analysisTitle: { fontSize: 22, fontWeight: '800', color: '#2D3436', textAlign: 'center', marginBottom: 8 },
  mealDesc: { fontSize: 15, color: '#636E72', fontStyle: 'italic', marginBottom: 20, textAlign: 'center' },
  assumeCard: { backgroundColor: '#FFF9E6', borderRadius: 14, padding: 16, marginBottom: 16 },
  assumeTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 4 },
  assumeSubtitle: { fontSize: 13, color: '#636E72', marginBottom: 10 },
  assumeItem: { fontSize: 14, color: '#2D3436', marginVertical: 3 },
  gutCard: { borderRadius: 14, padding: 20, marginBottom: 16, alignItems: 'center' },
  gutLabel: { fontSize: 13, color: '#636E72', marginBottom: 6 },
  gutValue: { fontSize: 40, fontWeight: '800' },
  nutritionGrid: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingVertical: 16, backgroundColor: '#FFF', borderRadius: 14 },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { fontSize: 22, fontWeight: '800', color: '#2D3436' },
  nutritionLabel: { fontSize: 12, color: '#636E72', marginTop: 4 },
  disclaimer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  
  section: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436', marginBottom: 12 },
  mealTypeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mealTypeButton: { flex: 1, alignItems: 'center', paddingVertical: 12, marginHorizontal: 3, borderRadius: 12, backgroundColor: '#F5F7F5' },
  mealTypeActive: { backgroundColor: '#4A7C59' },
  mealTypeText: { marginTop: 4, fontSize: 11, fontWeight: '600', color: '#636E72' },
  mealTypeTextActive: { color: '#FFF' },
  photoButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  photoButton: { alignItems: 'center', padding: 16 },
  photoIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  photoText: { fontSize: 13, color: '#2D3436', fontWeight: '500' },
  photoContainer: { position: 'relative' },
  photo: { width: '100%', height: 160, borderRadius: 12 },
  removePhoto: { position: 'absolute', top: 8, right: 8, backgroundColor: '#FFF', borderRadius: 16 },
  textInput: { backgroundColor: '#F5F7F5', borderRadius: 12, padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: 'top', color: '#2D3436' },
  tipText: { fontSize: 12, color: '#9CA3AF', marginTop: 10 },
  logButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A7C59', marginHorizontal: 16, marginTop: 24, paddingVertical: 18, borderRadius: 14, shadowColor: '#4A7C59', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  logButtonDisabled: { opacity: 0.7 },
  logButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700', marginLeft: 8 },
});
