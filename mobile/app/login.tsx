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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { Geist_700Bold } from "@expo-google-fonts/geist/700Bold";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const backgroundImage = require("../images/Fundo.png");

export default function LoginScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [email, setEmail] = useState("rendrew8@gmail.com");
  const [senha, setSenha] = useState("12345678910");
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F6F8" />

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
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={mostrarSenha ? "eye-outline" : "eye-outline"}
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
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.85}>
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* CADASTRO */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem conta? </Text>
          <TouchableOpacity activeOpacity={1}
         onPress={() => router.push("../cadastro") }
          >
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
 </SafeAreaView>
 </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex:1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    alignItems: "center",
  },


  /* LOGO */
  logoContainer: {
    marginTop: 130,
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

  /* CARD */
  loginCard: {
    marginTop: 4,
    width: width * 0.88,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },

  /* LABELS E INPUTS */
  label: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 16,
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
  eyeButton: {
    padding: 4,
  },

  /* ESQUECEU A SENHA */
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 12,
    marginBottom: 20,
  },
  forgotText: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#008B5E",
  },

  /* BOTÃO */
  loginButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  loginButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },

  /* CADASTRO */
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