import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RestricoesScreen() {
  const router = useRouter();
  
  // Estado para guardar quais restrições estão ativas
  const [restricoes, setRestricoes] = useState({
    gluten: false,
    lactose: false,
    amendoim: false,
  });

  useEffect(() => {
    // Carrega o que está salvo no celular ao abrir a tela
    const carregarRestricoes = async () => {
      const chaves = ['gluten', 'lactose', 'amendoim'];
      const novasRestricoes = { ...restricoes };
      
      for (const chave of chaves) {
        const valor = await AsyncStorage.getItem(`@restricao_${chave}`);
        novasRestricoes[chave as keyof typeof restricoes] = valor === 'true';
      }
      setRestricoes(novasRestricoes);
    };
    carregarRestricoes();
  }, []);

  // Função que roda ao clicar na chavinha
  const toggleRestricao = async (chave: keyof typeof restricoes) => {
    const novoValor = !restricoes[chave];
    
    // Atualiza na tela
    setRestricoes((prev) => ({ ...prev, [chave]: novoValor }));
    
    // Salva no sistema
    await AsyncStorage.setItem(`@restricao_${chave}`, String(novoValor));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBackground}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/perfil')} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.brandName}>RotuScan</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="warning" size={40} color="#16A34A" />
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Minhas Restrições</Text>
          <Text style={styles.cardSubtitle}>Ative os ingredientes que você deseja evitar.</Text>
          
          {/* Item 1: Glúten */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Ionicons name="nutrition-outline" size={24} color="#64748B" />
              <Text style={styles.switchLabel}>Sem Glúten</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
              thumbColor={restricoes.gluten ? '#16A34A' : '#94A3B8'}
              onValueChange={() => toggleRestricao('gluten')}
              value={restricoes.gluten}
            />
          </View>

          {/* Item 2: Lactose */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Ionicons name="water-outline" size={24} color="#64748B" />
              <Text style={styles.switchLabel}>Sem Lactose</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
              thumbColor={restricoes.lactose ? '#16A34A' : '#94A3B8'}
              onValueChange={() => toggleRestricao('lactose')}
              value={restricoes.lactose}
            />
          </View>

          {/* Item 3: Amendoim */}
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Ionicons name="leaf-outline" size={24} color="#64748B" />
              <Text style={styles.switchLabel}>Alergia a Amendoim</Text>
            </View>
            <Switch
              trackColor={{ false: '#E2E8F0', true: '#BBF7D0' }}
              thumbColor={restricoes.amendoim ? '#16A34A' : '#94A3B8'}
              onValueChange={() => toggleRestricao('amendoim')}
              value={restricoes.amendoim}
            />
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBackground: {
    backgroundColor: '#16A34A', paddingTop: 50, paddingBottom: 80,
    paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backIcon: { padding: 5 },
  brandName: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  profileHeader: { alignItems: 'center', marginTop: 10 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5,
  },
  cardContainer: { paddingHorizontal: 20, marginTop: -50 },
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#334155' },
  cardSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 20, marginTop: 4 },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 15,
  },
  switchLabelContainer: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { fontSize: 16, color: '#334155', fontWeight: '500', marginLeft: 15 },
});