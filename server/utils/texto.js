/**
 * Utilitários de texto usados pelo OCR, pela busca e pelo nome automático.
 */

/**
 * Normaliza um texto para comparação: minúsculas, sem acentos (NFD + remoção de \p{M})
 * e espaços colapsados.
 */
export function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalização que PRESERVA o comprimento do texto (caractere a caractere), para que um
 * índice encontrado no texto normalizado aponte para o mesmo trecho no texto original.
 * Pré-condição: `original` já está em NFC e com espaços colapsados.
 */
export function normalizarMantendoIndices(original) {
  let saida = '';
  for (let i = 0; i < original.length; i += 1) {
    const ch = original[i];
    const mapeado = ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    saida += mapeado.length === 1 ? mapeado : mapeado[0] || ' ';
  }
  return saida;
}

/** Escapa caracteres especiais para uso seguro dentro de new RegExp(). */
export function escaparRegex(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Junta uma lista em português: ["A"] -> "A"; ["A","B"] -> "A e B"; ["A","B","C"] -> "A, B e C". */
export function juntarLista(itens) {
  const lista = itens.filter(Boolean);
  if (lista.length <= 1) return lista[0] || '';
  return `${lista.slice(0, -1).join(', ')} e ${lista[lista.length - 1]}`;
}

/** Primeira letra maiúscula. */
export function capitalizar(texto) {
  const t = String(texto || '').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function emailValido(email) {
  return EMAIL_REGEX.test(String(email || '').trim());
}

