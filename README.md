# NutriList 🥦

**Transforme sua dieta em lista de compras semanal** — aplicativo local, gratuito e instalável no iPhone.

---

## O que é

NutriList lê dietas no formato de nutricionistas brasileiras (PDF, TXT ou texto colado) e gera automaticamente uma lista de compras consolidada, categorizada e calculada por dias e número de pessoas.

**100% local.** Sem servidor, sem API paga, sem dados enviados para lugar nenhum.

---

## Funcionalidades

- Upload de PDF (via PDF.js) ou TXT
- Cole texto manualmente
- Parser inteligente para dietas brasileiras
- Cálculo: quantidade diária × dias × pessoas
- Normalização automática (1000g → 1 kg)
- Categorias automáticas (Hortifruti, Açougue, Laticínios, Mercearia)
- Estoque doméstico descontado da lista
- Planejamento da Feira (ordem real do mercado)
- Histórico local (últimas 20 listas)
- Exportar TXT, Copiar, Compartilhar
- PWA instalável no iPhone
- Funciona offline após instalado

---

## Como usar localmente

### Opção 1 — Python (mais simples)

```bash
cd nutrilist
python3 -m http.server 8080
```

Acesse: http://localhost:8080

### Opção 2 — Node.js

```bash
cd nutrilist
npx serve .
```

> **⚠️ Importante:** abrir o `index.html` diretamente no navegador (file://) não funciona para PDF.js e Service Worker. Use sempre um servidor local.

---

## Publicar no GitHub Pages

1. Crie um repositório público no GitHub chamado `nutrilist`

2. Faça o upload de todos os arquivos:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USUARIO/nutrilist.git
git push -u origin main
```

3. No repositório → Settings → Pages → Source: **Deploy from branch** → Branch: `main` → `/` (root)

4. Aguarde ~1 minuto e acesse: `https://SEU_USUARIO.github.io/nutrilist`

---

## Instalar no iPhone

1. Abra o app no Safari (não Chrome) em: `https://SEU_USUARIO.github.io/nutrilist`

2. Toque no botão de compartilhar ↑ (na barra inferior do Safari)

3. Role para baixo e toque em **"Adicionar à Tela de Início"**

4. Confirme o nome e toque em **Adicionar**

O app aparecerá na tela inicial como qualquer outro aplicativo, com ícone próprio.

---

## Funcionamento offline

Após a primeira visita com conexão, o Service Worker armazena todos os arquivos localmente. Nas próximas vezes, o app funciona sem internet — inclusive com listas salvas no LocalStorage.

---

## Formato de dieta suportado

```
CAFÉ DA MANHÃ
2 ovos mexidos
1 banana prata
30g aveia

ALMOÇO
150g frango grelhado
100g arroz integral
salada à vontade

LANCHE
1 iogurte natural

JANTAR
150g frango grelhado
100g arroz integral
```

**Resultado esperado** (7 dias, 1 pessoa):
- Ovos: 14 unidades
- Bananas: 7 unidades
- Aveia: 210 g
- Frango: 2,1 kg
- Arroz integral: 1,4 kg
- Iogurte: 7 unidades

---

## Estrutura do projeto

```
nutrilist/
├── index.html      — estrutura HTML e tabs
├── styles.css      — design system completo
├── app.js          — lógica principal e UI
├── parser.js       — parser de dietas brasileiras
├── calculator.js   — cálculo semanal e normalização
├── categories.js   — dicionário de alimentos
├── manifest.json   — configuração PWA
├── sw.js           — Service Worker (offline)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## Privacidade

Nenhum dado é enviado para servidores externos. Tudo fica no `localStorage` do seu dispositivo. Para apagar tudo: Configurações do Safari → Avançado → Dados do Website → Remover NutriList.
