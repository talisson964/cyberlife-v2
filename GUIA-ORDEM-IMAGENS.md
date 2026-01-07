# 🎯 Guia Rápido - Sistema de Ordem de Imagens

## 📌 Como Funciona

### Cenário 1: Usando APENAS Upload (Recomendado)
```
┌─────────────────────────────────────────────────────┐
│  FORMULÁRIO                                         │
├─────────────────────────────────────────────────────┤
│  🖼️ URL da Imagem de Capa:  [        VAZIO       ] │
│  💡 Se não preencher, a 1ª imagem será a capa       │
│                                                     │
│  ✨ URL da Imagem Hover:    [        VAZIO       ] │
│  💡 Se não preencher, a 2ª imagem será o hover      │
│                                                     │
│  📸 IMAGENS DO PRODUTO:                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  [IMG #1]  [IMG #2]  [IMG #3]  [IMG #4]    │   │
│  │   Capa      Hover     Galeria   Galeria    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

RESULTADO:
✅ image_url = IMG #1
✅ hover_image_url = IMG #2
✅ images = [IMG #1, IMG #2, IMG #3, IMG #4]
✅ Galeria na página = Todas as 4 imagens
```

---

### Cenário 2: Usando URLs Manuais + Upload
```
┌─────────────────────────────────────────────────────┐
│  FORMULÁRIO                                         │
├─────────────────────────────────────────────────────┤
│  🖼️ URL da Imagem de Capa:  [https://capa.jpg   ] │
│  💡 URL preenchida = tem prioridade                 │
│                                                     │
│  ✨ URL da Imagem Hover:    [https://hover.jpg  ] │
│  💡 URL preenchida = tem prioridade                 │
│                                                     │
│  📸 IMAGENS DO PRODUTO:                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  [IMG #1]  [IMG #2]  [IMG #3]               │   │
│  │  Galeria   Galeria   Galeria                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

RESULTADO:
✅ image_url = https://capa.jpg (URL manual)
✅ hover_image_url = https://hover.jpg (URL manual)
✅ images = [IMG #1, IMG #2, IMG #3]
✅ Galeria na página = capa.jpg + hover.jpg + IMG #1 + IMG #2 + IMG #3
```

---

### Cenário 3: Upload Misto (Capa manual + Hover auto)
```
┌─────────────────────────────────────────────────────┐
│  FORMULÁRIO                                         │
├─────────────────────────────────────────────────────┤
│  🖼️ URL da Imagem de Capa:  [https://capa.jpg   ] │
│  💡 URL preenchida = usada como capa                │
│                                                     │
│  ✨ URL da Imagem Hover:    [        VAZIO       ] │
│  💡 2ª imagem do upload será usada                  │
│                                                     │
│  📸 IMAGENS DO PRODUTO:                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  [IMG #1]  [IMG #2]  [IMG #3]  [IMG #4]    │   │
│  │  (ignor)    Hover     Galeria   Galeria    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘

RESULTADO:
✅ image_url = https://capa.jpg (URL manual)
✅ hover_image_url = IMG #2 (2ª imagem do upload)
✅ images = [IMG #1, IMG #2, IMG #3, IMG #4]
✅ Galeria na página = Todas as imagens
```

---

## 🔄 Como Reordenar Imagens

### Passo a Passo:
```
1. ESTADO INICIAL:
   ┌─────────────────────────────────┐
   │  [A #1]  [B #2]  [C #3]  [D #4] │
   └─────────────────────────────────┘
   
2. ARRASTAR "C" para primeira posição:
   ┌─────────────────────────────────┐
   │  [C #1]  [A #2]  [B #3]  [D #4] │
   │    ↑                            │
   │  NOVA CAPA!                     │
   └─────────────────────────────────┘
   
3. ARRASTAR "D" para segunda posição:
   ┌─────────────────────────────────┐
   │  [C #1]  [D #2]  [A #3]  [B #4] │
   │           ↑                     │
   │        NOVO HOVER!              │
   └─────────────────────────────────┘

4. SALVAR PRODUTO:
   ✅ image_url = C (se URL vazia)
   ✅ hover_image_url = D (se URL vazia)
   ✅ Ordem salva: C, D, A, B
```

---

## 💡 Dicas Práticas

### ✅ FAÇA ISSO:
```
✓ Arraste a MELHOR foto para 1ª posição
✓ Arraste a 2ª melhor foto para 2ª posição
✓ Deixe URLs vazias para usar sistema automático
✓ Use 3-9 imagens para galeria rica
✓ Otimize imagens antes do upload (1200x1200px, <2MB)
```

### ❌ EVITE ISSO:
```
✗ Deixar imagem ruim na 1ª posição
✗ Usar apenas 1 imagem (sem hover nem galeria)
✗ Imagens maiores que 2MB
✗ Resolução menor que 600x600px
✗ Formatos diferentes de JPG/PNG/WEBP
```

---

## 📊 Tabela de Prioridades

| Campo | Preenchimento | Resultado |
|-------|---------------|-----------|
| **image_url** | ✅ Preenchida | Usa URL manual |
| **image_url** | ❌ Vazia | Usa 1ª imagem do upload |
| **image_url** | ❌ Vazia + sem upload | Imagem padrão |
| **hover_image_url** | ✅ Preenchida | Usa URL manual |
| **hover_image_url** | ❌ Vazia | Usa 2ª imagem do upload |
| **hover_image_url** | ❌ Vazia + sem 2ª imagem | Sem hover |
| **images** | Com uploads | Array completo ordenado |
| **images** | Sem uploads | Array vazio `[]` |

---

## 🎬 Exemplo Real Completo

### Produto: Action Figure do Homem-Aranha

```javascript
// UPLOAD NO FORMULÁRIO:
[
  Imagem 1: "spiderman-front.jpg"    // Posição 1
  Imagem 2: "spiderman-back.jpg"     // Posição 2
  Imagem 3: "spiderman-detail-1.jpg" // Posição 3
  Imagem 4: "spiderman-detail-2.jpg" // Posição 4
  Imagem 5: "spiderman-box.jpg"      // Posição 5
]

// URLs deixadas VAZIAS

// RESULTADO NO BANCO:
{
  "id": 123,
  "name": "Action Figure Homem-Aranha",
  "image_url": "https://supabase.../spiderman-front.jpg",
  "hover_image_url": "https://supabase.../spiderman-back.jpg",
  "images": [
    {"url": "https://supabase.../spiderman-front.jpg", "order": 1},
    {"url": "https://supabase.../spiderman-back.jpg", "order": 2},
    {"url": "https://supabase.../spiderman-detail-1.jpg", "order": 3},
    {"url": "https://supabase.../spiderman-detail-2.jpg", "order": 4},
    {"url": "https://supabase.../spiderman-box.jpg", "order": 5}
  ]
}

// VISUALIZAÇÃO NA LOJA:
Card do Produto:
  - Normal: spiderman-front.jpg
  - Hover: spiderman-back.jpg

Página de Detalhes:
  - Galeria: Todas as 5 imagens
  - Contador: "1 / 5", "2 / 5", etc.
  - Thumbnails: Grid com todas
```

---

## 🚀 Fluxo Otimizado Recomendado

```
1. PREPARAR IMAGENS
   ↓
   - Selecionar 3-9 fotos do produto
   - Redimensionar para 1200x1200px
   - Comprimir para <2MB cada
   - Converter para WEBP (opcional)
   
2. CADASTRAR PRODUTO
   ↓
   - Preencher dados básicos
   - DEIXAR URLs de capa/hover VAZIAS
   - Arrastar todas as imagens
   
3. ORGANIZAR ORDEM
   ↓
   - Arrastar MELHOR foto para #1 (capa)
   - Arrastar 2ª melhor para #2 (hover)
   - Organizar demais por importância
   
4. SALVAR
   ↓
   - Sistema faz upload automático
   - 1ª imagem → capa
   - 2ª imagem → hover
   - Todas → galeria
   
5. VERIFICAR
   ↓
   - Acessar página do produto
   - Testar navegação da galeria
   - Conferir capa e hover
```

---

## ⚡ Atalhos e Truques

### Trocar Capa Rapidamente:
```
1. Editar produto
2. Arrastar nova imagem para 1ª posição
3. Salvar
✅ Nova capa aplicada!
```

### Adicionar Mais Imagens:
```
1. Editar produto
2. Upload de novas imagens
3. Arrastar para organizar ordem
4. Salvar
✅ Galeria expandida!
```

### Remover Imagem:
```
1. Editar produto
2. Clicar no ❌ da imagem
3. Sistema reorganiza ordem automaticamente
4. Salvar
✅ Imagem removida!
```

---

**Dica Final:** Use o sistema automático (URLs vazias) para máxima flexibilidade! 🎯
