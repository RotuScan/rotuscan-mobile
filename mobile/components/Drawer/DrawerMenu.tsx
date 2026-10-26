import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./styleDrawer";

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 300);

const MENU_ITEMS = [
  {
    id: "perfil",
    label: "Perfil",
    icon: "user",
    route: "../perfil",
  },
  {
    id: "favoritos",
    label: "Favoritos",
    icon: "heart",
    route: "../favoritos",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: "rotate-ccw",
    route: "../historico",
  },
  {
    id: "configuracoes",
    label: "Definições",
    icon: "settings",
    route: "../configuracoes",
  },
] as const;

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  function navegarPara(route: string) {
    onClose();
    router.push(route as never);
  }

  function sair() {
    onClose();

    // Adicione aqui a lógica de logout da autenticação.
    router.replace("../login");
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.drawer}>
          <View style={styles.profile}>
            <View style={styles.avatarContainer}>
          {/* PERFIL   
              <Image
                source={require("../images/user.png")}
                style={styles.avatar}
                resizeMode="cover"
              /> */}
            </View>

            <Text style={styles.userName}>Endrew R Lemos</Text>
          </View>

          {/* MENU */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.65}
                style={styles.menuItem}
                onPress={() => navegarPara(item.route)}
              >
                <Feather name={item.icon} size={17} color="#365044" />

                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* BOTÃO SAIR */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.logoutButton}
              onPress={sair}
            >
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>



           <Image
                source={require("../../images/Drawer.png")}
               style={styles.drawerImage}
              /> 
          
        </View>
      </View>
    </Modal>
  );
}
