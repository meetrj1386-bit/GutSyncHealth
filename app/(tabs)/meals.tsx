import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeals } from '../../lib/data';
import { Meal } from '../../lib/supabase';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, getGutScoreColor, getGutScoreLabel, getMealTags, MEAL_TYPES } from '../../lib/theme';

type FilterType = 'today' | 'week' | 'month' | 'all';

export default function MealsScreen() {
  const [filter, setFilter] = useState<FilterType>('today');
  const { meals, isLoading, refetch, deleteMeal } = useMeals(filter);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getMealEmoji = (type: string) => MEAL_TYPES.find(m => m.id === type)?.emoji || '🍽️';

  const handleDeleteMeal = (id: string, description: string) => {
    Alert.alert('Delete Meal', `Remove "${description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMeal(id) },
    ]);
  };

  // Group meals by date
  const groupedMeals = meals.reduce((groups: Record<string, typeof meals>, meal) => {
    const date = formatDate(meal.logged_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(meal);
    return groups;
  }, {});

  // Calculate stats - handle NaN properly
  const mealsWithGutScore = meals.filter(m => m.gut_score !== null && m.gut_score !== undefined && !isNaN(m.gut_score));
  const avgGutScore = mealsWithGutScore.length > 0
    ? mealsWithGutScore.reduce((sum, m) => sum + (m.gut_score || 0), 0) / mealsWithGutScore.length
    : null;

  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalFiber = meals.reduce((sum, m) => sum + (m.fiber || 0), 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal History</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/log')}>
          <Text style={styles.addButtonText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['today', 'week', 'month', 'all'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      {meals.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{meals.length}</Text>
            <Text style={styles.statLabel}>Meals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, avgGutScore ? { color: getGutScoreColor(avgGutScore) } : {}]}>
              {avgGutScore ? avgGutScore.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statLabel}>Avg Gut</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCalories > 0 ? totalCalories.toLocaleString() : '—'}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      )}

      {/* Nutrition Summary */}
      {(totalProtein > 0 || totalFiber > 0) && (
        <View style={styles.nutritionSummary}>
          <Text style={styles.nutritionItem}>🥩 {totalProtein}g protein</Text>
          <Text style={styles.nutritionItem}>🌿 {totalFiber}g fiber</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⏳</Text>
            <Text style={styles.emptyText}>Loading meals...</Text>
          </View>
        ) : meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals {filter !== 'all' ? filter : ''}</Text>
            <Text style={styles.emptyText}>
              Log your meals to track nutrition and see how food affects your gut health.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/log')}>
              <Text style={styles.emptyButtonText}>Log Your First Meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          Object.entries(groupedMeals).map(([date, dateMeals]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dateMeals.map((meal) => {
                const scoreLabel = meal.gut_score ? getGutScoreLabel(meal.gut_score) : null;
                const tags = getMealTags(meal);
                const fiberBoost = meal.fiber && meal.fiber >= 5;
                
                return (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.mealCard}
                    onPress={() => setSelectedMeal(meal)}
                    onLongPress={() => handleDeleteMeal(meal.id, meal.description)}
                    activeOpacity={0.7}
                  >
                    {/* Fiber Boost Banner */}
                    {fiberBoost && (
                      <View style={styles.fiberBoostBanner}>
                        <Text style={styles.fiberBoostText}>🌱 Fiber Boost: {meal.fiber}g</Text>
                      </View>
                    )}
                    
                    <View style={styles.mealCardInner}>
                      {/* Left - Image or Emoji */}
                      <View style={styles.mealLeft}>
                        {meal.photo_url ? (
                          <Image source={{ uri: meal.photo_url }} style={styles.mealImage} />
                        ) : (
                          <View style={styles.mealEmojiContainer}>
                            <Text style={styles.mealEmoji}>{getMealEmoji(meal.meal_type)}</Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Center - Info */}
                      <View style={styles.mealCenter}>
                        <View style={styles.mealTypeRow}>
                          <Text style={styles.mealType}>
                            {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                          </Text>
                          <Text style={styles.mealTime}>{formatTime(meal.logged_at)}</Text>
                        </View>
                        <Text style={styles.mealDescription} numberOfLines={2}>{meal.description}</Text>
                        
                        {/* Nutrition Chips */}
                        <View style={styles.nutritionChips}>
                          {meal.calories ? (
                            <View style={styles.chip}>
                              <Text style={styles.chipText}>{meal.calories} cal</Text>
                            </View>
                          ) : null}
                          {meal.protein ? (
                            <View style={[styles.chip, styles.chipProtein]}>
                              <Text style={styles.chipText}>{meal.protein}g protein</Text>
                            </View>
                          ) : null}
                          {meal.fiber && !fiberBoost ? (
                            <View style={[styles.chip, styles.chipFiber]}>
                              <Text style={[styles.chipText, styles.chipFiberText]}>{meal.fiber}g fiber</Text>
                            </View>
                          ) : null}
                        </View>
                        
                        {/* Tags */}
                        {tags.length > 0 && (
                          <View style={styles.tagsRow}>
                            {tags.map((tag, i) => (
                              <View key={i} style={[styles.tag, !tag.positive && styles.tagWarning]}>
                                <Text style={styles.tagText}>{tag.emoji} {tag.label}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                      
                      {/* Right - Gut Score */}
                      <TouchableOpacity 
                        style={styles.mealRight}
                        onPress={() => setSelectedMeal(meal)}
                      >
                        {scoreLabel ? (
                          <View style={[styles.gutScoreBadge, { backgroundColor: scoreLabel.color + '15', borderColor: scoreLabel.color + '30' }]}>
                            <Text style={styles.gutScoreEmoji}>{scoreLabel.emoji}</Text>
                            <Text style={[styles.gutScoreText, { color: scoreLabel.color }]}>
                              {meal.gut_score?.toFixed(1)}
                            </Text>
                            <Text style={[styles.gutScoreLabel, { color: scoreLabel.color }]}>
                              {scoreLabel.label}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.noScoreBadge}>
                            <Text style={styles.noScoreText}>—</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                    
                    {/* Impact Reason (if AI analysis exists) */}
                    {meal.ai_analysis && (
                      <View style={styles.impactReason}>
                        <Text style={styles.impactText} numberOfLines={1}>
                          {meal.gut_score && meal.gut_score >= 7 ? '✓ ' : meal.gut_score && meal.gut_score < 5 ? '⚠️ ' : '→ '}
                          {meal.ai_analysis}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        {meals.length > 0 && (
          <Text style={styles.hint}>Tap meal for details • Long press to delete</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MEAL DETAIL MODAL */}
      <Modal visible={!!selectedMeal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMeal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {getMealEmoji(selectedMeal.meal_type)} {selectedMeal.meal_type.charAt(0).toUpperCase() + selectedMeal.meal_type.slice(1)}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedMeal(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Photo if exists */}
                  {selectedMeal.photo_url && (
                    <Image source={{ uri: selectedMeal.photo_url }} style={styles.modalImage} />
                  )}

                  <Text style={styles.modalDescription}>{selectedMeal.description}</Text>
                  <Text style={styles.modalTime}>
                    {formatDate(selectedMeal.logged_at)} at {formatTime(selectedMeal.logged_at)}
                  </Text>

                  {/* Gut Score Card - BIGGER and BETTER */}
                  {selectedMeal.gut_score && (
                    <View style={[styles.modalGutCard, { 
                      backgroundColor: getGutScoreColor(selectedMeal.gut_score) + '15',
                      borderColor: getGutScoreColor(selectedMeal.gut_score) 
                    }]}>
                      <View style={styles.modalGutScoreCircle}>
                        <Text style={styles.modalGutEmoji}>
                          {selectedMeal.gut_score >= 7 ? '💚' : selectedMeal.gut_score >= 5 ? '💛' : selectedMeal.gut_score >= 3 ? '🧡' : '❤️'}
                        </Text>
                        <Text style={[styles.modalGutValue, { color: getGutScoreColor(selectedMeal.gut_score) }]}>
                          {selectedMeal.gut_score.toFixed(1)}
                        </Text>
                        <Text style={[styles.modalGutLabel, { color: getGutScoreColor(selectedMeal.gut_score) }]}>
                          {getGutScoreLabel(selectedMeal.gut_score).label}
                        </Text>
                      </View>
                      <Text style={styles.modalGutDesc}>
                        {selectedMeal.gut_score >= 7 ? '✓ Great for gut health - fiber supports good bacteria' :
                         selectedMeal.gut_score >= 5 ? '→ Moderate impact - add more veggies next time' :
                         selectedMeal.gut_score >= 3 ? '⚠️ May stress gut - high fat or processed' :
                         '⚠️ Likely to cause discomfort - consider avoiding'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Add Symptom After Meal */}
                  <TouchableOpacity 
                    style={styles.addSymptomButton}
                    onPress={() => {
                      setSelectedMeal(null);
                      router.push('/(tabs)/checkin');
                    }}
                  >
                    <Text style={styles.addSymptomIcon}>🩺</Text>
                    <View style={styles.addSymptomContent}>
                      <Text style={styles.addSymptomTitle}>+ Log Symptom After This Meal</Text>
                      <Text style={styles.addSymptomSubtitle}>Gas, bloating, heaviness, cravings...</Text>
                    </View>
                    <Text style={styles.addSymptomArrow}>→</Text>
                  </TouchableOpacity>

                  {/* Nutrition Grid */}
                  <View style={styles.modalNutritionCard}>
                    <Text style={styles.modalSectionTitle}>📊 Nutrition</Text>
                    <View style={styles.modalNutritionGrid}>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedMeal.calories || 0}</Text>
                        <Text style={styles.modalNutritionLabel}>Calories</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedMeal.protein || 0}g</Text>
                        <Text style={styles.modalNutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedMeal.carbs || 0}g</Text>
                        <Text style={styles.modalNutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.modalNutritionItem}>
                        <Text style={styles.modalNutritionValue}>{selectedMeal.fat || 0}g</Text>
                        <Text style={styles.modalNutritionLabel}>Fat</Text>
                      </View>
                      <View style={[styles.modalNutritionItem, { backgroundColor: Colors.successLight }]}>
                        <Text style={[styles.modalNutritionValue, { color: Colors.success }]}>{selectedMeal.fiber || 0}g</Text>
                        <Text style={styles.modalNutritionLabel}>Fiber 🌱</Text>
                      </View>
                      {selectedMeal.sugar !== undefined && selectedMeal.sugar !== null && (
                        <View style={styles.modalNutritionItem}>
                          <Text style={[styles.modalNutritionValue, (selectedMeal.sugar || 0) > 15 && { color: Colors.warning }]}>
                            {selectedMeal.sugar}g
                          </Text>
                          <Text style={styles.modalNutritionLabel}>Sugar</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* AI Analysis */}
                  {selectedMeal.ai_analysis && (
                    <View style={styles.modalAnalysisCard}>
                      <Text style={styles.modalSectionTitle}>🧠 AI Analysis</Text>
                      <Text style={styles.modalAnalysisText}>{selectedMeal.ai_analysis}</Text>
                    </View>
                  )}

                  {/* AI Tips */}
                  {selectedMeal.ai_tips && selectedMeal.ai_tips.length > 0 && (
                    <View style={styles.modalTipsCard}>
                      <Text style={styles.modalSectionTitle}>💡 Tips</Text>
                      {selectedMeal.ai_tips.map((tip, idx) => (
                        <Text key={idx} style={styles.modalTipText}>• {tip}</Text>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.modalDeleteBtn}
                    onPress={() => {
                      setSelectedMeal(null);
                      handleDeleteMeal(selectedMeal.id, selectedMeal.description);
                    }}
                  >
                    <Text style={styles.modalDeleteText}>🗑️ Delete Meal</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.text },
  addButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  addButtonText: { color: Colors.textInverse, fontSize: FontSizes.sm, fontWeight: '600' },
  
  filterContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filterTab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: Colors.primary },
  filterText: { fontSize: FontSizes.sm, color: Colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: Colors.primary, fontWeight: '600' },
  
  statsContainer: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginHorizontal: Spacing.xs, alignItems: 'center', ...Shadows.card },
  statValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  
  nutritionSummary: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  nutritionItem: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginHorizontal: Spacing.md },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg },
  
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '600' },
  
  dateGroup: { marginBottom: Spacing.lg },
  dateHeader: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Premium meal card with shadow
  mealCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.card },
  mealCardInner: { flexDirection: 'row', padding: Spacing.md },
  
  // Fiber Boost Banner
  fiberBoostBanner: { backgroundColor: Colors.successLight, paddingVertical: 4, paddingHorizontal: Spacing.md },
  fiberBoostText: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.success },
  
  mealLeft: { marginRight: Spacing.md },
  mealImage: { width: 60, height: 60, borderRadius: BorderRadius.md },
  mealEmojiContainer: { width: 60, height: 60, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryFaded, alignItems: 'center', justifyContent: 'center' },
  mealEmoji: { fontSize: 28 },
  
  mealCenter: { flex: 1 },
  mealTypeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  mealType: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, marginRight: Spacing.sm },
  mealTime: { fontSize: FontSizes.xs, color: Colors.textMuted },
  mealDescription: { fontSize: FontSizes.md, color: Colors.text, marginBottom: Spacing.xs },
  
  // Nutrition Chips
  nutritionChips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4 },
  chip: { backgroundColor: Colors.borderLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  chipText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontWeight: '500' },
  chipProtein: { backgroundColor: '#DBEAFE' },
  chipFiber: { backgroundColor: Colors.successLight },
  chipFiberText: { color: Colors.success },
  
  // Tags row
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.xs, gap: 4 },
  tag: { backgroundColor: Colors.primaryFaded, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tagWarning: { backgroundColor: '#FEF3C7' },
  tagText: { fontSize: 10, color: Colors.text, fontWeight: '500' },
  
  // Gut Score Badge
  mealRight: { justifyContent: 'center', marginLeft: Spacing.sm },
  gutScoreBadge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, alignItems: 'center', minWidth: 65, borderWidth: 1 },
  gutScoreEmoji: { fontSize: 16, marginBottom: 2 },
  gutScoreText: { fontSize: FontSizes.lg, fontWeight: '700' },
  gutScoreLabel: { fontSize: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  noScoreBadge: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  noScoreText: { fontSize: FontSizes.md, color: Colors.textMuted },
  
  // Impact Reason
  impactReason: { backgroundColor: Colors.background, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  impactText: { fontSize: FontSizes.xs, color: Colors.textSecondary, fontStyle: 'italic' },
  
  hint: { fontSize: FontSizes.xs, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, paddingBottom: 40, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  modalClose: { fontSize: 24, color: Colors.textMuted, padding: 8 },
  modalImage: { width: '100%', height: 200, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  modalDescription: { fontSize: FontSizes.lg, color: Colors.text, marginBottom: Spacing.xs },
  modalTime: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.md },
  
  modalGutCard: { borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 2, alignItems: 'center' },
  modalGutScoreCircle: { alignItems: 'center', paddingVertical: Spacing.sm },
  modalGutEmoji: { fontSize: 36 },
  modalGutLabel: { fontSize: FontSizes.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  modalGutValue: { fontSize: 42, fontWeight: '700', marginVertical: 4 },
  modalGutDesc: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
  
  // Add Symptom Button
  addSymptomButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.warningLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.warning },
  addSymptomIcon: { fontSize: 24, marginRight: Spacing.md },
  addSymptomContent: { flex: 1 },
  addSymptomTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.warning },
  addSymptomSubtitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  addSymptomArrow: { fontSize: FontSizes.lg, color: Colors.warning },
  
  modalNutritionCard: { backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  modalSectionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  modalNutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modalNutritionItem: { width: '30%', alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  modalNutritionValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  modalNutritionLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  
  modalAnalysisCard: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  modalAnalysisText: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 22 },
  
  modalTipsCard: { backgroundColor: Colors.successLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  modalTipText: { fontSize: FontSizes.sm, color: Colors.success, marginBottom: 4 },
  
  modalDeleteBtn: { paddingVertical: Spacing.md, alignItems: 'center' },
  modalDeleteText: { fontSize: FontSizes.md, color: Colors.error },
});
