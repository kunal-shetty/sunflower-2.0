import { View, Text, Button, Image } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Image
        source={{ uri: 'https://ui-avatars.com/api/?name=User' }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>
        User
      </Text>
      <Text style={{ color: '#666' }}>user@example.com</Text>

      <View style={{ marginTop: 30 }}>
        <Button title="Logout" color="red" onPress={() => {}} />
      </View>
    </View>
  );
}
