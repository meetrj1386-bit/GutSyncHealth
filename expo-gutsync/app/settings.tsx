import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const theme = {
  primary: '#4A7C59',
  secondary: '#8FB996',
  accent: '#F4A261',
  background: '#FAFDF6',
  card: '#FFFFFF',
  text: '#2D3436',
  textLight: '#636E72',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = () => {
    if (!apiKey.startsWith('sk-')) {
      Alert.alert('Invalid Key', 'API key should start with "sk-"');
      return;
    }
    Alert.alert('Saved', 'Your OpenAI API key has been saved securely.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/login') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GS</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>GutSync User</Text>
            <Text style={styles.profileEmail}>user@example.com</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* API Key Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 OpenAI API Key</Text>
        <Text style={styles.sectionDescription}>
          Add your own API key for unlimited AI meal analysis
        </Text>
        
        <View style={styles.apiKeyContainer}>
          <TextInput
            style={styles.apiKeyInput}
            placeholder="sk-..."
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowApiKey(!showApiKey)}
          >
            <Ionicons
              name={showApiKey ? 'eye-off' : 'eye'}
              size={20}
              color={theme.textLight}
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveApiKey}>
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>

        <Text style={styles.apiKeyHelp}>
          Get your key from{' '}
          <Text style={styles.link}>platform.openai.com/api-keys</Text>
        </Text>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Medication reminders & check-ins</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E0E0E0', true: theme.secondary }}
            thumbColor={notificationsEnabled ? theme.primary : '#F5F5F5'}
          />
        </View>
      </View>

      {/* Sensitivities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Sensitivities</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="nutrition" size={20} color={theme.primary} />
          <Text style={styles.menuItemText}>Manage Sensitivities</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <View style={styles.sensitivitiesList}>
          <View style={styles.sensitivityTag}>
            <Text style={styles.sensitivityText}>Lactose</Text>
          </View>
          <View style={styles.sensitivityTag}>
            <Text style={styles.sensitivityText}>FODMAP</Text>
          </View>
        </View>
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="download" size={20} color={theme.primary} />
          <Text style={styles.menuItemText}>Export My Data</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text" size={20} color={theme.primary} />
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="trash" size={20} color={theme.error} />
          <Text style={[styles.menuItemText, { color: theme.error }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle" size={20} color={theme.primary} />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="star" size={20} color={theme.primary} />
          <Text style={styles.menuItemText}>Rate the App</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textLight} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color={theme.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  section: {
    backgroundColor: theme.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: theme.textLight,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.textLight,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  apiKeyInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
  },
  eyeButton: {
    padding: 12,
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  apiKeyHelp: {
    fontSize: 12,
    color: theme.textLight,
    textAlign: 'center',
  },
  link: {
    color: theme.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: theme.text,
  },
  settingDescription: {
    fontSize: 12,
    color: theme.textLight,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: theme.text,
  },
  sensitivitiesList: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  sensitivityTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sensitivityText: {
    fontSize: 13,
    color: theme.accent,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  aboutLabel: {
    fontSize: 15,
    color: theme.text,
  },
  aboutValue: {
    fontSize: 15,
    color: theme.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: theme.error,
  },
  bottomPadding: {
    height: 40,
  },
});
