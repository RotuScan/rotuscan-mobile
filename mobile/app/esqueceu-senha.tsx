import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { useRouter } from "expo-router";

import api, { extrairMensagemErro } from "../services/api";

const { width } = Dimensions.get("window");
const backgroundImage = require("../assets/images/Fundo.png");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EsqueceuSenhaScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const handleRecuperarSenha = async () => {
    if (loading) return;
    setErroEmail(null);
    setErroServidor(null);

    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo) {
      setErroEmail("Preencha seu e-mail");
      return;
    }

    if (!EMAIL_REGEX.test(emailLimpo)) {
      setErroEmail("E-mail inválido");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/esqueci-senha", {
        email: emailLimpo,
      });

      const mensagemSucesso =
        response.data?.mensagem ||
        "Instruções de recuperação enviadas para o seu e-mail.";

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(mensagemSucesso);
        router.replace("/login" as never);
      } else {
        Alert.alert("Sucesso", mensagemSucesso, [
          {
            text: "OK",
            onPress: () => router.replace("/login" as never),
          },
        ]);
      }
    } catch (error: any) {
      const msg = extrairMensagemErro(error);
      setErroServidor(msg);
      Alert.alert("Atenção", msg);
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

        <View style={styles.card}>
          <Text style={styles.title}>Esqueceu sua senha?</Text>
          <Text style={styles.subtitle}>
            Informe o e-mail associado à sua conta e enviaremos as instruções
            para redefinir sua senha.
          </Text>

          {erroServidor ? (
            <View style={styles.erroBanner}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.erroBannerText}>{erroServidor}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <View
            style={[
              styles.inputContainer,
              erroEmail ? styles.inputContainerError : null,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={erroEmail ? "#EF4444" : "#556070"}
              style={styles.inputIcon}
            />
            <TextInput
              value={email}
              onChangeText={(txt) => {
                setEmail(txt);
                if (erroEmail) setErroEmail(null);
                if (erroServidor) setErroServidor(null);
              }}
              placeholder="seunome@email.com"
              placeholderTextColor="#9EA5B1"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>
          {erroEmail ? (
            <View style={styles.fieldErrorRow}>
              <Ionicons name="alert-circle" size={13} color="#EF4444" />
              <Text style={styles.fieldErrorText}>{erroEmail}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.85}
            onPress={handleRecuperarSenha}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Enviando...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Enviar instruções</Text>
            )}
          </TouchableOpacity>

          <View style={styles.backContainer}>
            <Text style={styles.backText}>Lembrou a senha? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
            >
              <Text style={styles.backLink}>Voltar ao login</Text>
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
    marginTop: 105,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 50,
    color: "#006B3A",
    letterSpacing: -1.5,
  },
  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 50,
    color: "#F59E0B",
    letterSpacing: -1.5,
  },
  card: {
    marginTop: 12,
    width: width * 0.88,
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 13.5,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 18,
  },
  erroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  erroBannerText: {
    flex: 1,
    fontFamily: "Geist_500Medium",
    fontSize: 12.5,
    color: "#DC2626",
  },
  label: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
    paddingHorizontal: 8,
  },
  fieldErrorText: {
    fontFamily: "Geist_500Medium",
    fontSize: 11.5,
    color: "#EF4444",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    color: "#1F2937",
  },
  submitButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 24,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  backContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#9CA3AF",
  },
  backLink: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#008B5E",
  },
});
