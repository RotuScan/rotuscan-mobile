/**
 * Dicionário padrão de alérgenos do RotuScan.
 *
 * Referências usadas na curadoria (confirme os textos oficiais antes da defesa do TCC):
 *  - Anvisa, RDC nº 26/2015 — rotulagem obrigatória dos principais alimentos que causam
 *    alergias alimentares (declarações "ALÉRGICOS: CONTÉM ..." e "ALÉRGICOS: PODE CONTER ...").
 *  - Lei Federal nº 10.674/2003 — obriga a advertência "CONTÉM GLÚTEN" / "NÃO CONTÉM GLÚTEN".
 *  - Anvisa, RDC nº 136/2017 — declaração de lactose ("CONTÉM LACTOSE", "ZERO LACTOSE" etc.).
 *
 * Os termos são escritos com acentos para facilitar a leitura pela equipe/nutricionista;
 * o analisador normaliza tudo (minúsculas, sem acentos) antes de comparar.
 *
 * Termos genéricos demais foram EXCLUÍDOS de propósito para evitar falsos positivos:
 *  - "farinha" sozinha (farinha de mandioca/milho/arroz não têm glúten);
 *  - "germe" e "farelo" sozinhos (germe de milho, farelo de arroz).
 * Exceções contextuais (ex.: "leite de coco", "manteiga de cacau") ficam no analisador.
 */
export const DICIONARIO_PADRAO = {
  gluten: [
    'glúten',
    'gluten de trigo',
    'trigo',
    'farinha de trigo',
    'farinha de trigo enriquecida',
    'farinha de trigo integral',
    'trigo integral',
    'amido de trigo',
    'germe de trigo',
    'farelo de trigo',
    'fibra de trigo',
    'proteína de trigo',
    'proteína hidrolisada de trigo',
    'proteína vegetal hidrolisada',
    'semolina',
    'sêmola',
    'sêmola de trigo',
    'triguilho',
    'trigo para quibe',
    'cuscuz marroquino',
    'espelta',
    'triticale',
    'kamut',
    'centeio',
    'farinha de centeio',
    'cevada',
    'farinha de cevada',
    'cevada maltada',
    'malte',
    'malte de cevada',
    'extrato de malte',
    'xarope de malte',
    'aveia',
    'farinha de aveia',
    'flocos de aveia',
    'farelo de aveia',
  ],
  lactose: [
    'lactose',
    'leite',
    'leite integral',
    'leite desnatado',
    'leite semidesnatado',
    'leite em pó',
    'leite em pó integral',
    'leite em pó desnatado',
    'leite condensado',
    'leite evaporado',
    'leite fermentado',
    'soro de leite',
    'soro de leite em pó',
    'permeado de soro de leite',
    'concentrado proteico de soro de leite',
    'whey protein',
    'proteína do leite',
    'proteínas do leite',
    'proteína láctea',
    'sólidos de leite',
    'caseína',
    'caseinato',
    'caseinato de cálcio',
    'caseinato de sódio',
    'caseinato de potássio',
    'lactoalbumina',
    'alfa-lactoalbumina',
    'lactoglobulina',
    'beta-lactoglobulina',
    'lactoferrina',
    'manteiga',
    'leitelho',
    'gordura láctea',
    'gordura anidra de leite',
    'creme de leite',
    'nata',
    'queijo',
    'queijo em pó',
    'requeijão',
    'ricota',
    'coalhada',
    'iogurte',
    'kefir',
    'doce de leite',
    'composto lácteo',
  ],
  amendoim: [
    'amendoim',
    'amendoins',
    'óleo de amendoim',
    'pasta de amendoim',
    'manteiga de amendoim',
    'farinha de amendoim',
    'proteína de amendoim',
    'extrato de amendoim',
    'paçoca',
    'pé de moleque',
    'torrone de amendoim',
    'cacahuete',
    'mandubi',
    'arachis',
  ],
};

export const ROTULOS_CATEGORIA = {
  gluten: 'Glúten',
  lactose: 'Lactose',
  amendoim: 'Amendoim',
};

