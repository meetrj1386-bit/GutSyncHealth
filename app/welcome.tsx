import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'fitness',
    title: 'Your Gut, Your Health',
    subtitle: 'Everything starts in your gut',
    description: '80% of your immune system lives in your gut. Poor gut health causes fatigue, brain fog, mood swings, and more.',
    highlight: 'Finally understand WHY you feel the way you do.',
    color: '#4A7C59',
    bgColor: '#E8F5E9',
  },
  {
    id: '2',
    icon: 'camera',
    title: 'Snap. Predict. Feel Better.',
    subtitle: 'AI-powered food analysis',
    description: 'Take a photo of your meal. Our AI instantly tells you how it will affect your energy, gut, and mood in the next 2-3 hours.',
    highlight: 'Know BEFORE you feel bad, not after.',
    color: '#F4A261',
    bgColor: '#FFF3E0',
  },
  {
    id: '3',
    icon: 'medkit',
    title: 'Safe Medication Tracking',
    subtitle: 'Never miss dangerous interactions',
    description: 'Track all your medications and supplements. Get instant alerts about interactions and optimal timing.',
    highlight: 'Your pharmacist in your pocket.',
    color: '#5B4B8A',
    bgColor: '#F3E5F5',
  },
  {
    id: '4',
    icon: 'chatbubbles',
    title: 'Ask Anything, Anytime',
    subtitle: 'Your personal health assistant',
    description: '"What helps my kid\'s upset stomach?" "Can I take iron with coffee?" Get instant, personalized answers.',
    highlight: 'Like having a nutritionist on speed dial.',
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/register');
    }
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
        <Ionicons name={item.icon as any} size={56} color={item.color} />
      </View>
      
      <Text style={styles.subtitle}>{item.subtitle}</Text>
      <Text style={styles.title}>{item.title}</Text>
      
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={[styles.highlightBox, { backgroundColor: item.bgColor }]}>
        <Text style={[styles.highlight, { color: item.color }]}>{item.highlight}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="leaf" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>GutSync</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Progress & CTA */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Happy Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>4.8★</Text>
            <Text style={styles.statLabel}>App Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>2M+</Text>
            <Text style={styles.statLabel}>Meals Analyzed</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>
            {currentIndex === slides.length - 1 ? 'Start Free - No Credit Card' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Free forever • Premium features available
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDF6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3436',
    marginLeft: 10,
  },
  loginText: {
    fontSize: 16,
    color: '#4A7C59',
    fontWeight: '600',
  },
  slide: {
    width,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#4A7C59',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 16,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 24,
    marginBottom: 20,
  },
  highlightBox: {
    padding: 16,
    borderRadius: 12,
  },
  highlight: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#4A7C59',
    width: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E8E8E8',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7C59',
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 16,
  },
});
