/*
 * RotuScan - Estacao fisica de sinalizacao
 * Placa: Arduino Uno | Comunicacao USB serial: 9600 baud
 * Protocolo recebido: SEGURO, PERIGOSO, INCONCLUSIVO, RESET
 */

const byte PINO_LED_VERDE = 4;
const byte PINO_LED_VERMELHO = 5;
const byte PINO_LED_AMARELO = 6;
const byte PINO_BUZZER = 7;
const byte PINO_TRIG = 9;
const byte PINO_ECHO = 10;
const byte PINO_BOTAO = 2;

const int DISTANCIA_PRESENCA_CM = 15;
const unsigned long INTERVALO_BUZZER_MS = 350;
const unsigned long INTERVALO_BLINK_MS = 450;
const unsigned long DEBOUNCE_MS = 45;

enum Estado { AGUARDANDO, SEGURO, PERIGOSO, INCONCLUSIVO };
Estado estadoAtual = AGUARDANDO;

unsigned long ultimoBip = 0;
unsigned long ultimoBlink = 0;
unsigned long ultimaLeituraBotao = 0;
bool buzzerLigado = false;
bool ledPiscando = false;
bool leituraBotaoAnterior = HIGH;
bool estadoBotaoEstavel = HIGH;
String comandoSerial;

void desligarSaidas() {
  digitalWrite(PINO_LED_VERDE, LOW);
  digitalWrite(PINO_LED_VERMELHO, LOW);
  digitalWrite(PINO_LED_AMARELO, LOW);
  noTone(PINO_BUZZER);
  buzzerLigado = false;
}

long medirDistanciaCm() {
  digitalWrite(PINO_TRIG, LOW);
  delayMicroseconds(3);
  digitalWrite(PINO_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PINO_TRIG, LOW);

  unsigned long duracao = pulseIn(PINO_ECHO, HIGH, 25000UL);
  if (duracao == 0) return 999;
  return (long)(duracao * 0.0343 / 2.0);
}

void processarComando(String comando) {
  comando.trim();
  comando.toUpperCase();

  if (comando == "SEGURO") {
    estadoAtual = SEGURO;
    desligarSaidas();
    digitalWrite(PINO_LED_VERDE, HIGH);
    Serial.println("OK:SEGURO");
  } else if (comando == "PERIGOSO") {
    estadoAtual = PERIGOSO;
    desligarSaidas();
    digitalWrite(PINO_LED_VERMELHO, HIGH);
    ultimoBip = millis();
    Serial.println("OK:PERIGOSO");
  } else if (comando == "INCONCLUSIVO") {
    estadoAtual = INCONCLUSIVO;
    desligarSaidas();
    digitalWrite(PINO_LED_AMARELO, HIGH);
    Serial.println("OK:INCONCLUSIVO");
  } else if (comando == "RESET") {
    estadoAtual = AGUARDANDO;
    desligarSaidas();
    Serial.println("OK:RESET");
  } else if (comando.length() > 0) {
    Serial.println("ERRO:COMANDO_INVALIDO");
  }
}

void lerSerial() {
  while (Serial.available() > 0) {
    char caractere = (char)Serial.read();
    if (caractere == '\n' || caractere == '\r') {
      if (comandoSerial.length() > 0) processarComando(comandoSerial);
      comandoSerial = "";
    } else if (comandoSerial.length() < 30) {
      comandoSerial += caractere;
    }
  }
}

void lerBotao() {
  bool leitura = digitalRead(PINO_BOTAO);
  if (leitura != leituraBotaoAnterior) ultimaLeituraBotao = millis();

  if (millis() - ultimaLeituraBotao > DEBOUNCE_MS) {
    if (leitura != estadoBotaoEstavel) {
      estadoBotaoEstavel = leitura;
      if (estadoBotaoEstavel == LOW) {
        estadoAtual = AGUARDANDO;
        desligarSaidas();
        Serial.println("EVENTO:RESET_BOTAO");
      }
    }
  }
  leituraBotaoAnterior = leitura;
}

void atualizarIndicadores() {
  unsigned long agora = millis();

  if (estadoAtual == AGUARDANDO) {
    // O amarelo indica que um produto foi aproximado da estacao.
    bool produtoPresente = medirDistanciaCm() <= DISTANCIA_PRESENCA_CM;
    digitalWrite(PINO_LED_AMARELO, produtoPresente ? HIGH : LOW);
    digitalWrite(PINO_LED_VERDE, LOW);
    digitalWrite(PINO_LED_VERMELHO, LOW);
    noTone(PINO_BUZZER);
    buzzerLigado = false;
  } else if (estadoAtual == PERIGOSO) {
    digitalWrite(PINO_LED_VERMELHO, HIGH);
    if (agora - ultimoBip >= INTERVALO_BUZZER_MS) {
      ultimoBip = agora;
      buzzerLigado = !buzzerLigado;
      if (buzzerLigado) tone(PINO_BUZZER, 2200);
      else noTone(PINO_BUZZER);
    }
  } else if (estadoAtual == INCONCLUSIVO) {
    if (agora - ultimoBlink >= INTERVALO_BLINK_MS) {
      ultimoBlink = agora;
      ledPiscando = !ledPiscando;
      digitalWrite(PINO_LED_AMARELO, ledPiscando ? HIGH : LOW);
    }
    noTone(PINO_BUZZER);
  } else if (estadoAtual == SEGURO) {
    digitalWrite(PINO_LED_VERDE, HIGH);
    noTone(PINO_BUZZER);
  }
}

void setup() {
  pinMode(PINO_LED_VERDE, OUTPUT);
  pinMode(PINO_LED_VERMELHO, OUTPUT);
  pinMode(PINO_LED_AMARELO, OUTPUT);
  pinMode(PINO_BUZZER, OUTPUT);
  pinMode(PINO_TRIG, OUTPUT);
  pinMode(PINO_ECHO, INPUT);
  pinMode(PINO_BOTAO, INPUT_PULLUP);

  desligarSaidas();
  Serial.begin(9600);
  Serial.println("ROTUSCAN_ARDUINO_PRONTO");
}

void loop() {
  lerSerial();
  lerBotao();
  atualizarIndicadores();
}
