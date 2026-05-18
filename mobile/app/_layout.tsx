import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomDrawerContent(props: any) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Obtem as dimensoes das safe areas do dispositivo

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      const emailSalvo = await AsyncStorage.getItem('@usuario_email');
      if (nomeSalvo) setNome(nomeSalvo);
      if (emailSalvo) setEmail(emailSalvo);
    };
    carregarDados();
  }, []);

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: "destructive", 
        onPress: async () => {
          await AsyncStorage.removeItem('@usuario_nome');
          await AsyncStorage.removeItem('@usuario_email');
          router.replace('/'); 
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      
      <View style={[styles.drawerHeader, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          onPress={() => props.navigation.dispatch(DrawerActions.closeDrawer())} 
          style={styles.closeButton}
        >
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.profileInfoContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color="#16A34A" />
          </View>
          <Text style={styles.userName}>{nome || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{email || 'usuario@email.com'}</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 10 }}>
        <View style={styles.drawerItemsContainer}>
          <DrawerItem
            icon={({ size }) => <Ionicons name="person-outline" size={22} color="#334155" />}
            label="Dados pessoais"
            labelStyle={styles.drawerItemLabel}
            onPress={() => router.push('/(tabs)/dados-pessoais')}
          />
          <DrawerItem
            icon={({ size }) => <Ionicons name="warning-outline" size={22} color="#334155" />}
            label="Minhas restrições"
            labelStyle={styles.drawerItemLabel}
            onPress={() => router.push('/(tabs)/restricoes')}
          />
          <DrawerItem
            icon={({ size }) => <Ionicons name="notifications-outline" size={22} color="#334155" />}
            label="Notificações"
            labelStyle={styles.drawerItemLabel}
            onPress={() => {}}
          />
          <DrawerItem
            icon={({ size }) => <Ionicons name="settings-outline" size={22} color="#334155" />}
            label="Configurações"
            labelStyle={styles.drawerItemLabel}
            onPress={() => router.push('/(tabs)/configuracoes')}
          />
        </View>
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="index" options={{ swipeEnabled: false }} />
        <Drawer.Screen name="cadastro" options={{ swipeEnabled: false }} />
        <Drawer.Screen name="(tabs)" />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#16A34A',
    paddingBottom: 20,
    paddingHorizontal: 24,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  profileInfoContainer: {
    alignItems: 'flex-start',
    marginTop: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
  },
  userName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  userEmail: { color: '#DCFCE7', fontSize: 13, marginTop: 2 },
  drawerItemsContainer: { paddingHorizontal: 10 },
  drawerItemLabel: { fontSize: 15, color: '#334155', fontWeight: '600', marginLeft: -12 },
  drawerFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 40 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: 'bold', marginLeft: 12 },
});