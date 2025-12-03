import { Stack } from 'expo-router';
import { Colors } from '../../lib/theme';

export default function IntroLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    />
  );
}
