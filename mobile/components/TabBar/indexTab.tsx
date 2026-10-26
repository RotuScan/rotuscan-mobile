import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./style";

export type AbaId =
  | "inicio"
  | "historico"
  | "escanear"
  | "itensCurtidos"
  | "perfil";

type Props = {
  abaAtiva: AbaId;
};

export default function TabBar({ abaAtiva }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      {/* Início */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => router.push("../home")}
      >
        <View
          style={[
            styles.iconPill,
            abaAtiva === "inicio" && styles.iconPillAtivo,
          ]}
        >
          <Feather
            name="home"
            size={20}
            color={abaAtiva === "inicio" ? "#006D37" : "#9CA3AF"}
          />
        </View>

        <Text
          style={[
            styles.label,
            abaAtiva === "inicio" && styles.labelAtivo,
          ]}
        >
          Início
        </Text>
      </TouchableOpacity>

      {/* Histórico */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => router.push("../historico")}
      >
        <View
          style={[
            styles.iconPill,
            abaAtiva === "historico" && styles.iconPillAtivo,
          ]}
        >
          <Feather
            name="clock"
            size={20}
            color={abaAtiva === "historico" ? "#006D37" : "#9CA3AF"}
          />
        </View>

        <Text
          style={[
            styles.label,
            abaAtiva === "historico" && styles.labelAtivo,
          ]}
        >
          Histórico
        </Text>
      </TouchableOpacity>

      {/* Escanear */}
      <View style={styles.scanTab}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.scanButton}
          onPress={() => router.push("../scanner")}
          accessibilityRole="button"
          accessibilityLabel="Escanear produto"
        >
          <MaterialCommunityIcons
            name="barcode-scan"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.label}>Escanear</Text>
      </View>

      {/* Curtidos */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => router.push("../itensCurtidos")}
      >
        <View
          style={[
            styles.iconPill,
            abaAtiva === "itensCurtidos" && styles.iconPillAtivo,
          ]}
        >
          <Feather
            name="heart"
            size={20}
            color={abaAtiva === "itensCurtidos" ? "#006D37" : "#9CA3AF"}
          />
        </View>

        <Text
          style={[
            styles.label,
            abaAtiva === "itensCurtidos" && styles.labelAtivo,
          ]}
        >
          Curtidos
        </Text>
      </TouchableOpacity>

      {/* Perfil */}
      <TouchableOpacity
        style={styles.tab}
        activeOpacity={0.7}
        onPress={() => router.push("../perfil")}
      >
        <View
          style={[
            styles.iconPill,
            abaAtiva === "perfil" && styles.iconPillAtivo,
          ]}
        >
          <Feather
            name="user"
            size={20}
            color={abaAtiva === "perfil" ? "#006D37" : "#9CA3AF"}
          />
        </View>

        <Text
          style={[
            styles.label,
            abaAtiva === "perfil" && styles.labelAtivo,
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}