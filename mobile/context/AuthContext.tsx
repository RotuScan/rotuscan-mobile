import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { limparSessaoLocal } from "../services/api";

export type NiveisSensibilidade = {
  gluten: 0 | 1 | 2;
  lactose: 0 | 1 | 2;
  amendoim: 0 | 1 | 2;
};

export type UsuarioPublico = {
  id: string;
  nome: string;
  email: string;
  avatar?: string | null;
  role?: "PACIENTE" | "NUTRICIONISTA";
  restricoes: string[];
  niveisSensibilidade: NiveisSensibilidade;
};

export type RascunhoCadastro = {
  nome: string;
  email: string;
  senha: string;
  repetirSenha: string;
};

type AuthContextType = {
  usuarioAtual: UsuarioPublico | null;
  rascunhoCadastro: RascunhoCadastro;
  setRascunhoCadastro: React.Dispatch<React.SetStateAction<RascunhoCadastro>>;
  limparRascunhoCadastro: () => void;
  salvarSessaoUsuario: (
    token: string | null,
    usuario: UsuarioPublico
  ) => Promise<void>;
  atualizarAvatarContexto: (avatarBase64: string) => Promise<void>;
  encerrarSessao: () => Promise<void>;
};

const RASCUNHO_VAZIO: RascunhoCadastro = {
  nome: "",
  email: "",
  senha: "",
  repetirSenha: "",
};

const AuthContext = createContext<AuthContextType>({
  usuarioAtual: null,
  rascunhoCadastro: RASCUNHO_VAZIO,
  setRascunhoCadastro: () => {},
  limparRascunhoCadastro: () => {},
  salvarSessaoUsuario: async () => {},
  atualizarAvatarContexto: async () => {},
  encerrarSessao: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioPublico | null>(null);
  const [rascunhoCadastro, setRascunhoCadastro] =
    useState<RascunhoCadastro>(RASCUNHO_VAZIO);

  // Hidrata dados básicos do AsyncStorage ao montar o provider
  useEffect(() => {
    let ativo = true;
    AsyncStorage.multiGet([
      "@usuario_id",
      "@usuario_nome",
      "@usuario_email",
      "@usuario_avatar",
      "@usuario_restricoes",
      "@usuario_niveis",
    ])
      .then((entries) => {
        if (!ativo) return;
        const map = Object.fromEntries(entries);
        const id = map["@usuario_id"];
        if (!id) return;

        let restricoes: string[] = [];
        try {
          if (map["@usuario_restricoes"]) {
            restricoes = JSON.parse(map["@usuario_restricoes"]!);
          }
        } catch {}

        let niveis: NiveisSensibilidade = {
          gluten: 1,
          lactose: 1,
          amendoim: 1,
        };
        try {
          if (map["@usuario_niveis"]) {
            niveis = JSON.parse(map["@usuario_niveis"]!);
          }
        } catch {}

        setUsuarioAtual({
          id,
          nome: map["@usuario_nome"] || "Usuário",
          email: map["@usuario_email"] || "",
          avatar: map["@usuario_avatar"] || null,
          restricoes,
          niveisSensibilidade: niveis,
        });
      })
      .catch(() => {});

    return () => {
      ativo = false;
    };
  }, []);

  const limparRascunhoCadastro = useCallback(() => {
    setRascunhoCadastro(RASCUNHO_VAZIO);
  }, []);

  const salvarSessaoUsuario = useCallback(
    async (token: string | null, usuario: UsuarioPublico) => {
      const avatarExistente = await AsyncStorage.getItem("@usuario_avatar");
      const avatarFinal =
        usuario.avatar && String(usuario.avatar).trim()
          ? String(usuario.avatar)
          : avatarExistente || null;

      const pares: [string, string][] = [
        ["@usuario_id", String(usuario.id)],
        ["@usuario_nome", String(usuario.nome || "")],
        ["@usuario_email", String(usuario.email || "")],
        ["@usuario_restricoes", JSON.stringify(usuario.restricoes || [])],
        [
          "@usuario_niveis",
          JSON.stringify(
            usuario.niveisSensibilidade || {
              gluten: 1,
              lactose: 1,
              amendoim: 1,
            }
          ),
        ],
        [
          "@restricao_gluten",
          String((usuario.restricoes || []).includes("gluten")),
        ],
        [
          "@restricao_lactose",
          String((usuario.restricoes || []).includes("lactose")),
        ],
        [
          "@restricao_amendoim",
          String((usuario.restricoes || []).includes("amendoim")),
        ],
      ];

      if (token) {
        pares.push(["@rotuscan_token", token]);
      }
      if (avatarFinal) {
        pares.push(["@usuario_avatar", avatarFinal]);
      }

      await AsyncStorage.multiSet(pares);

      setUsuarioAtual({
        ...usuario,
        avatar: avatarFinal,
      });
    },
    []
  );

  const atualizarAvatarContexto = useCallback(async (avatarBase64: string) => {
    await AsyncStorage.setItem("@usuario_avatar", avatarBase64);
    setUsuarioAtual((prev) =>
      prev
        ? { ...prev, avatar: avatarBase64 }
        : {
            id: "",
            nome: "Usuário",
            email: "",
            avatar: avatarBase64,
            restricoes: [],
            niveisSensibilidade: { gluten: 1, lactose: 1, amendoim: 1 },
          }
    );
  }, []);

  const encerrarSessao = useCallback(async () => {
    limparRascunhoCadastro();
    setUsuarioAtual(null);
    await limparSessaoLocal();
  }, [limparRascunhoCadastro]);

  return (
    <AuthContext.Provider
      value={{
        usuarioAtual,
        rascunhoCadastro,
        setRascunhoCadastro,
        limparRascunhoCadastro,
        salvarSessaoUsuario,
        atualizarAvatarContexto,
        encerrarSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
