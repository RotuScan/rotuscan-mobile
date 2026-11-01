import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DrawerMenu from "@/components/Drawer/DrawerMenu";
import TabBar from "@/components/TabBar/indexTab";

export default function ScannerScreen() {
  const { width, height } = useWindowDimensions();

  const [permission, requestPermission] = useCameraPermissions();

  const [flashAtivo, setFlashAtivo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; msg: string } | null>(
    null
  );

  const SEU_IP_LOCAL = "192.168.1.8";

  // Responsividade
  const tamanhoMoldura = Math.min(width * 0.64, 230);
  const tamanhoBotao = Math.min(width * 0.115, 48);

  const navegar = (rota: string) => {
    setMenuAberto(false);
    router.push(rota as never);
  };

  const takePictureAndReadText = async () => {
    if (!cameraRef || loading) return;
    setLoading(true);
    setResult(null);

    try {
      let restricoesAtivas: string[] = [];
      const restricoesJson = await AsyncStorage.getItem("@usuario_restricoes");
      if (restricoesJson) {
        restricoesAtivas = JSON.parse(restricoesJson);
      } else {
        const lac = await AsyncStorage.getItem("@restricao_lactose");
        const glut = await AsyncStorage.getItem("@restricao_gluten");
        const amen = await AsyncStorage.getItem("@restricao_amendoim");

        if (lac === "true") restricoesAtivas.push("lactose");
        if (glut === "true") restricoesAtivas.push("gluten");
        if (amen === "true") restricoesAtivas.push("amendoim");
      }

      if (restricoesAtivas.length === 0) {
        restricoesAtivas = ["gluten", "lactose"];
      }

      const photo = await cameraRef.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      const formData = new FormData();
      // @ts-ignore
      formData.append("photo", {
        uri: photo.uri,
        name: "photo.jpg",
        type: "image/jpeg",
      });

      formData.append("restricoes", JSON.stringify(restricoesAtivas));
      const userId = await AsyncStorage.getItem("@usuario_id");
      if (userId) {
        formData.append("userId", userId);
      }

      const response = await fetch(`http://${SEU_IP_LOCAL}:3000/scanner`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (data.sucesso || data.status) {
        if (data.status === "PERIGO") {
          const msg = `Atenção! Encontramos: ${data.alergicosEncontrados.join(", ")}`;
          setResult({ status: "PERIGO", msg });
          Alert.alert("⚠️ Alerta de Restrição", msg);
        } else {
          const msg = "Produto seguro para o seu perfil!";
          setResult({ status: "SEGURO", msg });
          Alert.alert("✅ Produto Seguro", msg);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de Conexão", "Não foi possível alcançar o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Carregamento da permissão
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#24C95B" />
      </View>
    );
  }

  // Solicitação de permissão
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons
          name="camera-outline"
          size={65}
          color="#24C95B"
        />

        <Text style={styles.permissionTitle}>
          Acesso à câmera
        </Text>

        <Text style={styles.permissionText}>
          Precisamos acessar sua câmera para analisar os rótulos
          dos produtos.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Permitir acesso
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      {/* CÂMERA */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={flashAtivo}
        ref={(ref) => setCameraRef(ref)}
      />

      {/* CAMADA ESCURA */}
      <View
        style={styles.overlay}
        pointerEvents="box-none"
      >
        <SafeAreaView
          style={styles.safeArea}
          edges={["top"]}
        >
          {/* CABEÇALHO */}
          <View style={styles.header}>
            {/* MENU */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setMenuAberto(true)}
              activeOpacity={0.7}
            >
              <Feather
                name="menu"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* NOME */}
            <Text style={styles.headerTitle}>
              RotuScan
            </Text>

            {/* PERFIL */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navegar("/perfil")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-circle"
                size={39}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* CONTROLES LATERAIS */}
          <View style={styles.sideControls}>
            {/* FLASH */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  width: tamanhoBotao,
                  height: tamanhoBotao,
                  backgroundColor: flashAtivo
                    ? "#24C95B"
                    : "rgba(120, 75, 48, 0.65)",
                },
              ]}
              onPress={() => setFlashAtivo(!flashAtivo)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={flashAtivo ? "flash" : "flash-outline"}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* HISTÓRICO */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  width: tamanhoBotao,
                  height: tamanhoBotao,
                },
              ]}
              onPress={() => navegar("/historico")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* ÁREA CENTRAL DE LEITURA */}
          <View style={styles.scannerArea}>
            <View
              style={[
                styles.scannerFrame,
                {
                  width: tamanhoMoldura,
                  height: tamanhoMoldura * 0.83,
                },
              ]}
            >
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* INDICADOR DE ANÁLISE / BOTÃO CAPTURAR */}
          <View
            style={[
              styles.bottomContainer,
              { marginBottom: Math.max(height * 0.03, 16) },
            ]}
          >
            <TouchableOpacity
              style={styles.scanningIndicator}
              activeOpacity={0.8}
              onPress={takePictureAndReadText}
            >
              <View style={styles.scanningIcon}>
                <Ionicons
                  name="scan-outline"
                  size={19}
                  color="#24C95B"
                />
              </View>

              <Text style={styles.scanningText}>
                {loading
                  ? "Buscando restrições..."
                  : result
                  ? result.msg
                  : "Toque para escanear rótulo"}
              </Text>

              {loading && (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                  style={styles.loadingIcon}
                />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <TabBar abaAtiva="escanear" />
      </View>

      <DrawerMenu
        visible={menuAberto}
        onClose={() => setMenuAberto(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
    backgroundColor: "#FFFFFF",
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#006B3A",
    marginTop: 20,
  },

  permissionText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },

  permissionButton: {
    backgroundColor: "#24C95B",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 25,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // CAMADA SOBRE A CÂMERA
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.10)",
  },

  safeArea: {
    flex: 1,
  },

  // CABEÇALHO
  header: {
    height: 53,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    position: "absolute",
    left: 55,
    right: 55,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },

  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.30)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // BOTÕES LATERAIS
  sideControls: {
    position: "absolute",
    right: 12,
    top: "9%",
    gap: 13,
    alignItems: "center",
  },

  controlButton: {
    borderRadius: 50,
    backgroundColor: "rgba(120, 75, 48, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  // MOLDURA DE SCANNER
  scannerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scannerFrame: {
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: "25%",
    height: "25%",
    borderColor: "#008B5E",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 7,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 7,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 7,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 7,
  },

  // INDICADOR INFERIOR
  bottomContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  scanningIndicator: {
    minHeight: 43,
    minWidth: 205,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "rgba(35, 35, 35, 0.88)",
    gap: 9,
  },

  scanningIcon: {
    alignItems: "center",
    justifyContent: "center",
  },

  scanningText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },

  loadingIcon: {
    marginLeft: 2,
  },
});
