import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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

import AppHeader from "../components/Header/AppHeader";
import TabBar from "@/components/TabBar/indexTab";
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
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [drawerVisible, setDrawerVisible] = useState(false);
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width - 32, 440);

  const [nome, setNome] = useState("Endrew");
  const [email, setEmail] = useState("endrew.bis...@email.com");
  const [intolerancias, setIntolerancias] = useState<string[]>([
    "Glúten",
    "Lactose",
  ]);
  const [totalAnalises, setTotalAnalises] = useState(45);
  const [totalSeguros, setTotalSeguros] = useState(45);

  useFocusEffect(
    useCallback(() => {
      const carregarDadosPerfil = async () => {
        try {
          const nomeSalvo = await AsyncStorage.getItem("@usuario_nome");
          const emailSalvo = await AsyncStorage.getItem("@usuario_email");
          if (nomeSalvo && nomeSalvo.trim()) setNome(nomeSalvo);
          if (emailSalvo && emailSalvo.trim()) setEmail(emailSalvo);

          const restricoesJson = await AsyncStorage.getItem("@usuario_restricoes");
          if (restricoesJson) {
            const parsed: string[] = JSON.parse(restricoesJson);
            if (parsed.length > 0) {
              setIntolerancias(
                parsed.map((item) => MAPA_NOMES[item.toLowerCase()] || item)
              );
            }
          }

          const userId = await AsyncStorage.getItem("@usuario_id");
          if (userId) {
            const res = await api.get(`/users/historico/${userId}`).catch(() => null);
            if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
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

  function abrirRota(path: string) {
    router.push(path as never);
  }

  function sairDaConta() {
    Alert.alert(
      "Sair da conta",
      "Deseja realmente sair da sua conta?",
      [
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
              "@usuario_restricoes",
              "@restricao_gluten",
              "@restricao_lactose",
              "@restricao_amendoim",
            ]);
            router.replace("/" as never);
          },
        },
      ]
    );
  }

  function handleMenuPress() {
    setDrawerVisible(true);
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  const inicialAvatar = nome.trim() ? nome.trim().charAt(0).toUpperCase() : "E";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.headerContainer}>
        <AppHeader onMenuPress={handleMenuPress} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { width: cardWidth },
        ]}
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
                onPress={() => abrirRota("/editar-perfil")}
                activeOpacity={0.8}
                accessibilityLabel="Editar perfil"
              >
                <Feather
                  name="edit-2"
                  size={11}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.memberBadge}>
              <View style={styles.memberDot} />
              <Text style={styles.memberText}>MEMBRO ATIVO</Text>
            </View>
          </View>

          <Text style={styles.userName}>{nome}</Text>

          <Text style={styles.userEmail}>
            {email}
          </Text>

          <View style={styles.profileDivider} />

          <View style={styles.profileFooter}>
            <Feather
              name="shield"
              size={13}
              color={COLORS.green}
            />
            <Text style={styles.profileDate}>
              Sua saúde em primeiro lugar
            </Text>
          </View>
        </View>

        {/* Intolerâncias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              SUAS INTOLERÂNCIAS ATIVAS
            </Text>

            <TouchableOpacity
              onPress={() => abrirRota("/selectIntolerancia")}
              activeOpacity={0.7}
            >
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsContainer}>
            {intolerancias.map((item) => (
              <View key={item} style={styles.intoleranceChip}>
                <Ionicons
                  name={
                    item === "Glúten"
                      ? "nutrition-outline"
                      : item === "Lactose"
                      ? "water-outline"
                      : "alert-circle-outline"
                  }
                  size={15}
                  color="#596A78"
                />

                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addChip}
              activeOpacity={0.7}
              onPress={() => abrirRota("/selectIntolerancia")}
              accessibilityLabel="Adicionar intolerância"
            >
              <Feather
                name="plus"
                size={18}
                color={COLORS.green}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progresso de saúde */}
        <View style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>
              PROGRESSO DE SAÚDE
            </Text>

            <Text style={styles.healthDays}>12 dias</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.healthDescription}>
            Você realizou{" "}
            <Text style={styles.healthBold}>
              {totalSeguros} escaneamentos seguros
            </Text>{" "}
            este mês. Continue assim!
          </Text>
        </View>

        {/* Opções da conta */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>
            OPÇÕES DA CONTA
          </Text>

          <View style={styles.optionsCard}>
            <Option
              icon="user"
              title="Dados pessoais e metas"
              subtitle="Editar nome, e-mail e senha"
              onPress={() => abrirRota("/editar-perfil")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="clock"
              title="Histórico de análises"
              subtitle={`${totalAnalises} produtos analisados`}
              onPress={() => abrirRota("/historico")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="bell"
              title="Alertas de contaminação"
              onPress={() => abrirRota("/selectIntolerancia")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="help-circle"
              title="Ajuda e perguntas frequentes"
              onPress={() => abrirRota("/configuracoes")}
            />
          </View>
        </View>

        {/* Sair da conta */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.75}
          onPress={sairDaConta}
        >
          <Feather
            name="log-out"
            size={16}
            color={COLORS.red}
          />

          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Navegação inferior */}
      <View style={styles.tabBarContainer}>
        <TabBar abaAtiva="perfil" />
      </View>
    </SafeAreaView>
  );
}

function Option({
  icon,
  title,
  subtitle,
  onPress,
}: OptionProps) {
  return (
    <TouchableOpacity
      style={styles.optionRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.optionIcon}>
        <Feather
          name={icon}
          size={18}
          color="#718092"
        />
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.optionSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Feather
        name="chevron-right"
        size={18}
        color="#91A3BA"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  headerContainer: {
    width: "100%",
    alignSelf: "center",
  },

  scrollView: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
    alignSelf: "center",
  },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: "center",
    shadowColor: "#223344",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  profileTop: {
    width: "100%",
    minHeight: 76,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#CFF8E3",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLetter: {
    fontFamily: "Geist_700Bold",
    fontSize: 23,
    color: COLORS.green,
  },

  editAvatar: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.greenBright,
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
    paddingVertical: 5,
  },

  memberDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#12B981",
    marginRight: 5,
  },

  memberText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 9,
    color: "#079568",
  },

  userName: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#101828",
    marginTop: 8,
  },

  userEmail: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  profileDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0F3F5",
    marginTop: 16,
    marginBottom: 12,
  },

  profileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  profileDate: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    color: "#64748B",
  },

  section: {
    marginTop: 22,
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
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },

  chipText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#344054",
  },

  addChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingHorizontal: 15,
    paddingVertical: 16,
    marginTop: 18,
  },

  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
    height: 7,
    borderRadius: 5,
    backgroundColor: "#D5E2D9",
    overflow: "hidden",
    marginBottom: 12,
  },

  progressFill: {
    width: "75%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#176B43",
  },

  healthDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: "#40594A",
  },

  healthBold: {
    fontFamily: "Geist_700Bold",
  },

  optionsSection: {
    marginTop: 22,
  },

  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: "hidden",
  },

  optionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    fontSize: 13,
    color: "#263449",
  },

  optionSubtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },

  optionDivider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginLeft: 50,
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
    paddingHorizontal: 12,
  },

  logoutText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: COLORS.red,
  },

  bottomSpace: {
    height: 12,
  },

  tabBarContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
  },
});
