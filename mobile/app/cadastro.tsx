import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../services/api";

const { width } = Dimensions.get("window");
const backgroundImage = require("../assets/images/Fundo.png");

export default function CadastroScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [repetirSenha, setRepetirSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarRepetirSenha, setMostrarRepetirSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha || !repetirSenha) {
      return Alert.alert("Atenção", "Por favor, preencha todos os campos.");
    }

    if (senha !== repetirSenha) {
      return Alert.alert("Atenção", "As senhas não coincidem!");
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        nome,
        email,
        senha,
      });

      const { token, usuario } = response.data;

      // Salva a sessão JWT imediatamente para permitir salvar as restrições na próxima tela
      await AsyncStorage.setItem("@rotuscan_token", token);
      await AsyncStorage.setItem("@usuario_id", usuario.id);
      await AsyncStorage.setItem("@usuario_nome", usuario.nome);
      await AsyncStorage.setItem("@usuario_email", usuario.email);

      // Redireciona para a seleção de intolerâncias do colega (ou home caso não exista ainda)
      router.replace("/selectIntolerancia");
    } catch (error: any) {
      if (error.response) {
        Alert.alert("Erro no Cadastro", error.response.data.erro || "Falha ao criar conta.");
      } else {
        Alert.alert(
          "Erro de Rede",
          "Não foi possível conectar ao servidor. Verifique o IP e o Wi-Fi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.logoContainer}>
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.label}>Usuário (Nome completo)</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={16}
              color="#737D8D"
              style={styles.inputIcon}
            />
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor="#9EA5B1"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={16}
              color="#737D8D"
              style={styles.inputIcon}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seunome@email.com"
              placeholderTextColor="#9EA5B1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#737D8D"
              style={styles.inputIcon}
            />
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Crie uma senha"
              placeholderTextColor="#9EA5B1"
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mostrarSenha ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9AA3B2"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Repita a senha</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color="#737D8D"
              style={styles.inputIcon}
            />
            <TextInput
              value={repetirSenha}
              onChangeText={setRepetirSenha}
              placeholder="Repita a senha"
              placeholderTextColor="#9EA5B1"
              secureTextEntry={!mostrarRepetirSenha}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setMostrarRepetirSenha(!mostrarRepetirSenha)}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={mostrarRepetirSenha ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#9AA3B2"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={handleCadastro}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Próximo</Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color="#FFFFFF"
                  style={styles.arrow}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Já tem conta? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.registerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  logoContainer: {
    marginTop: 95,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 44,
    color: "#006B3A",
  },
  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 44,
    color: "#F8A018",
  },
  loginCard: {
    marginTop: 15,
    width: width * 0.9,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  label: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    color: "#374151",
    marginBottom: 6,
  },
  inputContainer: {
    width: "100%",
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E6EA",
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#374151",
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#24C95B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 18,
  },
  loginButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  arrow: {
    marginLeft: 6,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#9CA3AF",
  },
  registerLink: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#008B5E",
  },
});