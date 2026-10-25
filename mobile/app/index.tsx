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

  const backgroundImage = require("../images/Fundo.png");

  // ESTADOS PARA OS CAMPOS DE CADASTRO
  const [usuario, setUsuario] = useState("Endrew R Lemos");
  const [email, setEmail] = useState("rendrew8@gmail.com");
  const [senha, setSenha] = useState("12345678910");
  const [repetirSenha, setRepetirSenha] = useState("12345678910");
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
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

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
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} 
          onPress={() => router.push("../home")}>
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
    flex: 1,
    width: "100%",
    height: "100%",
  },
  
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    overflow: "hidden",
  
  },

  //   LOGO

  logoContainer: {
    position: "absolute",
    top: 103,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
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

  //   CARD

  loginCard: {
    position: "absolute",
    top: 163,
    width: width * 0.91,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 2,
  },

  // LABELS

  label: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 9.5,
    lineHeight: 12,
    color: "#374151",
    marginBottom: 6,
  },
    passwordLabel: {
    marginTop: 16,
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

  // INPUTS

  inputContainer: {
    width: "100%",
    height: 33,
    borderWidth: 1,
    borderColor: "#E3E6EA",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },

  inputIcon: {
    width: 17,
    marginRight: 4,
    textAlign: "center",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontFamily: "Geist_400Regular",
    fontSize: 9.5,
    color: "#374151",
  },

  eyeButton: {
    width: 22,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // =======   BOTÃO

  loginButton: {
    width: "100%",
    height: 34,
    borderRadius: 20,
    backgroundColor: "#24C95B",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 17,
  },

  loginButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  arrow: {
    marginLeft: 4,
  },

  //   LOGIN

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Geist_400Regular",
    fontSize: 9.5,
    color: "#9CA3AF",
  },
  registerLink: {
    fontFamily: "Geist_700Bold",
    fontSize: 9.5,
    color: "#008B5E",
  },
});
