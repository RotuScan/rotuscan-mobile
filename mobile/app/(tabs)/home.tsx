import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';

export default function HomeScreen() {
  const [nome, setNome] = useState('');
  const [restricoes, setRestricoes] = useState<string[]>([]);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      if (nomeSalvo) setNome(nomeSalvo);

      const keys = ['lactose', 'gluten', 'amendoim'];
      const ativas = [];
      for (const key of keys) {
        const val = await AsyncStorage.getItem(`@restricao_${key}`);
        if (val === 'true') ativas.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
      setRestricoes(ativas);
    };
    carregarDados();
  }, [restricoes]);

  const abrirMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={abrirMenu} style={styles.menuIcon}>
            <Ionicons name="menu" size={32} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.brandName}>RotuScan</Text>
          <View style={{ width: 32 }}></View>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Olá, {nome || 'Usuário'}!</Text>
          <Text style={styles.headerSubtitle}>Sua alimentação segura começa aqui.</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Suas Restrições</Text>
        <View style={styles.chipsContainer}>
          {restricoes.length > 0 ? (
            restricoes.map((item) => (
              <View key={item} style={styles.chipRed}>
                <Ionicons name="warning" size={16} color="#D32F2F" style={{ marginRight: 6 }} />
                <Text style={styles.chipTextRed}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRestricoes}>Nenhuma restrição ativa no momento.</Text>
          )}
        </View>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="time-outline" size={32} color="#16A34A" />
            </View>
            <Text style={styles.actionTitle}>Últimos Scans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF9C3' }]}>
              <Ionicons name="star-outline" size={32} color="#CA8A04" />
            </View>
            <Text style={styles.actionTitle}>Meus Favoritos</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Dica do Dia</Text>
        <View style={styles.infoCard}>
          <Ionicons name="leaf" size={28} color="#16A34A" />
          <Text style={styles.infoText}>Verifique os rótulos regularmente. As composições dos produtos podem sofrer alterações pelos fabricantes sem aviso prévio.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerCard: {
    backgroundColor: '#16A34A', paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuIcon: { padding: 5 },
  brandName: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  greetingContainer: { marginTop: 10 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 15, color: '#DCFCE7', marginTop: 4 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 12 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25 },
  chipRed: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', 
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 10,
    marginBottom: 10, borderWidth: 1, borderColor: '#FECACA',
  },
  chipTextRed: { color: '#D32F2F', fontWeight: '700', fontSize: 13 },
  noRestricoes: { color: '#94A3B8', fontStyle: 'italic' },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionCard: {
    backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 16, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
  },
  iconContainer: {
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  infoCard: {
    backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0',
  },
  infoText: { flex: 1, marginLeft: 16, fontSize: 14, color: '#166534', lineHeight: 20, fontWeight: '500' }
});