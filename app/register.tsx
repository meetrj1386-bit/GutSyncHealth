import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Health profile
  const [sensitivities, setSensitivities] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  const sensitivityOptions = [
    { id: 'lactose', label: '🥛 Lactose', desc: 'Dairy sensitivity' },
    { id: 'gluten', label: '🌾 Gluten', desc: 'Wheat/gluten issues' },
    { id: 'fodmap', label: '🥦 FODMAP', desc: 'Fermentable carbs' },
    { id: 'caffeine', label: '☕ Caffeine', desc: 'Caffeine sensitive' },
    { id: 'none', label: '✅ None', desc: 'No known sensitivities' },
  ];

  const goalOptions = [
    { id: 'gut', label: '🦠 Better Gut Health', desc: 'Less bloating & discomfort' },
    { id: 'energy', label: '⚡ More Energy', desc: 'No afternoon crashes' },
    { id: 'mood', label: '😊 Stable Mood', desc: 'Feel balanced all day' },
    { id: 'clarity', label: '🧠 Mental Clarity', desc: 'No more brain fog' },
    { id: 'meds', label: '💊 Track Medications', desc: 'Never miss a dose' },
  ];

  const toggleSensitivity = (id: string) => {
    if (id === 'none') {
      setSensitivities(['none']);
    } else {
      setSensitivities(prev => {
        const filtered = prev.filter(s => s !== 'none');
        return filtered.includes(id) 
          ? filtered.filter(s => s !== id) 
          : [...filtered, id];
      });
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handleStep2 = () => {
    setStep(3);
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Save user data locally
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        sensitivities,
        goals,
        createdAt: new Date().toISOString(),
      };
      
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      await SecureStore.setItemAsync('isLoggedIn', 'true');
      
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      // Fallback for simulator (SecureStore may not work)
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Info
  if (step === 1) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#2D3436" />
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <Text style={styles.title}>Let's get started! 👋</Text>
          <Text style={styles.subtitle}>Create your account in seconds</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>What should we call you?</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="Your first name"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.nextButton} onPress={handleStep1}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Step 2: Sensitivities
  if (step === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <Ionicons name="chevron-back" size={24} color="#2D3436" />
        </TouchableOpacity>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
          <View style={[styles.stepLine, styles.stepLineDone]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.title}>Any food sensitivities?</Text>
        <Text style={styles.subtitle}>We'll warn you about problematic ingredients</Text>

        <View style={styles.optionsGrid}>
          {sensitivityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                sensitivities.includes(option.id) && styles.optionCardActive,
              ]}
              onPress={() => toggleSensitivity(option.id)}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDesc}>{option.desc}</Text>
              {sensitivities.includes(option.id) && (
                <View style={styles.optionCheck}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleStep2}>
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleStep2}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step 3: Goals
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
        <Ionicons name="chevron-back" size={24} color="#2D3436" />
      </TouchableOpacity>

      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotDone]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <View style={[styles.stepDot, styles.stepDotDone]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>

      <Text style={styles.stepLabel}>Step 3 of 3</Text>
      <Text style={styles.title}>What's your main goal?</Text>
      <Text style={styles.subtitle}>Select all that apply - we'll personalize your experience</Text>

      <View style={styles.optionsGrid}>
        {goalOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              goals.includes(option.id) && styles.optionCardActive,
            ]}
            onPress={() => toggleGoal(option.id)}
          >
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionDesc}>{option.desc}</Text>
            {goals.includes(option.id) && (
              <View style={styles.optionCheck}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={[styles.nextButton, loading && styles.buttonDisabled]} 
        onPress={handleComplete}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.nextButtonText}>Start My Gut Health Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFDF6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#4A7C59',
  },
  stepDotDone: {
    backgroundColor: '#4A7C59',
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 8,
  },
  stepLineDone: {
    backgroundColor: '#4A7C59',
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#636E72',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    marginLeft: 12,
    fontSize: 16,
    color: '#2D3436',
  },
  optionsGrid: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    position: 'relative',
  },
  optionCardActive: {
    borderColor: '#4A7C59',
    backgroundColor: '#F0FDF4',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 13,
    color: '#636E72',
  },
  optionCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A7C59',
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: '#4A7C59',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  skipText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#9CA3AF',
    marginTop: 16,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 15,
    color: '#636E72',
  },
  loginLinkBold: {
    color: '#4A7C59',
    fontWeight: '700',
  },
});
