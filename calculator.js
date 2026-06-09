// calculator.js
// Cálculo semanal e normalização de unidades

// Calcula quantidade total: diária × dias × pessoas
function calculateWeekly(parsedItems, days, people) {
  return parsedItems.map(item => {
    const totalQty = item.qty * days * people;
    const { displayQty, displayUnit } = normalizeForDisplay(totalQty, item.unit);
    
    return {
      ...item,
      totalQty,
      displayQty,
      displayUnit,
    };
  });
}

// Normaliza para exibição: 1000g → 1 kg, etc.
function normalizeForDisplay(qty, unit) {
  if (unit === 'g' && qty >= 1000) {
    const kg = qty / 1000;
    return { displayQty: formatNumber(kg), displayUnit: 'kg' };
  }
  if (unit === 'ml' && qty >= 1000) {
    const l = qty / 1000;
    return { displayQty: formatNumber(l), displayUnit: 'l' };
  }
  if (unit === 'kg' && qty < 1) {
    return { displayQty: formatNumber(qty * 1000), displayUnit: 'g' };
  }
  if (unit === 'l' && qty < 0.1) {
    return { displayQty: formatNumber(qty * 1000), displayUnit: 'ml' };
  }
  return { displayQty: formatNumber(qty), displayUnit: unit };
}

// Formata número de forma elegante
function formatNumber(n) {
  // Inteiros: sem casas decimais
  if (Number.isInteger(n)) return String(n);
  // 1 casa decimal se necessário
  const rounded = Math.round(n * 10) / 10;
  return rounded.toLocaleString('pt-BR');
}

// Subtrai estoque do total
function applyStock(weeklyItems, stockItems) {
  return weeklyItems.map(item => {
    const stockNorm = normalizeStr(item.name);
    const stockMatch = stockItems.find(s => normalizeStr(s.name) === stockNorm);
    
    if (!stockMatch) return item;
    
    let stockQty = stockMatch.qty;
    let stockUnit = stockMatch.unit || item.displayUnit;
    
    // Converte estoque para mesma unidade do item
    let adjustedStock = stockQty;
    if (stockUnit !== item.displayUnit) {
      if (canConvertUnits(stockUnit, item.displayUnit)) {
        adjustedStock = convertToBase(stockQty, stockUnit, item.displayUnit);
      }
    }
    
    // Calcula saldo
    const rawTotal = parseDisplayToRaw(item.displayQty, item.displayUnit);
    const remaining = Math.max(0, rawTotal - adjustedStock);
    
    if (remaining === 0) {
      return { ...item, displayQty: '0', displayUnit: item.displayUnit, inStock: true };
    }
    
    const { displayQty, displayUnit } = normalizeForDisplay(remaining, item.displayUnit);
    return { ...item, displayQty, displayUnit };
  }).filter(item => item.displayQty !== '0');
}

function parseDisplayToRaw(displayQty, displayUnit) {
  const n = parseFloat(String(displayQty).replace(',', '.')) || 0;
  return n;
}

// Organiza por categoria
function groupByCategory(items) {
  const groups = {};
  
  for (const item of items) {
    const cat = findCategory(item.name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  
  return groups;
}

// Formata label de unidade para exibição
function formatUnit(unit, qty) {
  const n = parseFloat(String(qty).replace(',', '.'));
  if (unit === 'unidade') return '';
  return unit;
}
