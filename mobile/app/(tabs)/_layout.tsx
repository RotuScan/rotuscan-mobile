import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme'; // Puxando o seu verde!

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary, // Cor do ícone quando selecionado
        headerShown: false, // Esconde o cabeçalho feio do topo
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderColor: '#E0E0E0',
        }
      }}>
      
      {/* 1º Ícone: HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />,
        }}
      />

      {/* 2º Ícone: SCANNER (Meio) */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color }) => <Ionicons name="barcode-outline" size={30} color={color} />,
        }}
      />

      {/* 3º Ícone: PERFIL */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}