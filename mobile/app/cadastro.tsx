import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Importando sua conexão com o servidor e cores
import api from "../services/api";
import { Colors } from "../constants/theme";

export default function CadastroScreen() {
  const router = useRouter();

  // Estados dos campos
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  // Estados dos "olhinhos" da senha
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmarVisivel, setConfirmarVisivel] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Função REAL de cadastro no Banco
  const handleCadastro = async () => {
    // 1. Valida se preencheu tudo
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    // 2. Valida se as senhas são iguais
    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    setLoading(true);

    try {
      // 3. Envia para a sua API real (que vai salvar no MongoDB)
      await api.post('/api/cadastro', { 
        nome: nome, 
        email: email, 
        senha: senha 
      });

      // 4. Se deu tudo certo
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "OK", onPress: () => router.replace("/") } // Volta para o Login
      ]);

    } catch (error: any) {
      // 5. Se der erro (ex: e-mail já existe)
      console.error("Erro no cadastro:", error);
      if (error.response && error.response.data && error.response.data.erro) {
        Alert.alert("Erro", error.response.data.erro);
      } else {
        Alert.alert("Erro", "Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo + Nome (Seguindo sua referência) */}
      <View style={styles.containerLogo}>
        <Image
          style={styles.logo}
          source={require("../assets/images/react-logo.png")} // Lembre de trocar pela sua logo depois
        />
        <Text style={styles.titleRotuScan}>
          <Text style={{ color: "#2D7A5D" }}>Rotu</Text>
          <Text style={{ color: Colors.light.primary }}>Scan</Text>
        </Text>
      </View>

      <Text style={styles.title}>Crie sua conta</Text>

      {/* Campo Nome */}
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={nome}
        onChangeText={setNome}
      />

      {/* Campo Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seunome@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Campo Senha */}
      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Digite uma senha"
          secureTextEntry={!senhaVisivel}
          value={senha}
          onChangeText={setSenha}
        />
        <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
          <Ionicons
            name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      {/* Campo Confirmar Senha */}
      <Text style={styles.label}>Confirmar senha</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputFlex}
          placeholder="Repita a senha"
          secureTextEntry={!confirmarVisivel}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
        />
        <TouchableOpacity onPress={() => setConfirmarVisivel(!confirmarVisivel)}>
          <Ionicons
            name={confirmarVisivel ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#777"
          />
        </TouchableOpacity>
      </View>

      {/* Botão Criar Conta */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleCadastro}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>Criar conta</Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Já possui uma conta? </Text>
        <TouchableOpacity onPress={() => router.replace("/")}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
    justifyContent: "center",
  },
  containerLogo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
    resizeMode: "contain",
  },
  titleRotuScan: {
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    textAlign: "center",
    color: Colors.light.primary,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
  },
  label: {
    color: Colors.light.primary,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    backgroundColor: "#FFF",
    borderColor: "#E0E0E0",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
    elevation: 2, 
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#777",
  },
  loginText: {
    color: Colors.light.primary,
    fontWeight: "bold",
  },
});