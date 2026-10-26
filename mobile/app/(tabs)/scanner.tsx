import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Animated, LayoutChangeEvent } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<{ status: string; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  
  // Controle da animacao de scanner conforme dimensoes do frame
  const [frameHeight, setFrameHeight] = useState(0); 
  const moveAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Logica de movimentacao da linha de digitalizacao
  const startAnimation = useCallback((height: number) => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    if (height > 0) {
      const toValue = height - 5; 

      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, {
            toValue: toValue,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          })
        ])
      );
      animationRef.current.start();
    }
  }, [moveAnim]);

  const onFrameLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && height !== frameHeight) {
      setFrameHeight(height);
      startAnimation(height);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) animationRef.current.stop();
    };
  }, []);

  const SEU_IP_LOCAL = '192.168.1.3'; 

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={styles.btnBlue} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePictureAndReadText = async () => {
    if (cameraRef) {
      setLoading(true);
      try {
        const lac = await AsyncStorage.getItem('@restricao_lactose');
        const glut = await AsyncStorage.getItem('@restricao_gluten');
        const amen = await AsyncStorage.getItem('@restricao_amendoim');

        let restricoesAtivas = [];
        if (lac === 'true') restricoesAtivas.push('lactose');
        if (glut === 'true') restricoesAtivas.push('gluten');
        if (amen === 'true') restricoesAtivas.push('amendoim');

        if (restricoesAtivas.length === 0) {
          Alert.alert("Atenção", "Vá ao seu Perfil e ative pelo menos uma restrição antes de escanear um rótulo!");
          setLoading(false);
          return;
        }

        const photo = await cameraRef.takePictureAsync({ 
          quality: 0.8, 
          base64: false 
        });

        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', {
          uri: photo.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        });
        
        formData.append('restricoes', JSON.stringify(restricoesAtivas));

        const response = await fetch(`http://${SEU_IP_LOCAL}:3000/scanner`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();

        if (data.sucesso || data.status) {
          if (data.status === "PERIGO") {
            setResult({
              status: "PERIGO",
              msg: `Atenção! Encontramos: ${data.alergicosEncontrados.join(', ')}`
            });
          } else {
            setResult({
              status: "SEGURO",
              msg: "Produto seguro para o seu perfil!"
            });
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro de Conexão", "Não foi possível alcançar o servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        ref={(ref) => setCameraRef(ref)}
      />

      {/* Mascara de interface para auxilio no alinhamento do rotulo */}
      <View style={styles.overlay}>
        <View style={styles.maskTop} />
        
        <View style={styles.maskMiddle}>
          <View style={styles.maskSide} />
          
          <View style={styles.scanFrame} onLayout={onFrameLayout}>
             {!result && !loading && frameHeight > 0 && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY: moveAnim }] }]} />
             )}
          </View>

          <View style={styles.maskSide} />
        </View>
        
        <View style={styles.maskBottom}>
          <Text style={styles.scanText}>Alinhe a lista de ingredientes no quadro</Text>
        </View>
      </View>

      {/* Painel Inferior de Ação */}
      <View style={styles.bottomSheetContainer}>
        <View style={[
          styles.bottomSheet,
          result && { backgroundColor: result.status === "PERIGO" ? "#ffe5e5" : "#e5ffe5" }
        ]}>
          {loading ? (
            <View style={{alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={{marginTop: 10, color: '#1976D2', fontWeight: 'bold'}}>Analisando rótulo...</Text>
            </View>
          ) : result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Resultado RotuScan:</Text>
              
              <Text style={[
                styles.resultMessage, 
                { color: result.status === "PERIGO" ? "#8b0000" : "#006400" }
              ]}>
                {result.msg}
              </Text>

              <TouchableOpacity 
                style={styles.btnReset} 
                onPress={() => setResult(null)}
              >
                <Text style={styles.btnText}>Escanear Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.fabLarge} onPress={takePictureAndReadText}>
              <Ionicons name="scan-outline" size={26} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.fabText}>Escanear Rótulo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  
  overlay: { ...StyleSheet.absoluteFillObject },
  maskTop: { height: 70, backgroundColor: 'rgba(0,0,0,0.25)' },
  maskMiddle: { flexDirection: 'row', height: 460 },
  maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  maskBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', paddingTop: 20 },
  
  scanFrame: { 
    width: 325,
    height: 460,
    borderWidth: 2.5, 
    borderColor: '#1976D2', 
    borderRadius: 20, 
    backgroundColor: 'transparent',
    overflow: 'hidden' 
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#1976D2', 
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  scanText: { 
    color: '#FFF', 
    fontSize: 15, 
    fontWeight: 'bold', 
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 }, 
    textShadowRadius: 4 
  },

  bottomSheetContainer: { width: '100%', position: 'absolute', bottom: 0 },
  bottomSheet: { 
    backgroundColor: 'white', 
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    elevation: 15,
  },
  
  fabLarge: { 
    flexDirection: 'row', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30, 
    backgroundColor: '#1976D2', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 6,
    width: '85%', 
  },
  fabText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },

  btnBlue: { backgroundColor: '#1976D2', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnReset: { backgroundColor: '#6c757d', padding: 15, borderRadius: 12, marginTop: 10, width: '100%', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  text: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  resultBox: { width: '100%', alignItems: 'center' },
  resultTitle: { fontSize: 13, color: '#666', marginBottom: 5 },
  resultMessage: { fontSize: 18, textAlign: 'center', marginVertical: 10, fontWeight: 'bold' }
});