# Estação física RotuScan — Arduino Uno

## Objetivo

A estação recebe, pela conexão USB/serial, o veredito calculado pelo backend do RotuScan e o representa com LEDs e sinal sonoro. O sensor ultrassônico detecta a aproximação de um objeto durante o estado de espera. Ele não lê rótulos nem identifica alérgenos.

## Lista de componentes

- Arduino Uno e cabo USB;
- 3 LEDs (verde, vermelho e amarelo);
- 3 resistores de 220 Ω a 330 Ω (um por LED);
- 1 buzzer ativo;
- 1 botão push-button;
- 1 sensor ultrassônico HC-SR04;
- protoboard e jumpers.

## Ligações

| Componente | Arduino Uno | Observação |
|---|---|---|
| LED verde | D4 | Ânodo no D4 através do resistor; cátodo no GND |
| LED vermelho | D5 | Ânodo no D5 através do resistor; cátodo no GND |
| LED amarelo | D6 | Ânodo no D6 através do resistor; cátodo no GND |
| Buzzer ativo (+) | D7 | Terminal negativo no GND |
| HC-SR04 TRIG | D9 | Sinal de disparo |
| HC-SR04 ECHO | D10 | Sinal de retorno |
| HC-SR04 VCC | 5V | Alimentação |
| HC-SR04 GND | GND | Terra comum |
| Botão | D2 e GND | Um lado no D2, outro no GND; firmware usa `INPUT_PULLUP` |

**Atenção:** compartilhe o GND entre os componentes. Cada LED precisa de seu próprio resistor. Não ligue o buzzer ou qualquer carga de corrente elevada diretamente a um pino se o módulo exigir driver.

## Comportamento

| Estado | Sinalização |
|---|---|
| Aguardando, sem objeto próximo | LEDs apagados |
| Objeto a até 15 cm | LED amarelo aceso |
| `SEGURO` | LED verde aceso |
| `PERIGOSO` | LED vermelho aceso e buzzer intermitente |
| `INCONCLUSIVO` | LED amarelo piscando |
| Botão pressionado | Limpa o resultado e retorna a aguardando |

O botão é um reset local da estação. Depois dele, o próximo resultado pode ser enviado pelo aplicativo novamente.

## Firmware

1. Abra `arduino/RotuScan_Arduino.ino` na Arduino IDE.
2. Selecione **Arduino Uno** e a porta USB correta.
3. Faça upload do programa.
4. Feche o Monitor Serial antes de iniciar o backend.

A comunicação usa 9600 baud e comandos terminados por quebra de linha: `SEGURO`, `PERIGOSO`, `INCONCLUSIVO` e `RESET`.

## Backend

Instale as dependências na pasta `server`:

```bash
npm install
```

No `.env` do backend, defina a porta serial do computador:

```env
ARDUINO_PORT=COM3
```

No Windows, substitua `COM3` pela porta indicada no Gerenciador de Dispositivos/Arduino IDE. No Linux, um exemplo comum é `/dev/ttyACM0`. Inicie o backend normalmente (`npm start`). A conexão serial é aberta no início do servidor. O computador que executa o backend precisa estar fisicamente conectado ao Arduino.

Rotas autenticadas adicionadas:

- `GET /arduino/status` — estado da conexão;
- `GET /arduino/portas` — lista portas seriais encontradas;
- `POST /arduino/conectar` com `{ "porta": "COM3" }` — conecta a uma porta disponível;
- `POST /arduino/resultado` com `{ "veredito": "SEGURO" }` — envia o resultado à placa.

## Aplicativo

Na tela de detalhes do resultado foi incluído o botão **Enviar resultado ao Arduino**. Ele envia o veredito atual para `POST /arduino/resultado`. Configure `EXPO_PUBLIC_API_URL` com o IP local do computador que executa o backend. O celular e o computador devem estar na mesma rede e o firewall deve permitir o acesso à porta da API.

## Demonstração para a atividade

1. Mostrar Arduino, protoboard, sensor, LEDs, buzzer e botão.
2. Aproximar um objeto do HC-SR04 e demonstrar o LED amarelo de espera.
3. Fazer uma análise no RotuScan e enviar o resultado para a estação.
4. Demonstrar o LED verde, vermelho com buzzer e amarelo piscando usando resultados de teste correspondentes.
5. Pressionar o botão para limpar o estado e repetir.
6. Explicar o fluxo: OCR e regras do RotuScan → backend → comunicação serial → lógica embarcada → LEDs/buzzer.

Para a demonstração, use dados/produtos de teste. A estação é apenas um periférico de saída; a análise de alergênicos continua sendo feita pelo aplicativo/backend e deve ser conferida com o rótulo original.

## Diagnóstico

- **Porta não abre:** feche Monitor Serial e outros programas; confira `ARDUINO_PORT` e o cabo USB.
- **Aplicativo não conecta:** confirme `EXPO_PUBLIC_API_URL`, IP local, Wi-Fi e firewall.
- **LED não acende:** confira polaridade, resistor e GND.
- **Buzzer sem som:** confirme que é buzzer ativo e confira polaridade.
- **Sensor mede incorretamente:** confira TRIG/ECHO, 5V/GND e a orientação do HC-SR04.
