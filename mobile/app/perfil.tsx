
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import AppHeader from "../components/Header/AppHeader";
import TabBar from "@/components/TabBar/indexTab";

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

export default function PerfilScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width - 32, 440);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.green} />
      </View>
    );
  }

  const intolerancias = ["Glúten", "Lactose"];

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
          onPress: () => {
            // Adicione aqui a limpeza da sessão de autenticação.
            router.replace("../login" as never);
          },
        },
      ]
    );
  }
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setDrawerVisible(true);
    //onMenuPress?.();
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

          <AppHeader onMenuPress={() => setDrawerVisible(true)} />

      <ScrollView
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
                <Text style={styles.avatarLetter}>E</Text>
              </View>

              <TouchableOpacity
                style={styles.editAvatar}
                onPress={() => abrirRota("../dados-pessoais")}
                activeOpacity={0.8}
                accessibilityLabel="Editar perfil"
              >
                <Feather
                  name="edit-2"
                  size={10}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.memberBadge}>
              <View style={styles.memberDot} />
              <Text style={styles.memberText}>MEMBRO ATIVO</Text>
            </View>
          </View>

          <Text style={styles.userName}>Endrew</Text>

          <Text style={styles.userEmail}>
            endrew.bis...@email.com
          </Text>

          <View style={styles.profileDivider} />

        
        </View>

        {/* Intolerâncias */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              SUAS INTOLERÂNCIAS ATIVAS
            </Text>

            <TouchableOpacity
              onPress={() => abrirRota("../intolerancias")}
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
                      : "water-outline"
                  }
                  size={12}
                  color="#596A78"
                />

                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addChip}
              activeOpacity={0.7}
              onPress={() => abrirRota("../intolerancias")}
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

            <Text style={styles.healthDays}>12 Dias</Text>
          </View>

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.healthDescription}>
            Você realizou{" "}
            <Text style={styles.healthBold}>
              45 escaneamentos seguros
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
              title="Dados Pessoais & Metas"
              onPress={() => abrirRota("../dados-pessoais")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="clock"
              title="Histórico de Análises"
              subtitle="45 produtos analisados"
              onPress={() => abrirRota("../historico")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="bell"
              title="Alertas de Contaminação"
              onPress={() => abrirRota("../alertas")}
            />

            <View style={styles.optionDivider} />

            <Option
              icon="help-circle"
              title="Ajuda e Perguntas Frequentes"
              onPress={() => abrirRota("../ajuda")}
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
            size={12}
            color={COLORS.red}
          />

          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
  
        
      </ScrollView>
        <TabBar abaAtiva="historico" />
          </SafeAreaView>
          
  );
  
}


//Dados Usuarios
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
          size={15}
          color="#718092"
        />
      </View>

      <View style={styles.optionContent}>
        <Text style={styles.optionTitle}>{title}</Text>

        {subtitle ? (
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Feather
        name="chevron-right"
        size={15}
        color="#91A3BA"
      />
      
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


  notificationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDF0F3",
  },

  notificationDot: {
    position: "absolute",
    top: 5,
    right: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#A5B4FC",
  },

  scrollContent: {
    paddingTop: 5,
    paddingHorizontal: 0,
    paddingBottom: 10,
    alignSelf: "center",
  },

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: "center",
    shadowColor: "#223344",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.025,
    shadowRadius: 5,
    elevation: 1,
  },

  profileTop: {
    width: "100%",
    minHeight: 65,
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
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "#CFF8E3",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLetter: {
    fontFamily: "Geist_700Bold",
    fontSize: 17,
    color: COLORS.green,
  },

  editAvatar: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: "#00A866",
    borderWidth: 1.5,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  memberBadge: {
    position: "absolute",
    top: -1,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7FFF4",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  memberDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#12B981",
    marginRight: 3,
  },

  memberText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 6.5,
    color: "#079568",
  },

  userName: {
    fontFamily: "Geist_700Bold",
    fontSize: 14,
    color: "#101828",
    marginTop: 5,
  },

  userEmail: {
    fontFamily: "Geist_400Regular",
    fontSize: 7.5,
    color: "#64748B",
    marginTop: 2,
  },

  profileDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0F3F5",
    marginTop: 10,
    marginBottom: 8,
  },

  profileFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  profileDate: {
    fontFamily: "Geist_400Regular",
    fontSize: 7.5,
    color: "#64748B",
  },

  section: {
    marginTop: 19,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 8,
    letterSpacing: 0.25,
    color: "#607087",
  },

  editText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 8,
    color: "#00A866",
  },

  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  intoleranceChip: {
    minHeight: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EEF1F4",
  },

  chipText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 8,
    color: "#344054",
  },

  addChip: {
    width: 27,
    height: 27,
    borderRadius: 14,
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
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 12,
    marginTop: 13,
  },

  healthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  healthTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 7.5,
    color: COLORS.green,
    letterSpacing: 0.3,
  },

  healthDays: {
    fontFamily: "Geist_700Bold",
    fontSize: 8,
    color: COLORS.green,
  },

  progressBackground: {
    width: "100%",
    height: 5,
    borderRadius: 5,
    backgroundColor: "#D5E2D9",
    overflow: "hidden",
    marginBottom: 9,
  },

  progressFill: {
    width: "75%",
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#176B43",
  },

  healthDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 7.5,
    lineHeight: 11,
    color: "#40594A",
  },

  healthBold: {
    fontFamily: "Geist_700Bold",
  },

  optionsSection: {
    marginTop: 17,
  },

  optionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 2,
    overflow: "hidden",
  },

  optionRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },

  optionIcon: {
    width: 25,
    height: 25,
    borderRadius: 7,
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
    fontSize: 8.5,
    color: "#263449",
  },

  optionSubtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 7,
    color: "#94A3B8",
    marginTop: 2,
  },

  optionDivider: {
    height: 1,
    backgroundColor: "#F0F2F5",
    marginLeft: 33,
  },

  logoutButton: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.redLight,
    borderWidth: 1,
    borderColor: "#FDE2E2",
    borderRadius: 10,
    marginTop: 9,
    paddingHorizontal: 12,
  },

  logoutText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 8,
    color: COLORS.red,
  },

  bottomSpace: {
    height: 8,
  },
});
