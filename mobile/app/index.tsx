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

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const backgroundImage = require("../assets/images/Fundo.png");

  // ESTADOS PARA OS CAMPOS DE LOGIN
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

            {/* CARD DE LOGIN */}
            <View style={styles.loginCard}>
              {/* E-MAIL */}
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={18}
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
                  underlineColorAndroid="transparent"
                  style={styles.input}
                />
              </View>

              {/* SENHA */}
              <Text style={[styles.label, styles.passwordLabel]}>Senha</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
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
                  underlineColorAndroid="transparent"
                  style={[styles.input, { paddingRight: 35 }]}
                />
                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={mostrarSenha ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#8A94A6"
                  />
                </TouchableOpacity>
              </View>

              {/* ESQUECEU A SENHA */}
              <TouchableOpacity style={styles.forgotContainer} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Esqueceu a senha?</Text>
              </TouchableOpacity>

              {/* BOTÃO ENTRAR */}
              <TouchableOpacity
                style={styles.loginButton}
                activeOpacity={0.85}
                onPress={() => router.push("../home")}
              >
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>

              {/* CADASTRO */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Não tem conta? </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("../cadastro")}
                >
                  <Text style={styles.registerLink}>Cadastre-se</Text>
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
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

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

  loginCard: {
    width: "91%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },

  // LABELS
  label: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
    color: "#374151",
    marginBottom: 6,
  },
  passwordLabel: {
    marginTop: 14,
  },

  // ESQUECEU A SENHA
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 20,
  },
    forgotText: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#008B5E",
  },

  // INPUTS
  inputContainer: {
    width: "100%",
    height: 46,
    borderWidth: 1,
    borderColor: "#E3E6EA",
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  inputIcon: {
    marginRight: 8,
    textAlign: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#374151",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  loginButton: {
    width: "100%",
    height: 46,
    borderRadius: 22,
    backgroundColor: "#24C95B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
  },
  registerLink: {
    fontFamily: "Geist_700Bold",
    fontSize: 12,
    color: "#008B5E",
  },
});