import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [nome, setNome] = useState('');
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      if (nomeSalvo) setNome(nomeSalvo);
    };
    carregarDados();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header com Avatar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {nome || 'Usuário'}!</Text>
          <Text style={styles.subtitle}>O que vamos verificar hoje?</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={24} color="#FFF" />
        </View>
      </View>

      {/* Botão Principal de Scanner */}
      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => router.push("/(tabs)/scanner")}
      >
        <Ionicons name="barcode-outline" size={40} color="#FFF" />
        <Text style={styles.scanButtonText}>Escanear Rótulo</Text>
      </TouchableOpacity>

      {/* Seção de Dicas/Novidades */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dicas RotuScan</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name="information-circle" size={28} color={Colors.light.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Cuidado com Traços</Text>
          <Text style={styles.cardDescription}>
            Sempre verifique o aviso "Pode conter traços de..." mesmo que o ingrediente não esteja na lista principal.
          </Text>
        </View>
      </View>
      
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name="nutrition" size={28} color={Colors.light.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Nomes Ocultos</Text>
          <Text style={styles.cardDescription}>
            O glúten pode estar escondido com nomes como malte, cevada ou espelta. O scanner te ajuda nisso!
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#777', marginTop: 4 },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanButton: {
    backgroundColor: Colors.light.primary,
    margin: 24,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15
  },
  sectionHeader: { paddingHorizontal: 24, paddingBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginBottom: 15,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF'
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F0FFF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cardDescription: { fontSize: 13, color: '#666', lineHeight: 18 }
});