
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "../context/AuthContext";
import api, { extrairMensagemErro } from "../services/api";
import {
  buscarMensagens,
  enviarMensagem,
  marcarMensagensLidas,
  type MensagemChat,
} from "../services/chat";

export default function Chat() {
  const { usuarioAtual } = useAuth();

  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [nomeNutricionista, setNomeNutricionista] =
    useState("Meu nutricionista");
  const [novasMensagens, setNovasMensagens] = useState(0);

  const totalMensagensAnterior = useRef<number | null>(null);

  const listaRef = useRef<FlatList<MensagemChat>>(null);
  const carregamentoEmAndamento = useRef(false);

  const estaNoFinal = useRef(true);
  const primeiraRolagem = useRef(true);

  const podeRolarAutomaticamente = useRef(false);

  const carregarMensagens = useCallback(async () => {
    if (carregamentoEmAndamento.current) return;

    carregamentoEmAndamento.current = true;

    try {
      const lista = await buscarMensagens();

        const totalAnterior = totalMensagensAnterior.current;

        if (totalAnterior !== null && lista.length > totalAnterior) {
        const quantidadeNovas = lista.length - totalAnterior;

        if (!estaNoFinal.current) {
            setNovasMensagens((anterior) => anterior + quantidadeNovas);
        }
        }

        totalMensagensAnterior.current = lista.length;

        setMensagens(lista);
        setErro("");

      if (
        lista.some(
          (mensagem) =>
            mensagem.remetenteTipo === "NUTRICIONISTA" &&
            !mensagem.lidaEm
        )
      ) {
        await marcarMensagensLidas();
      }
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
      carregamentoEmAndamento.current = false;
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarNutricionista() {
      try {
        const resposta = await api.get("/users/perfil");
        if (!ativo) return;

        const vinculo =
          resposta.data?.vinculo ??
          resposta.data?.usuario?.vinculo;

        if (vinculo?.nutricionista?.nome) {
          setNomeNutricionista(vinculo.nutricionista.nome);
        }
      } catch {
        // O histórico do chat ainda pode ser carregado.
      }
    }

    void carregarNutricionista();
    void carregarMensagens();

    const intervalo = setInterval(() => {
      void carregarMensagens();
    }, 5000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [carregarMensagens]);

  async function handleEnviar() {
    const conteudo = texto.trim();

    if (!conteudo || enviando || conteudo.length > 2000) return;

    setEnviando(true);
    setErro("");

    try {
      await enviarMensagem(conteudo);
      setTexto("");
      await carregarMensagens();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviando(false);
    }
  }

  function renderMensagem({ item }: { item: MensagemChat }) {
    const minha = item.remetenteTipo === "PACIENTE";

    return (
      <View
        style={[
          styles.balao,
          minha ? styles.balaoPaciente : styles.balaoNutricionista,
        ]}
      >
        <Text style={styles.textoMensagem}>{item.texto}</Text>

        <View style={styles.rodapeMensagem}>
          <Text style={styles.horario}>
            {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {minha && (
            <Feather
              name={item.lidaEm ? "check-circle" : "check"}
              size={13}
              color={item.lidaEm ? "#16A34A" : "#64748B"}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  keyboardVerticalOffset={0}
>
        <View style={styles.cabecalho}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={24} color="#14532D" />
          </TouchableOpacity>

          <View style={styles.avatar}>
            <Feather name="user" size={22} color="#16834A" />
          </View>

          <View style={styles.dadosNutricionista}>
            <Text style={styles.nomeNutricionista}>
              {nomeNutricionista}
            </Text>
            <Text style={styles.subtitulo}>
              Conversa com seu nutricionista
            </Text>
          </View>
        </View>

        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={styles.textoAuxiliar}>
              Carregando conversa...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listaRef}
            data={mensagens}
            keyExtractor={(item) => item._id}
            renderItem={renderMensagem}
            contentContainerStyle={styles.lista}
            onScroll={(event) => {
                const {
                    layoutMeasurement,
                    contentOffset,
                    contentSize,
                } = event.nativeEvent;

                const distanciaDoFinal =
                    contentSize.height -
                    layoutMeasurement.height -
                    contentOffset.y;

                estaNoFinal.current = distanciaDoFinal < 100;

                if (estaNoFinal.current) {
                    setNovasMensagens(0);
                }
                }}
                onScrollBeginDrag={() => {
                podeRolarAutomaticamente.current = false;
                }}
                scrollEventThrottle={100}

                onContentSizeChange={() => {
                if (primeiraRolagem.current) {
                    primeiraRolagem.current = false;
                    listaRef.current?.scrollToEnd({ animated: false });
                    return;
                }

                if (podeRolarAutomaticamente.current) {
                    podeRolarAutomaticamente.current = false;
                    listaRef.current?.scrollToEnd({ animated: true });
                }
                }}
            ListEmptyComponent={
              !erro ? (
                <View style={styles.centro}>
                  <Feather
                    name="message-circle"
                    size={46}
                    color="#16A34A"
                  />
                  <Text style={styles.textoAuxiliar}>
                    Nenhuma mensagem ainda.
                  </Text>
                  <Text style={styles.textoAuxiliar}>
                    Envie uma mensagem para começar!
                  </Text>
                </View>
                ) : (
                    <View />
                     )
            }
          />
        )}

                {novasMensagens > 0 && (
          <TouchableOpacity
            style={styles.indicadorNovas}
            onPress={() => {
            podeRolarAutomaticamente.current = true;
            listaRef.current?.scrollToEnd({ animated: true });
            setNovasMensagens(0);
            }}
            activeOpacity={0.85}
          >
            <Feather name="arrow-down" size={16} color="#FFFFFF" />
            <Text style={styles.textoIndicador}>
              {novasMensagens === 1
                ? "1 nova mensagem"
                : `${novasMensagens} novas mensagens`}
            </Text>
          </TouchableOpacity>
        )}

        {!!erro && (
          <View style={styles.erroContainer}>
            <Text style={styles.erro}>{erro}</Text>
            <TouchableOpacity onPress={() => void carregarMensagens()}>
              <Text style={styles.tentarNovamente}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.areaEnvio}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#94A3B8"
            style={styles.campo}
            multiline
            maxLength={2000}
            editable={!enviando}
          />

          <TouchableOpacity
            style={[
              styles.botaoEnviar,
              (!texto.trim() || enviando) && styles.botaoDesabilitado,
            ]}
            onPress={() => void handleEnviar()}
            disabled={!texto.trim() || enviando}
            accessibilityLabel="Enviar mensagem"
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Feather name="send" size={21} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
 cabecalho: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingHorizontal: 18,
  paddingTop: Platform.OS === "android"
    ? (StatusBar.currentHeight ?? 0) + 16
    : 16,
  paddingBottom: 16,
  backgroundColor: "#FFFFFF",
  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",
},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },
  dadosNutricionista: {
    flex: 1,
  },
  nomeNutricionista: {
    fontSize: 17,
    fontWeight: "700",
    color: "#14532D",
  },
  subtitulo: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },
  lista: {
    padding: 16,
    flexGrow: 1,
    gap: 12,
  },
  centro: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  textoAuxiliar: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
  balao: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 1,
  },
  balaoPaciente: {
    alignSelf: "flex-end",
    backgroundColor: "#DCFCE7",
    borderBottomRightRadius: 4,
  },
  balaoNutricionista: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  textoMensagem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1E293B",
  },
  rodapeMensagem: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 5,
    marginTop: 5,
  },
  horario: {
    fontSize: 11,
    color: "#64748B",
  },
  areaEnvio: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  campo: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 22,
    fontSize: 15,
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
  },
  botaoEnviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  erroContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
  },
  erro: {
    color: "#DC2626",
    fontSize: 13,
  },
  tentarNovamente: {
    color: "#15803D",
    fontWeight: "600",
    marginTop: 5,
  },

  indicadorNovas: {
  alignSelf: "center",
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  backgroundColor: "#15803D",
  paddingHorizontal: 18,
  paddingVertical: 11,
  borderRadius: 24,
  marginBottom: 10,
  elevation: 4,
},

textoIndicador: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "700",
},
});
