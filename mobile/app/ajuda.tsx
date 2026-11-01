import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";

import AppHeader from "../components/Header/AppHeader";
import TabBar from "../components/TabBar/indexTab";

const PERGUNTAS_FREQUENTES = [
  {
    pergunta: "Como tirar uma boa foto do rótulo?",
    resposta:
      "Aproxime a câmera da lista de ingredientes em um local bem iluminado, evitando reflexos de luz sobre a embalagem plástica ou metálica.",
  },
  {
    pergunta: "O que significa a barra de Nível de Sensibilidade?",
    resposta:
      "No nível Leve, o RotuScan ignora avisos de 'Pode conter traços' para aquele alérgeno. Nos níveis Moderado e Grave, qualquer risco de contaminação cruzada gera alerta vermelho.",
  },
  {
    pergunta: "O que acontece quando o resultado dá Inconclusivo?",
    resposta:
      "Por segurança alimentar, se a foto estiver borrada ou com menos de 40 caracteres legíveis, o RotuScan nunca dirá que o produto é seguro. Ele exibirá um alerta âmbar pedindo uma nova foto.",
  },
  {
    pergunta: "Posso renomear um produto escaneado?",
    resposta:
      "Sim! Na tela de Resultado Detalhado, basta tocar sobre o nome automático do produto para digitar o nome comercial e a marca/peso.",
  },
];

export default function AjudaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [mensagemDuvida, setMensagemDuvida] = useState("");
  const [enviadoFeedback, setEnviadoFeedback] = useState(false);

  if (!fontsLoaded) return null;

  const cardWidth = Math.min(width - 36, 440);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { width: cardWidth }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={20} color="#087443" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Ajuda e Perguntas Frequentes</Text>
            <Text style={styles.pageSubtitle}>
              Tire suas dúvidas sobre o uso do RotuScan
            </Text>
          </View>
        </View>

        {/* Caixinha de texto placeholder provisória solicitada */}
        <View style={styles.boxCard}>
          <Text style={styles.boxLabel}>Envie sua dúvida ou sugestão</Text>
          <TextInput
            value={mensagemDuvida}
            onChangeText={(t) => {
              setMensagemDuvida(t);
              if (enviadoFeedback) setEnviadoFeedback(false);
            }}
            placeholder="Digite sua dúvida sobre leitura de rótulos ou funcionamento do app..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
          {enviadoFeedback ? (
            <View style={styles.feedbackRow}>
              <Ionicons name="checkmark-circle" size={16} color="#15803D" />
              <Text style={styles.feedbackText}>
                Sua mensagem foi registrada! Em breve nossa equipe responderá.
              </Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.sendBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (mensagemDuvida.trim()) {
                setMensagemDuvida("");
                setEnviadoFeedback(true);
              }
            }}
          >
            <Text style={styles.sendBtnText}>Enviar Mensagem</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>PERGUNTAS FREQUENTES (FAQ)</Text>

        {PERGUNTAS_FREQUENTES.map((item, idx) => (
          <View key={idx} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons
                name="help-circle-outline"
                size={18}
                color="#006D37"
              />
              <Text style={styles.faqQuestion}>{item.pergunta}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.resposta}</Text>
          </View>
        ))}
      </ScrollView>

      <TabBar abaAtiva="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  scrollContent: {
    alignSelf: "center",
    paddingTop: 16,
    paddingBottom: 34,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 19,
    color: "#101828",
  },
  pageSubtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  boxCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8EDF0",
    marginBottom: 20,
  },
  boxLabel: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#334155",
    marginBottom: 8,
  },
  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#1E293B",
    textAlignVertical: "top",
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  feedbackText: {
    flex: 1,
    fontFamily: "Geist_500Medium",
    fontSize: 12,
    color: "#15803D",
  },
  sendBtn: {
    backgroundColor: "#087443",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  sendBtnText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13.5,
    color: "#FFFFFF",
  },
  sectionHeader: {
    fontFamily: "Geist_700Bold",
    fontSize: 12,
    letterSpacing: 0.4,
    color: "#607087",
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E8EDF0",
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: "Geist_700Bold",
    fontSize: 13.5,
    color: "#1E293B",
  },
  faqAnswer: {
    fontFamily: "Geist_400Regular",
    fontSize: 12.5,
    lineHeight: 18,
    color: "#475569",
  },
});

