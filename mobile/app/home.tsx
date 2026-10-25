
import React, { useState } from "react";

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import TabBar from "../components/TabBar/indexTab";

import DrawerMenu from "@/components/Drawer/DrawerMenu";

type StatusProduto = "seguro" | "risco";

type ItemCurtido = {
  id: string;
  nome: string;
  status: StatusProduto;
  imagem?: string;
};

type ItemEscaneado = {
  id: string;
  nome: string;
  detalhe: string;
  status: StatusProduto;
  imagem?: string;
};

const ITENS_CURTIDOS: ItemCurtido[] = [
  {
    id: "1",
    nome: "Leite Silk",
    status: "seguro",
  },
  {
    id: "2",
    nome: "Quinoa Real",
    status: "seguro",
  },
  {
    id: "3",
    nome: "Quinoa Real",
    status: "seguro",
  },
];

const ITENS_ESCANEADOS: ItemEscaneado[] = [
  {
    id: "1",
    nome: "Leite de Amêndoas Silk",
    detalhe: "100% Seguro",
    status: "seguro",
  },
  {
    id: "2",
    nome: "Chocolate Branco",
    detalhe: "Contém Lactose",
    status: "risco",
    imagem:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200",
  },
];

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  // Estado responsável por abrir e fechar o Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);

  const nomeUsuario = "Endrew";
  const diasProgresso = 12;
  const escaneamentosSeguros = 45;

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setDrawerVisible(true)}
          accessibilityLabel="Abrir menu"
          accessibilityRole="button"
          style={styles.menuButton}
        >
          <Feather name="menu" size={24} color="#191C1D" />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <Image
          source={require("../images/user.png")}
          style={styles.avatarImage}
        />
      </View>

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SAUDAÇÃO */}
        <Text style={styles.greeting}>Olá {nomeUsuario}!</Text>

        {/* INTOLERÂNCIAS */}
        <Text style={styles.sectionLabel}>Suas intolerâncias</Text>

        <View style={styles.intoleranciasRow}>
          <View style={styles.intolerancia}>
            <Image
              style={styles.iconIntoleranciaGluten}
              source={require("../images/iconGluInt.png")}
            />
            <Text style={styles.intoleranciaText}>Glúten</Text>
          </View>

          <View style={styles.intolerancia}>
            <Image
              style={styles.iconIntolerancia}
              source={require("../images/iconLacInt.png")}
            />
            <Text style={styles.intoleranciaText}>Lactose</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addChipButton}
            onPress={() => router.push("../intolerancias")}
            accessibilityLabel="Adicionar intolerância"
            accessibilityRole="button"
          >
            <Feather name="plus" size={16} color="#006D37" />
          </TouchableOpacity>
        </View>

        {/* PROGRESSO DE SAÚDE */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>PROGRESSO DE SAÚDE</Text>
            <Text style={styles.progressDias}>{diasProgresso} Dias</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: "75%" }]} />
          </View>

          <Text style={styles.progressDescription}>
            Você realizou{" "}
            <Text style={styles.boldText}>
              {escaneamentosSeguros} escaneamentos seguros
            </Text>{" "}
            este mês. Continue assim!
          </Text>
        </View>

        {/* BOTÃO ESCANEAR PRODUTO */}
        <View style={styles.scanCardBorder}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.scanCardInner}
            onPress={() => router.push("../scanner")}
          >
            <View style={styles.scanIconBox}>
              <MaterialCommunityIcons
                name="barcode-scan"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.scanTextBox}>
              <Text style={styles.scanTitle}>Escanear Produto</Text>
              <Text style={styles.scanSubtitle}>
                Análise de ingredientes{"\n"}instantânea
              </Text>
            </View>

            <Feather name="chevron-right" size={20} color="#737D87" />
          </TouchableOpacity>
        </View>

        {/* ITENS CURTIDOS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Itens Curtidos</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityLabel="Ver todos os itens curtidos"
          >
            <Feather name="chevron-right" size={18} color="#191C1D" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          style={styles.curtidosScroll}
          contentContainerStyle={styles.curtidosRow}
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
          bounces={false}
          alwaysBounceHorizontal={false}
        >
          {ITENS_CURTIDOS.map((item) => (
            <View key={item.id} style={styles.curtidoCard}>
              <View style={styles.curtidoImageBox}>
                {item.imagem ? (
                  <Image
                    source={{ uri: item.imagem }}
                    style={styles.curtidoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather
                    name="package"
                    size={25}
                    color="#AAB2B8"
                  />
                )}

                <View style={styles.heartIcon}>
                  <Ionicons
                    name="heart"
                    size={12}
                    color="#DC2626"
                  />
                </View>
              </View>

              <Text style={styles.curtidoNome} numberOfLines={2}>
                {item.nome}
              </Text>

              <Text
                style={[
                  styles.statusSimpleText,
                  {
                    color:
                      item.status === "seguro" ? "#15803D" : "#DC2626",
                  },
                ]}
              >
                {item.status === "seguro" ? "Seguro" : "Risco"}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* RECÉM ESCANEADOS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            Recém Escaneados
          </Text>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.historicoLink}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {ITENS_ESCANEADOS.map((item) => {
          const isSeguro = item.status === "seguro";

          return (
            <View key={item.id} style={styles.escaneadoRow}>
              {item.imagem ? (
                <Image
                  source={{ uri: item.imagem }}
                  style={styles.escaneadoImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.escaneadoImagePlaceholder}>
                  <Feather
                    name="package"
                    size={20}
                    color="#AAB2B8"
                  />
                </View>
              )}

              <View style={styles.escaneadoInfo}>
                <Text style={styles.escaneadoNome}>
                  {item.nome}
                </Text>

                <View style={styles.escaneadoDetalheRow}>
                  {isSeguro ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color="#16A34A"
                      style={{ marginRight: 4 }}
                    />
                  ) : (
                    <Ionicons
                      name="warning"
                      size={13}
                      color="#DC2626"
                      style={{ marginRight: 4 }}
                    />
                  )}

                  <Text
                    style={[
                      styles.escaneadoDetalhe,
                      {
                        color: isSeguro ? "#16A34A" : "#DC2626",
                      },
                    ]}
                  >
                    {item.detalhe}
                  </Text>
                </View>
                
              </View>

              <StatusBadge status={item.status} />
            </View>
          );
        })}
      </ScrollView>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <TabBar abaAtiva="inicio" />

      {/* DRAWER MENU */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

function StatusBadge({ status }: { status: StatusProduto }) {
  const isSeguro = status === "seguro";

  return (
    <View
      style={[
        styles.statusBadge,
        isSeguro ? styles.statusBadgeSeguro : styles.statusBadgeRisco,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          isSeguro
            ? styles.statusBadgeTextSeguro
            : styles.statusBadgeTextRisco,
        ]}
      >
        {isSeguro ? "Seguro" : "Risco"}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  menuButton: {
    width: 36,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#006D37",
    letterSpacing: -0.5,
  },

  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#F59E0B",
    letterSpacing: -0.3,
  },

  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  greeting: {
    fontFamily: "Geist_700Bold",
    fontSize: 22,
    color: "#111827",
    marginBottom: 16,
  },

  sectionLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 10,
  },

  intoleranciasRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  intolerancia: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    gap: 6,
  },

  iconIntolerancia: {
    width: 7,
    height: 13,
  },

  iconIntoleranciaGluten: {
    width: 16,
    height: 16,
  },

  intoleranciaText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#1F2937",
  },

  addChipButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  // PROGRESSO DE SAÚDE
  progressCard: {
    width: "100%",
    backgroundColor: "#EBF1F0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  progressTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    color: "#006D37",
  },

  progressDias: {
    fontFamily: "Geist_700Bold",
    fontSize: 15,
    color: "#006D37",
  },

  progressBarBackground: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
    overflow: "hidden",
  },

  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#15803D",
  },

  progressDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "#4B5563",
  },

  boldText: {
    fontFamily: "Geist_700Bold",
    color: "#111827",
  },

  // ESCANEAR PRODUTO
  scanCardBorder: {
    width: "100%",
    borderRadius: 24,
    padding: 3,
    backgroundColor: "#22C55E",
    marginBottom: 24,
  },

  scanCardInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  scanIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#15803D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  scanTextBox: {
    flex: 1,
  },

  scanTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 15,
    color: "#111827",
    marginBottom: 2,
  },

  scanSubtitle: {
    fontFamily: "Geist_400Regular",
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 14,
  },

  // SEÇÕES
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionHeaderTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 16,
    color: "#111827",
    marginBottom: 29,
  },

  historicoLink: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    color: "#15803D",
  },

  // ITENS CURTIDOS
  curtidosScroll: {
    width: "100%",
    flexGrow: 0,
    flexShrink: 0,
  },

  curtidosRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 12,
    paddingBottom: 4,
  },

  curtidoCard: {
    width: 82,
    flexShrink: 0,
    marginRight: 10,
  },

  curtidoImageBox: {
    width: 82,
    height: 82,
    borderRadius: 9,
    backgroundColor: "#F3F4F6",
    marginBottom: 5,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  curtidoImage: {
    width: "100%",
    height: "100%",
  },

  heartIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  curtidoNome: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 9,
    lineHeight: 12,
    color: "#111827",
  },

  statusSimpleText: {
    fontFamily: "Geist_400Regular",
    fontSize: 9,
    marginTop: 2,
  },

  // RECÉM ESCANEADOS
  escaneadoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 10,
    marginBottom: 10,
  },

  escaneadoImage: {
    width: 46,
    height: 46,
    borderRadius: 12,
    marginRight: 12,
  },

  escaneadoImagePlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  escaneadoInfo: {
    flex: 1,
  },

  escaneadoNome: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#111827",
  },

  escaneadoDetalheRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  escaneadoDetalhe: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 11,
  },

  // STATUS BADGE
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  statusBadgeSeguro: {
    backgroundColor: "#DCFCE7",
  },

  statusBadgeRisco: {
    backgroundColor: "#FEE2E2",
  },

  statusBadgeText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 11,
  },

  statusBadgeTextSeguro: {
    color: "#15803D",
  },

  statusBadgeTextRisco: {
    color: "#DC2626",
  },

  // DICA DO DIA
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    gap: 12,
  },

  tipIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 10,
    color: "#15803D",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  tipText: {
    fontFamily: "Geist_400Regular",
    fontSize: 11,
    lineHeight: 15,
    color: "#374151",
  },
});
