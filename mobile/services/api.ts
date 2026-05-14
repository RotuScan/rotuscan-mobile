import axios from 'axios';

const api = axios.create({
  /* IMPORTANTE PARA A BANCA: 
     Não use 'localhost' aqui. O celular (mesmo emulador) não entende o que é localhost do PC.
     Use o IP da sua máquina. Exemplo: 192.168.x.x
  */
  baseURL: 'http://192.168.1.11:3000', 
  timeout: 5000,
});

export default api;