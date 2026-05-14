import React, { useState, useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from "../services/api"; 
import { Colors } from "../constants/theme"; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const verificarLogin = async () => {
    const id = await AsyncStorage.getItem('@usuario_id');
    if (id) {
      // Se achou um ID, pula direto para a Home!
      router.replace("/(tabs)/home");
    }
  };
  verificarLogin();
  }, []);

  const handleLogin = async () => {
  if (!email || !senha) return Alert.alert("Erro", "Preencha tudo.");
  setLoading(true);
  try {
    const response = await api.post('/api/login', { email, senha });

    // --- AQUI ENTRA A MEMÓRIA ---
    // Guardamos o ID e o Nome como Strings
    await AsyncStorage.setItem('@usuario_id', response.data.usuarioId);
    await AsyncStorage.setItem('@usuario_nome', response.data.nome);
    // ----------------------------

    router.replace("/(tabs)/home");
  } catch (error) {
    Alert.alert("Erro", "E-mail ou senha incorretos.");
  } finally {
    setLoading(false);
  }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.containerLogo}>
        {/* Mudei o caminho abaixo para uma imagem que EXISTE na sua pasta assets/images */}
        <Image
          style={styles.logo}
          source={require("../assets/images/react-logo.png")} 
        />
        <Text style={styles.titleRotuScan}>
          <Text style={{ color: "#2D7A5D" }}>Rotu</Text>
          <Text style={{ color: Colors.light.primary }}>Scan</Text>
        </Text>
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Logue para continuar</Text>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seunome@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputInsideContainer}
          placeholder="sua senha"
          secureTextEntry={!senhaVisivel}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Ionicons name={senhaVisivel ? "eye-off-outline" : "eye-outline"} size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <View style={{ flexDirection: "row", marginTop: 20, justifyContent: 'center' }}>
        <Text>Não possui uma conta? </Text>
        <TouchableOpacity onPress={() => router.push("/cadastro")}>
          <Text style={{ color: Colors.light.primary, fontWeight: "bold" }}>Crie sua conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1, justifyContent: "center" },
  containerLogo: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 40 },
  logo: { width: 60, height: 60, marginRight: 10, resizeMode: "contain" },
  titleRotuScan: { fontSize: 32, fontWeight: "bold" },
  welcomeContainer: { alignItems: "center", marginBottom: 30 },
  title: { color: Colors.light.primary, fontSize: 24, fontWeight: "bold" },
  subtitle: { color: Colors.light.primary, fontSize: 16, marginTop: 5 },
  label: { color: Colors.light.primary, fontSize: 16, marginBottom: 8, marginTop: 15, fontWeight: "bold" },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 16, borderColor: Colors.light.primary },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.light.primary, borderRadius: 8, paddingHorizontal: 12 },
  inputInsideContainer: { flex: 1, paddingVertical: 14, fontSize: 16 },
  button: { backgroundColor: Colors.light.primary, padding: 16, borderRadius: 10, marginTop: 35, alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 18 },
});