import React, { useState, useCallback } from "react";
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TabBar from "../components/TabBar/indexTab";
import AppHeader from "../components/Header/AppHeader";
import ScanThumb from "../components/ScanThumb";
import api, { extrairMensagemErro } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatarResumoAlergicos, obterDicaDoDia } from "../utils/datas";

type ItemHistoricoAPI = {
  id: string;
  nomeProduto: string;
  nomeAutomatico?: boolean;
  marcaPeso?: string | null;
  veredito: "SEGURO" | "PERIGOSO";
  alergicosDetectados?: {
    categoria: string;
    tipo: "CONTEM" | "TRACOS";
    termos?: string[];
  }[];
  curtido: boolean;
  imagemUrl?: string | null;
  imagemDemo?: string | null;
  createdAt?: string;
};

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const { salvarSessaoUsuario } = useAuth();

  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [restricoesAtivas, setRestricoesAtivas] = useState<string[]>([]);
  const [diasConsecutivos, setDiasConsecutivos] = useState(0);
  const [escaneamentosSegurosMes, setEscaneamentosSegurosMes] = useState(0);
  const [metaMensal, setMetaMensal] = useState(50);

  const [itensCurtidos, setItensCurtidos] = useState<ItemHistoricoAPI[]>([]);
  const [recemEscaneados, setRecemEscaneados] = useState<ItemHistoricoAPI[]>(
    []
  );

  const [refreshing, setRefreshing] = useState(false);
  const [erroInline, setErroInline] = useState<string | null>(null);

  const dicaDoDia = obterDicaDoDia();

  const carregarTudo = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      setErroInline(null);

      try {
        // Hidrata cache local primeiro para resposta visual imediata
        const [nomeSalvo, restricoesJson] = await Promise.all([
          AsyncStorage.getItem("@usuario_nome"),
          AsyncStorage.getItem("@usuario_restricoes"),
        ]);

        if (nomeSalvo && nomeSalvo.trim()) {
          setNomeUsuario(nomeSalvo.trim().split(" ")[0]);
        }
        if (restricoesJson) {
          const parsed: string[] = JSON.parse(restricoesJson);
          setRestricoesAtivas(parsed.map((r) => r.toLowerCase()));
        }

        // Busca dados reais do MongoDB em paralelo
        const [resPerfil, resCurtidos, resRecentes] = await Promise.all([
          api.get("/users/perfil"),
          api.get("/users/historico?curtido=true&limit=10"),
          api.get("/users/historico?limit=5"),
        ]);

        const u = resPerfil.data?.usuario || resPerfil.data;
        const st = resPerfil.data?.stats || {};

        if (u?.nome) {
          setNomeUsuario(String(u.nome).trim().split(" ")[0]);
        }
        if (Array.isArray(u?.restricoes)) {
          setRestricoesAtivas(
            u.restricoes.map((r: string) => r.toLowerCase())
          );
        }

        setDiasConsecutivos(Number(st.diasConsecutivos || 0));
        setEscaneamentosSegurosMes(Number(st.escaneamentosSegurosMes || 0));
        setMetaMensal(Number(st.metaMensal || 50));

        setItensCurtidos(
          Array.isArray(resCurtidos.data?.itens) ? resCurtidos.data.itens : []
        );
        setRecemEscaneados(
          Array.isArray(resRecentes.data?.itens) ? resRecentes.data.itens : []
        );

        if (u?.id || u?._id) {
          await salvarSessaoUsuario(null, {
            id: String(u.id || u._id),
            nome: u.nome || "",
            email: u.email || "",
            avatar: u.avatar || null,
            restricoes: u.restricoes || [],
            niveisSensibilidade: u.niveisSensibilidade || {
              gluten: 1,
              lactose: 1,
              amendoim: 1,
            },
          });
        }
      } catch (error: any) {
        setErroInline(extrairMensagemErro(error));
      } finally {
        setRefreshing(false);
      }
    },
    [salvarSessaoUsuario]
  );

  useFocusEffect(
    useCallback(() => {
      carregarTudo(false);
    }, [carregarTudo])
  );

  const abrirResultado = (id: string) => {
    router.push({
      pathname: "/resultado" as any,
      params: { id },
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const porcentagemMeta = Math.min(
    100,
    Math.round((escaneamentosSegurosMes / Math.max(1, metaMensal)) * 100)
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      <AppHeader />

      {/* CONTEÚDO PRINCIPAL */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => carregarTudo(true)}
            colors={["#006D37"]}
            tintColor="#006D37"
          />
        }
      >
        {erroInline ? (
          <View style={styles.erroBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.erroBannerText}>{erroInline}</Text>
          </View>
        ) : null}

        {/* SAUDAÇÃO */}
        <Text style={styles.greeting}>Olá {nomeUsuario}!</Text>

        {/* INTOLERÂNCIAS */}
        <Text style={styles.sectionLabel}>Suas intolerâncias</Text>

        <View style={styles.intoleranciasRow}>
          {restricoesAtivas.includes("gluten") && (
            <View style={styles.intolerancia}>
              <Image
                style={styles.iconIntoleranciaGluten}
                source={require("../assets/images/iconGluInt.png")}
              />
              <Text style={styles.intoleranciaText}>Glúten</Text>
            </View>
          )}

          {restricoesAtivas.includes("lactose") && (
            <View style={styles.intolerancia}>
              <Image
                style={styles.iconIntolerancia}
                source={require("../assets/images/iconLacInt.png")}
              />
              <Text style={styles.intoleranciaText}>Lactose</Text>
            </View>
          )}

          {restricoesAtivas.includes("amendoim") && (
            <View style={styles.intolerancia}>
              <Image
                style={styles.iconIntoleranciaGluten}
                source={require("../assets/images/iconAmendoim.png")}
              />
              <Text style={styles.intoleranciaText}>Amendoim</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addChipButton}
            onPress={() => router.push("/editar-perfil" as never)}
            accessibilityLabel="Editar intolerâncias"
            accessibilityRole="button"
          >
            <Feather name="plus" size={16} color="#006D37" />
          </TouchableOpacity>
        </View>

        {/* PROGRESSO DE SAÚDE */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>PROGRESSO DE SAÚDE</Text>
            <Text style={styles.progressDias}>
              {diasConsecutivos} {diasConsecutivos === 1 ? "Dia" : "Dias"}
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${porcentagemMeta}%` },
              ]}
            />
          </View>

          {escaneamentosSegurosMes > 0 ? (
            <Text style={styles.progressDescription}>
              Você realizou{" "}
              <Text style={styles.boldText}>
                {escaneamentosSegurosMes} escaneamentos seguros
              </Text>{" "}
              este mês. Continue assim!
            </Text>
          ) : (
            <Text style={styles.progressDescription}>
              Você ainda não realizou escaneamentos seguros este mês.{" "}
              <Text style={styles.boldText}>
                Escaneie seu primeiro rótulo agora!
              </Text>
            </Text>
          )}
        </View>

        {/* BOTÃO ESCANEAR PRODUTO */}
        <View style={styles.scanCardBorder}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.scanCardInner}
            onPress={() => router.push("/scanner" as never)}
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
            onPress={() => router.push("/itensCurtidos" as never)}
            accessibilityLabel="Ver todos os itens curtidos"
          >
            <Feather name="chevron-right" size={18} color="#191C1D" />
          </TouchableOpacity>
        </View>

        {itensCurtidos.length > 0 ? (
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
            {itensCurtidos.map((item) => {
              const isSeguro = item.veredito === "SEGURO";
              const catPrincipal =
                item.alergicosDetectados?.[0]?.categoria || null;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.curtidoCard}
                  activeOpacity={0.8}
                  onPress={() => abrirResultado(item.id)}
                >
                  <View style={styles.curtidoImageBox}>
                    <ScanThumb
                      imagemUrl={item.imagemUrl}
                      imagemDemo={item.imagemDemo}
                      categoriaPrincipal={catPrincipal}
                      style={styles.curtidoImage}
                      iconSize={24}
                    />

                    <View style={styles.heartIcon}>
                      <Ionicons name="heart" size={12} color="#DC2626" />
                    </View>
                  </View>

                  <Text style={styles.curtidoNome} numberOfLines={2}>
                    {item.nomeProduto}
                  </Text>

                  <Text
                    style={[
                      styles.statusSimpleText,
                      {
                        color: isSeguro ? "#15803D" : "#DC2626",
                      },
                    ]}
                  >
                    {isSeguro ? "Seguro" : "Risco"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="heart-outline" size={22} color="#9CA3AF" />
            <Text style={styles.emptyBoxText}>
              Seus produtos favoritados aparecerão aqui.
            </Text>
          </View>
        )}

        {/* RECÉM ESCANEADOS */}
        <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
          <Text style={styles.sectionHeaderTitle}>Recém Escaneados</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/historico" as never)}
          >
            <Text style={styles.historicoLink}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {recemEscaneados.length > 0 ? (
          recemEscaneados.map((item) => {
            const isSeguro = item.veredito === "SEGURO";
            const detalheTexto = formatarResumoAlergicos(
              item.veredito,
              item.alergicosDetectados
            );
            const catPrincipal =
              item.alergicosDetectados?.[0]?.categoria || null;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.escaneadoRow}
                activeOpacity={0.8}
                onPress={() => abrirResultado(item.id)}
              >
                <ScanThumb
                  imagemUrl={item.imagemUrl}
                  imagemDemo={item.imagemDemo}
                  categoriaPrincipal={catPrincipal}
                  style={styles.escaneadoImagePlaceholder}
                  iconSize={20}
                />

                <View style={styles.escaneadoInfo}>
                  <Text style={styles.escaneadoNome} numberOfLines={1}>
                    {item.nomeProduto}
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
                      numberOfLines={1}
                    >
                      {detalheTexto}
                    </Text>
                  </View>
                </View>

                <StatusBadge seguro={isSeguro} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons
              name="barcode-scan"
              size={22}
              color="#9CA3AF"
            />
            <Text style={styles.emptyBoxText}>
              Nenhum produto escaneado ainda. Toque em &quot;Escanear Produto&quot;
              acima para começar!
            </Text>
          </View>
        )}

        {/* DICA DO DIA */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Ionicons name="bulb-outline" size={20} color="#15803D" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>DICA DO DIA</Text>
            <Text style={styles.tipText}>{dicaDoDia}</Text>
          </View>
        </View>
      </ScrollView>

      {/* BARRA DE NAVEGAÇÃO INFERIOR */}
      <TabBar abaAtiva="inicio" />
    </SafeAreaView>
  );
}

function StatusBadge({ seguro }: { seguro: boolean }) {
  return (
    <View
      style={[
        styles.statusBadge,
        seguro ? styles.statusBadgeSeguro : styles.statusBadgeRisco,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          seguro ? styles.statusBadgeTextSeguro : styles.statusBadgeTextRisco,
        ]}
      >
        {seguro ? "Seguro" : "Risco"}
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
  erroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  erroBannerText: {
    flex: 1,
    fontFamily: "Geist_500Medium",
    fontSize: 12,
    color: "#DC2626",
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
    flexWrap: "wrap",
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
    marginBottom: 6,
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
    marginBottom: 6,
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
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 16,
    color: "#111827",
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
    width: 86,
    flexShrink: 0,
    marginRight: 10,
  },
  curtidoImageBox: {
    width: 86,
    height: 86,
    borderRadius: 10,
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
    fontSize: 10,
    lineHeight: 13,
    color: "#111827",
  },
  statusSimpleText: {
    fontFamily: "Geist_500Medium",
    fontSize: 9.5,
    marginTop: 2,
  },
  emptyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 6,
  },
  emptyBoxText: {
    flex: 1,
    fontFamily: "Geist_400Regular",
    fontSize: 12,
    lineHeight: 17,
    color: "#6B7280",
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
  escaneadoImagePlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    marginRight: 12,
  },
  escaneadoInfo: {
    flex: 1,
    marginRight: 8,
  },
  escaneadoNome: {
    fontFamily: "Geist_700Bold",
    fontSize: 13,
    color: "#111827",
  },
  escaneadoDetalheRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  escaneadoDetalhe: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 11,
    flexShrink: 1,
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
    padding: 14,
    marginTop: 12,
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
    marginBottom: 3,
  },
  tipText: {
    fontFamily: "Geist_400Regular",
    fontSize: 11.5,
    lineHeight: 16,
    color: "#374151",
  },
});
