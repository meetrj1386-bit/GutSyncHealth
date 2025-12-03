import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Shadows } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.icon, focused && styles.iconActive]}>
                {focused ? <View style={styles.homeIconActive} /> : <View style={styles.homeIcon} />}
              </View>
            </View>
          ),
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Health',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.icon, focused && styles.iconActive]}>
                {focused ? <View style={styles.coachIconActive} /> : <View style={styles.coachIcon} />}
              </View>
            </View>
          ),
          tabBarLabel: 'Health',
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.centerButtonContainer}>
              <View style={styles.centerButton}>
                <Text style={styles.plusText}>+</Text>
              </View>
              <Text style={styles.fabLabelText}>Log</Text>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="cabinet"
        options={{
          title: 'Meds',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.icon, focused && styles.iconActive]}>
                {focused ? <View style={styles.medsIconActive} /> : <View style={styles.medsIcon} />}
              </View>
            </View>
          ),
          tabBarLabel: 'Meds',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <View style={[styles.icon, focused && styles.iconActive]}>
                {focused ? <View style={styles.profileIconActive} /> : <View style={styles.profileIcon} />}
              </View>
            </View>
          ),
          tabBarLabel: 'Me',
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="checkin" options={{ href: null }} />
      <Tabs.Screen name="insights" options={{ href: null }} />
      <Tabs.Screen name="meals" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    ...Shadows.sm,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabIcon: {
    marginBottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {},
  
  // Simple shapes for icons
  homeIcon: { width: 20, height: 18, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 3 },
  homeIconActive: { width: 20, height: 18, backgroundColor: Colors.primary, borderRadius: 3 },
  coachIcon: { width: 20, height: 20, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 10 },
  coachIconActive: { width: 20, height: 20, backgroundColor: Colors.primary, borderRadius: 10 },
  mealsIcon: { width: 18, height: 18, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 9 },
  mealsIconActive: { width: 18, height: 18, backgroundColor: Colors.primary, borderRadius: 9 },
  medsIcon: { width: 16, height: 20, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 8 },
  medsIconActive: { width: 16, height: 20, backgroundColor: Colors.primary, borderRadius: 8 },
  profileIcon: { width: 18, height: 18, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 9 },
  profileIconActive: { width: 18, height: 18, backgroundColor: Colors.primary, borderRadius: 9 },
  
  // Center button (FAB)
  centerButtonContainer: {
    alignItems: 'center',
    marginTop: -15,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  plusText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    marginTop: -2,
  },
  fabLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
});
