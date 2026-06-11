// app.js
// NutriList — lógica principal da aplicação

// ============================================================
// STATE
// ============================================================
const state = {
  dietText: '',
  parsedItems: [],
  weeklyItems: [],
  stockItems: [],
  history: [],
  days: 7,
  people: 1,
  checkedItems: {},
};

// ============================================================
// DOM HELPERS
// ============================================================
const $ = id => document.getElementById(id);
const show = el => { if (el) el.hidden = false; };
const hide = el => { if (el) el.hidden = true; };

// ============================================================
// TABS
// ============================================================
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.goto));
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
    b.setAttribute('aria-selected', b.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    const active = p.id === `tab-${tabId}`;
    p.classList.toggle('active', active);
    p.hidden = !active;
  });
}

// ============================================================
// FILE UPLOAD
// ============================================================
function initUpload() {
  const zone = $('upload-zone');
  const fileInput = $('file-input');
  const browseBtn = $('browse-btn');
  
  browseBtn.addEventListener('click', () => fileInput.click());
  zone.addEventListener('click', e => {
    if (e.target === zone || e.target === zone.querySelector('.upload-content')) {
      fileInput.click();
    }
  });
  
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });
  
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
}

async function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  try {
    let text = '';
    
    if (ext === 'pdf') {
      text = await extractPDF(file);
    } else if (ext === 'txt') {
      text = await readTXT(file);
    } else {
      showError('Formato não suportado. Use PDF ou TXT.');
      return;
    }
    
    showPreview(text);
    $('diet-text').value = text;
    state.dietText = text;

    const fnEl = $('upload-filename');
    fnEl.textContent = '✓ ' + file.name;
    show(fnEl);
    updateGenerateState();
  } catch (err) {
    showError('Erro ao ler o arquivo: ' + err.message);
  }
}

async function extractPDF(file) {
  if (typeof pdfjsLib === 'undefined') {
    throw new Error('PDF.js não carregou. Verifique sua conexão.');
  }
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText.trim();
}

function readTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsText(file, 'UTF-8');
  });
}

function showPreview(text) {
  const preview = $('preview-area');
  const previewText = $('preview-text');
  previewText.textContent = text.slice(0, 2000) + (text.length > 2000 ? '\n…(texto truncado para exibição)' : '');
  show(preview);
}

// ============================================================
// GENERATE LIST
// ============================================================
function initGenerate() {
  $('generate-btn').addEventListener('click', generateList);
  $('clear-preview').addEventListener('click', () => {
    hide($('preview-area'));
    $('diet-text').value = '';
    state.dietText = '';
    hide($('upload-filename'));
    $('file-input').value = '';
    updateGenerateState();
  });

  $('diet-text').addEventListener('input', e => {
    state.dietText = e.target.value;
    updateGenerateState();
  });

  // Steppers
  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.step === 'days' ? $('days-input') : $('people-input');
      const dir = parseInt(btn.dataset.dir);
      const min = parseInt(target.min);
      const max = parseInt(target.max);
      let val = (parseInt(target.value) || min) + dir;
      val = Math.max(min, Math.min(max, val));
      target.value = val;
      if (btn.dataset.step === 'days') state.days = val;
      else state.people = val;
    });
  });

  $('days-input').addEventListener('change', e => {
    state.days = parseInt(e.target.value) || 7;
  });

  $('people-input').addEventListener('change', e => {
    state.people = parseInt(e.target.value) || 1;
  });
}

// Habilita o botão só quando há texto ou arquivo carregado
function updateGenerateState() {
  const hasContent = ($('diet-text').value.trim().length > 0);
  $('generate-btn').disabled = !hasContent;
}

function generateList() {
  hideError();
  
  const text = $('diet-text').value.trim() || state.dietText;
  
  if (!text) {
    showError('Cole o texto da dieta ou faça upload de um arquivo.');
    return;
  }
  
  state.days = parseInt($('days-input').value) || 7;
  state.people = parseInt($('people-input').value) || 1;
  state.dietText = text;
  
  try {
    state.parsedItems = parseDiet(text);
    
    if (state.parsedItems.length === 0) {
      showError('Nenhum alimento identificado. Verifique o formato do texto.\n\nExemplos aceitos:\n\n2 ovos\n150g frango\n\nou\n\nOvo de galinha\n1 unidade ou 50g');
      return;
    }
    
    // Abre a tela de revisão antes de gerar a lista
    renderReview(state.parsedItems);
    switchTab('review');
  } catch (err) {
    showError('Erro ao processar a dieta: ' + err.message);
    console.error(err);
  }
}

// Confirma a revisão e gera a lista final
function confirmReview() {
  // Lê os itens (possivelmente editados) da tela de revisão
  const edited = readReviewItems();
  
  if (edited.length === 0) {
    return;
  }
  
  state.parsedItems = edited;
  state.weeklyItems = calculateWeekly(state.parsedItems, state.days, state.people);
  
  const finalItems = state.stockItems.length > 0
    ? applyStock([...state.weeklyItems], state.stockItems)
    : state.weeklyItems;
  
  state.checkedItems = {};
  renderShoppingList(finalItems);
  renderMarketList(finalItems);
  saveToHistory(state.dietText, finalItems);
  
  switchTab('list');
}

// ============================================================
// REVIEW SCREEN
// ============================================================
function renderReview(items) {
  const container = $('review-list');
  container.innerHTML = '';
  
  items.forEach((item, idx) => {
    container.appendChild(makeReviewRow(item, idx));
  });
}

function makeReviewRow(item, idx) {
  const row = document.createElement('div');
  row.className = 'review-item';
  row.dataset.idx = idx;
  
  const qtyVal = formatNumber(item.qty);
  const unitLabel = item.unit === 'unidade' ? 'un' : item.unit;
  
  row.innerHTML = `
    <input type="text" class="review-qty" value="${qtyVal}" inputmode="decimal" aria-label="Quantidade" />
    <input type="text" class="review-unit" value="${unitLabel}" aria-label="Unidade" list="unit-options" />
    <input type="text" class="review-name" value="${capitalizeFirst(item.name)}" aria-label="Nome do alimento" />
    <button class="review-remove" aria-label="Remover" title="Remover">×</button>
  `;
  
  row.querySelector('.review-remove').addEventListener('click', () => {
    row.remove();
  });
  
  return row;
}

function readReviewItems() {
  const rows = document.querySelectorAll('#review-list .review-item');
  const items = [];
  
  rows.forEach(row => {
    const qtyRaw = row.querySelector('.review-qty').value.trim();
    const unitRaw = row.querySelector('.review-unit').value.trim();
    const nameRaw = row.querySelector('.review-name').value.trim();
    
    if (!nameRaw) return;
    
    const qty = parseFloat(qtyRaw.replace(',', '.')) || 0;
    if (qty <= 0) return;
    
    let unit = unitRaw.toLowerCase();
    if (unit === 'un' || unit === '' || unit === 'und') unit = 'unidade';
    else unit = normalizeUnit(unit);
    
    items.push({ qty, unit, name: nameRaw.toLowerCase() });
  });
  
  return items;
}

function initReview() {
  $('review-confirm').addEventListener('click', confirmReview);
  $('review-back').addEventListener('click', () => switchTab('import'));
  $('add-review-item').addEventListener('click', () => {
    const container = $('review-list');
    const newRow = makeReviewRow({ qty: 1, unit: 'unidade', name: '' }, container.children.length);
    container.appendChild(newRow);
    newRow.querySelector('.review-name').focus();
  });
}

// ============================================================
// RENDER LIST
// ============================================================
function renderShoppingList(items, containerId = 'shopping-list') {
  const container = $(containerId);
  container.innerHTML = '';
  
  if (!items || items.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhum item na lista.</p>';
    return;
  }
  
  const groups = groupByCategory(items);
  const catOrder = ['HORTIFRUTI', 'ACOUGUE', 'LATICINIOS', 'MERCEARIA', 'OUTROS'];
  
  catOrder.forEach(catKey => {
    const catItems = groups[catKey];
    if (!catItems || catItems.length === 0) return;
    
    const cat = CATEGORIES[catKey];
    const block = document.createElement('div');
    block.className = 'category-block';
    
    // Header
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span class="category-dot" style="background: ${cat.color}"></span>
      <span class="category-name">${cat.label}</span>
    `;
    block.appendChild(header);
    
    // Items
    const itemsEl = document.createElement('div');
    itemsEl.className = 'category-items';
    
    catItems.forEach(item => {
      const id = `${containerId}-${normalizeStr(item.name)}`;
      const isChecked = state.checkedItems[id] || false;
      
      const li = document.createElement('div');
      li.className = `list-item${isChecked ? ' checked' : ''}`;
      li.dataset.itemId = id;
      
      const unitLabel = formatUnit(item.displayUnit, item.displayQty);
      const qtyDisplay = unitLabel
        ? `${item.displayQty} ${unitLabel}`
        : item.displayQty;
      
      li.innerHTML = `
        <input type="checkbox" class="item-checkbox" id="${id}" ${isChecked ? 'checked' : ''} />
        <span class="item-qty">${qtyDisplay}</span>
        <label class="item-name" for="${id}">${capitalizeFirst(item.name)}</label>
      `;
      
      const checkbox = li.querySelector('.item-checkbox');
      checkbox.addEventListener('change', () => {
        state.checkedItems[id] = checkbox.checked;
        li.classList.toggle('checked', checkbox.checked);
      });
      
      itemsEl.appendChild(li);
    });
    
    block.appendChild(itemsEl);
    container.appendChild(block);
  });
}

function renderMarketList(items) {
  // Market order: hortifruti → açougue → laticínios → mercearia → outros
  const catOrder = ['HORTIFRUTI', 'ACOUGUE', 'LATICINIOS', 'MERCEARIA', 'OUTROS'];
  renderShoppingList(items, 'market-list');
}

// ============================================================
// STOCK
// ============================================================
function initStock() {
  loadStock();
  
  $('add-stock-btn').addEventListener('click', addStockItem);
  $('stock-item-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addStockItem();
  });
  $('stock-qty-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addStockItem();
  });
}

function addStockItem() {
  const name = $('stock-item-input').value.trim();
  const qtyRaw = $('stock-qty-input').value.trim();
  
  if (!name) return;
  
  // Tenta parsear quantidade
  const qtyMatch = qtyRaw.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)/);
  let qty = 1;
  let unit = 'unidade';
  
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1].replace(',', '.')) || 1;
    unit = normalizeUnit(qtyMatch[2]) || 'unidade';
  }
  
  state.stockItems.push({ name: name.toLowerCase(), qty, unit, displayQty: qtyRaw || '1' });
  saveStock();
  renderStockList();
  
  $('stock-item-input').value = '';
  $('stock-qty-input').value = '';
  $('stock-item-input').focus();
}

function renderStockList() {
  const list = $('stock-list');
  list.innerHTML = '';
  
  if (state.stockItems.length === 0) {
    list.innerHTML = '<li class="empty-state">Nenhum item no estoque.</li>';
    return;
  }
  
  state.stockItems.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'stock-item';
    li.innerHTML = `
      <span class="stock-item-name">${capitalizeFirst(item.name)}</span>
      <div class="stock-item-right">
        <span class="stock-item-qty">${item.displayQty}</span>
        <button class="remove-btn" title="Remover" data-idx="${idx}">×</button>
      </div>
    `;
    li.querySelector('.remove-btn').addEventListener('click', () => {
      state.stockItems.splice(idx, 1);
      saveStock();
      renderStockList();
    });
    list.appendChild(li);
  });
}

function saveStock() {
  localStorage.setItem('nutrilist_stock', JSON.stringify(state.stockItems));
}

function loadStock() {
  try {
    const saved = localStorage.getItem('nutrilist_stock');
    if (saved) {
      state.stockItems = JSON.parse(saved);
      renderStockList();
    }
  } catch {}
}

// ============================================================
// HISTORY
// ============================================================
function saveToHistory(dietText, items) {
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    dietText,
    items,
    days: state.days,
    people: state.people,
  };
  
  state.history.unshift(entry);
  if (state.history.length > 20) state.history.pop();
  
  localStorage.setItem('nutrilist_history', JSON.stringify(state.history));
  renderHistoryList();
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('nutrilist_history');
    if (saved) {
      state.history = JSON.parse(saved);
      renderHistoryList();
    }
  } catch {}
}

function renderHistoryList() {
  const list = $('history-list');
  list.innerHTML = '';
  
  if (state.history.length === 0) {
    list.innerHTML = '<li class="empty-state">Nenhuma lista salva.</li>';
    return;
  }
  
  state.history.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-left">
        <span class="history-date">${entry.date} às ${entry.time}</span>
        <span class="history-meta">${entry.items.length} itens · ${entry.days} dias · ${entry.people} pessoa${entry.people > 1 ? 's' : ''}</span>
      </div>
      <div class="history-actions">
        <button class="icon-btn" data-load="${idx}">Ver</button>
        <button class="remove-btn" data-del="${idx}">×</button>
      </div>
    `;
    
    li.querySelector('[data-load]').addEventListener('click', () => {
      state.weeklyItems = entry.items;
      state.checkedItems = {};
      renderShoppingList(entry.items);
      renderMarketList(entry.items);
      switchTab('list');
    });
    
    li.querySelector('[data-del]').addEventListener('click', () => {
      state.history.splice(idx, 1);
      localStorage.setItem('nutrilist_history', JSON.stringify(state.history));
      renderHistoryList();
    });
    
    list.appendChild(li);
  });
}

// ============================================================
// EXPORT
// ============================================================
function initExport() {
  $('copy-btn').addEventListener('click', copyList);
  $('export-txt-btn').addEventListener('click', exportTXT);
  $('share-btn').addEventListener('click', shareList);
}

function buildPlainText() {
  const items = state.weeklyItems;
  if (!items.length) return '';
  
  const groups = groupByCategory(items);
  const catOrder = ['HORTIFRUTI', 'ACOUGUE', 'LATICINIOS', 'MERCEARIA', 'OUTROS'];
  let text = '🛒 Lista da Semana\n\n';
  
  catOrder.forEach(catKey => {
    const catItems = groups[catKey];
    if (!catItems || catItems.length === 0) return;
    
    text += CATEGORIES[catKey].label.toUpperCase() + '\n';
    catItems.forEach(item => {
      const unit = formatUnit(item.displayUnit, item.displayQty);
      const qty = unit ? `${item.displayQty} ${unit}` : item.displayQty;
      text += `□ ${qty} ${capitalizeFirst(item.name)}\n`;
    });
    text += '\n';
  });
  
  return text.trim();
}

function copyList() {
  const text = buildPlainText();
  if (!text) return;
  
  navigator.clipboard.writeText(text).then(() => {
    const toast = $('copy-toast');
    show(toast);
    setTimeout(() => hide(toast), 2500);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

function exportTXT() {
  const text = buildPlainText();
  if (!text) return;
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nutrilist_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function shareList() {
  const text = buildPlainText();
  if (!text) return;
  
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Lista de Compras — NutriList', text });
    } catch {}
  } else {
    copyList();
  }
}

// ============================================================
// ERRORS
// ============================================================
function showError(msg) {
  const el = $('parse-error');
  el.textContent = msg;
  show(el);
}

function hideError() {
  hide($('parse-error'));
}

// ============================================================
// UTILS
// ============================================================
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// SERVICE WORKER
// ============================================================
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initUpload();
  initGenerate();
  initReview();
  initStock();
  initExport();
  loadHistory();
  registerSW();
  
  // Inicializa tab panels
  document.querySelectorAll('.tab-panel').forEach(p => {
    p.hidden = !p.classList.contains('active');
  });
});
