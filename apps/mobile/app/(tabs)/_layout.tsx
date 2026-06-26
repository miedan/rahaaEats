import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/BottomNav';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <BottomNav {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="liked" />
    </Tabs>
  );
}
