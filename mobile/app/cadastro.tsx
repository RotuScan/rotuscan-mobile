import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function CadastroScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const backgroundImage = require("../assets/images/Fundo.png");

  // ESTADOS PARA OS CAMPOS
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [repetirSenha, setRepetirSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarRepetirSenha, setMostrarRepetirSenha] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ImageBackground
      source={backgroundImage}
      resizeMode="cover"
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* LOGO */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoRotu}>Rotu</Text>
              <Text style={styles.logoScan}>Scan</Text>
            </View>

            {/* CARD */}
            <View style={styles.card}>
              {/* USUÁRIO */}
              <Text style={styles.label}>Usuário</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color="#556070"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={usuario}
                  onChangeText={setUsuario}
                  placeholder="Usuário"
                  placeholderTextColor="#9EA5B1"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              {/* E-MAIL */}
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color="#556070"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail"
                  placeholderTextColor="#9EA5B1"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              {/* SENHA */}
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#556070"
                  style={styles.inputIcon}
                />
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Senha"
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
                    name={mostrarSenha ? "eye-outline" : "eye-off-outline"}
                    size={16}
                    color="#8A94A6"
                  />
                </TouchableOpacity>
              </View>

              {/* REPITA A SENHA */}
              <Text style={styles.label}>Repita a senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#556070"
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
                    name={mostrarRepetirSenha ? "eye-outline" : "eye-off-outline"}
                    size={16}
                    color="#8A94A6"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.85}
                onPress={() => router.push("../selectIntolerancia")}
              >
                <Text style={styles.actionButtonText}>Próximo </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>Já tem conta? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.back()}
                >
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },

  // LOGO
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 42,
    lineHeight: 48,
    color: "#006B3A",
  },
  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 42,
    lineHeight: 48,
    color: "#F8A018",
  },

  // CARD DE CADASTRO
  card: {
    width: width * 0.91,
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 22,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  label: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 11,
    lineHeight: 14,
    color: "#374151",
    marginBottom: 5,
    marginTop: 10,
  },
  inputContainer: {
    width: "100%",
    height: 42,
    borderWidth: 1,
    borderColor: "#E3E6EA",
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 6,
    textAlign: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#374151",
  },
  eyeButton: {
    width: 28,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // BOTÃO PRÓXIMO
  actionButton: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: "#24C95B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 16,
  },
  actionButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
// FOOTER
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Geist_400Regular",
    fontSize: 11.5,
    color: "#9CA3AF",
  },
  footerLink: {
    fontFamily: "Geist_700Bold",
    fontSize: 11.5,
    color: "#008B5E",
  },
});