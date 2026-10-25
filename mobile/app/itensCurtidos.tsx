
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

import TabBar from "../components/TabBar/indexTab";

import DrawerMenu from "@/components/Drawer/DrawerMenu";

type StatusProduto = "Seguro" | "Risco";
type Filtro = "Todos" | StatusProduto;

type ProdutoCurtido = {
  id: string;
  nome: string;
  imagem: string;
  status: StatusProduto;
  curtido: boolean;
};

const produtosIniciais: ProdutoCurtido[] = [
  {
    id: "1",
    nome: "Sorvetinho",
    imagem:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "2",
    nome: "Leite Integral",
    imagem:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "3",
    nome: "Cervejinha",
    imagem:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "4",
    nome: "Chocolatinho",
    imagem:
      "https://images.unsplash.com/photo-1548907040-4d42a0b3a1f2?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "5",
    nome: "Suplementinho",
    imagem:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "6",
    nome: "Torradinha",
    imagem:
      "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=300",
    status: "Seguro",
    curtido: true,
  },
  {
    id: "7",
    nome: "Biscoitinhos",
    imagem:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300",
    status: "Risco",
    curtido: true,
  },
  {
    id: "8",
    nome: "Bolachinhas",
    imagem:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300",
    status: "Seguro",
    curtido: true,
  },
];

export default function ItensCurtidos() {
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { width } = useWindowDimensions();
  const espacamento = 12;
  const paddingHorizontal = 17;

  const larguraCard =
    (width - paddingHorizontal * 2 - espacamento) / 2;

  const quantidadeCurtidos = produtos.filter(
    (produto) => produto.curtido
  ).length;

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((produto) => {
      const correspondeBusca = produto.nome
        .toLowerCase()
        .includes(termo);

      const correspondeFiltro =
        filtro === "Todos" || produto.status === filtro;

      return (
        produto.curtido &&
        correspondeBusca &&
        correspondeFiltro
      );
    });
  }, [produtos, busca, filtro]);

  function alternarCurtida(id: string) {
    setProdutos((atuais) =>
      atuais.map((produto) =>
        produto.id === id
          ? { ...produto, curtido: !produto.curtido }
          : produto
      )
    );
  }

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.conteudo}
      >
        {/* Título e contador */}
        <View style={styles.tituloLinha}>
          <View style={styles.tituloGrupo}>
            <Text style={styles.titulo}>Itens Curtidos</Text>
            <Text style={styles.subtitulo}>
              Produtos que você salvou
            </Text>
          </View>

          <View style={styles.contador}>
            <Ionicons
              name="heart"
              size={15}
              color="#F52222"
            />
            <Text style={styles.contadorTexto}>
              {quantidadeCurtidos} itens
            </Text>
          </View>
        </View>

        {/* Pesquisa */}
        <View style={styles.pesquisa}>
          <Feather
            name="search"
            size={18}
            color="#728078"
          />

          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar nos seus itens curtidos..."
            placeholderTextColor="#89948E"
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
                color="#89948E"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filtros}>
          {(["Todos", "Risco", "Seguro"] as Filtro[]).map(
            (opcao) => (
              <TouchableOpacity
                key={opcao}
                activeOpacity={0.7}
                onPress={() => setFiltro(opcao)}
                style={[
                  styles.filtro,
                  filtro === opcao && styles.filtroAtivo,
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
                    filtro === opcao && styles.textoFiltroAtivo,
                  ]}
                >
                  {opcao}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* Grade de produtos curtidos */}
        {produtosFiltrados.length > 0 ? (
          <View style={styles.grade}>
            {produtosFiltrados.map((produto) => {
              const cor =
                produto.status === "Seguro"
                  ? "#00783F"
                  : "#BF2922";

              return (
                <View
                  key={produto.id}
                  style={[
                    styles.card,
                    { width: larguraCard },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.botaoCoracao}
                    onPress={() => alternarCurtida(produto.id)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Desfavoritar ${produto.nome}`}
                  >
                    <Ionicons
                      name={
                        produto.curtido
                          ? "heart"
                          : "heart-outline"
                      }
                      size={19}
                      color={
                        produto.curtido ? "#F52222" : "#777777"
                      }
                    />
                  </TouchableOpacity>

                  <View style={styles.imagemContainer}>
                    <Image
                      source={{ uri: produto.imagem }}
                      style={styles.imagemProduto}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    style={styles.nomeProduto}
                    numberOfLines={2}
                  >
                    {produto.nome}
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
                      {produto.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Ionicons
              name="heart-outline"
              size={45}
              color="#A0B0A6"
            />

            <Text style={styles.vazioTitulo}>
              Nenhum item curtido encontrado
            </Text>

            <Text style={styles.vazioTexto}>
              Favorite um produto ou tente outra pesquisa.
            </Text>
          </View>
        )}
      </ScrollView>

      
     <TabBar abaAtiva="itensCurtidos" />
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

  espacadorHeader: {
    width: 36,
  },

  conteudo: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 24,
  },

  tituloLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    marginBottom: 16,
  },

  tituloGrupo: {
    flex: 1,
  },

  titulo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#202623",
    letterSpacing: -0.7,
  },

  subtitulo: {
    fontSize: 11,
    color: "#68756D",
    marginTop: 2,
  },

  contador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#EAF3EE",
    borderWidth: 1,
    borderColor: "#D5E4DA",
  },

  contadorTexto: {
    fontSize: 10,
    fontWeight: "700",
    color: "#294638",
  },

  pesquisa: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CDDAD1",
    backgroundColor: "#F2F5F3",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    fontSize: 11,
    color: "#263B30",
    paddingVertical: 0,
  },

  filtros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    marginBottom: 18,
  },

  filtro: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9E2DC",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 10,
    color: "#59665E",
  },

  textoFiltroAtivo: {
    color: "#005C30",
    fontWeight: "700",
  },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 13,
  },

  card: {
    minHeight: 166,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 9,
    borderWidth: 1,
    borderColor: "#E5EAE6",
    elevation: 2,
    shadowColor: "#25382D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  botaoCoracao: {
    position: "absolute",
    zIndex: 2,
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  imagemContainer: {
    height: 94,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  imagemProduto: {
    width: "88%",
    height: "100%",
  },

  nomeProduto: {
    minHeight: 16,
    fontSize: 11,
    fontWeight: "700",
    color: "#252B27",
    marginTop: 2,
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },

  bolinhaStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  textoStatus: {
    fontSize: 9,
    fontWeight: "600",
  },

  vazio: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 15,
  },

  vazioTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#294638",
    marginTop: 12,
    textAlign: "center",
  },

  vazioTexto: {
    fontSize: 12,
    color: "#78847C",
    textAlign: "center",
    marginTop: 5,
  },
});
