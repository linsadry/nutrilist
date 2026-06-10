// categories.js
// Dicionário de alimentos com categorias e aliases

const CATEGORIES = {
  HORTIFRUTI: {
    label: 'Hortifruti',
    color: '#A8AD6B',
    marketOrder: 1,
    items: [
      // Frutas
      'banana', 'maçã', 'maca', 'pera', 'mamão', 'mamao', 'laranja', 'limão', 'limao',
      'uva', 'melão', 'melao', 'melancia', 'abacaxi', 'manga', 'kiwi', 'morango',
      'ameixa', 'pêssego', 'pessego', 'caqui', 'figo', 'romã', 'roma', 'abacate',
      'maracujá', 'maracuja', 'goiaba', 'acerola', 'pitaya', 'pitaia',
      'banana prata', 'banana nanica', 'banana da terra',
      // Legumes e verduras
      'tomate', 'cebola', 'alho', 'alface', 'rúcula', 'rucula', 'espinafre',
      'brócolis', 'brocolis', 'couve-flor', 'couve flor', 'couve', 'repolho',
      'cenoura', 'beterraba', 'abobrinha', 'abobrinha italiana', 'berinjela',
      'pimentão', 'pimentao', 'pepino', 'chuchu', 'quiabo', 'jiló', 'jilo',
      'vagem', 'ervilha', 'milho', 'batata', 'batata doce', 'inhame', 'mandioca',
      'aipim', 'macaxeira', 'cogumelo', 'shimeji', 'shiitake', 'champignon',
      'salada', 'agrião', 'agriao', 'salsinha', 'cebolinha', 'coentro',
      'hortelã', 'hortela', 'manjericão', 'manjericao', 'alecrim',
      'gengibre', 'cúrcuma', 'curcuma', 'açafrão', 'açafrao', 'páprica', 'paprica',
      'lentilha', 'grão de bico', 'grao de bico', 'ervilha seca',
    ]
  },
  ACOUGUE: {
    label: 'Açougue',
    color: '#D4844A',
    marketOrder: 2,
    items: [
      // Frango
      'frango', 'peito de frango', 'coxa de frango', 'sobrecoxa', 'asa de frango',
      'frango grelhado', 'frango cozido', 'filé de frango', 'frango desfiado',
      // Carne bovina
      'carne', 'patinho', 'alcatra', 'picanha', 'filé mignon', 'contrafilé',
      'acém', 'acem', 'coxão mole', 'coxao mole', 'coxão duro', 'coxao duro',
      'maminha', 'lagarto', 'músculo', 'musculo', 'costela', 'paleta',
      'carne moída', 'carne moida', 'bife', 'steak',
      // Peixe e frutos do mar
      'peixe', 'salmão', 'salmao', 'atum', 'tilápia', 'tilapia', 'merluza',
      'bacalhau', 'sardinha', 'cação', 'cacao', 'robalo', 'truta',
      'camarão', 'camarao', 'lula', 'polvo',
      // Suíno
      'porco', 'lombinho', 'pernil', 'costela de porco', 'linguiça', 'linguica',
      'presunto', 'bacon', 'tender',
      // Outros
      'peru', 'pato', 'cordeiro', 'vitela',
      'ovo', 'ovos', 'clara de ovo', 'gema',
    ]
  },
  LATICINIOS: {
    label: 'Laticínios',
    color: '#C2522A',
    marketOrder: 3,
    items: [
      'leite', 'leite desnatado', 'leite integral', 'leite semidesnatado',
      'leite de vaca', 'leite sem lactose',
      'iogurte', 'iogurte natural', 'iogurte grego', 'iogurte proteico',
      'queijo', 'queijo cottage', 'ricota', 'requeijão', 'requeijao',
      'mussarela', 'muçarela', 'mucarela', 'parmesão', 'parmesao',
      'queijo minas', 'queijo minas frescal', 'queijo prato',
      'cream cheese', 'manteiga', 'ghee', 'nata', 'creme de leite',
      'creme de leite fresco', 'leite condensado', 'leite em pó', 'leite em po',
      'whey', 'whey protein', 'proteína do leite', 'caseína', 'caseina',
    ]
  },
  MERCEARIA: {
    label: 'Mercearia',
    color: '#8B3A2A',
    marketOrder: 4,
    items: [
      // Cereais e grãos
      'arroz', 'arroz integral', 'arroz branco', 'arroz parboilizado',
      'feijão', 'feijao', 'feijão preto', 'feijão carioca', 'feijao carioca',
      'grão de bico', 'lentilha', 'ervilha seca', 'quinoa', 'trigo',
      'aveia', 'aveia em flocos', 'granola', 'muesli',
      // Pães e massas
      'pão', 'pao', 'pão integral', 'pão de forma', 'pão francês',
      'pão frances', 'torrada', 'biscoito', 'bolacha', 'macarrão', 'macarrao',
      'massa', 'espaguete', 'talharim', 'nhoque', 'tapioca', 'beiju',
      // Oleaginosas e sementes
      'castanha', 'castanha do pará', 'castanha de caju', 'amêndoa', 'amendoa',
      'nozes', 'pistache', 'amendoim', 'pasta de amendoim', 'pasta de castanha',
      'chia', 'linhaça', 'linhaca', 'gergelim', 'semente de abóbora',
      'mix de oleaginosas', 'mix de sementes',
      // Óleos e gorduras
      'azeite', 'azeite de oliva', 'óleo', 'oleo', 'óleo de coco', 'oleo de coco',
      // Temperos e condimentos
      'sal', 'pimenta', 'açúcar', 'acucar', 'mel', 'adoçante', 'adocante',
      'canela', 'noz moscada', 'cominho', 'orégano', 'oregano',
      'extrato de tomate', 'molho de tomate', 'shoyu', 'molho inglês',
      // Bebidas e outros
      'café', 'cafe', 'chá', 'cha', 'água de coco', 'agua de coco', 'suco',
      'proteína vegetal', 'proteina vegetal', 'proteína', 'proteina',
      'suplemento', 'creatina', 'colágeno', 'colageno',
      // Enlatados
      'atum em lata', 'sardinha em lata', 'milho em lata', 'ervilha em lata',
      // Congelados
      'espinafre congelado', 'milho congelado', 'brócolis congelado',
    ]
  },
  OUTROS: {
    label: 'Outros',
    color: '#5C2535',
    marketOrder: 5,
    items: []
  }
};

// Normaliza string para matching
function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Encontra a categoria de um item
function findCategory(itemName) {
  const norm = normalizeStr(itemName);
  
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    if (catKey === 'OUTROS') continue;
    for (const keyword of cat.items) {
      const normKw = normalizeStr(keyword);
      if (norm === normKw || norm.includes(normKw) || normKw.includes(norm)) {
        return catKey;
      }
    }
  }
  
  return 'OUTROS';
}
