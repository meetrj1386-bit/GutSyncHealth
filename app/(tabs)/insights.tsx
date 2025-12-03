import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCheckIns, useMeals, useSupplements, useInsights } from '../../lib/data';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, SYMPTOMS, getGutScoreColor, getMoodData } from '../../lib/theme';

export default function InsightsScreen() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const { checkIns, refetch: refetchCheckIns } = useCheckIns({ start: twoWeeksAgo, end: new Date() });
  const { meals, refetch: refetchMeals } = useMeals('week');
  const { supplements } = useSupplements();
  const { insights, refetch: refetchInsights } = useInsights();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCheckIns(), refetchMeals(), refetchInsights()]);
    setRefreshing(false);
  }, []);

  // Calculate week's check-ins
  const weekCheckIns = checkIns.filter(c => new Date(c.check_in_date) >= weekAgo);
  
  // Calculate averages
  const avgGut = weekCheckIns.length > 0 ? weekCheckIns.reduce((s, c) => s + c.gut, 0) / weekCheckIns.length : 0;
  const avgEnergy = weekCheckIns.length > 0 ? weekCheckIns.reduce((s, c) => s + c.energy, 0) / weekCheckIns.length : 0;
  const avgMood = weekCheckIns.length > 0 ? weekCheckIns.reduce((s, c) => s + c.mood, 0) / weekCheckIns.length : 0;

  // Best and worst days
  const sortedByGut = [...weekCheckIns].sort((a, b) => b.gut - a.gut);
  const bestDay = sortedByGut[0];
  const worstDay = sortedByGut[sortedByGut.length - 1];

  // Meal Quality Stats
  const mealsWithGut = meals.filter(m => m.gut_score !== null && m.gut_score !== undefined);
  const avgMealGut = mealsWithGut.length > 0 ? mealsWithGut.reduce((s, m) => s + (m.gut_score || 0), 0) / mealsWithGut.length : 0;
  const totalFiber = meals.reduce((s, m) => s + (m.fiber || 0), 0);
  const totalSugar = meals.reduce((s, m) => s + (m.sugar || 0), 0);
  const avgFiberPerMeal = meals.length > 0 ? totalFiber / meals.length : 0;
  const avgSugarPerMeal = meals.length > 0 ? totalSugar / meals.length : 0;
  const gutFriendlyCount = mealsWithGut.filter(m => (m.gut_score || 0) >= 7).length;
  const toAvoidCount = mealsWithGut.filter(m => (m.gut_score || 0) < 5).length;

  // PATTERNS & TRIGGERS - This is the key feature!
  const generatePatterns = () => {
    const patterns: { icon: string; text: string; count: number }[] = [];

    // Pattern 1: Low fiber = low energy
    const lowFiberDays: string[] = [];
    const lowEnergyAfterLowFiber: string[] = [];
    
    meals.forEach(meal => {
      if (meal.fiber && meal.fiber < 5) {
        const mealDate = new Date(meal.logged_at).toDateString();
        if (!lowFiberDays.includes(mealDate)) lowFiberDays.push(mealDate);
      }
    });

    weekCheckIns.forEach(ci => {
      const ciDate = new Date(ci.check_in_date).toDateString();
      const yesterdayDate = new Date(ci.check_in_date);
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      
      if (lowFiberDays.includes(yesterdayDate.toDateString()) && ci.energy <= 4) {
        if (!lowEnergyAfterLowFiber.includes(ciDate)) lowEnergyAfterLowFiber.push(ciDate);
      }
    });

    if (lowEnergyAfterLowFiber.length >= 2) {
      patterns.push({
        icon: '🥬',
        text: `Low fiber breakfast → low energy at 3 PM`,
        count: lowEnergyAfterLowFiber.length
      });
    }

    // Pattern 2: Symptoms correlation
    const symptomDays: Record<string, { dates: string[]; avgGut: number }> = {};
    
    weekCheckIns.forEach(ci => {
      (ci.symptoms || []).forEach(sym => {
        if (!symptomDays[sym]) symptomDays[sym] = { dates: [], avgGut: 0 };
        symptomDays[sym].dates.push(ci.check_in_date);
        symptomDays[sym].avgGut += ci.gut;
      });
    });

    Object.entries(symptomDays).forEach(([sym, data]) => {
      if (data.dates.length >= 2) {
        data.avgGut = data.avgGut / data.dates.length;
        const label = SYMPTOMS.find(s => s.id === sym)?.label || sym;
        
        // Check if meals before symptom have pattern
        const mealsBeforeSymptom = meals.filter(m => {
          const mealDate = new Date(m.logged_at);
          return data.dates.some(d => {
            const symDate = new Date(d);
            const hoursDiff = (symDate.getTime() - mealDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff > 0 && hoursDiff < 12;
          });
        });

        // Check for dairy pattern
        const dairyMeals = mealsBeforeSymptom.filter(m => 
          m.description?.toLowerCase().includes('milk') ||
          m.description?.toLowerCase().includes('cheese') ||
          m.description?.toLowerCase().includes('dairy') ||
          m.description?.toLowerCase().includes('yogurt')
        );

        if (sym === 'gas' || sym === 'bloating') {
          if (dairyMeals.length >= 1) {
            patterns.push({
              icon: '🥛',
              text: `Dairy → ${label} within 3-4 hours`,
              count: dairyMeals.length
            });
          }
        }
      }
    });

    // Pattern 3: Late dinner = low gut next morning
    const lateDinnerDays: string[] = [];
    meals.forEach(m => {
      if (m.meal_type === 'dinner') {
        const hour = new Date(m.logged_at).getHours();
        if (hour >= 21) {
          lateDinnerDays.push(new Date(m.logged_at).toDateString());
        }
      }
    });

    const lowGutAfterLateDinner = weekCheckIns.filter(ci => {
      const yesterday = new Date(ci.check_in_date);
      yesterday.setDate(yesterday.getDate() - 1);
      return lateDinnerDays.includes(yesterday.toDateString()) && ci.gut <= 5;
    });

    if (lowGutAfterLateDinner.length >= 2) {
      patterns.push({
        icon: '🌙',
        text: `Late dinner → low gut score next morning`,
        count: lowGutAfterLateDinner.length
      });
    }

    // Pattern 4: Missing supplement correlation
    const hasMagnesium = supplements.some(s => s.name.toLowerCase().includes('magnesium'));
    const lowSleepDays = weekCheckIns.filter(ci => ci.energy <= 3).length;
    
    if (hasMagnesium && lowSleepDays >= 2) {
      patterns.push({
        icon: '💊',
        text: `Check magnesium consistency → linked to energy`,
        count: lowSleepDays
      });
    }

    // Pattern 5: High sugar = inflammation
    const highSugarMeals = meals.filter(m => (m.sugar || 0) > 20);
    if (highSugarMeals.length >= 2) {
      patterns.push({
        icon: '🍬',
        text: `High sugar meals → may cause inflammation`,
        count: highSugarMeals.length
      });
    }

    return patterns.slice(0, 5);
  };

  // Top symptoms
  const symptomCounts: Record<string, number> = {};
  weekCheckIns.forEach(ci => {
    (ci.symptoms || []).forEach(sym => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // AI Recommendations
  const getRecommendations = () => {
    const recs: string[] = [];
    
    if (avgFiberPerMeal < 5) recs.push("Increase fiber: Add oats, berries, or leafy greens to each meal");
    if (avgSugarPerMeal > 15) recs.push("Reduce sugar: Swap processed snacks for whole foods");
    if (avgGut < 5 && topSymptoms.some(([s]) => s === 'bloating')) {
      recs.push("For bloating: Eat slowly, avoid carbonated drinks, try peppermint tea");
    }
    if (avgEnergy < 5) recs.push("Boost energy: Check B12 levels and sleep quality");
    if (toAvoidCount > gutFriendlyCount) recs.push("Your meals trend low on gut-friendliness. Try more whole foods.");
    
    if (recs.length === 0) recs.push("Keep up your healthy habits! Your patterns look good.");
    
    return recs.slice(0, 3);
  };

  const patterns = generatePatterns();
  const recommendations = getRecommendations();

  // TOP DRIVER OF THE WEEK
  const getTopDriver = () => {
    const drivers: { emoji: string; label: string; impact: string; detail: string }[] = [];
    
    if (avgFiberPerMeal < 5 && meals.length >= 3) {
      drivers.push({
        emoji: '🥬',
        label: 'Low Fiber Intake',
        impact: 'Impacting: Gut, Energy, Mood',
        detail: `Avg ${avgFiberPerMeal.toFixed(0)}g/meal (aim for 8g+)`
      });
    }
    
    if (avgSugarPerMeal > 15) {
      drivers.push({
        emoji: '🍬',
        label: 'High Sugar Consumption',
        impact: 'Impacting: Gut inflammation, Energy crashes',
        detail: `Avg ${avgSugarPerMeal.toFixed(0)}g/meal (aim for <10g)`
      });
    }
    
    if (topSymptoms.length > 0 && topSymptoms[0][1] >= 3) {
      const symptom = SYMPTOMS.find(s => s.id === topSymptoms[0][0]);
      drivers.push({
        emoji: symptom?.emoji || '⚠️',
        label: `Frequent ${symptom?.label || 'Symptoms'}`,
        impact: 'Impacting: Daily comfort, Quality of life',
        detail: `Occurred ${topSymptoms[0][1]} times this week`
      });
    }
    
    if (avgEnergy < 4) {
      drivers.push({
        emoji: '😴',
        label: 'Low Energy Pattern',
        impact: 'Impacting: Productivity, Mood',
        detail: `Avg energy ${avgEnergy.toFixed(1)}/10`
      });
    }
    
    return drivers[0] || null;
  };

  const topDriver = getTopDriver();

  // FOOD SENSITIVITY DETECTION
  const detectFoodSensitivities = () => {
    const sensitivities: { food: string; symptom: string; count: number }[] = [];
    
    // Foods to check
    const triggerFoods = [
      { keywords: ['dairy', 'milk', 'cheese', 'yogurt', 'ice cream'], label: 'Dairy' },
      { keywords: ['gluten', 'bread', 'pasta', 'wheat'], label: 'Gluten' },
      { keywords: ['garlic', 'onion'], label: 'Garlic/Onion' },
      { keywords: ['coffee', 'caffeine'], label: 'Coffee' },
      { keywords: ['fried', 'oily', 'greasy'], label: 'Fried Foods' },
      { keywords: ['spicy', 'chili', 'hot sauce'], label: 'Spicy Foods' },
      { keywords: ['alcohol', 'wine', 'beer'], label: 'Alcohol' },
      { keywords: ['sugar', 'candy', 'soda'], label: 'Sugar' },
    ];
    
    // Check each food against symptoms
    triggerFoods.forEach(({ keywords, label }) => {
      const mealsWithFood = meals.filter(m => 
        keywords.some(k => m.description?.toLowerCase().includes(k))
      );
      
      if (mealsWithFood.length > 0) {
        // Check for symptoms within 12 hours after these meals
        ['bloating', 'gas', 'nausea', 'heartburn', 'diarrhea'].forEach(symptom => {
          let symptomCount = 0;
          
          mealsWithFood.forEach(meal => {
            const mealTime = new Date(meal.logged_at).getTime();
            const hasSymptomAfter = weekCheckIns.some(ci => {
              const ciTime = new Date(ci.check_in_date).getTime();
              const hoursDiff = (ciTime - mealTime) / (1000 * 60 * 60);
              return hoursDiff > 0 && hoursDiff < 24 && ci.symptoms?.includes(symptom);
            });
            if (hasSymptomAfter) symptomCount++;
          });
          
          if (symptomCount >= 2) {
            const symptomLabel = SYMPTOMS.find(s => s.id === symptom)?.label || symptom;
            sensitivities.push({
              food: label,
              symptom: symptomLabel,
              count: symptomCount
            });
          }
        });
      }
    });
    
    return sensitivities.slice(0, 5);
  };

  const foodSensitivities = detectFoodSensitivities();

  // GUT TREND DATA (last 7 days)
  const gutTrendData = weekCheckIns
    .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime())
    .map(ci => ({
      day: new Date(ci.check_in_date).toLocaleDateString('en-US', { weekday: 'short' }),
      gut: ci.gut,
      energy: ci.energy,
      mood: ci.mood,
    }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📊 Insights</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {weekCheckIns.length < 3 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyTitle}>Need More Data</Text>
            <Text style={styles.emptyText}>
              Complete at least 3 check-ins and log meals to see personalized patterns and insights.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/checkin')}>
              <Text style={styles.emptyButtonText}>Do Check-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Weekly Averages */}
            <View style={styles.avgCard}>
              <Text style={styles.avgTitle}>This Week's Averages</Text>
              <View style={styles.avgRow}>
                <View style={styles.avgItem}>
                  <Text style={styles.avgEmoji}>🦠</Text>
                  <Text style={[styles.avgValue, { color: getGutScoreColor(avgGut) }]}>{avgGut.toFixed(1)}</Text>
                  <Text style={styles.avgLabel}>Gut</Text>
                </View>
                <View style={styles.avgItem}>
                  <Text style={styles.avgEmoji}>⚡</Text>
                  <Text style={styles.avgValue}>{avgEnergy.toFixed(1)}</Text>
                  <Text style={styles.avgLabel}>Energy</Text>
                </View>
                <View style={styles.avgItem}>
                  <Text style={styles.avgEmoji}>🧠</Text>
                  <Text style={styles.avgValue}>{avgMood.toFixed(1)}</Text>
                  <Text style={styles.avgLabel}>Mood</Text>
                </View>
              </View>
            </View>

            {/* 🔥 TOP DRIVER OF THE WEEK */}
            {topDriver && (
              <View style={styles.topDriverCard}>
                <Text style={styles.topDriverTitle}>🔥 Driver of the Week</Text>
                <View style={styles.topDriverContent}>
                  <Text style={styles.topDriverEmoji}>{topDriver.emoji}</Text>
                  <View style={styles.topDriverText}>
                    <Text style={styles.topDriverLabel}>{topDriver.label}</Text>
                    <Text style={styles.topDriverImpact}>{topDriver.impact}</Text>
                    <Text style={styles.topDriverDetail}>{topDriver.detail}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 🌱 PATTERNS & TRIGGERS - THE KEY FEATURE */}
            <View style={styles.patternsCard}>
              <Text style={styles.patternsTitle}>🌱 Top Patterns This Week</Text>
              {patterns.length > 0 ? (
                patterns.map((p, i) => (
                  <View key={i} style={styles.patternRow}>
                    <Text style={styles.patternIcon}>{p.icon}</Text>
                    <Text style={styles.patternText}>{p.text}</Text>
                    <View style={styles.patternCount}>
                      <Text style={styles.patternCountText}>{p.count}x</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noPatterns}>Log more meals and check-ins to discover patterns</Text>
              )}
            </View>

            {/* 📈 GUT TREND GRAPH with Momentum */}
            {gutTrendData.length >= 3 && (
              <View style={styles.trendCard}>
                {/* Gut Momentum Header */}
                <View style={styles.trendHeader}>
                  <Text style={styles.trendTitle}>📈 7-Day Gut Trend</Text>
                  {(() => {
                    const firstHalf = gutTrendData.slice(0, Math.floor(gutTrendData.length / 2));
                    const secondHalf = gutTrendData.slice(Math.floor(gutTrendData.length / 2));
                    const firstAvg = firstHalf.reduce((s, d) => s + d.gut, 0) / firstHalf.length;
                    const secondAvg = secondHalf.reduce((s, d) => s + d.gut, 0) / secondHalf.length;
                    const momentum = secondAvg - firstAvg;
                    const isImproving = momentum > 0.2;
                    const isDeclining = momentum < -0.2;
                    return (
                      <View style={[styles.momentumBadge, { 
                        backgroundColor: isImproving ? Colors.successLight : isDeclining ? Colors.errorLight : Colors.warningLight 
                      }]}>
                        <Text style={[styles.momentumText, {
                          color: isImproving ? Colors.success : isDeclining ? Colors.error : Colors.warning
                        }]}>
                          {isImproving ? '📈 Improving' : isDeclining ? '📉 Declining' : '➡️ Stable'} 
                          {Math.abs(momentum) >= 0.1 ? ` ${momentum > 0 ? '+' : ''}${momentum.toFixed(1)}` : ''}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                
                {/* Chart with gradient background */}
                <View style={styles.trendChartWrapper}>
                  <View style={styles.trendChart}>
                    {gutTrendData.map((d, i) => (
                      <View key={i} style={styles.trendBarContainer}>
                        <View style={[styles.trendBar, { 
                          height: `${d.gut * 10}%`,
                          backgroundColor: d.gut >= 7 ? Colors.success : d.gut >= 5 ? Colors.warning : '#F97316'
                        }]} />
                        <Text style={styles.trendBarLabel}>{d.day}</Text>
                        <Text style={styles.trendBarValue}>{d.gut.toFixed(0)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 🚨 FOOD SENSITIVITY DETECTION */}
            {foodSensitivities.length > 0 && (
              <View style={styles.sensitivityCard}>
                <Text style={styles.sensitivityTitle}>🚨 Possible Food Sensitivities</Text>
                <Text style={styles.sensitivitySubtitle}>Based on meal + symptom patterns</Text>
                {foodSensitivities.map((s, i) => (
                  <View key={i} style={styles.sensitivityRow}>
                    <Text style={styles.sensitivityFood}>🍽️ {s.food}</Text>
                    <Text style={styles.sensitivityArrow}>→</Text>
                    <Text style={styles.sensitivitySymptom}>{s.symptom}</Text>
                    <View style={styles.sensitivityCount}>
                      <Text style={styles.sensitivityCountText}>{s.count}x</Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.sensitivityNote}>💡 Try eliminating these foods for 2 weeks to test</Text>
              </View>
            )}

            {/* Meal Quality Score */}
            <View style={styles.mealQualityCard}>
              <Text style={styles.mealQualityTitle}>🥗 Meal Quality Score</Text>
              <View style={styles.mealQualityGrid}>
                <View style={styles.mealQualityStat}>
                  <Text style={styles.mealQualityValue}>{meals.length}</Text>
                  <Text style={styles.mealQualityLabel}>Meals</Text>
                </View>
                <View style={styles.mealQualityStat}>
                  <Text style={[styles.mealQualityValue, { color: getGutScoreColor(avgMealGut) }]}>
                    {avgMealGut.toFixed(1)}
                  </Text>
                  <Text style={styles.mealQualityLabel}>Avg Score</Text>
                </View>
                <View style={styles.mealQualityStat}>
                  <Text style={[styles.mealQualityValue, { color: avgFiberPerMeal >= 5 ? Colors.success : Colors.warning }]}>
                    {avgFiberPerMeal.toFixed(0)}g
                  </Text>
                  <Text style={styles.mealQualityLabel}>Fiber/meal</Text>
                </View>
                <View style={styles.mealQualityStat}>
                  <Text style={[styles.mealQualityValue, { color: avgSugarPerMeal <= 10 ? Colors.success : Colors.warning }]}>
                    {avgSugarPerMeal.toFixed(0)}g
                  </Text>
                  <Text style={styles.mealQualityLabel}>Sugar/meal</Text>
                </View>
              </View>
              <View style={styles.mealQualityRow}>
                <View style={[styles.mealQualityBadge, { backgroundColor: Colors.successLight }]}>
                  <Text style={[styles.mealQualityBadgeText, { color: Colors.success }]}>
                    ✓ {gutFriendlyCount} Gut-Friendly
                  </Text>
                </View>
                <View style={[styles.mealQualityBadge, { backgroundColor: Colors.warningLight }]}>
                  <Text style={[styles.mealQualityBadgeText, { color: Colors.warning }]}>
                    ⚠ {toAvoidCount} To Avoid
                  </Text>
                </View>
              </View>
            </View>

            {/* Best & Worst Days */}
            <View style={styles.dayCardsRow}>
              {bestDay && (
                <View style={[styles.dayCard, { borderColor: Colors.success }]}>
                  <Text style={styles.dayCardTitle}>🌟 Best Day</Text>
                  <Text style={styles.dayCardDate}>
                    {new Date(bestDay.check_in_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={[styles.dayCardScore, { color: Colors.success }]}>{bestDay.gut}/10</Text>
                </View>
              )}
              {worstDay && bestDay && worstDay.id !== bestDay.id && (
                <View style={[styles.dayCard, { borderColor: Colors.warning }]}>
                  <Text style={styles.dayCardTitle}>😔 Tough Day</Text>
                  <Text style={styles.dayCardDate}>
                    {new Date(worstDay.check_in_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={[styles.dayCardScore, { color: Colors.warning }]}>{worstDay.gut}/10</Text>
                </View>
              )}
            </View>

            {/* Top Symptoms */}
            {topSymptoms.length > 0 && (
              <View style={styles.symptomsCard}>
                <Text style={styles.symptomsTitle}>🤢 Common Symptoms</Text>
                <View style={styles.symptomsGrid}>
                  {topSymptoms.map(([sym, count]) => {
                    const symptom = SYMPTOMS.find(s => s.id === sym);
                    return (
                      <View key={sym} style={styles.symptomItem}>
                        <Text style={styles.symptomEmoji}>{symptom?.emoji}</Text>
                        <Text style={styles.symptomLabel}>{symptom?.label}</Text>
                        <Text style={styles.symptomCount}>{count}x</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* AI Recommendations */}
            <View style={styles.recsCard}>
              <Text style={styles.recsTitle}>💡 AI Recommendations</Text>
              {recommendations.map((rec, i) => (
                <View key={i} style={styles.recItem}>
                  <Text style={styles.recText}>• {rec}</Text>
                </View>
              ))}
            </View>

            {/* 📖 Weekly Story Button */}
            <TouchableOpacity 
              style={styles.weeklyStoryButton}
              onPress={() => router.push('/(tabs)/ask')}
            >
              <Text style={styles.weeklyStoryIcon}>📖</Text>
              <View style={styles.weeklyStoryText}>
                <Text style={styles.weeklyStoryTitle}>View My Weekly Gut Story</Text>
                <Text style={styles.weeklyStorySubtitle}>3 wins • patterns • what to improve</Text>
              </View>
              <Text style={styles.weeklyStoryArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '500' },
  title: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.lg, gap: Spacing.lg }, // Added gap for breathing room
  
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSizes.xl, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSizes.md, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyButton: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.lg },
  emptyButtonText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '600' },
  
  // Averages
  avgCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 0, ...Shadows.card },
  avgTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md },
  avgRow: { flexDirection: 'row', justifyContent: 'space-around' },
  avgItem: { alignItems: 'center' },
  avgEmoji: { fontSize: 24, marginBottom: 4 },
  avgValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  avgLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  
  // Patterns - THE KEY FEATURE!
  patternsCard: { backgroundColor: Colors.warningLight, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 0, borderWidth: 2, borderColor: Colors.warning },
  patternsTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.warning, marginBottom: Spacing.sm },
  patternRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: 6 },
  patternIcon: { fontSize: 18, marginRight: 8 },
  patternText: { flex: 1, fontSize: FontSizes.sm, color: Colors.text },
  patternCount: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2 },
  patternCountText: { fontSize: FontSizes.xs, color: Colors.textInverse, fontWeight: '600' },
  noPatterns: { fontSize: FontSizes.sm, color: Colors.textSecondary, fontStyle: 'italic' },
  
  // TOP DRIVER
  topDriverCard: { backgroundColor: Colors.error + '15', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 0, borderWidth: 2, borderColor: Colors.error },
  topDriverTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.error, marginBottom: Spacing.sm },
  topDriverContent: { flexDirection: 'row', alignItems: 'center' },
  topDriverEmoji: { fontSize: 36, marginRight: Spacing.md },
  topDriverText: { flex: 1 },
  topDriverLabel: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.text },
  topDriverImpact: { fontSize: FontSizes.sm, color: Colors.error, marginTop: 2 },
  topDriverDetail: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  
  // Meal Quality
  mealQualityCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  mealQualityTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.md },
  mealQualityGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  mealQualityStat: { alignItems: 'center', flex: 1 },
  mealQualityValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  mealQualityLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  mealQualityRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  mealQualityBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  mealQualityBadgeText: { fontSize: FontSizes.sm, fontWeight: '600' },
  
  // Day Cards
  dayCardsRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  dayCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 2, alignItems: 'center' },
  dayCardTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  dayCardDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
  dayCardScore: { fontSize: FontSizes.xl, fontWeight: '700', marginTop: 4 },
  
  // Symptoms
  symptomsCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadows.sm },
  symptomsTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md },
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  symptomItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  symptomEmoji: { fontSize: 14, marginRight: 4 },
  symptomLabel: { fontSize: FontSizes.sm, color: Colors.text },
  symptomCount: { fontSize: FontSizes.xs, color: Colors.textMuted, marginLeft: 4 },
  
  // Recommendations
  recsCard: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 0 },
  recsTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary, marginBottom: Spacing.sm },
  recItem: { marginBottom: 6 },
  recText: { fontSize: FontSizes.sm, color: Colors.text, lineHeight: 20 },
  
  // Weekly Story Button - Premium CTA
  weeklyStoryButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    borderRadius: BorderRadius.lg, 
    padding: Spacing.md,
    marginBottom: 0,
    ...Shadows.card,
  },
  weeklyStoryIcon: { fontSize: 28, marginRight: Spacing.md },
  weeklyStoryText: { flex: 1 },
  weeklyStoryTitle: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textInverse },
  weeklyStorySubtitle: { fontSize: FontSizes.xs, color: Colors.textInverse, opacity: 0.8, marginTop: 2 },
  weeklyStoryArrow: { fontSize: FontSizes.xl, color: Colors.textInverse, fontWeight: '600' },
  
  // Trend Chart with Gradient & Momentum
  trendCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: 0, ...Shadows.card },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  trendTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  momentumBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  momentumText: { fontSize: FontSizes.xs, fontWeight: '600' },
  trendChartWrapper: { backgroundColor: '#F8FAFD', borderRadius: BorderRadius.md, padding: Spacing.sm },
  trendChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingTop: 20 },
  trendBarContainer: { alignItems: 'center', flex: 1 },
  trendBar: { width: 28, borderRadius: 6, minHeight: 8 },
  trendBarLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 6 },
  trendBarValue: { fontSize: 11, color: Colors.text, fontWeight: '600' },
  
  // Food Sensitivity
  sensitivityCard: { backgroundColor: '#FFF3E0', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 2, borderColor: '#FF9800' },
  sensitivityTitle: { fontSize: FontSizes.md, fontWeight: '700', color: '#E65100', marginBottom: 2 },
  sensitivitySubtitle: { fontSize: FontSizes.xs, color: '#FF9800', marginBottom: Spacing.sm },
  sensitivityRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: 6 },
  sensitivityFood: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text, flex: 1 },
  sensitivityArrow: { fontSize: FontSizes.sm, color: '#FF9800', marginHorizontal: 8 },
  sensitivitySymptom: { fontSize: FontSizes.sm, color: Colors.error },
  sensitivityCount: { backgroundColor: '#FF9800', borderRadius: BorderRadius.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  sensitivityCountText: { fontSize: FontSizes.xs, color: Colors.textInverse, fontWeight: '600' },
  sensitivityNote: { fontSize: FontSizes.xs, color: '#E65100', marginTop: Spacing.sm, fontStyle: 'italic' },
});
