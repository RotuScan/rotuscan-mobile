import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  
  // Estados das chaves (Toggles) de restrição
  const [lactose, setLactose] = useState(false);
  const [gluten, setGluten] = useState(false);
  const [amendoim, setAmendoim] = useState(false);
  const [acucar, setAcucar] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem('@usuario_nome');
      if (nomeSalvo) setNome(nomeSalvo);
      
      // Carrega as restrições salvas da memória ao abrir a tela
      const lac = await AsyncStorage.getItem('@restricao_lactose');
      const glut = await AsyncStorage.getItem('@restricao_gluten');
      const amen = await AsyncStorage.getItem('@restricao_amendoim');
      const acuc = await AsyncStorage.getItem('@restricao_acucar');
      
      if (lac === 'true') setLactose(true);
      if (glut === 'true') setGluten(true);
      if (amen === 'true') setAmendoim(true);
      if (acuc === 'true') setAcucar(true);
    };
    carregarDados();
  }, []);

  // NOVO: Função que atualiza o botão e salva na memória ao mesmo tempo
  const toggleSwitch = async (chave: string, valor: boolean, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter(valor);
    await AsyncStorage.setItem(`@restricao_${chave}`, valor ? 'true' : 'false');
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/");
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={50} color={Colors.light.primary} />
        </View>
        <Text style={styles.userName}>{nome || 'Usuário'}</Text>
        <Text style={styles.userEmail}>Minha Conta</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas Restrições</Text>
        <Text style={styles.sectionSubtitle}>Ligue as chaves dos ingredientes que o scanner deve procurar.</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Lactose / Leite</Text>
          </View>
          <Switch
            value={lactose}
            // NOVO: Usa a função para salvar
            onValueChange={(val) => toggleSwitch('lactose', val, setLactose)}
            trackColor={{ false: "#D3D3D3", true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Glúten</Text>
          </View>
          <Switch
            value={gluten}
            onValueChange={(val) => toggleSwitch('gluten', val, setGluten)}
            trackColor={{ false: "#D3D3D3", true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Amendoim</Text>
          </View>
          <Switch
            value={amendoim}
            onValueChange={(val) => toggleSwitch('amendoim', val, setAmendoim)}
            trackColor={{ false: "#D3D3D3", true: Colors.light.primary }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Açúcar</Text>
          </View>
          <Switch
            value={acucar}
            onValueChange={(val) => toggleSwitch('acucar', val, setAcucar)}
            trackColor={{ false: "#D3D3D3", true: Colors.light.primary }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Estilos mantidos exatamente iguais aos seus
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0FFF0', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: Colors.light.primary },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginTop: 5 },
  section: { marginTop: 20, backgroundColor: '#FFF', paddingVertical: 20, paddingHorizontal: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  sectionSubtitle: { fontSize: 13, color: '#666', marginBottom: 20 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontSize: 16, color: '#333', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 24, padding: 16, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FFE5E5' },
  logoutText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});