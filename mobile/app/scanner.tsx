import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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
import TabBar from "@/components/TabBar/indexTab";

export default function ScannerScreen() {
  const { width, height } = useWindowDimensions();

  const [permission, requestPermission] = useCameraPermissions();

  const [flashAtivo, setFlashAtivo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  // Responsividade
  const tamanhoMoldura = Math.min(width * 0.64, 230);
  const tamanhoBotao = Math.min(width * 0.115, 48);

  // Menu lateral
  const navegar = (rota: string) => {
    setMenuAberto(false);
    router.push(rota as any);
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
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* CÂMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashAtivo}
      />

      {/* CAMADA ESCURA */}
      <View
        style={styles.overlay}
        pointerEvents="box-none"
      >
        <SafeAreaView
          style={styles.safeArea}
          edges={["top", "bottom"]}
        >
          {/* CABEÇALHO */}
          <View style={styles.header}>
            {/* MENU */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.push("../../Drawer/DrawerMenu") }
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
              onPress={() => navegar("/(tabs)/perfil")}
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
              onPress={() => navegar("/(tabs)/historico")}
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
             
            </View>
          </View>

          {/* INDICADOR DE ANÁLISE */}
          <View
            style={[
              styles.bottomContainer,
              { marginBottom: Math.max(height * 0.045, 20) },
            ]}
          >
            <View style={styles.scanningIndicator}>
              <View style={styles.scanningIcon}>
                <Ionicons
                  name="scan-outline"
                  size={19}
                  color="#24C95B"
                />
              </View>

              <Text style={styles.scanningText}>
                Buscando restrições...
              </Text>

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={styles.loadingIcon}
              />
            </View>
          </View>
        </SafeAreaView>
         d
        
      </View>

    
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
    ...StyleSheet.absoluteFillObject,
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

  // DRAWER
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  drawer: {
    width: "78%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: "#1A1A2E",
    paddingHorizontal: 22,
    paddingTop: 60,
  },

  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  drawerLogo: {
    fontSize: 25,
    fontWeight: "700",
  },

  drawerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 20,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    gap: 15,
  },

  drawerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
});
