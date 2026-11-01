import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { router } from "expo-router";

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.8:3000"
).replace(/\/+$/, "");

export const CHAVES_STORAGE = [
  "@rotuscan_token",
  "@usuario_id",
  "@usuario_nome",
  "@usuario_email",
  "@usuario_restricoes",
  "@usuario_niveis",
  "@usuario_avatar",
  "@restricao_gluten",
  "@restricao_lactose",
  "@restricao_amendoim",
  "@usuario_liberar_tracos",
];

export async function limparSessaoLocal() {
  try {
    await AsyncStorage.multiRemove(CHAVES_STORAGE);
  } catch {
    // ignora erro de leitura/remoção local
  }
}

export function extrairMensagemErro(error: any): string {
  if (!error) return "Ocorreu um erro inesperado.";
  if (typeof error === "string") return error;
  if (error.erroAmigavel) return error.erroAmigavel;
  if (error.response?.data?.erro) return String(error.response.data.erro);
  if (error.response?.data?.mensagem) return String(error.response.data.mensagem);
  if (!error.response) {
    return "Não foi possível conectar ao servidor";
  }
  return "Ocorreu um erro ao comunicar com o servidor.";
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Interceptor de requisição: anexa automaticamente o Token JWT salvo
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@rotuscan_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta: trata 401 (sessão expirada) e mensagens de rede
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = String(error?.config?.url || "");
    const ehRotaAuth =
      url.includes("/auth/login") ||
      url.includes("/api/login") ||
      url.includes("/auth/register") ||
      url.includes("/api/cadastro");

    if (error?.response?.status === 401 && !ehRotaAuth) {
      await limparSessaoLocal();
      try {
        router.replace("/login" as never);
      } catch {
        // ignora se o router ainda não estiver montado
      }
    }

    if (!error?.response) {
      error.erroAmigavel = "Não foi possível conectar ao servidor";
    } else if (error?.response?.data?.erro) {
      error.erroAmigavel = error.response.data.erro;
    }

    return Promise.reject(error);
  }
);

/**
 * Envia a foto capturada para POST /scanner usando XMLHttpRequest nativo (evitando o bug
 * 'Unsupported FormDataPart implementation' do polyfill expo/fetch no SDK 58).
 */
export async function enviarFotoScanner(uri: string): Promise<any> {
  const token = await AsyncStorage.getItem("@rotuscan_token");
  const formData = new FormData();

  if (Platform.OS === "web") {
    const respBlob = await fetch(uri);
    const blob = await respBlob.blob();
    formData.append("photo", blob, "rotulo.jpg");
  } else {
    const nomeArquivo = uri.split("/").pop() || "rotulo.jpg";
    const ext = nomeArquivo.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("photo", {
      uri,
      name: nomeArquivo,
      type: mimeType,
    } as any);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/scanner`);
    xhr.timeout = 45000;
    xhr.setRequestHeader("Accept", "application/json");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = async () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = { erro: "Resposta inválida do servidor." };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json);
      } else if (xhr.status === 401) {
        await limparSessaoLocal();
        try {
          router.replace("/login" as never);
        } catch {
          // ignora
        }
        reject({
          response: { status: 401, data: json },
          erroAmigavel: json?.erro || "Sessão expirada. Faça login novamente.",
        });
      } else {
        reject({
          response: { status: xhr.status, data: json },
          erroAmigavel:
            json?.erro || "Não foi possível analisar a imagem no servidor.",
        });
      }
    };

    xhr.onerror = () => {
      reject({
        erroAmigavel: "Não foi possível conectar ao servidor",
      });
    };

    xhr.ontimeout = () => {
      reject({
        erroAmigavel:
          "O servidor demorou muito para responder. Tente novamente com boa conexão.",
      });
    };

    xhr.send(formData as any);
  });
}

export async function enviarAvatarUsuario(
  uri: string,
  base64?: string | null
): Promise<any> {
  if (base64) {
    const dataUri = base64.startsWith("data:")
      ? base64
      : `data:image/jpeg;base64,${base64}`;
    const res = await api.put("/users/perfil", { avatar: dataUri });
    return res.data;
  }

  const token = await AsyncStorage.getItem("@rotuscan_token");
  const formData = new FormData();

  if (Platform.OS === "web") {
    const respBlob = await fetch(uri);
    const blob = await respBlob.blob();
    formData.append("avatar", blob, "avatar.jpg");
  } else {
    const nomeArquivo = uri.split("/").pop() || "avatar.jpg";
    const ext = nomeArquivo.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("avatar", {
      uri,
      name: nomeArquivo,
      type: mimeType,
    } as any);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/users/avatar`);
    xhr.timeout = 30000;
    xhr.setRequestHeader("Accept", "application/json");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = { erro: "Resposta inválida do servidor." };
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(json);
      } else {
        reject({
          response: { status: xhr.status, data: json },
          erroAmigavel: json?.erro || "Erro ao enviar foto de perfil.",
        });
      }
    };

    xhr.onerror = () => {
      reject({ erroAmigavel: "Não foi possível conectar ao servidor" });
    };

    xhr.send(formData as any);
  });
}

export default api;
