import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [sensitivities, setSensitivities] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'User');
        setUserEmail(user.email || '');
        setSensitivities(user.sensitivities || []);
      }
    } catch {
      // Fallback
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              // Clear all user data
              await SecureStore.deleteItemAsync('user');
              await SecureStore.deleteItemAsync('isLoggedIn');
            } catch {
              // Continue anyway
            }
            // Navigate to welcome screen
            router.replace('/welcome');
          }
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(userName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Gut Health Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🦠 Gut Health Profile</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="nutrition" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Food Sensitivities</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {sensitivities.length > 0 && sensitivities[0] !== 'none' && (
          <View style={styles.sensitivitiesRow}>
            {sensitivities.map((s, index) => (
              <View key={index} style={styles.sensitivityTag}>
                <Text style={styles.sensitivityText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="flag" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Health Goals</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="time" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Meal Reminders</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Notifications</Text>
        
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Medication Reminders</Text>
            <Text style={styles.settingDesc}>Never miss a dose</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E0E0E0', true: '#8FB996' }}
            thumbColor={notifications ? '#4A7C59' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Daily Check-in</Text>
            <Text style={styles.settingDesc}>Evening reminder to log how you feel</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: '#E0E0E0', true: '#8FB996' }}
            thumbColor="#4A7C59"
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Weekly Insights</Text>
            <Text style={styles.settingDesc}>Summary of your gut health patterns</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: '#E0E0E0', true: '#8FB996' }}
            thumbColor="#4A7C59"
          />
        </View>
      </View>

      {/* Data & Privacy */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Data & Privacy</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="download-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Export My Data</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Support</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Help & FAQ</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="chatbubble-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Contact Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="star-outline" size={20} color="#4A7C59" />
          <Text style={styles.menuItemText}>Rate the App</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.card}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={[styles.card, styles.dangerCard]}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          <Text style={[styles.menuItemText, { color: '#E74C3C' }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A7C59',
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
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
  },
  profileEmail: {
    fontSize: 13,
    color: '#636E72',
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
    color: '#2D3436',
  },
  sensitivitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sensitivityTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  sensitivityText: {
    fontSize: 12,
    color: '#F4A261',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 15,
    color: '#2D3436',
  },
  settingDesc: {
    fontSize: 12,
    color: '#636E72',
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutLabel: {
    fontSize: 15,
    color: '#2D3436',
  },
  aboutValue: {
    fontSize: 15,
    color: '#636E72',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 14,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#E74C3C',
  },
  bottomPadding: {
    height: 40,
  },
});
