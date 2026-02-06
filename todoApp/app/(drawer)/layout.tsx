import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  return (
    <Drawer screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="(drawer)/settings" options={{ title: 'Settings' }} />
    </Drawer>
  );
}
