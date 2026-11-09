
import api from "./api";

export interface MensagemChat {
  _id: string;
  pacienteId: string;
  nutricionistaId: string;
  remetenteTipo: "PACIENTE" | "NUTRICIONISTA";
  texto: string;
  lidaEm: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function buscarMensagens(): Promise<MensagemChat[]> {
  const resposta = await api.get<{ mensagens: MensagemChat[] }>(
    "/chat/mensagens"
  );

  return resposta.data.mensagens;
}

export async function enviarMensagem(
  texto: string
): Promise<MensagemChat> {
  const resposta = await api.post<{ mensagem: MensagemChat }>(
    "/chat/mensagens",
    { texto }
  );

  return resposta.data.mensagem;
}

export async function marcarMensagensLidas(): Promise<number> {
  const resposta = await api.patch<{
    sucesso: boolean;
    atualizadas: number;
  }>("/chat/mensagens/lidas");

  return resposta.data.atualizadas;
}
