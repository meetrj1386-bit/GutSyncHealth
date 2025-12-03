import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { useTodayCheckIn, useMeals, useSupplements, useCheckIns } from '../../lib/data';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, getMoodData, getGutScoreColor, MEAL_TYPES, SYMPTOMS } from '../../lib/theme';

const { width } = Dimensions.get('window');

// FRIENDLY LABELS (not negative!)
const GUT_LABELS = {
  great: { label: 'Feeling Great!', sublabel: 'Your gut is thriving today 🌟', color: '#10B981' },
  good: { label: 'Looking Good', sublabel: 'Keep up the healthy choices! 💪', color: '#34D399' },
  ok: { label: 'Needs Support', sublabel: 'Small adjustments can boost tomorrow 💛', color: '#F59E0B' },
  struggling: { label: 'Needs Attention', sublabel: 'Let\'s focus on gut-friendly foods today 🤗', color: '#EF4444' },
};

const getGutLabel = (score: number) => {
  if (score >= 7) return GUT_LABELS.great;
  if (score >= 5) return GUT_LABELS.good;
  if (score >= 3) return GUT_LABELS.ok;
  return GUT_LABELS.struggling;
};

export default function HomeScreen() {
  const { profile } = useAuth();
  const { checkIn, isLoading: checkInLoading, refetch: refetchCheckIn } = useTodayCheckIn();
  const { meals: todayMeals, isLoading: mealsLoading, refetch: refetchMeals } = useMeals('today');
  const { meals: weekMeals } = useMeals('week');
  const { supplements, refetch: refetchSupplements } = useSupplements();
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { checkIns: recentCheckIns } = useCheckIns({ start: weekAgo, end: new Date() });
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
  const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
  const { checkIns: yesterdayCheckIns } = useCheckIns({ start: yesterdayStart, end: yesterdayEnd });
  const yesterdayCheckIn = yesterdayCheckIns[0];
  
  const [refreshing, setRefreshing] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [modalType, setModalType] = useState<'gut' | 'energy' | 'mood'>('gut');

  const openModal = (type: 'gut' | 'energy' | 'mood') => {
    setModalType(type);
    setShowWhyModal(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCheckIn(), refetchMeals(), refetchSupplements()]);
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = profile?.name?.split(' ')[0] || 'there';

  // Calculate scores
  const gutScore = checkIn?.gut || null;
  const moodScore = checkIn?.mood || null;
  const energyScore = checkIn?.energy || null;

  const avgGutScore = recentCheckIns.length > 0
    ? recentCheckIns.reduce((sum, c) => sum + c.gut, 0) / recentCheckIns.length
    : null;

  const displayGutScore = gutScore || avgGutScore;
  const displayMoodScore = moodScore || (recentCheckIns.length > 0 ? recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length : null);
  const displayEnergyScore = energyScore || (recentCheckIns.length > 0 ? recentCheckIns.reduce((sum, c) => sum + c.energy, 0) / recentCheckIns.length : null);
  
  const gutMood = displayGutScore ? getMoodData(displayGutScore) : null;
  const gutLabel = displayGutScore ? getGutLabel(displayGutScore) : null;

  // Yesterday's data
  const yesterdayMeals = weekMeals.filter(m => {
    const mealDate = new Date(m.logged_at);
    return mealDate >= yesterdayStart && mealDate <= yesterdayEnd;
  });

  const yesterdayFiber = yesterdayMeals.reduce((sum, m) => sum + (m.fiber || 0), 0);
  const yesterdaySugar = yesterdayMeals.reduce((sum, m) => sum + (m.sugar || 0), 0);
  const todayFiber = todayMeals.reduce((sum, m) => sum + (m.fiber || 0), 0);
  const todaySugar = todayMeals.reduce((sum, m) => sum + (m.sugar || 0), 0);

  // DAILY COMPLETION RING
  const mealsLogged = todayMeals.length;
  const hasCheckIn = !!checkIn;
  const supplementsCount = supplements.length;
  
  const totalTasks = 4 + supplementsCount; // 3 meals + check-in + supplements
  const completedTasks = Math.min(mealsLogged, 3) + (hasCheckIn ? 1 : 0);
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // WHAT'S DRIVING TODAY
  const getDrivers = () => {
    const drivers: { icon: string; label: string; value: string; direction: 'up' | 'down' | 'neutral' }[] = [];
    
    drivers.push({
      icon: '🌱',
      label: 'Fiber',
      value: `${todayFiber.toFixed(0)}g`,
      direction: todayFiber >= 10 ? 'up' : 'down'
    });
    
    drivers.push({
      icon: '🍬',
      label: 'Sugar',
      value: `${todaySugar.toFixed(0)}g`,
      direction: todaySugar <= 15 ? 'up' : 'down'
    });
    
    if (displayEnergyScore) {
      drivers.push({
        icon: '⚡',
        label: 'Energy',
        value: `${displayEnergyScore.toFixed(1)}`,
        direction: displayEnergyScore >= 6 ? 'up' : 'down'
      });
    }
    
    if (displayMoodScore) {
      drivers.push({
        icon: '🧠',
        label: 'Mood',
        value: `${displayMoodScore.toFixed(1)}`,
        direction: displayMoodScore >= 6 ? 'up' : 'down'
      });
    }
    
    return drivers.slice(0, 4);
  };

  // PERSONAL PATTERN BADGE
  const getPatternBadge = () => {
    if (yesterdayFiber < 10 && todayFiber < 10) {
      return { emoji: '🌱', text: 'Low Fiber Pattern', color: Colors.warning };
    }
    if (yesterdaySugar > 25 || todaySugar > 25) {
      return { emoji: '🍬', text: 'High Sugar Alert', color: Colors.error };
    }
    if (displayEnergyScore && displayEnergyScore < 4) {
      return { emoji: '😴', text: 'Energy Gap Detected', color: Colors.warning };
    }
    if (recentCheckIns.filter(c => c.symptoms?.includes('bloating')).length >= 2) {
      return { emoji: '🎈', text: 'Bloating Pattern', color: Colors.warning };
    }
    if (displayGutScore && displayGutScore >= 7) {
      return { emoji: '🌟', text: 'Great Week!', color: Colors.success };
    }
    return null;
  };

  // ONE SIMPLE FIX
  const getSimpleFix = () => {
    if (todayFiber < 5) {
      return { action: 'Add handful of nuts/seeds', impact: '+5g fiber, better digestion', icon: '🥜' };
    }
    if (todaySugar > 20) {
      return { action: 'Drink 300ml warm water now', impact: 'reduces sugar cravings', icon: '💧' };
    }
    if (!hasCheckIn) {
      return { action: 'Do a 30-sec check-in', impact: 'unlocks personalized insights', icon: '📝' };
    }
    if (mealsLogged < 2) {
      return { action: 'Log your next meal', impact: 'AI learns your patterns', icon: '📸' };
    }
    if (displayEnergyScore && displayEnergyScore < 5) {
      return { action: 'Take a 10-min walk outside', impact: '+2 energy points (avg)', icon: '🚶' };
    }
    if (displayGutScore && displayGutScore < 5) {
      return { action: 'Eat probiotic food (yogurt/kimchi)', impact: 'supports gut healing', icon: '🦠' };
    }
    return { action: 'Keep up great habits!', impact: 'you\'re on track 🎉', icon: '✨' };
  };

  // PREDICTION
  const getPrediction = () => {
    if (todayFiber < 5) {
      return { time: '2-4 PM', issue: 'Low energy', fix: 'Add oats or fruits before lunch' };
    }
    if (yesterdaySugar > 25) {
      return { time: 'Afternoon', issue: 'Sugar cravings', fix: 'Have protein-rich snack ready' };
    }
    if (displayGutScore && displayGutScore < 4) {
      return { time: 'Evening', issue: 'Digestive discomfort', fix: 'Eat light dinner, avoid dairy' };
    }
    return { time: 'Today', issue: 'Good momentum!', fix: 'Maintain current habits' };
  };

  const drivers = getDrivers();
  const patternBadge = getPatternBadge();
  const simpleFix = getSimpleFix();
  const prediction = getPrediction();
  const isLoading = checkInLoading || mealsLoading;
  
  // Check if user is new (no meals ever logged)
  const isNewUser = weekMeals.length === 0 && !hasCheckIn;
  const hasEnoughData = weekMeals.length >= 3; // Need at least 3 meals for patterns

  // Get active indicator index for strip
  const getActiveIndicator = () => {
    if (!displayGutScore) return -1;
    if (displayGutScore >= 7) return 0;
    if (displayGutScore >= 5) return 1;
    if (displayGutScore >= 3) return 2;
    return 3;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}, {firstName} 👋</Text>
            {profile?.streak_count != null && profile.streak_count > 0 && (
              <Text style={styles.streak}>🔥 {profile.streak_count} day streak</Text>
            )}
          </View>
          
          {/* Daily Completion Ring */}
          <TouchableOpacity style={styles.ringContainer} onPress={() => router.push('/(tabs)/checkin')}>
            <View style={styles.ringOuter}>
              <View style={[styles.ringProgress, { 
                borderColor: completionPercent >= 75 ? Colors.success : completionPercent >= 50 ? Colors.warning : Colors.primary,
                borderTopColor: 'transparent',
                transform: [{ rotate: `${(completionPercent / 100) * 360}deg` }]
              }]} />
              <View style={styles.ringInner}>
                <Text style={styles.ringPercent}>{completionPercent}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Daily Progress Bar */}
        <View style={styles.dailyProgressContainer}>
          <View style={styles.dailyProgressHeader}>
            <Text style={styles.dailyProgressLabel}>Daily Progress</Text>
            <Text style={styles.dailyProgressPercent}>{completionPercent}%</Text>
          </View>
          <View style={styles.dailyProgressBar}>
            <View style={[styles.dailyProgressFill, { 
              width: `${completionPercent}%`,
              backgroundColor: completionPercent >= 75 ? Colors.success : completionPercent >= 50 ? Colors.warning : Colors.primary 
            }]} />
          </View>
          <Text style={styles.dailyProgressHint}>
            {completionPercent < 25 ? '🚀 Just getting started!' : 
             completionPercent < 50 ? '💪 Keep going!' : 
             completionPercent < 75 ? '🔥 Almost there!' : 
             '🎉 Great job today!'}
          </Text>
        </View>

        {/* Welcome Card for New Users */}
        {isNewUser && (
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeBannerEmoji}>🎉</Text>
            <View style={styles.welcomeBannerContent}>
              <Text style={styles.welcomeBannerTitle}>Welcome to GutSync!</Text>
              <Text style={styles.welcomeBannerText}>Start logging meals & check-ins — we'll show your first insights today.</Text>
            </View>
          </View>
        )}

        {/* Main Score Card - COMPACT */}
        <TouchableOpacity style={styles.scoresCard} onPress={() => openModal('gut')} activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 16 }} />
          ) : displayGutScore ? (
            <>
              {/* Score Row - Emoji + Number together */}
              <View style={styles.scoreRow}>
                <Text style={styles.gutEmoji}>{gutMood?.emoji}</Text>
                <Text style={[styles.gutScore, { color: gutLabel?.color }]}>{displayGutScore.toFixed(1)}</Text>
              </View>
              
              {/* Label */}
              <Text style={[styles.gutLabel, { color: gutLabel?.color }]}>{gutLabel?.label}</Text>
              
              {/* Compact Indicator Strip */}
              <View style={styles.indicatorStrip}>
                {[
                  { color: Colors.success, label: 'Great', active: getActiveIndicator() === 0 },
                  { color: Colors.warning, label: 'OK', active: getActiveIndicator() === 1 },
                  { color: '#F97316', label: 'Support', active: getActiveIndicator() === 2 },
                  { color: Colors.error, label: 'Attention', active: getActiveIndicator() === 3 },
                ].map((item, i) => (
                  <View key={i} style={[styles.indicatorItem, item.active && [styles.indicatorActive, { borderColor: item.color }]]}>
                    <View style={[styles.indicatorDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.indicatorLabel, item.active && styles.indicatorLabelActive]}>{item.label}</Text>
                  </View>
                ))}
              </View>
              
              {/* Triangle - Compact */}
              <View style={styles.triangleContainer}>
                <TouchableOpacity style={styles.triangleItem} onPress={() => openModal('energy')}>
                  <Text style={styles.triangleEmoji}>⚡</Text>
                  <Text style={styles.triangleValue}>{displayEnergyScore?.toFixed(1) || '—'}</Text>
                  <Text style={styles.triangleLabel}>Energy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.triangleItem} onPress={() => openModal('mood')}>
                  <Text style={styles.triangleEmoji}>🧠</Text>
                  <Text style={styles.triangleValue}>{displayMoodScore?.toFixed(1) || '—'}</Text>
                  <Text style={styles.triangleLabel}>Mood</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.triangleItem} onPress={() => openModal('gut')}>
                  <Text style={styles.triangleEmoji}>🦠</Text>
                  <Text style={styles.triangleValue}>{displayGutScore?.toFixed(1) || '—'}</Text>
                  <Text style={styles.triangleLabel}>Gut</Text>
                </TouchableOpacity>
              </View>
              
              {/* Quick Check-in Button - Inline */}
              <TouchableOpacity 
                style={styles.quickCheckinButton} 
                onPress={() => router.push('/(tabs)/checkin')}
              >
                <Text style={styles.quickCheckinText}>📝 Update Check-in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(tabs)/checkin')} style={styles.emptyGut}>
              <Text style={styles.emptyGutEmoji}>🩺</Text>
              <Text style={styles.emptyGutTitle}>How are you feeling?</Text>
              <Text style={styles.emptyGutSubtitle}>Tap to do your first check-in</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* ✨ QUICK WIN - Show for all users, moved up for immediate value */}
        <TouchableOpacity style={styles.quickWinCard} onPress={() => {
          if (simpleFix.icon === '📝') router.push('/(tabs)/checkin');
          else if (simpleFix.icon === '📸') router.push('/(tabs)/log');
          else router.push('/(tabs)/ask');
        }}>
          <Text style={styles.quickWinIcon}>{simpleFix.icon}</Text>
          <View style={styles.quickWinContent}>
            <Text style={styles.quickWinTitle}>✨ Quick Win</Text>
            <Text style={styles.quickWinAction}>{simpleFix.action}</Text>
            <Text style={styles.quickWinImpact}>→ {simpleFix.impact}</Text>
          </View>
          <Text style={styles.quickWinArrow}>→</Text>
        </TouchableOpacity>

        {/* 🎯 NEXT ACTION CTA */}
        <View style={styles.nextActionContainer}>
          <Text style={styles.nextActionLabel}>What should I do next?</Text>
          <View style={styles.nextActionButtons}>
            {!hasCheckIn && (
              <TouchableOpacity style={styles.nextActionBtn} onPress={() => router.push('/(tabs)/checkin')}>
                <Text style={styles.nextActionEmoji}>📝</Text>
                <Text style={styles.nextActionText}>Check-in</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextActionBtn} onPress={() => router.push('/(tabs)/log')}>
              <Text style={styles.nextActionEmoji}>📸</Text>
              <Text style={styles.nextActionText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextActionBtn} onPress={() => router.push('/(tabs)/ask')}>
              <Text style={styles.nextActionEmoji}>💚</Text>
              <Text style={styles.nextActionText}>Ask Coach</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🔥 TOP DRIVER TODAY - Only show when we have meal data */}
        {todayMeals.length > 0 && (
          <View style={styles.topDriverCard}>
            <Text style={styles.topDriverBadge}>🔥 Top Driver Today</Text>
            <Text style={styles.topDriverText}>
              {todayFiber >= 15 ? '🌱 High Fiber Intake (+gut health)' :
               todaySugar > 20 ? '🍬 High Sugar Consumption (watch energy)' :
               todayMeals.reduce((s, m) => s + (m.protein || 0), 0) >= 40 ? '💪 Good Protein Intake (+energy)' :
               mealsLogged >= 3 ? '✅ Regular Eating Pattern (+metabolism)' :
               '📊 Keep logging to find your top driver'}
            </Text>
          </View>
        )}

        {/* NEW USER GETTING STARTED - Compact version */}
        {isNewUser && (
          <View style={styles.gettingStartedCard}>
            <Text style={styles.gettingStartedTitle}>🚀 Getting Started</Text>
            <View style={styles.gettingStartedSteps}>
              <View style={styles.gettingStartedStep}>
                <View style={[styles.stepDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.stepText}>Log a meal</Text>
              </View>
              <View style={styles.gettingStartedStep}>
                <View style={[styles.stepDot, { backgroundColor: hasCheckIn ? Colors.primary : Colors.border }]} />
                <Text style={styles.stepText}>Daily check-in</Text>
              </View>
              <View style={styles.gettingStartedStep}>
                <View style={[styles.stepDot, { backgroundColor: Colors.border }]} />
                <Text style={styles.stepText}>See insights</Text>
              </View>
            </View>
          </View>
        )}

        {/* WHAT'S DRIVING TODAY - Only show when we have meal data */}
        {todayMeals.length > 0 && (
          <View style={styles.driversCard}>
            <Text style={styles.driversTitle}>📊 What's Driving Today</Text>
            <View style={styles.driversGrid}>
              {drivers.map((d, i) => (
                <View key={i} style={styles.driverItem}>
                  <Text style={styles.driverIcon}>{d.icon}</Text>
                  <Text style={styles.driverLabel}>{d.label}</Text>
                  <View style={styles.driverValueRow}>
                    <Text style={[styles.driverArrow, { color: d.direction === 'up' ? Colors.success : Colors.error }]}>
                      {d.direction === 'up' ? '⬆' : '⬇'}
                    </Text>
                    <Text style={styles.driverValue}>{d.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ✨ YOUR BODY STORY TODAY - Only show when we have data */}
        {!isNewUser && (
          <TouchableOpacity style={styles.bodyStoryButton} onPress={() => openModal('gut')}>
            <Text style={styles.bodyStoryIcon}>✨</Text>
            <View style={styles.bodyStoryContent}>
              <Text style={styles.bodyStoryTitle}>Your Body Story Today</Text>
              <Text style={styles.bodyStorySubtitle}>Gut score • why • patterns • simple fix</Text>
            </View>
            <Text style={styles.bodyStoryArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* 🔮 PREDICTION - Only show when we have enough historical data */}
        {hasEnoughData && (
          <View style={styles.predictionCard}>
            <Text style={styles.predictionTitle}>🔮 Today's Prediction</Text>
            <View style={styles.predictionContent}>
              <Text style={styles.predictionTime}>{prediction.time}</Text>
              <Text style={styles.predictionIssue}>{prediction.issue}</Text>
            </View>
            <Text style={styles.predictionFix}>🔹 Fix: {prediction.fix}</Text>
          </View>
        )}

        {/* PATTERN BADGE - Only show when we have enough data */}
        {hasEnoughData && patternBadge && (
          <TouchableOpacity style={[styles.patternBadge, { backgroundColor: patternBadge.color + '20', borderColor: patternBadge.color }]} onPress={() => router.push('/(tabs)/insights')}>
            <Text style={styles.patternEmoji}>{patternBadge.emoji}</Text>
            <Text style={[styles.patternText, { color: patternBadge.color }]}>{patternBadge.text}</Text>
            <Text style={styles.patternArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* TODAY'S MEALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍽️  TODAY'S MEALS</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/meals')}>
              <Text style={styles.seeAllText}>History →</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealsRow}>
            {MEAL_TYPES.slice(0, 4).map((mealType) => {
              const meal = todayMeals.find(m => m.meal_type === mealType.id);
              const gutIndicator = meal?.gut_score ? (meal.gut_score >= 7 ? '🟢' : meal.gut_score >= 5 ? '🟡' : '🔴') : '';
              return (
                <TouchableOpacity
                  key={mealType.id}
                  style={[styles.mealCard, meal && styles.mealCardLogged]}
                  onPress={() => router.push('/(tabs)/log')}
                >
                  <Text style={styles.mealEmoji}>{mealType.emoji}</Text>
                  <Text style={styles.mealType}>{mealType.label}</Text>
                  {meal ? (
                    <>
                      <Text style={styles.mealDesc} numberOfLines={1}>{meal.description}</Text>
                      {(meal.fiber || meal.gut_score) && (
                        <View style={styles.mealStats}>
                          {meal.fiber !== null && meal.fiber !== undefined && <Text style={styles.mealFiber}>🌱{meal.fiber}g</Text>}
                          {meal.gut_score !== null && meal.gut_score !== undefined && (
                            <Text style={[styles.mealGutScore, { color: getGutScoreColor(meal.gut_score) }]}>
                              {gutIndicator}{meal.gut_score.toFixed(1)}
                            </Text>
                          )}
                        </View>
                      )}
                    </>
                  ) : (
                    <Text style={styles.mealAdd}>+ Log</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SUPPLEMENTS - Horizontal Grid */}
        {supplements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💊  SUPPLEMENTS</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/cabinet')}>
                <Text style={styles.seeAllText}>Manage →</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.supplementsRow}>
              {supplements.slice(0, 5).map((supp) => {
                const insight = getSupplementInsight(supp, displayEnergyScore, displayMoodScore);
                return (
                  <TouchableOpacity key={supp.id} style={styles.suppCardHorizontal} onPress={() => router.push('/(tabs)/cabinet')}>
                    <Text style={styles.suppPill}>💊</Text>
                    <Text style={styles.suppNameHorizontal} numberOfLines={1}>{supp.name}</Text>
                    {supp.dosage && <Text style={styles.suppDosageHorizontal}>{supp.dosage}</Text>}
                  </TouchableOpacity>
                );
              })}
              {supplements.length > 5 && (
                <TouchableOpacity style={styles.suppCardMore} onPress={() => router.push('/(tabs)/cabinet')}>
                  <Text style={styles.suppMoreText}>+{supplements.length - 5}</Text>
                  <Text style={styles.suppMoreLabel}>more</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/log')}>
            <Text style={styles.actionEmoji}>📸</Text>
            <Text style={styles.actionLabel}>Log Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/checkin')}>
            <Text style={styles.actionEmoji}>😊</Text>
            <Text style={styles.actionLabel}>Check-in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/ask')}>
            <Text style={styles.actionEmoji}>💚</Text>
            <Text style={styles.actionLabel}>Health Coach</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/insights')}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionLabel}>Insights</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BEAUTIFUL WHY MODAL */}
      <Modal visible={showWhyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'gut' ? '🦠 Your Gut Today' : 
                 modalType === 'energy' ? '⚡ Your Energy Today' : 
                 '🧠 Your Mood Today'}
              </Text>
              <TouchableOpacity onPress={() => setShowWhyModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Score with progress feel */}
              <View style={styles.modalScoreBox}>
                <Text style={styles.modalScoreEmoji}>
                  {modalType === 'gut' ? gutMood?.emoji : 
                   modalType === 'energy' ? (displayEnergyScore && displayEnergyScore >= 7 ? '⚡' : displayEnergyScore && displayEnergyScore >= 5 ? '🔋' : '😴') :
                   (displayMoodScore && displayMoodScore >= 7 ? '😊' : displayMoodScore && displayMoodScore >= 5 ? '😐' : '😔')}
                </Text>
                <Text style={[styles.modalScoreValue, { 
                  color: modalType === 'gut' ? gutLabel?.color : 
                         modalType === 'energy' ? (displayEnergyScore && displayEnergyScore >= 7 ? Colors.success : displayEnergyScore && displayEnergyScore >= 5 ? Colors.warning : Colors.error) :
                         (displayMoodScore && displayMoodScore >= 7 ? Colors.success : displayMoodScore && displayMoodScore >= 5 ? Colors.warning : Colors.error)
                }]}>
                  {modalType === 'gut' ? displayGutScore?.toFixed(1) : 
                   modalType === 'energy' ? displayEnergyScore?.toFixed(1) : 
                   displayMoodScore?.toFixed(1)}/10
                </Text>
                <Text style={[styles.modalScoreLabel, { 
                  color: modalType === 'gut' ? gutLabel?.color : 
                         modalType === 'energy' ? (displayEnergyScore && displayEnergyScore >= 7 ? Colors.success : Colors.warning) :
                         (displayMoodScore && displayMoodScore >= 7 ? Colors.success : Colors.warning)
                }]}>
                  {modalType === 'gut' ? gutLabel?.label : 
                   modalType === 'energy' ? (displayEnergyScore && displayEnergyScore >= 7 ? 'High Energy!' : displayEnergyScore && displayEnergyScore >= 5 ? 'Moderate Energy' : 'Low Energy') :
                   (displayMoodScore && displayMoodScore >= 7 ? 'Feeling Good!' : displayMoodScore && displayMoodScore >= 5 ? 'Stable Mood' : 'Needs Support')}
                </Text>
                
                {/* Progress bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { 
                    width: `${((modalType === 'gut' ? displayGutScore : modalType === 'energy' ? displayEnergyScore : displayMoodScore) || 0) * 10}%`,
                    backgroundColor: modalType === 'gut' ? gutLabel?.color : 
                                    modalType === 'energy' ? (displayEnergyScore && displayEnergyScore >= 7 ? Colors.success : Colors.warning) :
                                    (displayMoodScore && displayMoodScore >= 7 ? Colors.success : Colors.warning)
                  }]} />
                </View>
              </View>

              {/* GUT-SPECIFIC CONTENT - DATA DRIVEN */}
              {modalType === 'gut' && (
                <>
                  <Text style={styles.modalSectionTitle}>🔍 Based on Your Data Today:</Text>
                  <View style={styles.modalFactors}>
                    <Text style={styles.modalFactor}>• Fiber: {todayFiber.toFixed(0)}g {todayFiber === 0 ? '' : todayFiber < 10 ? '(aim for 25g+/day)' : '✓ Good'}</Text>
                    <Text style={styles.modalFactor}>• Sugar: {todaySugar.toFixed(0)}g {todaySugar === 0 ? '' : todaySugar > 25 ? '⚠️ High (feeds bad bacteria)' : '✓'}</Text>
                    <Text style={styles.modalFactor}>• Meals logged: {mealsLogged} {mealsLogged === 0 ? '' : mealsLogged < 3 ? '' : '✓'}</Text>
                    {checkIn?.symptoms && checkIn.symptoms.length > 0 ? (
                      <Text style={styles.modalFactor}>• Symptoms: {checkIn.symptoms.map(s => SYMPTOMS.find(sym => sym.id === s)?.label).join(', ')}</Text>
                    ) : checkIn?.symptoms?.length === 0 ? (
                      <Text style={styles.modalFactor}>• No symptoms ✓</Text>
                    ) : null}
                  </View>

                  <View style={styles.modalSummaryBox}>
                    <Text style={styles.modalSummaryTitle}>💚 Health Coach Analysis</Text>
                    <Text style={styles.modalSummaryText}>
                      {(() => {
                        const parts: string[] = [];
                        
                        if (mealsLogged === 0) {
                          return 'Log meals to see how food affects your gut.';
                        }
                        
                        if (todayFiber > 0 && todayFiber < 10) {
                          parts.push(`Fiber at ${todayFiber.toFixed(0)}g is low - fiber feeds good gut bacteria`);
                        } else if (todayFiber >= 15) {
                          parts.push(`Good fiber (${todayFiber.toFixed(0)}g) supports healthy digestion`);
                        }
                        
                        if (todaySugar > 25) {
                          parts.push(`Sugar at ${todaySugar.toFixed(0)}g may feed harmful bacteria`);
                        }
                        
                        if (checkIn?.symptoms?.includes('bloating')) {
                          parts.push('Bloating noted - check for trigger foods');
                        }
                        if (checkIn?.symptoms?.includes('gas')) {
                          parts.push('Gas may indicate food intolerance');
                        }
                        
                        if (displayGutScore && displayGutScore >= 7 && parts.length === 0) {
                          return 'Your gut data looks healthy today. Keep it up!';
                        }
                        
                        return parts.length > 0 ? parts.join('. ') + '.' : 'Log more to get personalized insights.';
                      })()}
                    </Text>
                  </View>

                  <Text style={styles.modalSectionTitle}>🎯 Actions Based on Your Data:</Text>
                  {todayFiber < 10 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Add high-fiber food (oats, veggies)</Text>
                    </View>
                  )}
                  {todaySugar > 20 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Skip sugary foods today</Text>
                    </View>
                  )}
                  {checkIn?.symptoms && checkIn.symptoms.length > 0 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Try peppermint tea for symptoms</Text>
                    </View>
                  )}
                  <View style={styles.modalSuggestion}>
                    <Text style={styles.modalSuggestionText}>✓ Eat probiotic foods (yogurt, kimchi)</Text>
                  </View>
                </>
              )}

              {/* ENERGY-SPECIFIC CONTENT - DATA DRIVEN ONLY */}
              {modalType === 'energy' && (
                <>
                  <Text style={styles.modalSectionTitle}>🔍 Based on Your Data Today:</Text>
                  <View style={styles.modalFactors}>
                    <Text style={styles.modalFactor}>• Meals logged: {mealsLogged} {mealsLogged === 0 ? '⚠️ No meals yet' : mealsLogged < 3 ? '' : '✓'}</Text>
                    <Text style={styles.modalFactor}>• Protein: {todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0).toFixed(0)}g {todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0) >= 30 ? '✓' : todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0) > 0 ? '(aim for 30g+)' : ''}</Text>
                    <Text style={styles.modalFactor}>• Fiber: {todayFiber.toFixed(0)}g {todayFiber >= 10 ? '✓ Good' : todayFiber > 0 ? '(low = less sustained energy)' : ''}</Text>
                    <Text style={styles.modalFactor}>• Sugar: {todaySugar.toFixed(0)}g {todaySugar > 25 ? '⚠️ High (crash risk)' : todaySugar > 0 ? '✓' : ''}</Text>
                    {displayGutScore !== null && displayGutScore !== undefined && (
                      <Text style={styles.modalFactor}>• Gut score: {displayGutScore.toFixed(1)}/10 {displayGutScore < 5 ? '(gut affects energy)' : ''}</Text>
                    )}
                  </View>

                  <View style={styles.modalSummaryBox}>
                    <Text style={styles.modalSummaryTitle}>💚 Health Coach Analysis</Text>
                    <Text style={styles.modalSummaryText}>
                      {(() => {
                        const protein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
                        const parts: string[] = [];
                        
                        if (mealsLogged === 0) {
                          parts.push('No meals logged yet - eating regularly helps maintain energy');
                        } else {
                          if (protein >= 30) parts.push(`Good protein (${protein.toFixed(0)}g) for sustained energy`);
                          else if (protein > 0) parts.push(`Protein at ${protein.toFixed(0)}g - adding more helps energy`);
                          
                          if (todaySugar > 25) parts.push(`High sugar (${todaySugar.toFixed(0)}g) may cause energy crashes`);
                          else if (todaySugar <= 10 && todaySugar > 0) parts.push(`Low sugar (${todaySugar.toFixed(0)}g) = steady energy ✓`);
                          
                          if (todayFiber < 5 && todayFiber > 0) parts.push('Low fiber may affect sustained energy');
                        }
                        
                        if (displayGutScore && displayGutScore < 5) parts.push('Low gut score can drain energy');
                        
                        return parts.length > 0 ? parts.join('. ') + '.' : 'Log more data to get personalized insights.';
                      })()}
                    </Text>
                  </View>

                  <Text style={styles.modalSectionTitle}>🎯 Actions Based on Your Data:</Text>
                  {mealsLogged < 3 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Log your next meal</Text>
                    </View>
                  )}
                  {todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0) < 30 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Have a protein-rich snack</Text>
                    </View>
                  )}
                  {todaySugar > 20 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Skip sugary foods for rest of day</Text>
                    </View>
                  )}
                  <View style={styles.modalSuggestion}>
                    <Text style={styles.modalSuggestionText}>✓ Take a 10-minute walk</Text>
                  </View>
                  <View style={styles.modalSuggestion}>
                    <Text style={styles.modalSuggestionText}>✓ Drink a glass of water</Text>
                  </View>
                </>
              )}

              {/* MOOD-SPECIFIC CONTENT - DATA DRIVEN ONLY */}
              {modalType === 'mood' && (
                <>
                  <Text style={styles.modalSectionTitle}>🔍 Based on Your Data Today:</Text>
                  <View style={styles.modalFactors}>
                    {displayGutScore !== null && displayGutScore !== undefined && (
                      <Text style={styles.modalFactor}>
                        • Gut: {displayGutScore.toFixed(1)}/10 {displayGutScore < 5 ? '⚠️ (90% of serotonin made in gut)' : displayGutScore >= 7 ? '✓ Gut-brain axis healthy' : ''}
                      </Text>
                    )}
                    {displayEnergyScore !== null && displayEnergyScore !== undefined && (
                      <Text style={styles.modalFactor}>
                        • Energy: {displayEnergyScore.toFixed(1)}/10 {displayEnergyScore < 5 ? '(low energy often affects mood)' : displayEnergyScore >= 7 ? '✓' : ''}
                      </Text>
                    )}
                    <Text style={styles.modalFactor}>• Meals: {mealsLogged} {mealsLogged === 0 ? '⚠️ Hunger affects mood' : mealsLogged < 3 ? '' : '✓'}</Text>
                    {checkIn?.symptoms && checkIn.symptoms.length > 0 && (
                      <Text style={styles.modalFactor}>• Symptoms: {checkIn.symptoms.map(s => SYMPTOMS.find(sym => sym.id === s)?.label).join(', ')}</Text>
                    )}
                    {checkIn?.symptoms?.length === 0 && (
                      <Text style={styles.modalFactor}>• No symptoms ✓</Text>
                    )}
                  </View>

                  <View style={styles.modalSummaryBox}>
                    <Text style={styles.modalSummaryTitle}>💚 Health Coach Analysis</Text>
                    <Text style={styles.modalSummaryText}>
                      {(() => {
                        const parts: string[] = [];
                        
                        // Only make claims based on ACTUAL data
                        if (displayGutScore !== null && displayGutScore !== undefined) {
                          if (displayGutScore < 5) {
                            parts.push(`Gut score is ${displayGutScore.toFixed(1)} - since 90% of serotonin is made in your gut, this may affect mood`);
                          } else if (displayGutScore >= 7) {
                            parts.push(`Gut at ${displayGutScore.toFixed(1)} supports healthy serotonin production`);
                          }
                        }
                        
                        if (displayEnergyScore !== null && displayEnergyScore !== undefined) {
                          if (displayEnergyScore < 5 && (!displayGutScore || displayGutScore >= 5)) {
                            parts.push(`Low energy (${displayEnergyScore.toFixed(1)}) can drag mood down`);
                          }
                        }
                        
                        if (mealsLogged === 0) {
                          parts.push('No meals logged - blood sugar drops affect mood');
                        }
                        
                        if (checkIn?.symptoms?.includes('bloating') || checkIn?.symptoms?.includes('cramping')) {
                          parts.push('Physical discomfort from symptoms can impact mood');
                        }
                        
                        if (parts.length === 0) {
                          if (displayMoodScore && displayMoodScore >= 7) {
                            return 'Your data shows good balance today - keep it up!';
                          }
                          return 'Log more check-ins and meals to get personalized mood insights.';
                        }
                        
                        return parts.join('. ') + '.';
                      })()}
                    </Text>
                  </View>

                  <Text style={styles.modalSectionTitle}>🎯 Actions Based on Your Data:</Text>
                  {displayGutScore !== null && displayGutScore !== undefined && displayGutScore < 5 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Eat probiotic foods (gut → mood)</Text>
                    </View>
                  )}
                  {mealsLogged < 2 && (
                    <View style={styles.modalSuggestion}>
                      <Text style={styles.modalSuggestionText}>✓ Have a balanced meal soon</Text>
                    </View>
                  )}
                  <View style={styles.modalSuggestion}>
                    <Text style={styles.modalSuggestionText}>✓ Get 10 min of sunlight</Text>
                  </View>
                  <View style={styles.modalSuggestion}>
                    <Text style={styles.modalSuggestionText}>✓ Practice 5 deep breaths</Text>
                  </View>
                </>
              )}

              {/* Emotional connection */}
              <View style={styles.emotionalBox}>
                <Text style={styles.emotionalText}>💚 Your body is trying to tell you something — and you're listening.</Text>
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={() => { setShowWhyModal(false); router.push('/(tabs)/ask'); }}>
                <Text style={styles.modalButtonText}>💬 Ask Health Coach for Help</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function for supplement insights
const getSupplementInsight = (supp: any, energy: number | null, mood: number | null) => {
  const name = supp.name.toLowerCase();
  
  if (name.includes('magnesium')) {
    if (energy && energy >= 6) return { text: '💤 Linked to better sleep on days you take it', color: Colors.success };
    return { text: '⏰ Best: Evening • Helps sleep & relaxation', color: Colors.textSecondary };
  }
  if (name.includes('vitamin d') || name.includes('d3')) {
    if (mood && mood < 5) return { text: '⚠️ Low mood often occurs when missed', color: Colors.warning };
    return { text: '☀️ Best: Morning with food • Supports mood', color: Colors.textSecondary };
  }
  if (name.includes('probiotic')) {
    return { text: '🦠 Directly supports gut • Best on empty stomach', color: Colors.success };
  }
  if (name.includes('omega') || name.includes('fish oil')) {
    return { text: '🧠 Reduces inflammation • Best with meals', color: Colors.success };
  }
  if (name.includes('b12')) {
    if (energy && energy < 5) return { text: '⚠️ Low energy = check B12 consistency', color: Colors.warning };
    return { text: '⚡ Boosts energy • Best: Morning', color: Colors.textSecondary };
  }
  return { text: '📊 Track consistently to see patterns', color: Colors.textMuted };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },
  
  // Header - tighter
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.sm },
  headerLeft: { flex: 1 },
  greeting: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text },
  streak: { fontSize: FontSizes.sm, color: Colors.secondary, marginTop: 2, fontWeight: '600' },
  
  // Completion Ring - smaller
  ringContainer: { alignItems: 'center' },
  ringOuter: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: Colors.borderLight, justifyContent: 'center', alignItems: 'center' },
  ringProgress: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 3 },
  ringInner: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { fontSize: 10, fontWeight: '700', color: Colors.text },
  
  // Daily Progress Bar
  dailyProgressContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dailyProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dailyProgressLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dailyProgressPercent: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
  dailyProgressBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dailyProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  dailyProgressHint: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Welcome Banner (small, for new users)
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4', // mint green
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  welcomeBannerEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  welcomeBannerContent: {
    flex: 1,
  },
  welcomeBannerTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.success,
  },
  welcomeBannerText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // COMPACT Score Card - tighter
  scoresCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.sm, alignItems: 'center', marginBottom: Spacing.sm, ...Shadows.card },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  gutEmoji: { fontSize: 28, marginRight: 6 },
  gutScore: { fontSize: 36, fontWeight: '700' },
  gutLabel: { fontSize: FontSizes.sm, fontWeight: '600', marginTop: 2 },
  
  // Compact Indicator Strip with dots
  indicatorStrip: { flexDirection: 'row', marginTop: Spacing.xs, backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: 4 },
  indicatorItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: BorderRadius.md, borderWidth: 2, borderColor: 'transparent', marginHorizontal: 2 },
  indicatorActive: { backgroundColor: Colors.surface, ...Shadows.sm },
  indicatorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  indicatorLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  indicatorLabelActive: { color: Colors.text, fontWeight: '700' },
  
  // Compact Triangle
  triangleContainer: { flexDirection: 'row', width: '100%', marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  triangleItem: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  triangleEmoji: { fontSize: 14 },
  triangleValue: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.text },
  triangleLabel: { fontSize: 8, color: Colors.textMuted },
  
  // Quick Check-in Button - smaller
  quickCheckinButton: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quickCheckinText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  emptyGut: { alignItems: 'center', paddingVertical: Spacing.sm },
  emptyGutEmoji: { fontSize: 40, marginBottom: Spacing.xs },
  emptyGutTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  emptyGutSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  
  // Quick Win Card (moved up, more prominent)
  quickWinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  quickWinIcon: { fontSize: 28, marginRight: Spacing.sm },
  quickWinContent: { flex: 1 },
  quickWinTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.success },
  quickWinAction: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  quickWinImpact: { fontSize: FontSizes.xs, color: Colors.success },
  quickWinArrow: { fontSize: FontSizes.lg, color: Colors.success, fontWeight: '600' },
  
  // Next Action Container
  nextActionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  nextActionLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  nextActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nextActionBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  nextActionEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  nextActionText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Top Driver Card - tighter
  topDriverCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  topDriverBadge: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 2,
  },
  topDriverText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Getting Started Card (compact for new users)
  gettingStartedCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gettingStartedTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  gettingStartedSteps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gettingStartedStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  stepText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  
  // Simple Fix Card (Quick Win) - keep for backward compat
  simpleFixCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.successLight, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.success },
  simpleFixIcon: { fontSize: 28, marginRight: Spacing.sm },
  simpleFixContent: { flex: 1 },
  simpleFixTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.success },
  simpleFixAction: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  simpleFixImpact: { fontSize: FontSizes.xs, color: Colors.success },
  
  // Drivers Card - tighter
  driversCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  driversTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs },
  driversGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  driverItem: { alignItems: 'center', flex: 1 },
  driverIcon: { fontSize: 18 },
  driverLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 1 },
  driverValueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  driverArrow: { fontSize: 10, marginRight: 1 },
  driverValue: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.text },
  
  // Prediction Card - tighter
  predictionCard: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm },
  predictionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.primary, marginBottom: 2 },
  predictionContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  predictionTime: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.text, marginRight: 6 },
  predictionIssue: { fontSize: FontSizes.xs, color: Colors.text },
  predictionFix: { fontSize: FontSizes.xs, color: Colors.primary },
  
  // Body Story Button - Premium Feature
  bodyStoryButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.primary, 
    borderRadius: BorderRadius.md, 
    padding: Spacing.sm, 
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  bodyStoryIcon: { fontSize: 24, marginRight: Spacing.sm },
  bodyStoryContent: { flex: 1 },
  bodyStoryTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textInverse },
  bodyStorySubtitle: { fontSize: FontSizes.xs, color: Colors.textInverse, opacity: 0.8, marginTop: 1 },
  bodyStoryArrow: { fontSize: FontSizes.lg, color: Colors.textInverse, fontWeight: '600' },
  
  // Pattern Badge - tighter
  patternBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.sm, borderWidth: 1 },
  patternEmoji: { fontSize: 20, marginRight: Spacing.xs },
  patternText: { flex: 1, fontSize: FontSizes.sm, fontWeight: '600' },
  patternArrow: { fontSize: FontSizes.md, color: Colors.textMuted },
  
  section: { marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.5 },
  seeAll: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '500' },
  
  mealsRow: { paddingRight: Spacing.md, gap: 10 },
  mealCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, width: 90, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  mealCardLogged: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaded },
  mealEmoji: { fontSize: 22, marginBottom: 2 },
  mealType: { fontSize: 10, fontWeight: '600', color: Colors.text },
  mealDesc: { fontSize: 8, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  mealStats: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 3 },
  mealFiber: { fontSize: 9, color: Colors.success, fontWeight: '600' },
  mealGutScore: { fontSize: 10, fontWeight: '700' },
  mealAdd: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  
  suppCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: Spacing.xs, ...Shadows.sm },
  suppHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suppName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.text },
  suppDosage: { fontSize: FontSizes.xs, color: Colors.textMuted },
  suppInsight: { fontSize: FontSizes.xs, marginTop: 2 },
  
  // Horizontal Supplements Grid
  supplementsRow: { paddingRight: Spacing.md, gap: 10 },
  suppCardHorizontal: { 
    backgroundColor: Colors.surface, 
    borderRadius: BorderRadius.md, 
    padding: Spacing.sm, 
    width: 100, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  suppPill: { fontSize: 24, marginBottom: 4 },
  suppNameHorizontal: { fontSize: 12, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  suppDosageHorizontal: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  suppCardMore: {
    backgroundColor: Colors.primaryFaded,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  suppMoreText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  suppMoreLabel: { fontSize: 10, color: Colors.primary },
  
  // Button-style links
  seeAllButton: { backgroundColor: Colors.primaryFaded, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  seeAllText: { fontSize: FontSizes.sm, color: Colors.primary, fontWeight: '600' },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionEmoji: { fontSize: 24, marginBottom: 2 },
  actionLabel: { fontSize: 9, color: Colors.textSecondary },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.md, paddingBottom: 40, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  modalTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.text },
  modalClose: { fontSize: 24, color: Colors.textMuted, padding: 8 },
  
  modalScoreBox: { alignItems: 'center', backgroundColor: Colors.background, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg },
  modalScoreEmoji: { fontSize: 48 },
  modalScoreValue: { fontSize: 36, fontWeight: '700' },
  modalScoreLabel: { fontSize: FontSizes.md, fontWeight: '600' },
  progressBarBg: { width: '100%', height: 8, backgroundColor: Colors.borderLight, borderRadius: 4, marginTop: Spacing.sm, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  
  modalSectionTitle: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, marginTop: 8 },
  modalFactors: { backgroundColor: Colors.background, borderRadius: BorderRadius.md, padding: Spacing.md },
  modalFactor: { fontSize: FontSizes.sm, color: Colors.text, marginBottom: 4 },
  
  modalSummaryBox: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.md },
  modalSummaryTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.primary, marginBottom: 4 },
  modalSummaryText: { fontSize: FontSizes.md, color: Colors.text },
  
  emotionalBox: { backgroundColor: Colors.successLight, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.md },
  emotionalText: { fontSize: FontSizes.sm, color: Colors.success, fontStyle: 'italic', textAlign: 'center' },
  
  modalSuggestion: { backgroundColor: Colors.successLight, borderRadius: BorderRadius.md, padding: Spacing.sm, marginBottom: 6 },
  modalSuggestionText: { fontSize: FontSizes.md, color: Colors.success, fontWeight: '500' },
  
  modalButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  modalButtonText: { color: Colors.textInverse, fontSize: FontSizes.md, fontWeight: '600' },
  
  // Welcome card for new users
  welcomeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadows.md,
  },
  welcomeEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  welcomeTitle: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  welcomeSubtitle: { fontSize: FontSizes.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
  welcomeSteps: { width: '100%', marginBottom: Spacing.lg },
  welcomeStep: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  welcomeStepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  welcomeStepNumberText: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textInverse },
  welcomeStepContent: { flex: 1 },
  welcomeStepTitle: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.text },
  welcomeStepDesc: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  welcomeButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, ...Shadows.sm },
  welcomeButtonText: { fontSize: FontSizes.md, fontWeight: '600', color: Colors.textInverse },
});
