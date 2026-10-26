
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Props = {
  telaAtiva: "historico" | "itensCurtidos";
};

export default function HeaderRotuScan({ telaAtiva }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.menu}
        onPress={() => router.push("/")}
        accessibilityLabel="Abrir navegação"
      >
        <Feather name="menu" size={22} color="#34483D" />
      </TouchableOpacity>

      <Text style={styles.logo}>
        <Text style={styles.rotu}>Rotu</Text>
        <Text style={styles.scan}>Scan</Text>
      </Text>

      <TouchableOpacity
        style={styles.perfil}
        onPress={() => router.push("/")}
        accessibilityLabel="Perfil"
      >
        <Ionicons
          name="person-circle-outline"
          size={31}
          color="#00783F"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E7E2",
    backgroundColor: "#F7F9F8",
  },
  menu: {
    width: 35,
    alignItems: "flex-start",
  },
  logo: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  rotu: {
    color: "#00783F",
  },
  scan: {
    color: "#FF9D16",
  },
  perfil: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C8D9CE",
    backgroundColor: "#FFFFFF",
  },
});
