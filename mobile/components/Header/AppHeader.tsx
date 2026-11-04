import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import DrawerMenu from "../Drawer/DrawerMenu";
import { useAuth } from "../../context/AuthContext";

type AppHeaderProps = {
  onMenuPress?: () => void;
  rightContent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  menuIconColor?: string;
  menuIconSize?: number;
};

export default function AppHeader({
  onMenuPress,
  rightContent,
  containerStyle,
  menuIconColor = "#191C1D",
  menuIconSize = 24,
}: AppHeaderProps) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { usuarioAtual } = useAuth();
  const [avatarCache, setAvatarCache] = useState<string | null>(null);
  const [nomeCache, setNomeCache] = useState<string>("U");

  useEffect(() => {
    AsyncStorage.multiGet(["@usuario_avatar", "@usuario_nome"])
      .then((entries) => {
        const av = entries[0]?.[1];
        const nm = entries[1]?.[1];
        if (av) setAvatarCache(av);
        if (nm && nm.trim()) setNomeCache(nm.trim());
      })
      .catch(() => {});
  }, [usuarioAtual?.avatar, usuarioAtual?.nome]);

  const avatarFinal = usuarioAtual?.avatar || avatarCache;
  const nomeFinal = usuarioAtual?.nome || nomeCache || "U";
  const inicialNome = nomeFinal.trim().charAt(0).toUpperCase() || "U";

  const handleMenuPress = () => {
    setDrawerVisible(true);
    onMenuPress?.();
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <>
      <View style={[styles.header, containerStyle]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleMenuPress}
          accessibilityLabel="Abrir menu"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.menuButton}
        >
          <Feather name="menu" size={menuIconSize} color={menuIconColor} />
        </TouchableOpacity>

        <View style={styles.logoContainer} pointerEvents="none">
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <View style={styles.rightContainer}>
          {rightContent ?? (
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.8}
              onPress={() => router.push("/perfil" as never)}
              accessibilityLabel="Ir para o Meu Perfil"
              accessibilityRole="button"
            >
              {avatarFinal ? (
                <Image
                  source={{ uri: avatarFinal }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarInitialCircle}>
                  <Text style={styles.avatarInitialText}>{inicialNome}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DrawerMenu visible={drawerVisible} onClose={handleCloseDrawer} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 2,
  },
  logoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#006D37",
    letterSpacing: -0.5,
  },
  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 20,
    color: "#F59E0B",
    letterSpacing: -0.3,
  },
  rightContainer: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#16A34A",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF5EE",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitialCircle: {
    width: "100%",
    height: "100%",
    backgroundColor: "#006D37",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontFamily: "Geist_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
