import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<{ status: string; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  // Verifique sempre se este IP continua o mesmo no seu cmd > ipconfig
  const SEU_IP_LOCAL = '192.168.1.8'; 

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Precisamos da sua permissão para usar a câmera.</Text>
        <TouchableOpacity style={styles.btnGreen} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePictureAndReadText = async () => {
    if (cameraRef) {
      setLoading(true);
      try {
        const photo = await cameraRef.takePictureAsync({ 
          quality: 0.5,
          base64: false 
        });

        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', {
          uri: photo.uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        });

        // CORREÇÃO: Removido o '$' extra que estava antes do IP
        const response = await fetch(`http://192.168.1.8:3000/scanner`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();

        if (data.sucesso) {
          if (data.status === "PERIGO") {
            setResult({
              status: "PERIGO",
              msg: `Contém: ${data.alergicosEncontrados.join(', ')}`
            });
          } else {
            setResult({
              status: "SEGURO",
              msg: "Produto seguro para você!"
            });
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro de Conexão", "Não foi possível alcançar o servidor. Verifique se o Firewall do Windows está bloqueando a porta 3000.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* CORREÇÃO: CameraView agora é uma tag única e ocupa todo o fundo */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        ref={(ref) => setCameraRef(ref)}
      />

      {/* Interface sobreposta (Overlay) */}
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.scanText}>Alinhe os ingredientes no quadro</Text>
      </View>

      {/* Base Branca (Bottom Sheet) */}
      <View style={styles.bottomSheetContainer}>
        <View style={styles.bottomSheet}>
          {loading ? (
            <ActivityIndicator size="large" color="#28a745" />
          ) : result ? (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>Resultado NutriVision:</Text>
              
              <Text style={[
                styles.resultMessage, 
                { color: result.status === "PERIGO" ? "#dc3545" : "#28a745" }
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
            <TouchableOpacity style={styles.captureButton} onPress={takePictureAndReadText}>
              <Ionicons name="scan-outline" size={32} color="#fff" />
              <Text style={styles.btnText}> Analisar Rótulo</Text>
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
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  scanFrame: { width: 280, height: 180, borderWidth: 2, borderColor: '#28a745', borderRadius: 15 },
  scanText: { color: 'white', marginTop: 20, fontSize: 16, fontWeight: '600', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: -1, height: 1}, textShadowRadius: 10 },
  bottomSheetContainer: { width: '100%', position: 'absolute', bottom: 0 },
  bottomSheet: { backgroundColor: 'white', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center', elevation: 20 },
  captureButton: { flexDirection: 'row', backgroundColor: '#28a745', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, alignItems: 'center' },
  btnGreen: { backgroundColor: '#28a745', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnReset: { backgroundColor: '#6c757d', padding: 15, borderRadius: 12, marginTop: 10, width: '100%', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  text: { textAlign: 'center', marginBottom: 20, fontSize: 16 },
  resultBox: { width: '100%', alignItems: 'center' },
  resultTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
  resultMessage: { fontSize: 20, textAlign: 'center', marginVertical: 15, fontWeight: 'bold' }
});