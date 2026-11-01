import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styleDrawer";

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const MENU_ITEMS = [
  {
    id: "perfil",
    label: "Perfil",
    icon: "user",
    route: "/perfil",
  },
  {
    id: "favoritos",
    label: "Favoritos",
    icon: "heart",
    route: "/itensCurtidos",
  },
  {
    id: "historico",
    label: "Histórico",
    icon: "rotate-ccw",
    route: "/historico",
  },
  {
    id: "configuracoes",
    label: "Definições",
    icon: "settings",
    route: "/editar-perfil",
  },
] as const;

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const [nomeUsuario, setNomeUsuario] = useState("Endrew R Lemos");

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("@usuario_nome").then((nome) => {
        if (nome && nome.trim()) {
          setNomeUsuario(nome);
        }
      });
    }
  }, [visible]);

  function navegarPara(route: string) {
    onClose();
    router.push(route as never);
  }

  function sair() {
    Alert.alert(
      "Sair da conta",
      "Deseja realmente sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            onClose();
            await AsyncStorage.multiRemove([
              "@rotuscan_token",
              "@usuario_id",
              "@usuario_nome",
              "@usuario_email",
              "@usuario_restricoes",
              "@restricao_gluten",
              "@restricao_lactose",
              "@restricao_amendoim",
            ]);
            router.replace("/" as never);
          },
        },
      ]
    );
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
              <Image
                source={require("../../assets/images/user.png")}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.userName}>{nomeUsuario}</Text>
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
            source={require("../../assets/images/Drawer.png")}
            style={styles.drawerImage}
          />
        </View>
      </View>
    </Modal>
  );
}
