// GutSync Pro - Premium Theme
// Designed for health & wellness - calming, trustworthy, premium feel

export const Colors = {
  // Primary - Calming Teal (gut health, wellness)
  primary: '#0D9488',
  primaryLight: '#14B8A6',
  primaryDark: '#0F766E',
  primaryFaded: 'rgba(13, 148, 136, 0.1)',
  
  // Secondary - Warm Orange (energy, vitality)
  secondary: '#F59E0B',
  secondaryLight: '#FBBF24',
  secondaryDark: '#D97706',
  
  // Background
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#FF6B6B',       // Softer coral red - less alarming
  errorLight: '#FFE5E5',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Gut Score Colors (gradient from bad to good)
  gutBad: '#FF6B6B',      // 1-3 - Softer coral
  gutOkay: '#F59E0B',     // 4-5
  gutGood: '#10B981',     // 6-7
  gutGreat: '#0D9488',    // 8-10
  
  // Mood Emojis mapping
  moods: {
    1: { emoji: '😫', label: 'Terrible', color: '#FF6B6B' },
    2: { emoji: '😞', label: 'Bad', color: '#FF8C66' },
    3: { emoji: '😕', label: 'Not Great', color: '#F59E0B' },
    4: { emoji: '😐', label: 'Okay', color: '#EAB308' },
    5: { emoji: '🙂', label: 'Fine', color: '#84CC16' },
    6: { emoji: '😊', label: 'Good', color: '#22C55E' },
    7: { emoji: '😄', label: 'Great', color: '#10B981' },
    8: { emoji: '🤗', label: 'Very Good', color: '#14B8A6' },
    9: { emoji: '😁', label: 'Excellent', color: '#0D9488' },
    10: { emoji: '🌟', label: 'Amazing', color: '#0F766E' },
  },
  
  // Borders & Dividers
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 18,    // Premium card radius
  xl: 24,
  xxl: 28,   // Extra large for hero cards
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  // Premium subtle shadow for cards
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

// Symptom options for check-ins
export const SYMPTOMS = [
  { id: 'bloating', label: 'Bloating', emoji: '🎈' },
  { id: 'gas', label: 'Gas', emoji: '💨' },
  { id: 'cramping', label: 'Cramping', emoji: '😣' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'heartburn', label: 'Heartburn', emoji: '🔥' },
  { id: 'constipation', label: 'Constipation', emoji: '🚫' },
  { id: 'diarrhea', label: 'Diarrhea', emoji: '💧' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'brain_fog', label: 'Brain Fog', emoji: '🌫️' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'skin_issues', label: 'Skin Issues', emoji: '🔴' },
];

// Meal types
export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅', time: '6:00 - 10:00' },
  { id: 'lunch', label: 'Lunch', emoji: '☀️', time: '11:00 - 14:00' },
  { id: 'dinner', label: 'Dinner', emoji: '🌙', time: '17:00 - 21:00' },
  { id: 'snack', label: 'Snack', emoji: '🍎', time: 'Anytime' },
];

// Helper function to get gut score color
// IMPROVED LOGIC:
// 7-10: Green (Gut-Healing)
// 5-6.9: Yellow (OK but Improve)  
// 3-4.9: Orange (Stressing Gut)
// 0-2.9: Red (Gut-Irritating)
export const getGutScoreColor = (score: number): string => {
  if (score >= 7) return Colors.success;      // Green - Gut-Healing
  if (score >= 5) return Colors.warning;      // Yellow - OK but Improve
  if (score >= 3) return '#F97316';           // Orange - Stressing Gut
  return Colors.error;                         // Red - Gut-Irritating
};

// Get gut score label with emoji
export const getGutScoreLabel = (score: number): { label: string; emoji: string; color: string } => {
  if (score >= 7) return { label: 'Gut-Healing', emoji: '💚', color: Colors.success };
  if (score >= 5) return { label: 'OK - Improve', emoji: '💛', color: Colors.warning };
  if (score >= 3) return { label: 'Gut-Stressing', emoji: '🧡', color: '#F97316' };
  return { label: 'Gut-Irritating', emoji: '❤️', color: Colors.error };
};

// Generate meal tags based on nutrition
export const getMealTags = (meal: { fiber?: number; protein?: number; carbs?: number; fat?: number; description?: string }): Array<{ label: string; emoji: string; positive: boolean }> => {
  const tags: Array<{ label: string; emoji: string; positive: boolean }> = [];
  
  // Fiber check
  if (meal.fiber && meal.fiber >= 5) {
    tags.push({ label: 'High Fiber', emoji: '🌱', positive: true });
  }
  
  // Protein check
  if (meal.protein && meal.protein >= 20) {
    tags.push({ label: 'Protein Rich', emoji: '💪', positive: true });
  }
  
  // Check description for common patterns
  const desc = (meal.description || '').toLowerCase();
  
  if (desc.includes('yogurt') || desc.includes('curd') || desc.includes('kimchi') || desc.includes('fermented')) {
    tags.push({ label: 'Probiotic', emoji: '🦠', positive: true });
  }
  
  if (desc.includes('oats') || desc.includes('roti') || desc.includes('wheat') || desc.includes('whole grain') || desc.includes('brown rice')) {
    tags.push({ label: 'Whole Grain', emoji: '🌾', positive: true });
  }
  
  if (desc.includes('salad') || desc.includes('vegetables') || desc.includes('veggies') || desc.includes('spinach') || desc.includes('broccoli')) {
    tags.push({ label: 'Veggie Rich', emoji: '🥗', positive: true });
  }
  
  if (desc.includes('fried') || desc.includes('deep fried') || desc.includes('samosa') || desc.includes('pakora')) {
    tags.push({ label: 'Fried', emoji: '🍳', positive: false });
  }
  
  if (desc.includes('spicy') || desc.includes('chili') || desc.includes('hot')) {
    tags.push({ label: 'Spicy', emoji: '🌶️', positive: false });
  }
  
  if (desc.includes('home') || desc.includes('homemade')) {
    tags.push({ label: 'Home-cooked', emoji: '🏠', positive: true });
  }
  
  return tags.slice(0, 3); // Max 3 tags
};

// Helper function to get mood data
export const getMoodData = (score: number) => {
  const clamped = Math.max(1, Math.min(10, Math.round(score)));
  return Colors.moods[clamped as keyof typeof Colors.moods];
};
