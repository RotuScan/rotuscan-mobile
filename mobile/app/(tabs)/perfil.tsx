import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
  showBadge?: boolean;
  badgeCount?: number;
}

export default function PerfilScreen() {
  const [nome, setNome] = useState('');
  const [qtdRestricoes, setQtdRestricoes] = useState(0);
  const navigation = useNavigation();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const carregarDados = async () => {
        const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
        if (nomeSalvo) setNome(nomeSalvo);

        // Verificacao de restricoes ativas no armazenamento local
        const keys = ['lactose', 'gluten', 'amendoim'];
        let ativas = 0;
        for (const key of keys) {
          const val = await AsyncStorage.getItem(`@restricao_${key}`);
          if (val === 'true') ativas++;
        }
        setQtdRestricoes(ativas);
      };
      carregarDados();
    }, [])
  );

  const abrirMenu = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (error) {
      Alert.alert("Em construção", "O menu lateral será ativado em breve!");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Deseja realmente sair do RotuScan?",
      [
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
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress, color = '#334155', showBadge, badgeCount = 0 }: MenuItemProps) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.menuItemText, { color: color }]}>{title}</Text>
      </View>
      
      <View style={styles.menuItemRight}>
        {showBadge && (
          <Text style={styles.greenBadgeText}>
            {badgeCount} {badgeCount === 1 ? 'ativa' : 'ativas'}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 90 }} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBackground}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={abrirMenu} style={styles.menuIcon}>
            <Ionicons name="menu" size={32} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.brandName}>RotuScan</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color="#16A34A" />
          </View>
          <Text style={styles.greeting}>{nome || 'Nome do Usuário'}</Text>
          <Text style={styles.subtitle}>Verifique e gerencie sua conta</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem 
          icon="person-outline" 
          title="Dados Pessoais" 
          onPress={() => router.push("/(tabs)/dados-pessoais")} 
        />
        <MenuItem 
          icon="warning-outline" 
          title="Minhas Restrições" 
          showBadge={true}
          badgeCount={qtdRestricoes} 
          onPress={() => router.push("/(tabs)/restricoes")} 
        />
        <MenuItem 
          icon="settings-outline" 
          title="Configurações" 
          onPress={() => router.push("/(tabs)/configuracoes")} 
        />
        <MenuItem 
          icon="star-outline" 
          title="Meus Favoritos" 
          onPress={() => {}} 
        />
        <MenuItem 
          icon="help-circle-outline" 
          title="Ajuda" 
          onPress={() => {}} 
        />
        
        <View style={styles.separator} />

        <MenuItem 
          icon="log-out-outline" 
          title="Sair" 
          color="#EF4444" 
          onPress={handleLogout} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBackground: {
    backgroundColor: '#16A34A', paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  menuIcon: { padding: 5 },
  brandName: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  profileHeader: { alignItems: 'center', marginTop: 5 },
  avatarCircle: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#DCFCE7', marginTop: 4 },
  menuContainer: { paddingHorizontal: 20, marginTop: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 14, marginBottom: 10, elevation: 1,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuItemIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  menuItemText: { fontSize: 15, fontWeight: '600' },
  menuItemRight: { flexDirection: 'row', alignItems: 'center' },
  greenBadgeText: {
    color: '#16A34A',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  separator: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8, marginHorizontal: 10 }
});