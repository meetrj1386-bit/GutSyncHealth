import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

const INTRO_SEEN_KEY = 'gutsync_intro_seen_v2';

// Screen colors - each screen has unique color
const SCREEN_COLORS = {
  1: { primary: '#009688', bg: '#E6F4F1', glow: 'rgba(0, 150, 136, 0.3)' },  // Teal
  2: { primary: '#3B82F6', bg: '#E8F1FF', glow: 'rgba(59, 130, 246, 0.3)' },  // Blue
  3: { primary: '#8B5CF6', bg: '#F3E8FF', glow: 'rgba(139, 92, 246, 0.3)' },  // Purple
  4: { primary: '#F59E0B', bg: '#FFF7E6', glow: 'rgba(245, 158, 11, 0.3)' },  // Amber
  5: { primary: '#10B981', bg: '#ECFDF5', glow: 'rgba(16, 185, 129, 0.3)' },  // Emerald (distinct!)
  6: { primary: '#EF4444', bg: '#FFECEC', glow: 'rgba(239, 68, 68, 0.2)' },   // Red
};

const DOT_COLORS = ['#009688', '#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'];

interface SlideData {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    icon: '🦠',
    title: 'Welcome to GutSync',
    subtitle: 'Your personal gut & wellness companion',
    buttonText: 'Next',
  },
  {
    id: 2,
    icon: '📸',
    title: 'Snap & Analyze',
    subtitle: 'AI-powered meal insights',
    buttonText: 'Next',
  },
  {
    id: 3,
    icon: '📊',
    title: 'Discover Patterns',
    subtitle: 'See what really affects your body',
    buttonText: 'Next',
  },
  {
    id: 4,
    icon: '💊',
    title: 'Track Supplements',
    subtitle: 'Know what actually works for YOU',
    buttonText: 'Next',
  },
  {
    id: 5,
    icon: '✨',
    title: 'Your Daily Gut Story',
    subtitle: 'Small habits → big improvements',
    buttonText: 'Next',
  },
  {
    id: 6,
    icon: '⚠️',
    title: 'Before You Begin',
    subtitle: '',
    buttonText: 'I Understand & Agree',
  },
];

export default function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentColors = SCREEN_COLORS[(currentIndex + 1) as keyof typeof SCREEN_COLORS];

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      try {
        await SecureStore.setItemAsync(INTRO_SEEN_KEY, 'true');
      } catch (e) {
        console.log('SecureStore error:', e);
      }
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = async () => {
    try {
      await SecureStore.setItemAsync(INTRO_SEEN_KEY, 'true');
    } catch (e) {
      console.log('SecureStore error:', e);
    }
    router.replace('/(auth)/login');
  };

  const renderSlideContent = (slideId: number) => {
    const colors = SCREEN_COLORS[slideId as keyof typeof SCREEN_COLORS];

    if (slideId === 1) {
      return (
        <Text style={styles.contentText}>
          Discover how food, supplements, and daily habits shape your energy, mood, and digestion — in a simple, meaningful way.
        </Text>
      );
    }

    if (slideId === 2) {
      return (
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>
            Take a quick photo of your meal and instantly see:
          </Text>
          <View style={styles.checklistContainer}>
            {['Gut score', 'Fiber/sugar balance', 'Digestion impact', 'Simple fixes'].map((item, i) => (
              <View key={i} style={styles.checklistItem}>
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }

    if (slideId === 3) {
      return (
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>GutSync reveals hidden connections like:</Text>
          <View style={styles.patternsContainer}>
            {[
              { emoji: '🌾', text: 'Wheat lowers energy' },
              { emoji: '🥛', text: 'Dairy triggers bloating' },
              { emoji: '🍭', text: 'Sugar drops mood' },
            ].map((item, i) => (
              <View key={i} style={[styles.patternCard, { borderColor: colors.primary + '40' }]}>
                <Text style={styles.patternEmoji}>{item.emoji}</Text>
                <Text style={styles.patternText}>{item.text}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.tagline, { color: colors.primary }]}>
            Understand your body like never before.
          </Text>
        </View>
      );
    }

    if (slideId === 4) {
      return (
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>
            Log supplements & medications and see which ones improve:
          </Text>
          <View style={styles.checklistContainer}>
            {['Energy', 'Mood', 'Digestion', 'Gut score'].map((item, i) => (
              <View key={i} style={styles.checklistItem}>
                <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
                <Text style={styles.checklistText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.tagline, { color: colors.primary }]}>Real data → real clarity.</Text>
        </View>
      );
    }

    if (slideId === 5) {
      return (
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>Each day, GutSync helps you:</Text>
          <View style={styles.bulletContainer}>
            {[
              'Log meals easily',
              'Check your energy, mood, and gut',
              'Follow simple fix suggestions',
              'Build a healthier routine',
            ].map((item, i) => (
              <View key={i} style={styles.bulletItem}>
                <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.tagline, { color: colors.primary, marginTop: 20 }]}>
            Ready to feel better every day?
          </Text>
        </View>
      );
    }

    if (slideId === 6) {
      return (
        <View style={styles.disclaimerBox}>
          <View style={[styles.disclaimerCard, { borderColor: '#FCA5A5' }]}>
            <Text style={styles.disclaimerIntro}>
              GutSync provides general wellness guidance only. It is not a substitute for medical advice, diagnosis, or treatment.
            </Text>
            <View style={styles.disclaimerList}>
              {[
                'Always consult a healthcare professional',
                'Do not ignore medical advice',
                'Seek immediate help for urgent symptoms',
                'Individual results may vary',
              ].map((item, i) => (
                <View key={i} style={styles.disclaimerItem}>
                  <View style={styles.disclaimerBullet} />
                  <Text style={styles.disclaimerText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => Linking.openURL('https://gutsync.app/terms')}>
              <Text style={styles.linkText}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.linkDivider}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://gutsync.app/privacy')}>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.linkDivider}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://gutsync.app/faq')}>
              <Text style={styles.linkText}>FAQ</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSlide = () => {
    const item = SLIDES[currentIndex];
    const colors = SCREEN_COLORS[item.id as keyof typeof SCREEN_COLORS];
    
    return (
      <ScrollView 
        style={styles.slideScroll}
        contentContainerStyle={styles.slideContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon with glow */}
        <View style={styles.iconWrapper}>
          <View style={[styles.iconGlow, { backgroundColor: colors.glow }]} />
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.primary }]}>{item.title}</Text>

        {/* Subtitle */}
        {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}

        {/* Content */}
        {renderSlideContent(item.id)}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip button */}
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipText, { color: currentColors.primary }]}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? DOT_COLORS[index] : '#D1D5DB',
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Current Slide */}
        <View style={{ flex: 1 }} key={currentIndex}>
          {renderSlide()}
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: currentColors.primary }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>{SLIDES[currentIndex].buttonText}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  slideScroll: {
    flex: 1,
  },
  slideContent: {
    paddingHorizontal: 32,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  contentBox: {
    width: '100%',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  contentTextSmall: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  
  // Checklist styles (Screen 2 & 4)
  checklistContainer: {
    width: '100%',
    gap: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checklistText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  
  // Patterns styles (Screen 3)
  patternsContainer: {
    width: '100%',
    gap: 10,
    marginBottom: 8,
  },
  patternCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  patternEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  patternText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  
  // Bullet styles (Screen 5)
  bulletContainer: {
    width: '100%',
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  tagline: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  
  // Disclaimer styles (Screen 6)
  disclaimerBox: {
    width: '100%',
    alignItems: 'center',
  },
  disclaimerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    width: '100%',
  },
  disclaimerIntro: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  disclaimerList: {
    gap: 10,
  },
  disclaimerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginRight: 10,
    marginTop: 6,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  linkDivider: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  // Bottom button
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 16,
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
