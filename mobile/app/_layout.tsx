import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* O nome "index" diz para o Expo Router: Comece por aqui! (Seu Login) */}
      <Stack.Screen name="index" />
      
      {/* Sua tela de cadastro */}
      <Stack.Screen name="cadastro" />
      
      {/* O grupo de abas (Home, Scanner, Perfil) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}