import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppHeader from "../components/Header/AppHeader";
import TabBar from "../components/TabBar/indexTab";

export default function ConfiguracoesScreen() {
  const router = useRouter();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <AppHeader />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="arrow-left" size={20} color="#087443" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Configurações e Ajuda</Text>
          </View>

          <Text style={styles.sectionTitle}>Preferências do App</Text>
          <View style={styles.card}>
            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#64748B"
                />
                <Text style={styles.itemText}>Notificações Push</Text>
              </View>
              <Switch
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={pushEnabled ? "#16A34A" : "#94A3B8"}
                onValueChange={setPushEnabled}
                value={pushEnabled}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Ionicons name="moon-outline" size={22} color="#64748B" />
                <Text style={styles.itemText}>Modo Escuro</Text>
              </View>
              <Switch
                trackColor={{ false: "#E2E8F0", true: "#BBF7D0" }}
                thumbColor={darkModeEnabled ? "#16A34A" : "#94A3B8"}
                onValueChange={setDarkModeEnabled}
                value={darkModeEnabled}
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Suporte e Sobre</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.itemRowAction}>
              <View style={styles.itemLeft}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#64748B"
                />
                <Text style={styles.itemText}>Central de Ajuda</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.itemRowAction}>
              <View style={styles.itemLeft}>
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#64748B"
                />
                <Text style={styles.itemText}>Termos de Uso</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.itemRowAction}>
              <View style={styles.itemLeft}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#64748B"
                />
                <Text style={styles.itemText}>Política de Privacidade</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>

          <Text style={styles.versionText}>RotuScan Versão 1.0.0</Text>
        </View>
      </ScrollView>

      <TabBar abaAtiva="perfil" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF5EE",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#101828",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  itemRowAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  versionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 30,
  },
});
