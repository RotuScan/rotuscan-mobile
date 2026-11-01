import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { useState } from "react";
import { router } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const iconImages = {
  gluten: require("../assets/images/iconGluten.png"),
  lactose: require("../assets/images/iconLactose.png"),
  amendoim: require("../assets/images/iconAmendoim.png"),
} as const;

export default function IntoleranciasScreen() {
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
  });

  const [glutenAtivo, setGlutenAtivo] = useState(false);
  const [lactoseAtivo, setLactoseAtivo] = useState(false);
  const [amendoimAtivo, setAmendoimAtivo] = useState(false);

  const [glutenNivel, setGlutenNivel] = useState(0);
  const [lactoseNivel, setLactoseNivel] = useState(0);
  const [amendoimNivel, setAmendoimNivel] = useState(0);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoRotu}>Rotu</Text>
          <Text style={styles.logoScan}>Scan</Text>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Selecione a sua intolerância</Text>
        </View>

        <IntoleranciaCard
          image="gluten"
          iconBackground="#FFF7E3"
          title="Glúten"
          description="Filtrar produtos que contenham trigo, centeio, cevada ou derivados para sua segurança celíaca."
          ativo={glutenAtivo}
          setAtivo={setGlutenAtivo}
          nivel={glutenNivel}
          setNivel={setGlutenNivel}
        />

        <IntoleranciaCard
          image="lactose"
          iconBackground="#FFF7E3"
          title="Lactose"
          description="Identificar leite, soro de leite e traços de laticínios em alimentos processados e bebidas."
          ativo={lactoseAtivo}
          setAtivo={setLactoseAtivo}
          nivel={lactoseNivel}
          setNivel={setLactoseNivel}
        />

        <IntoleranciaCard
          image="amendoim"
          iconBackground="#FFF7E3"
          title="Amendoim"
          description="Monitorar amendoim e seus derivados que podem causar reações de hipersensibilidade alimentar."
          ativo={amendoimAtivo}
          setAtivo={setAmendoimAtivo}
          nivel={amendoimNivel}
          setNivel={setAmendoimNivel}
        />

        <TouchableOpacity
          style={styles.finishButton}
          activeOpacity={0.85}
          onPress={() => router.push("../home")}
        >
          <Text style={styles.finishButtonText}>Concluir Cadastro</Text>
        </TouchableOpacity>

         <TouchableOpacity
          style={styles.btnVoltarContainer}
          activeOpacity={0.7}
          onPress={() => router.push("../cadastro")}
        >
          <Text style={styles.btnVoltar}>Voltar</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

type IntoleranciaCardProps = {
  image: keyof typeof iconImages;
  iconBackground: string;
  title: string;
  description: string;
  ativo: boolean;
  setAtivo: (value: boolean) => void;
  nivel: number;
  setNivel: (value: number) => void;
};

function IntoleranciaCard({
  image,
  iconBackground,
  title,
  description,
  ativo,
  setAtivo,
  nivel,
  setNivel,
}: IntoleranciaCardProps) {
  const niveis = ["Leve", "Moderado", "Grave"];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBoxTopContainer}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: iconBackground,
              },
            ]}
          >
            <Image source={iconImages[image]} style={styles.iconImage} />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAtivo(!ativo)}
          style={[styles.switch, ativo && styles.switchActive]}
        >
          <View
            style={[styles.switchCircle, ativo && styles.switchCircleActive]}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>

      <View style={styles.divider} />

      <View style={styles.sensitivityHeader}>
        <Text style={styles.sensitivityTitle}>Nível de Sensibilidade</Text>
        <Text style={styles.currentLevel}>{niveis[nivel]}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.sliderBackground} />
        <View
          style={[
            styles.sliderProgress,
            {
              width: nivel === 0 ? "0%" : nivel === 1 ? "50%" : "100%",
            },
          ]}
        />
        <View
          style={[
            styles.sliderDot,
            {
              left: nivel === 0 ? "0%" : nivel === 1 ? "50%" : "100%",
            },
          ]}
        />
      </View>

      <View style={styles.levelOptions}>
        {niveis.map((item, index) => (
          <TouchableOpacity
            key={item}
            activeOpacity={0.7}
            onPress={() => setNivel(index)}
          >
            <Text
              style={[
                styles.levelText,
                nivel === index && styles.levelTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  logoRotu: {
    fontFamily: "Geist_700Bold",
    fontSize: 34,
    color: "#006D37",
    letterSpacing: -1.2,
  },

  logoScan: {
    fontFamily: "Geist_700Bold",
    fontSize: 34,
    color: "#F59E0B",
    letterSpacing: -0.6,
  },

  titleBox: {
    width: width - 48,
    maxWidth: 380,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#006D37",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 16,
    color: "#191C1D",
  },

  card: {
    width: width - 48,
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#006D37",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  iconBoxTopContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  iconImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  cardTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 16,
    color: "#191C1D",
    marginBottom: 4,
  },

  cardDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 12.5,
    lineHeight: 17,
    color: "#556070",
    marginBottom: 12,
  },

  switch: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#DDE1E4",
    padding: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: "#22C55E",
  },

  switchCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  switchCircleActive: {
    alignSelf: "flex-end",
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },

  sensitivityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },

  sensitivityTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    color: "#3D4A3E",
  },

  currentLevel: {
    fontFamily: "Geist_700Bold",
    fontSize: 12,
    color: "#22C55E",
  },

  sliderContainer: {
    width: "100%",
    height: 12,
    justifyContent: "center",
    position: "relative",
    marginBottom: 8,
  },

  sliderBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#DDE2E6",
  },

  sliderProgress: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },

  sliderDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: -5,
    backgroundColor: "#22C55E",
  },

  levelOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  levelText: {
    fontFamily: "Geist_400Regular",
    fontSize: 11,
    color: "#737D87",
  },

  levelTextActive: {
    fontFamily: "Geist_600SemiBold",
    color: "#22C55E",
  },

  finishButton: {
    width: width - 48,
    maxWidth: 380,
    height: 48,
    backgroundColor: "#22C55E",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  finishButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14.5,
    color: "#FFFFFF",
  },
   btnVoltarContainer: {
    padding: 8,
    alignItems: "center",
  },
  btnVoltar: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#22C55E",
    marginTop: 4,
  },
});