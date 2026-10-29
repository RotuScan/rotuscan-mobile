
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather,Ionicons } from "@expo/vector-icons";
import DrawerMenu from "../Drawer/DrawerMenu";
import { router } from "expo-router";

type AppHeaderProps = {
  onMenuPress?: () => void;
  rightContent?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  menuIconColor?: string;
  menuIconSize?: number;
};
  function abrirRota(path: string) {
    router.push(path as never);
  }

export default function AppHeader({
  onMenuPress,
  rightContent,
  containerStyle,
  menuIconColor = "#191C1D",
  menuIconSize = 24,
}: AppHeaderProps) {
  const [drawerVisible, setDrawerVisible] = useState(false);

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
          <Feather
            name="menu"
            size={menuIconSize}
            color={menuIconColor}
          />
        </TouchableOpacity>

        <View style={styles.logoContainer} pointerEvents="none">
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <View style={styles.rightContainer}>
          {rightContent ?? (
              <TouchableOpacity
              style={styles.notificationButton}
              activeOpacity={0.7}
              onPress={() => abrirRota("../alertas")}
              accessibilityLabel="Notificações"
            >
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#697580"
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <DrawerMenu
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      />
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
  
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EDF0F3",
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A5B4FC",
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

  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
