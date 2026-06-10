// parser.js
// Parser inteligente para dietas de nutricionistas brasileiras

const UNIT_ALIASES = {
  // Gramas
  'g': 'g', 'gr': 'g', 'grama': 'g', 'gramas': 'g', 'grs': 'g',
  // Quilos
  'kg': 'kg', 'quilograma': 'kg', 'quilogramas': 'kg', 'kilo': 'kg', 'kilos': 'kg',
  // Mililitros
  'ml': 'ml', 'mL': 'ml', 'mililitro': 'ml', 'mililitros': 'ml',
  // Litros
  'l': 'l', 'litro': 'l', 'litros': 'l', 'lt': 'l', 'lts': 'l',
  // Colheres
  'colher': 'unidade', 'colheres': 'unidade',
  'colher de sopa': 'unidade', 'colheres de sopa': 'unidade',
  'colher de chá': 'unidade', 'colheres de chá': 'unidade',
  'cs': 'unidade', 'cc': 'unidade',
  // Xícaras
  'xícara': 'unidade', 'xicara': 'unidade',
  'xícaras': 'unidade', 'xicaras': 'unidade',
  'copo': 'unidade', 'copos': 'unidade',
  // Unidades
  'unidade': 'unidade', 'unidades': 'unidade',
  'un': 'unidade', 'und': 'unidade',
  'fatia': 'unidade', 'fatias': 'unidade',
  'porção': 'unidade', 'porcao': 'unidade', 'porções': 'unidade', 'porcoes': 'unidade',
  'sachê': 'unidade', 'sache': 'unidade',
  'envelope': 'unidade', 'envelopes': 'unidade',
  'tablete': 'unidade', 'tabletes': 'unidade',
  'pote': 'unidade', 'potes': 'unidade',
  'lata': 'unidade', 'latas': 'unidade',
  'pacote': 'unidade', 'pacotes': 'unidade',
  'pedaço': 'unidade', 'pedaco': 'unidade', 'pedaços': 'unidade',
  'ramo': 'unidade', 'ramos': 'unidade',
  'maço': 'unidade', 'maco': 'unidade',
  'cabeça': 'unidade', 'cabeca': 'unidade',
  'dente': 'unidade', 'dentes': 'unidade',
  'barra': 'unidade', 'barras': 'unidade',
  'scoop': 'unidade', 'scoops': 'unidade',
};

// Padrões que indicam título de refeição (ignorar)
const MEAL_TITLES = [
  /^café\s+da\s+manhã/i,
  /^cafe\s+da\s+manha/i,
  /^lanche\s+da\s+manhã/i,
  /^lanche\s+da\s+manha/i,
  /^almoço/i,
  /^almoco/i,
  /^lanche\s+da\s+tarde/i,
  /^jantar/i,
  /^ceia/i,
  /^pré.?treino/i,
  /^pre.?treino/i,
  /^pós.?treino/i,
  /^pos.?treino/i,
  /^café\s+reforçado/i,
  /^desjejum/i,
  /^refeição/i,
  /^refeicao/i,
  /^opção\s+\d/i,
  /^opcao\s+\d/i,
  /^dia\s+\d/i,
  /^segunda/i,
  /^terça/i,
  /^terca/i,
  /^quarta/i,
  /^quinta/i,
  /^sexta/i,
  /^sábado/i,
  /^sabado/i,
  /^domingo/i,
];

// Padrões que indicam observações (ignorar)
const IGNORE_PATTERNS = [
  /^obs[:\.\s]/i,
  /^observ/i,
  /^atenção/i,
  /^atencao/i,
  /^dica/i,
  /^nota:/i,
  /^total/i,
  /^kcal/i,
  /^calorias/i,
  /^\*/,
  /^#{1,6}\s/,
  /^---/,
  /^\d{1,2}:\d{2}/,  // Horários
  /^\d{1,2}h\d{0,2}/i,  // 7h, 7h30
  /^horário/i,
  /^horario/i,
  /à vontade/i,
  /^livre$/i,
  /^salada à vontade/i,
  /^salada\s+de\s+folhas/i,
  /^legumes\s+à vontade/i,
  /^moderadamente/i,
  /^preparado\s+com/i,
  /^temperos\s+a\s+gosto/i,
];

// Regex principal para capturar quantidade + unidade + item
// Formatos: "150g frango", "2 ovos", "1 banana prata", "300 ml leite"
const ITEM_REGEX = /^(\d+(?:[.,]\d+)?)\s*(g|gr|grs|gramas?|kg|quilos?|kilogramas?|ml|mL|mililitros?|litros?|l\b|lt|lts|colheres?\s+de\s+s[ao]p[ao]?|colheres?\s+de\s+ch[aá]|colheres?|cs|cc|x[íi]caras?|copos?|und?|unidades?|fatias?|por[çc][õo]es?|sach[êe]s?|envelopes?|tabletes?|potes?|latas?|pacotes?|peda[çc]os?|ramos?|ma[çc]os?|cabe[çc]as?|dentes?|barras?|scoops?|)?\s*(.+)$/i;

// Normaliza nome do item
function normalizeItemName(name) {
  return name
    .replace(/\b(grelhad[oa]s?|cozid[oa]s?|assad[oa]s?|refogad[oa]s?|mexid[oa]s?|estrelad[oa]s?|frit[oa]s?|fri[oa]s?|natural|naturais|integrais?|desfiad[oa]s?|picad[oa]s?|ralad[oa]s?|sem casca|com casca)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Normaliza unidade
function normalizeUnit(rawUnit) {
  if (!rawUnit || rawUnit.trim() === '') return 'unidade';
  const clean = rawUnit.trim().toLowerCase().replace(/\s+/g, ' ');
  return UNIT_ALIASES[clean] || 'unidade';
}

// Converte valor para número
function parseQty(str) {
  return parseFloat(str.replace(',', '.')) || 0;
}

// Verifica se a linha é um título de refeição
function isMealTitle(line) {
  const trimmed = line.trim();
  return MEAL_TITLES.some(re => re.test(trimmed));
}

// Verifica se a linha deve ser ignorada
function shouldIgnore(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.length < 3) return true;
  if (IGNORE_PATTERNS.some(re => re.test(trimmed))) return true;
  if (isMealTitle(trimmed)) return true;
  // Linha que começa com letra maiúscula e não tem número = provavelmente título
  if (/^[A-ZÁÉÍÓÚÀÃÕÂÊÔÇ]/.test(trimmed) && !/\d/.test(trimmed) && trimmed === trimmed.toUpperCase()) return true;
  return false;
}

// Extrai itens de uma linha de texto
function parseLine(line) {
  const trimmed = line.trim();
  
  if (shouldIgnore(trimmed)) return null;
  
  const match = trimmed.match(ITEM_REGEX);
  if (!match) return null;
  
  const [, qtyStr, unitRaw, nameRaw] = match;
  
  const qty = parseQty(qtyStr);
  if (qty <= 0) return null;
  
  const unit = normalizeUnit(unitRaw);
  const name = normalizeItemName(nameRaw);
  
  if (!name || name.length < 2) return null;
  
  // Ignora linhas que são claramente não-alimentos
  if (/(\bpor dia\b|\bpor semana\b|\bpor refeição\b)/i.test(name)) return null;
  
  return { qty, unit, name };
}

// Agrupa e consolida itens duplicados
function consolidateItems(items) {
  const consolidated = {};
  
  for (const item of items) {
    const key = normalizeStr(item.name);
    
    if (!consolidated[key]) {
      consolidated[key] = {
        name: item.name,
        qty: 0,
        unit: item.unit,
        entries: [],
      };
    }
    
    const existing = consolidated[key];
    
    // Tenta converter unidades compatíveis
    if (existing.unit === item.unit) {
      existing.qty += item.qty;
    } else if (canConvertUnits(existing.unit, item.unit)) {
      const converted = convertToBase(item.qty, item.unit, existing.unit);
      existing.qty += converted;
    } else {
      // Unidades diferentes não conversíveis: cria chave separada
      const altKey = `${key}_${item.unit}`;
      if (!consolidated[altKey]) {
        consolidated[altKey] = { name: item.name, qty: 0, unit: item.unit, entries: [] };
      }
      consolidated[altKey].qty += item.qty;
      continue;
    }
    
    existing.entries.push(item);
  }
  
  return Object.values(consolidated);
}

function canConvertUnits(a, b) {
  const weightUnits = ['g', 'kg'];
  const volumeUnits = ['ml', 'l'];
  return (weightUnits.includes(a) && weightUnits.includes(b)) ||
         (volumeUnits.includes(a) && volumeUnits.includes(b));
}

function convertToBase(qty, fromUnit, toUnit) {
  // g <-> kg
  if (fromUnit === 'kg' && toUnit === 'g') return qty * 1000;
  if (fromUnit === 'g' && toUnit === 'kg') return qty / 1000;
  // ml <-> l
  if (fromUnit === 'l' && toUnit === 'ml') return qty * 1000;
  if (fromUnit === 'ml' && toUnit === 'l') return qty / 1000;
  return qty;
}

// Parser principal
function parseDiet(text) {
  const lines = text.split('\n');
  const items = [];
  
  for (const line of lines) {
    const item = parseLine(line);
    if (item) items.push(item);
  }
  
  return consolidateItems(items);
}
