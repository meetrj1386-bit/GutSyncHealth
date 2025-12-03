import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../lib/auth';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows } from '../../lib/theme';

const INTRO_SEEN_KEY = 'gutsync_intro_seen_v2';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  
  // Editable fields
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  
  // Notifications
  const [notifMorning, setNotifMorning] = useState(profile?.notification_morning ?? true);
  const [notifEvening, setNotifEvening] = useState(profile?.notification_evening ?? true);
  const [notifMeals, setNotifMeals] = useState(profile?.notification_meals ?? true);
  const [notifMeds, setNotifMeds] = useState(profile?.notification_meds ?? true);

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await updateProfile({
      name: name.trim(),
      phone: phone.trim() || null,
      notification_morning: notifMorning,
      notification_evening: notifEvening,
      notification_meals: notifMeals,
      notification_meds: notifMeds,
    });

    setIsSaving(false);
    
    if (error) {
      Alert.alert('Error', 'Could not save changes');
    } else {
      setIsEditing(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            // Clear intro flag so user sees intro again on new login (optional)
            // await SecureStore.deleteItemAsync(INTRO_SEEN_KEY);
            await signOut();
            // Force navigation to login after sign out
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile?.name) return '?';
    return profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              <Text style={styles.saveButton}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials()}</Text>
          </View>
          {!isEditing && (
            <>
              <Text style={styles.userName}>{profile?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{profile?.email}</Text>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.streak_count || 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.longest_streak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥</Text>
            <Text style={styles.statLabel}>Keep Going!</Text>
          </View>
        </View>

        {/* Personal Info */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.card}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.textMuted}
                  underlineColorAndroid="transparent"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Your phone number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Morning Check-in</Text>
                <Text style={styles.settingDescription}>Reminder to log how you feel</Text>
              </View>
              <Switch
                value={notifMorning}
                onValueChange={setNotifMorning}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notifMorning ? Colors.primary : Colors.textMuted}
                disabled={!isEditing}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Evening Check-in</Text>
                <Text style={styles.settingDescription}>End of day reflection</Text>
              </View>
              <Switch
                value={notifEvening}
                onValueChange={setNotifEvening}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notifEvening ? Colors.primary : Colors.textMuted}
                disabled={!isEditing}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Meal Reminders</Text>
                <Text style={styles.settingDescription}>Remember to log meals</Text>
              </View>
              <Switch
                value={notifMeals}
                onValueChange={setNotifMeals}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notifMeals ? Colors.primary : Colors.textMuted}
                disabled={!isEditing}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Medication Reminders</Text>
                <Text style={styles.settingDescription}>Take supplements on time</Text>
              </View>
              <Switch
                value={notifMeds}
                onValueChange={setNotifMeds}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={notifMeds ? Colors.primary : Colors.textMuted}
                disabled={!isEditing}
              />
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => router.push('/(tabs)/insights')}
            >
              <Text style={styles.linkIcon}>📊</Text>
              <Text style={styles.linkLabel}>View Insights</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => router.push('/(tabs)/ask')}
            >
              <Text style={styles.linkIcon}>🤖</Text>
              <Text style={styles.linkLabel}>Ask AI</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => router.push('/(tabs)/cabinet')}
            >
              <Text style={styles.linkIcon}>💊</Text>
              <Text style={styles.linkLabel}>Medicine Cabinet</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => setShowFAQ(true)}>
              <Text style={styles.linkIcon}>❓</Text>
              <Text style={styles.linkLabel}>Help & FAQ</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkIcon}>📧</Text>
              <Text style={styles.linkLabel}>Contact Support</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.linkRow}>
              <Text style={styles.linkIcon}>⭐</Text>
              <Text style={styles.linkLabel}>Rate the App</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={async () => {
                await SecureStore.deleteItemAsync(INTRO_SEEN_KEY);
                router.replace('/(intro)');
              }}
            >
              <Text style={styles.linkIcon}>🎬</Text>
              <Text style={styles.linkLabel}>View Intro Again</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} onPress={() => setShowTerms(true)}>
              <Text style={styles.linkIcon}>📜</Text>
              <Text style={styles.linkLabel}>Terms of Use</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <TouchableOpacity style={styles.linkRow} onPress={() => setShowPrivacy(true)}>
              <Text style={styles.linkIcon}>🔒</Text>
              <Text style={styles.linkLabel}>Privacy Policy</Text>
              <Text style={styles.linkArrow}>→</Text>
            </TouchableOpacity>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.disclaimerRow}>
              <Text style={styles.linkIcon}>⚠️</Text>
              <Text style={styles.disclaimerText}>
                GutSync is for informational purposes only and does not provide medical advice.
              </Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>GutSync v1.0.0</Text>
        <Text style={styles.disclaimer}>
          This app is not a substitute for professional medical advice
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Terms Modal */}
      <Modal visible={showTerms} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📜 Terms of Use</Text>
            <TouchableOpacity onPress={() => setShowTerms(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>1. Not Medical Advice</Text>
            <Text style={styles.modalText}>
              GutSync is designed for general wellness and informational purposes only. The App does NOT provide medical advice, diagnosis, or treatment.{'\n\n'}
              Always seek the advice of your physician or other qualified health provider.
            </Text>
            
            <Text style={styles.modalSectionTitle}>2. Emergency Situations</Text>
            <Text style={styles.modalTextImportant}>
              NEVER DISREGARD PROFESSIONAL MEDICAL ADVICE OR DELAY SEEKING IT BECAUSE OF SOMETHING YOU HAVE READ IN THIS APP.
            </Text>
            
            <Text style={styles.modalSectionTitle}>3. AI Content Disclaimer</Text>
            <Text style={styles.modalText}>
              AI-generated content may contain errors and should be verified with healthcare professionals.
            </Text>
            
            <Text style={styles.modalSectionTitle}>4. Limitation of Liability</Text>
            <Text style={styles.modalText}>
              Use of the App is at your own risk. We are not liable for any health decisions made based on App information.
            </Text>
            
            <Text style={styles.modalLastUpdated}>Last Updated: December 2024</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTerms(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacy} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🔒 Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacy(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalSectionTitle}>Data We Collect</Text>
            <Text style={styles.modalText}>
              • Account info (email, name){'\n'}
              • Health data (meals, symptoms, check-ins){'\n'}
              • Usage data
            </Text>
            
            <Text style={styles.modalSectionTitle}>Data Security</Text>
            <Text style={styles.modalText}>
              Your data is encrypted and stored securely. We never sell your personal health data.
            </Text>
            
            <Text style={styles.modalSectionTitle}>Your Rights</Text>
            <Text style={styles.modalText}>
              You can access, correct, or delete your data at any time from settings.
            </Text>
            
            <Text style={styles.modalLastUpdated}>Last Updated: December 2024</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FAQ Modal */}
      <Modal visible={showFAQ} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>❓ FAQ</Text>
            <TouchableOpacity onPress={() => setShowFAQ(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.faqQuestion}>Is GutSync a medical app?</Text>
            <Text style={styles.modalText}>
              No. GutSync is for general wellness only and does NOT provide medical advice. Always consult healthcare professionals.
            </Text>
            
            <Text style={styles.faqQuestion}>How accurate is the AI?</Text>
            <Text style={styles.modalText}>
              AI provides estimates based on general nutritional info. Use as guidance, not precise measurements.
            </Text>
            
            <Text style={styles.faqQuestion}>Can GutSync diagnose conditions?</Text>
            <Text style={styles.modalTextImportant}>
              No. Only medical testing can diagnose conditions. GutSync helps track patterns to discuss with your doctor.
            </Text>
            
            <Text style={styles.faqQuestion}>Is my data private?</Text>
            <Text style={styles.modalText}>
              Yes. Data is encrypted and never sold. You can delete all data anytime.
            </Text>
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFAQ(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  editButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLabel: {
    fontSize: FontSizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  linkIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.md,
  },
  linkLabel: {
    flex: 1,
    fontSize: FontSizes.md,
    color: Colors.text,
  },
  linkArrow: {
    fontSize: FontSizes.md,
    color: Colors.textMuted,
  },
  signOutButton: {
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.error,
  },
  version: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  disclaimer: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.warning,
    lineHeight: 18,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textMuted,
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  modalSectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  modalText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  modalTextImportant: {
    fontSize: FontSizes.sm,
    color: '#DC2626',
    lineHeight: 22,
    fontWeight: '600',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  modalLastUpdated: {
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  closeButtonText: {
    color: Colors.textInverse,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  faqQuestion: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
});
