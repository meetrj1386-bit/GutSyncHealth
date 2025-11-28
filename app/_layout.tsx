import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="add-medication" 
          options={{ 
            headerShown: true,
            title: 'Add Medication',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#4A7C59' },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="add-supplement" 
          options={{ 
            headerShown: true,
            title: 'Add Supplement',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#4A7C59' },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            headerShown: true,
            title: 'Settings',
            headerStyle: { backgroundColor: '#4A7C59' },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </>
  );
}
