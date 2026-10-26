import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../services/api";

const COLORS = {
  background: "#F5F7FA",
  white: "#FFFFFF",
  green: "#087443",
  greenBright: "#20C875",
  greenLight: "#EAF5EE",
  text: "#17251D",
  textSecondary: "#7B8790",
  border: "#E8EDF0",
  muted: "#F0F4F7",
  red: "#EF4444",
  redLight: "#FFF1F1",
};

type OptionProps = {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  subtitle?: string;
  onPress: () => void;
};

const MAPA_NOMES: Record<string, string> = {
  gluten: "Glúten",
  lactose: "Lactose",
  amendoim: "Amendoim",
};

export default function PerfilScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 32, 440);

  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  // Estados dinâmicos integrados ao AsyncStorage e à API
  const [nome, setNome] = useState("Usuário");
  const [email, setEmail] = useState("usuario@email.com");
  const [intolerancias, setIntolerancias] = useState<string[]>([]);
  const [totalAnalises, setTotalAnalises] = useState(0);
  const [totalSeguros, setTotalSeguros] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const carregarDadosPerfil = async () => {
        try {
          const nomeSalvo = await AsyncStorage.getItem("@usuario_nome");
          const emailSalvo = await AsyncStorage.getItem("@usuario_email");
          if (nomeSalvo) setNome(nomeSalvo);
          if (emailSalvo) setEmail(emailSalvo);

          // 1. Tenta carregar o array JSON salvo pela tela selectIntolerancia.tsx
          const restricoesJson = await AsyncStorage.getItem("@usuario_restricoes");
          let listaAtiva: string[] = [];

          if (restricoesJson) {
            const parsed: string[] = JSON.parse(restricoesJson);
            listaAtiva = parsed.map((item) => MAPA_NOMES[item.toLowerCase()] || item);
          } else {
            // 2. Fallback compatível com o formato antigo (@restricao_key)
            const keys = ["gluten", "lactose", "amendoim"];
            for (const key of keys) {
              const val = await AsyncStorage.getItem(`@restricao_${key}`);
              if (val === "true") {
                listaAtiva.push(MAPA_NOMES[key]);
              }
            }
          }
          setIntolerancias(listaAtiva);

          // 3. Busca contagem real de escaneamentos no Back-end (se conectado)
          const userId = await AsyncStorage.getItem("@usuario_id");
          if (userId) {
            const res = await api.get(`/users/historico/${userId}`).catch(() => null);
            if (res?.data && Array.isArray(res.data)) {
              setTotalAnalises(res.data.length);
              const seguros = res.data.filter(
                (log: any) => log.veredito === "SEGURO"
              ).length;
              setTotalSeguros(seguros);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        }
      };

      carregarDadosPerfil();
    }, [])
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  function abrirRota(path: string) {
    router.push(path as never);
  }

  function sairDaConta() {
    Alert.alert("Sair da conta", "Deseja realmente sair do RotuScan?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "@rotuscan_token",
            "@usuario_id",
            "@usuario_nome",
            "@usuario_email",
          ]);
          router.replace("/" as never);
        },
      },
    ]);
  }

  const inicialAvatar = nome.trim() ? nome.trim().charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Cabeçalho */}
      <View style={[styles.header, { width: cardWidth }]}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <Feather name="arrow-left" size={21} color="#59636D" />
        </TouchableOpacity>

        <View style={styles.logo}>
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          activeOpacity={0.7}
          onPress={() => abrirRota("/historico")}
          accessibilityLabel="Histórico"
        >
          <Ionicons name="notifications-outline" size={17} color="#697580" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { width: cardWidth }]}
      >
        {/* Cartão do perfil */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{inicialAvatar}</Text>
              </View>

              <TouchableOpacity
                style={styles.editAvatar}
                onPress={() => abrirRota("/selectIntolerancia")}
                activeOpacity={0.8}
                accessibilityLabel="Editar perfil"
              >
                <Feather name="edit-2" size={10} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.memberBadge}>
              <View style={styles.memberDot} />
              <Text style={styles.memberText}>MEMBRO ATIVO</Text>
            </View>
          </View>

          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          <View style={styles.profileDivider} />

          <View style={styles.profileFooter}>
            <Feather name="shield" size={11} color={COLORS.greenBright} />
            <Text style={styles.profileDate}>
              Proteção ativa contra alérgenos
            </Text>
          </View>
        </View>

        {/* Intolerâncias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              SUAS INTOLERÂNCIAS ATIVAS ({intolerancias.length})
            </Text>

            <TouchableOpacity
              onPress={() => abrirRota("/selectIntolerancia")}
              activeOpacity={0.7}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsContainer}>
            {intolerancias.length > 0 ? (
              intolerancias.map((item) => (
                <View key={item} style={styles.intoleranceChip}>
                  <Ionicons
                    name={
                      item === "Glúten"
                        ? "nutrition-outline"
                        : item === "Lactose"
                        ? "water-outline"
                        : "alert-circle-outline"
                    }
                    size={14}
                    color="#596A78"
                  />
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyChipText}>
                Nenhuma restrição selecionada
              </Text>
            )}

            <TouchableOpacity
              style={styles.addChip}
              activeOpacity={0.7}
              onPress={() => abrirRota("/selectIntolerancia")}
              accessibilityLabel="Adicionar intolerância"
            >
              <Feather name="plus" size={18} color={COLORS.green} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progresso de saúde */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>PROGRESSO DE SAÚDE</Text>
            <Text style={styles.healthDays}>{totalAnalises} Scans</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.healthDescription}>
            Você realizou{" "}
            <Text style={styles.healthBold}>
              {totalSeguros} escaneamentos seguros
            </Text>{" "}
            registrados no seu histórico. Continue assim!
          </Text>
        </View>

        {/* Opções da conta */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>OPÇÕES DA CONTA</Text>

          <View style={styles.optionsCard}>
            <Option
              icon="Sliders"
              title="Minhas Intolerâncias & Sensibilidade"
              subtitle={`${intolerancias.length} restrições configuradas`}
              onPress={() => abrirRota("/selectIntolerancia")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="clock"
              title="Histórico de Análises"
              subtitle={`${totalAnalises} produtos analisados`}
              onPress={() => abrirRota("/historico")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="heart"
              title="Meus Itens Curtidos"
              subtitle="Produtos salvos como favoritos"
              onPress={() => abrirRota("/itensCurtidos")}
            />
          </View>
        </View>

        {/* Sair da conta */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.75}
          onPress={sairDaConta}
        >
          <Feather name="log-out" size={14} color={COLORS.red} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Option({ icon, title, subtitle, onPress }: OptionProps) {
  return (
    <TouchableOpacity
      style={styles.optionRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <Feather name={icon} size={16} color="#718092" />
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Feather name="chevron-right" size={16} color="#91A3BA" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: COLORS.green,
    letterSpacing: -0.6,
  },
  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#F59E0B",
    letterSpacing: -0.4,
  },
  notificationButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDF0F3",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#20C875",
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
    alignSelf: "center",
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    alignItems: "center",
    shadowColor: "#223344",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTop: {
    width: "100%",
    minHeight: 70,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#CFF8E3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontFamily: "Geist_700Bold",
    fontSize: 22,
    color: COLORS.green,
  },
  editAvatar: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#00A866",
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  memberBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7FFF4",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#12B981",
    marginRight: 4,
  },
  memberText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 10,
    color: "#079568",
  },
  userName: {
    fontFamily: "Geist_700Bold",
    fontSize: 18,
    color: "#101828",
    marginTop: 8,
  },
  userEmail: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  profileDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0F3F5",
    marginTop: 12,
    marginBottom: 10,
  },
  profileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  profileDate: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#64748B",
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.3,
    color: "#607087",
  },
  editText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#00A866",
  },
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  intoleranceChip: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },
  chipText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#344054",
  },
  emptyChipText: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#94A3B8",
  },
  addChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E3EAE6",
    alignItems: "center",
    justifyContent: "center",
  },
  healthCard: {
    backgroundColor: "#EAF4EE",
    borderWidth: 1,
    borderColor: "#E0EDE4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  healthTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 12,
    color: COLORS.green,
    letterSpacing: 0.3,
  },
  healthDays: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: COLORS.green,
  },
  progressBackground: {
    width: "100%",
    height: 6,
    borderRadius: 6,
    backgroundColor: "#D5E2D9",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    width: "75%",
    height: "100%",
    borderRadius: 6,
    backgroundColor: "#176B43",
  },
  healthDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    lineHeight: 18,
    color: "#40594A",
  },
  healthBold: {
    fontFamily: "Geist_700Bold",
  },
  optionsSection: {
    marginTop: 20,
  },
  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
  },
  optionRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
    justifyContent: "center",
  },
  optionTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14,
    color: "#263449",
  },
  optionSubtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginLeft: 46,
  },
  logoutButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: "#FDE2E2",
    borderRadius: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14,
    color: COLORS.red,
  },
  bottomSpace: {
    height: 20,
  },
});