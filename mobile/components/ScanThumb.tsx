import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  type ImageResizeMode,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { API_URL } from "../services/api";

/**
 * Mapa preparado (e vazio por padrão) para imagens estáticas de demonstração
 * que futuramente serão adicionadas em mobile/assets/produtos/.
 * NUNCA faça require() de arquivos que ainda não existem no disco.
 */
export const IMAGEM_DEMO_MAP: Record<string, any> = {};

const ICONES_ALERGENO: Record<string, any> = {
  gluten: require("../assets/images/iconGluten.png"),
  lactose: require("../assets/images/iconLactose.png"),
  amendoim: require("../assets/images/iconAmendoim.png"),
};

type ScanThumbProps = {
  imagemUrl?: string | null;
  imagemDemo?: string | null;
  localUri?: string | null;
  categoriaPrincipal?: string | null;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  iconSize?: number;
};

export default function ScanThumb({
  imagemUrl,
  imagemDemo,
  localUri,
  categoriaPrincipal,
  style,
  resizeMode = "cover",
  iconSize = 24,
}: ScanThumbProps) {
  const [token, setToken] = useState<string | null>(null);
  const [erroImagem, setErroImagem] = useState(false);

  useEffect(() => {
    let ativo = true;
    setErroImagem(false);
    AsyncStorage.getItem("@rotuscan_token").then((tk) => {
      if (ativo) setToken(tk);
    });
    return () => {
      ativo = false;
    };
  }, [imagemUrl, localUri]);

  // 1. URI local recém-capturada pela câmera
  if (localUri && !erroImagem) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri: localUri }}
          style={styles.fullImage}
          resizeMode={resizeMode}
          onError={() => setErroImagem(true)}
        />
      </View>
    );
  }

  // 2. Imagem de demonstração mapeada localmente (se existir no mapa)
  if (imagemDemo && IMAGEM_DEMO_MAP[imagemDemo] && !erroImagem) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={IMAGEM_DEMO_MAP[imagemDemo]}
          style={styles.fullImage}
          resizeMode={resizeMode}
          onError={() => setErroImagem(true)}
        />
      </View>
    );
  }

  // 3. Miniatura autenticada do servidor GET /users/historico/:id/imagem
  if (imagemUrl && token && !erroImagem) {
    const urlCompleta = imagemUrl.startsWith("http")
      ? imagemUrl
      : `${API_URL}${imagemUrl.startsWith("/") ? "" : "/"}${imagemUrl}`;

    return (
      <View style={[styles.container, style]}>
        <Image
          source={{
            uri: urlCompleta,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }}
          style={styles.fullImage}
          resizeMode={resizeMode}
          onError={() => setErroImagem(true)}
        />
      </View>
    );
  }

  // 4. Placeholder com o ícone do alérgeno principal ou ícone neutro
  const catNorm = (categoriaPrincipal || "").toLowerCase();
  const iconeAlergeno = ICONES_ALERGENO[catNorm];

  return (
    <View style={[styles.container, styles.placeholder, style]}>
      {iconeAlergeno ? (
        <Image
          source={iconeAlergeno}
          style={{ width: iconSize, height: iconSize }}
          resizeMode="contain"
        />
      ) : (
        <Feather name="package" size={iconSize} color="#9CA3AF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  placeholder: {
    backgroundColor: "#F3F4F6",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
});

