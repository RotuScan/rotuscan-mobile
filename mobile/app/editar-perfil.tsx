import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../services/api";
import AppHeader from "../components/Header/AppHeader";
import TabBar from "../components/TabBar/indexTab";

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  const [novaSenha, setNovaSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      const nomeSalvo = await AsyncStorage.getItem("@usuario_nome");
      const emailSalvo = await AsyncStorage.getItem("@usuario_email");
      if (nomeSalvo) setNome(nomeSalvo);
      if (emailSalvo) setEmail(emailSalvo);
    };
    carregarDados();
  }, []);

  const salvarPerfil = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert("Erro", "Nome e e-mail são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const usuarioId = await AsyncStorage.getItem("@usuario_id");

      if (usuarioId) {
        const dadosAtualizacao: any = {
          id: usuarioId,
          nome: nome.trim(),
          email: email.trim(),
        };
        if (novaSenha.trim() !== "") {
          dadosAtualizacao.senha = novaSenha;
        }

        await api.put("/api/usuario/atualizar", dadosAtualizacao);
      }

      await AsyncStorage.setItem("@usuario_nome", nome.trim());
      await AsyncStorage.setItem("@usuario_email", email.trim());

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      router.replace("/perfil" as never);
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil no servidor. Verifique os dados ou a conexão."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}
      >
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={20} color="#087443" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Editar Perfil</Text>
          </View>

          <View style={styles.profileCard}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite seu nome"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Digite seu e-mail"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.label}>Nova Senha (Opcional)</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry={!senhaVisivel}
                placeholder="Digite para alterar"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                onPress={() => setSenhaVisivel(!senhaVisivel)}
                style={{ padding: 5 }}
              >
                <Ionicons
                  name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>
              Deixe em branco para manter a senha atual.
            </Text>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={salvarPerfil}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TabBar abaAtiva="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  cardContainer: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  label: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: "#334155" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 15 },
  hintText: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 15,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: "#087443",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    elevation: 2,
  },
  saveButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
});
