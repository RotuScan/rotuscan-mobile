import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DadosPessoaisScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      const emailSalvo = await AsyncStorage.getItem('@usuario_email'); 
      if (nomeSalvo) setNome(nomeSalvo);
      if (emailSalvo) setEmail(emailSalvo);
    };
    carregarDados();
  }, []);

  return (
    <View style={styles.container}>
      
      {/* Cabeçalho Verde com Botão Voltar FORÇANDO A IDA PARA O PERFIL */}
      <View style={styles.headerBackground}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/perfil')} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.brandName}>RotuScan</Text>
          <View style={{ width: 28 }} /> 
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#16A34A" />
          </View>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Informações do Perfil</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{nome || 'Não informado'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#64748B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{email || 'usuario@email.com'}</Text>
            </View>
          </View>

          {/* AQUI ESTÁ A CORREÇÃO DO BOTÃO */}
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push('/(tabs)/editar-perfil')}
          >
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBackground: {
    backgroundColor: '#16A34A',
    paddingTop: 50,
    paddingBottom: 80,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backIcon: { padding: 5 },
  brandName: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  profileHeader: { alignItems: 'center', marginTop: 10 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5,
  },
  cardContainer: { paddingHorizontal: 20, marginTop: -50 },
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 20 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10,
  },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { fontSize: 12, color: '#94A3B8' },
  infoValue: { fontSize: 16, color: '#334155', fontWeight: '500', marginTop: 2 },
  editButton: {
    backgroundColor: '#F0FDF4', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#BBF7D0',
  },
  editButtonText: { color: '#16A34A', fontWeight: 'bold', fontSize: 15 }
});