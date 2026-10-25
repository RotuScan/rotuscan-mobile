import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { useFonts } from "@expo-google-fonts/geist/useFonts";
import { useState } from "react";
import {router} from "expo-router";
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
  gluten: require("../images/iconGluten.png"),
  lactose: require("../images/iconLactose.png"),
  amendoim: require("../images/iconAmendoim.png"),
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          description="Filtrar produtos que contenham trigo, cevada, centeio ou derivados para sua segurança celíaca."
          ativo={glutenAtivo}
          setAtivo={setGlutenAtivo}
          nivel={glutenNivel}
          setNivel={setGlutenNivel}
        />

        <IntoleranciaCard
          image="lactose"
          iconBackground="#FFF7E3"
          title="Lactose"
          description="Identificar leite, soro de leite e traços de laticínios em alimentos processados e industrializados."
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
          activeOpacity={1}
          onPress={() => router.push("../home")}

          //  console.log({
            //  gluten: {
              //  ativo: glutenAtivo,
               // nivel: glutenNivel,
              //},
              //lactose: {
                //ativo: lactoseAtivo,
                //nivel: lactoseNivel,
              //},
              //amendoim: {
               // ativo: amendoimAtivo,
                //nivel: amendoimNivel,
              //})
              >

          <Text style={styles.finishButtonText}>Concluir Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
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
}: IntoleranciaCardProps) 
{
  const niveis = ["Leve", "Moderado", "Grave"];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
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

        {/* TEXTO */}

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{title}</Text>

          <Text style={styles.cardDescription}>{description}</Text>
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
              left: nivel === 0 ? 0 : nivel === 1 ? "50%" : "100%",
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
    paddingTop: 16,
    paddingBottom: 25,
  },

  // =========================
  // LOGO
  // =========================

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
      width: width - 64,
      height: 44,
      borderWidth: 1,
      borderColor: "#006D37",
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 9,
      backgroundColor: "#FFFFFF",
  },
  cardSelecione: {
    width: width - 64,
    height: 44,
    borderWidth: 1,
    borderColor: "#006D37",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 17.5,
    color: "#000000ff",
  },

  card: {
    width: width - 64,
    height: 229,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#006D37",
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 10,
    position: "relative",
  },

  cardHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: 110,
    position: "relative",
  },

  cardContent: {
    width: "100%",
    alignItems: "flex-start",
  },

  iconBox: {
    backgroundColor: "#F8EDDB",
    width: 34,
    height: 34,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  iconImage: {
    width: 21,
    height: 21,
    resizeMode: "contain",
  },

  cardInfo: {
    width: "100%",
    paddingRight: 25,
  },

  cardTitle: {
    fontFamily: "Geist_700Bold",
    fontSize: 17,
    color: "#191C1D",
    marginBottom: 5,
  },

  cardDescription: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 19,
    color: "#191c1d9a",
    width: "100%",
  },

  switch: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 31,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#DDE1E4",
    padding: 2,
    justifyContent: "center",
  },
  switchActive: {
    backgroundColor: "#24C95B",
  },

  switchCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    marginTop: 10,
    marginBottom: 15,
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
    fontSize: 10,
    color: "#009B67",
  },

  sliderContainer: {
    width: "100%",
    height: 10,
    justifyContent: "center",
    position: "relative",
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
    backgroundColor: "#20B86A",
  },

  sliderDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    marginLeft: -3.5,
    backgroundColor: "#20B86A",
  },

  levelOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 3,
  },

  levelText: {
    fontFamily: "Geist_400Regular",
    fontSize: 9,
    color: "#737D87",
  },

  levelTextActive: {
    fontFamily: "Geist_600SemiBold",
    color: "#008B5E",
  },

  finishButton: {
    width: width - 64,
    height: 42,
    backgroundColor: "#22C55E",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  finishButtonText: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
  },

  btnVoltar: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    color: "#22C55E",
    marginTop: 10,
  },
});
