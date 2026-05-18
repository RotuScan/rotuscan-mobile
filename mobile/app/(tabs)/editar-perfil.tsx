import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from "../../services/api";

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      const emailSalvo = await AsyncStorage.getItem('@usuario_email');
      if (nomeSalvo) setNome(nomeSalvo);
      if (emailSalvo) setEmail(emailSalvo);
    };
    carregarDados();
  }, []);

  const salvarPerfil = async () => {
    if (!nome || !email) {
      Alert.alert('Erro', 'Nome e e-mail são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const usuarioId = await AsyncStorage.getItem('@usuario_id'); 

      // Definicao do payload. A senha e opcional na atualizacao
      const dadosAtualizacao: any = { id: usuarioId, nome, email };
      if (novaSenha.trim() !== '') {
        dadosAtualizacao.senha = novaSenha;
      }

      // Requisição para a sua API
      const response = await api.put('/api/usuario/atualizar', dadosAtualizacao);

      if (response.data.sucesso || response.status === 200) {
        await AsyncStorage.setItem('@usuario_nome', nome);
        await AsyncStorage.setItem('@usuario_email', email);
        
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        router.back(); 
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Verifique os dados ou a conexão.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      <View style={styles.headerBackground}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.brandName}>Editar Perfil</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.profileCard}>
          
          <Text style={styles.label}>Nome Completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
            />
          </View>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Digite seu e-mail"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.divider} />
          
          <Text style={styles.label}>Nova Senha (Opcional)</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry={!senhaVisivel}
              placeholder="Digite para alterar"
            />
            <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={{ padding: 5 }}>
              <Ionicons name={senhaVisivel ? "eye-off-outline" : "eye-outline"} size={22} color="#94A3B8" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hintText}>Deixe em branco para manter a senha atual.</Text>

          <TouchableOpacity style={styles.saveButton} onPress={salvarPerfil} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBackground: {
    backgroundColor: '#16A34A', paddingTop: 50, paddingBottom: 80, paddingHorizontal: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backIcon: { padding: 5 },
  brandName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  cardContainer: { paddingHorizontal: 20, marginTop: -40 },
  profileCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  label: { fontSize: 14, color: '#334155', fontWeight: '600', marginBottom: 8, marginTop: 10 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9',
    borderRadius: 12, paddingHorizontal: 15, marginBottom: 5,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#334155' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  hintText: { fontSize: 12, color: '#94A3B8', marginBottom: 15, marginLeft: 5 },
  saveButton: {
    backgroundColor: '#16A34A', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', marginTop: 15, elevation: 3,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});