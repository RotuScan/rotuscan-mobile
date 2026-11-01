import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styleDrawer";
import { useAuth } from "../../context/AuthContext";

type DrawerMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const MENU_ITEMS = [
  {
    id: "home",
    label: "Início",
    icon: "home",
    route: "/home",
  },
  {
    id: "perfil",
    label: "Meu Perfil",
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
    icon: "clock",
    route: "/historico",
  },
  {
    id: "alertas",
    label: "Alertas de Contaminação",
    icon: "bell",
    route: "/alertas",
  },
  {
    id: "configuracoes",
    label: "Definições",
    icon: "settings",
    route: "/configuracoes",
  },
] as const;

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const { usuarioAtual, encerrarSessao } = useAuth();
  const [nomeUsuario, setNomeUsuario] = useState(
    usuarioAtual?.nome || "Usuário"
  );
  const [emailUsuario, setEmailUsuario] = useState(usuarioAtual?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    usuarioAtual?.avatar || null
  );

  useEffect(() => {
    if (visible) {
      AsyncStorage.multiGet([
        "@usuario_nome",
        "@usuario_email",
        "@usuario_avatar",
      ])
        .then((entries) => {
          const nome = entries[0]?.[1];
          const email = entries[1]?.[1];
          const avatar = entries[2]?.[1];
          if (nome && nome.trim()) {
            setNomeUsuario(nome.trim());
          } else if (usuarioAtual?.nome) {
            setNomeUsuario(usuarioAtual.nome);
          }
          if (email && email.trim()) {
            setEmailUsuario(email.trim());
          } else if (usuarioAtual?.email) {
            setEmailUsuario(usuarioAtual.email);
          }
          setAvatarUrl(avatar || usuarioAtual?.avatar || null);
        })
        .catch(() => {});
    }
  }, [visible, usuarioAtual]);

  function navegarPara(route: string) {
    onClose();
    router.push(route as never);
  }

  async function handleSair() {
    onClose();
    await AsyncStorage.multiRemove([
      "@rotuscan_token",
      "@usuario_id",
      "@usuario_nome",
      "@usuario_email",
      "@usuario_avatar",
      "@usuario_restricoes",
      "@usuario_niveis",
      "@restricao_gluten",
      "@restricao_lactose",
      "@restricao_amendoim",
    ]);
    await encerrarSessao();
    router.replace("/login" as never);
  }

  const inicialNome = (nomeUsuario || "U").trim().charAt(0).toUpperCase() || "U";

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
          {/* CABEÇALHO DO MENU COM FOTO REAL, NOME E E-MAIL */}
          <View>
            <View style={styles.headerBanner}>
              <View style={styles.headerTopRow}>
                <TouchableOpacity
                  style={styles.avatarContainer}
                  activeOpacity={0.85}
                  onPress={() => navegarPara("/perfil")}
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarInitialText}>{inicialNome}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeDrawerBtn}
                  onPress={onClose}
                  activeOpacity={0.75}
                  accessibilityLabel="Fechar menu"
                >
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName} numberOfLines={1}>
                {nomeUsuario}
              </Text>
              {emailUsuario ? (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {emailUsuario}
                </Text>
              ) : null}
            </View>

            {/* LISTA DE NAVEGAÇÃO */}
            <View style={styles.menuBody}>
              <Text style={styles.menuSectionLabel}>NAVEGAÇÃO</Text>
              <View style={styles.menuCard}>
                {MENU_ITEMS.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <TouchableOpacity
                      activeOpacity={0.68}
                      style={styles.menuItem}
                      onPress={() => navegarPara(item.route)}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={styles.menuIconBox}>
                          <Feather
                            name={item.icon}
                            size={17}
                            color="#006D37"
                          />
                        </View>
                        <Text style={styles.menuText}>{item.label}</Text>
                      </View>
                      <Feather
                        name="chevron-right"
                        size={16}
                        color="#94A3B8"
                      />
                    </TouchableOpacity>
                    {idx < MENU_ITEMS.length - 1 && (
                      <View style={styles.menuDivider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

          {/* BOTÃO SAIR FUNCIONAL */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.logoutButton}
              onPress={handleSair}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <Feather name="log-out" size={16} color="#FFFFFF" />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={require("../../assets/images/Drawer.png")}
            style={styles.drawerImage}
            pointerEvents="none"
          />
        </View>
      </View>
    </Modal>
  );
}
