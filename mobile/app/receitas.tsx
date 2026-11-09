import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import AppHeader from "../components/Header/AppHeader";
import TabBar from "../components/TabBar/indexTab";

type Receita = {
  id: string;
  nome: string;
  imagem: string;
  restricoes: string[];
  tempo: string;
  categoria: string;
  descricao: string;
  ingredientes: string[];
  preparo: string[];
};

const CHAVE_FAVORITOS = "@rotuscan_receitas_favoritas";

const RECEITAS: Receita[] = [
  {
    id: "pao", nome: "Pão caseiro", imagem: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem glúten", "Sem lactose"], tempo: "45 min", categoria: "Pães",
    descricao: "Um pão macio e simples para acompanhar o café da manhã.",
    ingredientes: ["2 xícaras de farinha de arroz", "1 xícara de polvilho doce", "1 ovo", "1 xícara de água morna", "1 colher de sopa de azeite", "1 colher de sopa de fermento biológico"],
    preparo: ["Misture os ingredientes secos em uma tigela.", "Adicione o ovo, a água e o azeite e mexa até formar uma massa homogênea.", "Acrescente o fermento e misture delicadamente.", "Coloque em uma forma untada e deixe descansar por 20 minutos.", "Asse em forno preaquecido a 180 °C por aproximadamente 30 minutos."],
  },
  {
    id: "iogurte", nome: "Iogurte com frutas", imagem: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem glúten"], tempo: "5 min", categoria: "Lanches",
    descricao: "Uma opção rápida e refrescante para qualquer hora do dia.",
    ingredientes: ["1 pote de iogurte natural", "1/2 banana fatiada", "5 morangos", "1 colher de sopa de chia"],
    preparo: ["Coloque o iogurte em uma tigela.", "Adicione as frutas picadas.", "Finalize com chia e sirva gelado."],
  },
  {
    id: "pizza", nome: "Pizza de frigideira", imagem: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem glúten"], tempo: "20 min", categoria: "Refeições",
    descricao: "Pizza prática com massa rápida e cobertura de sua preferência.",
    ingredientes: ["1 ovo", "2 colheres de sopa de farinha de arroz", "2 colheres de sopa de leite", "1/2 colher de chá de fermento", "Molho de tomate", "Queijo e vegetais a gosto"],
    preparo: ["Misture o ovo, a farinha, o leite e o fermento.", "Despeje em frigideira antiaderente em fogo baixo.", "Quando firmar, vire a massa e espalhe o molho e a cobertura.", "Tampe até o queijo derreter e sirva."],
  },
  {
    id: "sorvete", nome: "Sorvete de banana", imagem: "https://images.unsplash.com/photo-1501446529957-6226bd447c46?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem glúten", "Sem lactose"], tempo: "10 min", categoria: "Sobremesas",
    descricao: "Sobremesa cremosa feita com banana congelada.",
    ingredientes: ["3 bananas maduras congeladas", "1 colher de chá de cacau em pó (opcional)"],
    preparo: ["Corte as bananas congeladas em rodelas.", "Bata em um processador até obter textura cremosa.", "Adicione cacau, se desejar, e sirva imediatamente."],
  },
  {
    id: "panqueca", nome: "Panqueca de aveia", imagem: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem lactose"], tempo: "15 min", categoria: "Café da manhã",
    descricao: "Panquecas leves para começar o dia. Use aveia certificada sem glúten se necessário.",
    ingredientes: ["1 banana", "1 ovo", "3 colheres de sopa de aveia", "Canela a gosto"],
    preparo: ["Amasse a banana e misture com o ovo.", "Acrescente a aveia e a canela.", "Doure pequenas porções em frigideira antiaderente dos dois lados."],
  },
  {
    id: "pasta", nome: "Pasta de sementes", imagem: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
    restricoes: ["Sem glúten", "Sem lactose"], tempo: "10 min", categoria: "Lanches",
    descricao: "Pasta cremosa para servir com legumes ou torradas adequadas à sua dieta.",
    ingredientes: ["1/2 xícara de sementes de girassol", "Suco de 1/2 limão", "2 colheres de sopa de azeite", "Água, sal e ervas a gosto"],
    preparo: ["Deixe as sementes de molho por 2 horas e escorra.", "Bata com limão, azeite e temperos.", "Adicione água aos poucos até atingir a textura desejada."],
  },
];

const FILTROS = ["Todas", "Sem glúten", "Sem lactose"] as const;
type Filtro = (typeof FILTROS)[number];

export default function ReceitasScreen() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todas");
  const [favoritas, setFavoritas] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [receitaSelecionada, setReceitaSelecionada] = useState<Receita | null>(null);

  const carregarFavoritas = useCallback(async () => {
    try {
      const salvo = await AsyncStorage.getItem(CHAVE_FAVORITOS);
      setFavoritas(salvo ? JSON.parse(salvo) : []);
    } catch {
      setFavoritas([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregarFavoritas(); }, [carregarFavoritas]);
  useFocusEffect(useCallback(() => { carregarFavoritas(); }, [carregarFavoritas]));

  const alternarFavorito = async (id: string) => {
    const atualizadas = favoritas.includes(id)
      ? favoritas.filter((item) => item !== id)
      : [...favoritas, id];
    setFavoritas(atualizadas);
    try { await AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(atualizadas)); } catch { /* mantém o estado da tela */ }
  };

  const receitasFiltradas = useMemo(() => RECEITAS.filter((receita) => {
    const correspondeBusca = receita.nome.toLowerCase().includes(busca.trim().toLowerCase()) || receita.categoria.toLowerCase().includes(busca.trim().toLowerCase());
    const correspondeFiltro = filtro === "Todas" || receita.restricoes.includes(filtro);
    return correspondeBusca && correspondeFiltro;
  }), [busca, filtro]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Receitas</Text>
        <View style={styles.pesquisa}>
          <Feather name="search" size={18} color="#718078" />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Hmm, que tal um pãozinho sem glúten?" placeholderTextColor="#89948E" style={styles.input} returnKeyType="search" />
          {!!busca && <TouchableOpacity onPress={() => setBusca("")}><Ionicons name="close-circle" size={18} color="#89948E" /></TouchableOpacity>}
        </View>

        <View style={styles.filtros}>
          {FILTROS.map((opcao) => (
            <TouchableOpacity key={opcao} onPress={() => setFiltro(opcao)} style={[styles.filtro, filtro === opcao && styles.filtroAtivo]}>
              <Text style={[styles.filtroTexto, filtro === opcao && styles.filtroTextoAtivo]}>{opcao}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.subtituloLinha}>
          <Text style={styles.subtitulo}>{busca || filtro !== "Todas" ? "Resultados para você" : "Sugestões para você"}</Text>
          <Text style={styles.contagem}>{receitasFiltradas.length} receitas</Text>
        </View>

        {carregando ? <ActivityIndicator color="#00783F" style={{ marginTop: 35 }} /> : receitasFiltradas.length > 0 ? (
          <View style={styles.grade}>
            {receitasFiltradas.map((receita) => (
              <TouchableOpacity key={receita.id} style={styles.card} activeOpacity={0.88} onPress={() => setReceitaSelecionada(receita)}>
                <TouchableOpacity style={styles.coracao} onPress={() => alternarFavorito(receita.id)} accessibilityRole="button" accessibilityLabel={`${favoritas.includes(receita.id) ? "Remover dos" : "Adicionar aos"} favoritos: ${receita.nome}`}>
                  <Ionicons name={favoritas.includes(receita.id) ? "heart" : "heart-outline"} size={20} color={favoritas.includes(receita.id) ? "#E34B55" : "#7B8580"} />
                </TouchableOpacity>
                <Image source={{ uri: receita.imagem }} style={styles.imagem} resizeMode="cover" />
                <Text style={styles.nomeReceita} numberOfLines={1}>{receita.nome}</Text>
                <View style={styles.informacoes}>
                  <View style={styles.status}><View style={styles.bolinha} /><Text style={styles.statusTexto}>{receita.restricoes[0].toLowerCase()}</Text></View>
                  <View style={styles.tempo}><Feather name="clock" size={10} color="#7C8780" /><Text style={styles.tempoTexto}>{receita.tempo}</Text></View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.vazio}>
            <Feather name="search" size={38} color="#A4B0A8" />
            <Text style={styles.vazioTitulo}>Nenhuma receita encontrada</Text>
            <Text style={styles.vazioTexto}>Tente outro nome ou altere o filtro selecionado.</Text>
          </View>
        )}
      </ScrollView>
      <TabBar abaAtiva="inicio" />

      <Modal visible={!!receitaSelecionada} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setReceitaSelecionada(null)}>
        {receitaSelecionada && (
          <SafeAreaView style={styles.modalSafe} edges={["top", "bottom"]}>
            <View style={styles.modalTopo}>
              <Text style={styles.modalTitulo}>Detalhes da receita</Text>
              <TouchableOpacity onPress={() => setReceitaSelecionada(null)} style={styles.fechar}><Feather name="x" size={21} color="#34443A" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalConteudo}>
              <Image source={{ uri: receitaSelecionada.imagem }} style={styles.imagemDetalhe} />
              <View style={styles.detalheTituloLinha}>
                <Text style={styles.detalheTitulo}>{receitaSelecionada.nome}</Text>
                <TouchableOpacity onPress={() => alternarFavorito(receitaSelecionada.id)}><Ionicons name={favoritas.includes(receitaSelecionada.id) ? "heart" : "heart-outline"} size={25} color={favoritas.includes(receitaSelecionada.id) ? "#E34B55" : "#68756D"} /></TouchableOpacity>
              </View>
              <Text style={styles.descricao}>{receitaSelecionada.descricao}</Text>
              <View style={styles.chipsDetalhe}>{receitaSelecionada.restricoes.map((r) => <Text key={r} style={styles.chipDetalhe}>{r}</Text>)}<Text style={styles.chipTempo}><Feather name="clock" size={12} /> {receitaSelecionada.tempo}</Text></View>
              <Text style={styles.secaoTitulo}>Ingredientes</Text>
              {receitaSelecionada.ingredientes.map((item, i) => <View key={`${i}-${item}`} style={styles.listaLinha}><View style={styles.marcador} /><Text style={styles.listaTexto}>{item}</Text></View>)}
              <Text style={styles.secaoTitulo}>Modo de preparo</Text>
              {receitaSelecionada.preparo.map((item, i) => <View key={`${i}-${item}`} style={styles.preparoLinha}><Text style={styles.numero}>{i + 1}</Text><Text style={styles.listaTexto}>{item}</Text></View>)}
              <Text style={styles.aviso}>Atenção: confira sempre os rótulos dos ingredientes e possíveis avisos de contaminação cruzada antes do consumo.</Text>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9F8" },
  conteudo: { paddingHorizontal: 18, paddingTop: 25, paddingBottom: 28 },
  titulo: { fontSize: 25, fontWeight: "800", color: "#202623", textAlign: "center", marginBottom: 14, letterSpacing: -0.5 },
  pesquisa: { height: 42, borderRadius: 14, borderWidth: 1, borderColor: "#CDDAD1", backgroundColor: "#F2F5F3", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  input: { flex: 1, fontSize: 12, color: "#263B30", paddingVertical: 0 },
  filtros: { flexDirection: "row", gap: 7, marginTop: 12, marginBottom: 17 },
  filtro: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: "#D9E2DC", backgroundColor: "#FFFFFF" },
  filtroAtivo: { backgroundColor: "#DDF1E5", borderColor: "#16834A" },
  filtroTexto: { color: "#657169", fontSize: 10, fontWeight: "600" },
  filtroTextoAtivo: { color: "#006D37" },
  subtituloLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  subtitulo: { fontSize: 10, color: "#78847C" },
  contagem: { fontSize: 10, color: "#8A958E" },
  grade: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 },
  card: { width: "48.2%", minHeight: 160, backgroundColor: "#FFFFFF", borderRadius: 15, padding: 9, borderWidth: 1, borderColor: "#E5EAE6", elevation: 2, shadowColor: "#25382D", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  coracao: { position: "absolute", zIndex: 2, top: 5, right: 5, width: 29, height: 29, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFFDD", borderRadius: 16 },
  imagem: { width: 92, height: 82, alignSelf: "center", borderRadius: 9, marginBottom: 7, backgroundColor: "#EDF1EE" },
  nomeReceita: { fontSize: 11, fontWeight: "800", color: "#252B27", marginTop: 1 },
  informacoes: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 3 },
  status: { flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 },
  bolinha: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#00783F" },
  statusTexto: { fontSize: 8, color: "#00783F", fontWeight: "700", flexShrink: 1 },
  tempo: { flexDirection: "row", alignItems: "center", gap: 3 },
  tempoTexto: { fontSize: 8, color: "#7C8780" },
  vazio: { alignItems: "center", paddingVertical: 55, paddingHorizontal: 20 },
  vazioTitulo: { fontSize: 14, fontWeight: "700", color: "#294638", marginTop: 12 },
  vazioTexto: { fontSize: 11, color: "#78847C", textAlign: "center", marginTop: 5 },
  modalSafe: { flex: 1, backgroundColor: "#FFFFFF" },
  modalTopo: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EDF0ED" },
  modalTitulo: { fontSize: 16, fontWeight: "800", color: "#263B30" },
  fechar: { width: 34, height: 34, borderRadius: 18, backgroundColor: "#F1F5F2", alignItems: "center", justifyContent: "center" },
  modalConteudo: { padding: 20, paddingBottom: 35 },
  imagemDetalhe: { width: "100%", height: 190, borderRadius: 16, backgroundColor: "#EDF1EE" },
  detalheTituloLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 },
  detalheTitulo: { flex: 1, fontSize: 22, fontWeight: "800", color: "#202623" },
  descricao: { fontSize: 13, lineHeight: 19, color: "#657169", marginTop: 7 },
  chipsDetalhe: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12, alignItems: "center" },
  chipDetalhe: { color: "#006D37", backgroundColor: "#E7F4EB", borderRadius: 15, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 6, fontSize: 10, fontWeight: "700" },
  chipTempo: { color: "#68756D", fontSize: 11 },
  secaoTitulo: { fontSize: 16, fontWeight: "800", color: "#263B30", marginTop: 23, marginBottom: 10 },
  listaLinha: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 9 },
  marcador: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#16834A", marginTop: 6 },
  listaTexto: { flex: 1, fontSize: 12, lineHeight: 18, color: "#4D5A52" },
  preparoLinha: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  numero: { width: 23, height: 23, borderRadius: 12, textAlign: "center", textAlignVertical: "center", overflow: "hidden", backgroundColor: "#E7F4EB", color: "#006D37", fontSize: 11, fontWeight: "800" },
  aviso: { marginTop: 22, padding: 12, borderRadius: 10, backgroundColor: "#FFF8E8", color: "#806321", fontSize: 11, lineHeight: 16 },
});
