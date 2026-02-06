import { View, Text } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Image } from 'expo-image';

export default function HomeScreen() {
  return (
    <>
      <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
        />
      }>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Hello 👋
          </Text>
          <Text style={{ color: '#666' }}>
            Let's make today productive!
          </Text>
        </View>
      </ParallaxScrollView>

y    </>
  );
}
