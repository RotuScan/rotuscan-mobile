
import React, { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import TabBar from "../components/TabBar/indexTab";


import DrawerMenu from "@/components/Drawer/DrawerMenu";

type StatusProduto = "Seguro" | "Risco";
type Filtro = "Todos" | StatusProduto;

type Escaneamento = {
  id: string;
  nome: string;
  horario: string;
  dataGrupo: string;
  status: StatusProduto;
  imagem: string;
};

const ESCANEAMENTOS: Escaneamento[] = [
  {
    id: "1",
    nome: "Leite Integral",
    horario: "19:36",
    dataGrupo: "Hoje",
    status: "Seguro",
    imagem:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200",
  },
  {
    id: "2",
    nome: "Cebolitinhos",
    horario: "19:32",
    dataGrupo: "Hoje",
    status: "Risco",
    imagem:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200",
  },
  {
    id: "3",
    nome: "Sorvetinho",
    horario: "19:27",
    dataGrupo: "Hoje",
    status: "Seguro",
    imagem:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200",
  },
  {
    id: "4",
    nome: "Cervejinha",
    horario: "16:48",
    dataGrupo: "Ontem",
    status: "Seguro",
    imagem:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200",
  },
  {
    id: "5",
    nome: "Chocolatinho",
    horario: "16:52",
    dataGrupo: "Ontem",
    status: "Seguro",
    imagem:
      "https://images.unsplash.com/photo-1548907040-4d42a0b3a1f2?w=200",
  },
  {
    id: "6",
    nome: "Biscoitinhos",
    horario: "14:20",
    dataGrupo: "06 de Set, 2026",
    status: "Risco",
    imagem:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200",
  },
];

export default function Historico() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Filtra os produtos pelo nome e pelo status.
  const registrosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return ESCANEAMENTOS.filter((item) => {
      const nomeCorresponde = item.nome
        .toLowerCase()
        .includes(termo);

      const statusCorresponde =
        filtro === "Todos" || item.status === filtro;

      return nomeCorresponde && statusCorresponde;
    });
  }, [busca, filtro]);

  // Agrupa os registros por data.
  const grupos = useMemo(() => {
    const resultado: {
      titulo: string;
      itens: Escaneamento[];
    }[] = [];

    registrosFiltrados.forEach((item) => {
      let grupo = resultado.find(
        (g) => g.titulo === item.dataGrupo
      );

      if (!grupo) {
        grupo = {
          titulo: item.dataGrupo,
          itens: [],
        };

        resultado.push(grupo);
      }

      grupo.itens.push(item);
    });

    return resultado;
  }, [registrosFiltrados]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F9F8"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setDrawerVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
          style={styles.menuButton}
        >
          <Feather
            name="menu"
            size={24}
            color="#191C1D"
          />
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

      {/* Conteúdo do histórico */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.conteudo}
      >
        <Text style={styles.titleHistorico}>
          Histórico
        </Text>

        <Text style={styles.subtitle}>
          Seus últimos escaneamentos
        </Text>

        {/* Pesquisa */}
        <View style={styles.search}>
          <Feather
            name="search"
            size={18}
            color="#728078"
          />

          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar produto escaneado..."
            placeholderTextColor="#78847D"
            style={styles.input}
            returnKeyType="search"
          />

          {busca.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusca("")}
              accessibilityLabel="Limpar pesquisa"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#78847D"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtros}>
          {(["Todos", "Risco", "Seguro"] as Filtro[]).map(
            (opcao) => {
              const ativo = filtro === opcao;

              return (
                <TouchableOpacity
                  key={opcao}
                  activeOpacity={0.7}
                  onPress={() => setFiltro(opcao)}
                  style={[
                    styles.filtro,
                    ativo && styles.filtroAtivo,
                  ]}
                >
                  {opcao !== "Todos" && (
                    <View
                      style={[
                        styles.bolinhaFiltro,
                        {
                          backgroundColor:
                            opcao === "Risco"
                              ? "#BF2922"
                              : "#00783F",
                        },
                      ]}
                    />
                  )}

                  <Text
                    style={[
                      styles.textoFiltro,
                      ativo && styles.textoFiltroAtivo,
                    ]}
                  >
                    {opcao}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Timeline agrupada por data */}
        {grupos.length > 0 ? (
          grupos.map((grupo) => (
            <View
              key={grupo.titulo}
              style={styles.grupo}
            >
              <Text style={styles.dataGrupo}>
                {grupo.titulo}
              </Text>

              {grupo.itens.map((item, index) => {
                const cor =
                  item.status === "Seguro"
                    ? "#00783F"
                    : "#BF2922";

                const ultimo =
                  index === grupo.itens.length - 1;

                return (
                  <View
                    key={item.id}
                    style={styles.itemTimeline}
                  >
                    <View style={styles.trilho}>
                      {!ultimo && (
                        <View
                          style={[
                            styles.linha,
                            { backgroundColor: cor },
                          ]}
                        />
                      )}

                      <View
                        style={[
                          styles.marcador,
                          { backgroundColor: cor },
                        ]}
                      />
                    </View>

                    <View style={styles.card}>
                      <Image
                        source={{ uri: item.imagem }}
                        style={styles.imagem}
                        resizeMode="contain"
                      />

                      <View style={styles.informacoes}>
                        <Text
                          style={styles.nome}
                          numberOfLines={2}
                        >
                          {item.nome}
                        </Text>

                        <View style={styles.status}>
                          <View
                            style={[
                              styles.bolinhaStatus,
                              { backgroundColor: cor },
                            ]}
                          />

                          <Text
                            style={[
                              styles.textoStatus,
                              { color: cor },
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>

                        <Text style={styles.horario}>
                          {item.horario}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        ) : (
          <View style={styles.vazio}>
            <Ionicons
              name="time-outline"
              size={42}
              color="#A0B0A6"
            />

            <Text style={styles.vazioTitulo}>
              Nenhum escaneamento encontrado
            </Text>

            <Text style={styles.vazioTexto}>
              Tente outro nome ou altere o filtro.
            </Text>
          </View>
        )}
      </ScrollView>

   
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
            <TabBar abaAtiva="historico" />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },

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

  conteudo: {
    paddingHorizontal: 17,
    paddingTop: 22,
    paddingBottom: 30,
  },

  titleHistorico: {
    fontSize: 25,
    fontWeight: "800",
    color: "#202623",
    letterSpacing: -0.7,
  },

  subtitle: {
    fontSize: 11,
    color: "#68756D",
    fontWeight: "600",
    marginBottom: 9,
  },

  search: {
    minHeight: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#CAD8CE",
    backgroundColor: "#F1F4F2",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    fontSize: 12,
    color: "#263B30",
    paddingVertical: 8,
  },

  filtros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
    marginBottom: 21,
  },

  filtro: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE4DE",
    backgroundColor: "#FAFBFA",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  filtroAtivo: {
    backgroundColor: "#BFE8D1",
    borderColor: "#00783F",
  },

  bolinhaFiltro: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  textoFiltro: {
    fontSize: 11,
    color: "#59675E",
  },

  textoFiltroAtivo: {
    color: "#005C30",
    fontWeight: "700",
  },

  grupo: {
    marginBottom: 12,
  },

  dataGrupo: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00783F",
    marginLeft: 11,
    marginBottom: 8,
  },

  itemTimeline: {
    flexDirection: "row",
    minHeight: 76,
    marginBottom: 7,
  },

  trilho: {
    width: 31,
    alignItems: "center",
    position: "relative",
  },

  linha: {
    position: "absolute",
    top: 0,
    bottom: -7,
    width: 1,
    opacity: 0.6,
  },

  marcador: {
    position: "absolute",
    top: 28,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  card: {
    flex: 1,
    minHeight: 76,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD9CE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  imagem: {
    width: 49,
    height: 59,
  },

  informacoes: {
    flex: 1,
    justifyContent: "center",
  },

  nome: {
    fontSize: 12,
    fontWeight: "800",
    color: "#242925",
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },

  bolinhaStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  textoStatus: {
    fontSize: 10,
    fontWeight: "700",
  },

  horario: {
    fontSize: 9,
    color: "#68756D",
    marginTop: 4,
  },

  vazio: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },

  vazioTitulo: {
    color: "#294638",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },

  vazioTexto: {
    color: "#78847C",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
  },
});
