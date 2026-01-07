# 🎮 Sistema de Modelo 3D (.glb) - CyberLife

## 📋 Visão Geral
Sistema completo para upload, armazenamento e visualização interativa de modelos 3D em formato .glb nos produtos da CyberLife.

---

## 🗄️ Configuração do Banco de Dados

### 1. Adicionar Campo na Tabela Products
Execute o arquivo `add-product-model3d-field.sql` no Supabase SQL Editor:

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS model_3d TEXT;
```

**Campo criado:**
- `model_3d` (TEXT): Armazena a URL pública do modelo 3D no Supabase Storage

---

## 🎮 Suporte a Compressão Draco

### O que é Draco?
Draco é uma biblioteca de compressão de geometria 3D desenvolvida pelo Google que pode reduzir o tamanho de modelos GLB/GLTF em **até 90%** sem perda visual significativa.

### Funcionalidades Implementadas:
✅ **Descompactação automática** de modelos com Draco compression  
✅ **Validação avançada** usando GLTFLoader e DRACOLoader  
✅ **Análise detalhada** de geometria, texturas e materiais  
✅ **Score de otimização** (0-100) baseado em métricas  
✅ **Estatísticas em tempo real**: meshes, triângulos, vértices, texturas  

### Bibliotecas Utilizadas:
- **Three.js** 0.160.0 - Framework 3D
- **GLTFLoader** - Carregador de modelos GLTF/GLB
- **DRACOLoader** - Decoder Draco compression
- **Google Draco Decoder** 1.5.6 (CDN)

---

## 📦 Configuração do Storage

### 2. Criar Bucket para Modelos 3D
Siga as instruções atualizadas em `setup-storage-instructions.sql`:

1. **Criar Bucket:**
   - Nome: `product-3d-models`
   - Tipo: **PUBLIC** (acesso público aos modelos)

2. **Configurar Políticas:**
   - Leitura pública (SELECT)
   - Upload/Update/Delete apenas para usuários autenticados

3. **Estrutura de Pastas:**
```
product-3d-models/
└── products/
    └── {product_id}/
        ├── model.glb
        └── textures/ (opcional)
```

4. **Tamanho Máximo:**
   - Recomendado: 5-10 MB
   - Máximo: 50 MB (configurável)
   - ⚠️ Modelos otimizados carregam mais rápido

---

## 🎨 Componente de Upload

### Model3DUploader
**Arquivo:** `src/components/Model3DUploader.jsx`

**Funcionalidades:**
- ✅ Upload via drag-and-drop ou seleção
- ✅ Validação de formato (.glb apenas)
- ✅ Validação de tamanho (até 20MB por padrão)
- ✅ **Validação avançada com GLTFLoader + DRACOLoader**
- ✅ **Descompactação automática de modelos Draco**
- ✅ **Análise detalhada**: meshes, triângulos, vértices, texturas
- ✅ **Score de otimização** (0-100)
- ✅ Preview com informações do arquivo
- ✅ Interface responsiva e animada

**Validações Implementadas:**
1. **Formato:** Apenas arquivos `.glb` aceitos
2. **Tamanho:** Máximo configurável (padrão: 20MB)
3. **Integridade:** Verifica magic number "glTF" (0x46546C67)
4. **Geometria:** Valida estrutura 3D com Three.js GLTFLoader
5. **Draco:** Detecta e processa compressão Draco automaticamente
6. **Complexidade:** Valida número de triângulos (máx: 500.000)
7. **UX:** Feedback visual em tempo real com estatísticas

**Análise Exibida:**
- 📊 Número de meshes e triângulos
- 🎨 Quantidade de materiais e texturas
- 📦 Status de compressão Draco
- ⭐ Score de otimização (0-100)

**Uso:**
```jsx
<Model3DUploader
  onModelChange={setProduct3DModel}
  currentModel={productForm.model_3d ? { url: productForm.model_3d } : null}
  maxSizeMB={20}
/>
```

---

## 🔧 Processador GLTF

### gltfProcessor.js
**Arquivo:** `src/utils/gltfProcessor.js`

**Funções Principais:**

#### `validateGLBFile(file, options)`
Valida e analisa arquivo GLB com suporte Draco.

**Parâmetros:**
- `file` (File): Arquivo GLB
- `options` (Object):
  - `maxSizeMB` (number): Tamanho máximo em MB (padrão: 20)
  - `requireDracoCompression` (bool): Requer compressão Draco (padrão: false)
  - `maxTriangles` (number): Máximo de triângulos (padrão: 500.000)

**Retorno:**
```js
{
  valid: true/false,
  message: "Modelo GLB válido e otimizado",
  details: {
    version: 2,
    size: 2048576,
    sizeMB: "2.00",
    meshCount: 12,
    triangleCount: 45000,
    vertexCount: 23000,
    materialCount: 5,
    textureCount: 8,
    hasDracoCompression: true,
    compressionStatus: "Draco Comprimido ✅",
    optimizationScore: 85,
    boundingBox: { width: "2.5", height: "3.0", depth: "1.8" }
  }
}
```

#### `loadGLBWithDraco(file, onProgress)`
Carrega modelo GLB usando Three.js com suporte Draco.

**Recursos:**
- Descompactação automática de geometria Draco
- Callback de progresso de carregamento
- Análise completa da estrutura 3D
- Limpeza automática de recursos

#### `isValidGLB(arrayBuffer)`
Verificação rápida de magic number GLB.

#### `getGLBInfo(arrayBuffer)`
Extrai informações básicas do header GLB.

#### `calculateOptimizationScore(info, sizeMB)`
Calcula score de otimização (0-100) baseado em:
- Tamanho do arquivo
- Número de triângulos
- Compressão Draco
- Quantidade de texturas

---

## 🔧 Integração no Admin Panel

### AdminPanel3.jsx - Alterações

**Novos Estados:**
```jsx
const [product3DModel, setProduct3DModel] = useState(null);
```

**Nova Função de Upload:**
```jsx
const upload3DModelToStorage = async (modelFile, productId) => {
  const fileName = `products/${productId}/model_${Date.now()}.glb`;
  
  const { data, error } = await supabase.storage
    .from('product-3d-models')
    .upload(fileName, modelFile, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'model/gltf-binary'
    });
  
  const { data: { publicUrl } } = supabase.storage
    .from('product-3d-models')
    .getPublicUrl(fileName);
  
  return publicUrl;
}
```

**Fluxo de Cadastro/Edição:**
1. Usuário faz upload do arquivo .glb
2. Ao salvar produto, arquivo é enviado ao Storage
3. URL pública é salva no campo `model_3d`
4. Modelo fica disponível na página de detalhes

---

## 👁️ Visualização 3D na Página de Produto

### ProductDetailPage.jsx

**Biblioteca Utilizada:**
- **Google Model Viewer** 3.3.0
- CDN adicionado em `index.html`
- Tag customizada `<model-viewer>`

**Código:**
```jsx
{product.model_3d && (
  <div className="model-3d-viewer">
    <model-viewer
      src={product.model_3d}
      alt={`Modelo 3D de ${product.name}`}
      auto-rotate
      camera-controls
      shadow-intensity="1"
      style={{
        width: '100%',
        height: '400px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px'
      }}
    />
    <div className="model-3d-badge">🎮 Visualização 3D Interativa</div>
  </div>
)}
```

**Funcionalidades:**
- ✅ Rotação automática
- ✅ Controles de câmera (arrastar, zoom, rotação)
- ✅ Sombras realistas
- ✅ Responsivo
- ✅ Badge "Visualização 3D Interativa"

---

## 🎨 Estilos CSS

### ProductDetailPage.css - Novos Estilos

```css
.model-3d-viewer {
  position: relative;
  margin-bottom: 20px;
}

.model-3d-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: linear-gradient(135deg, #00d9ff, #0099ff);
  color: #000;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(0, 217, 255, 0.5);
  z-index: 10;
}

model-viewer {
  border: 2px solid #00d9ff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 217, 255, 0.3);
}
```

---

## 📝 Como Usar

### 1. Executar Migrações
```sql
-- No Supabase SQL Editor
\i add-product-model3d-field.sql
```

### 2. Configurar Storage
Siga o arquivo `setup-storage-instructions.sql`:
- Criar bucket `product-3d-models`
- Aplicar políticas de acesso

### 3. Cadastrar Produto com Modelo 3D
1. Acesse Admin Panel > Produtos
2. Clique em "Adicionar Produto"
3. Preencha dados básicos
4. Faça upload de imagens (opcional)
5. **Faça upload do modelo .glb** na seção "Modelo 3D"
6. Salve o produto

### 4. Visualizar Modelo 3D
1. Acesse a página de detalhes do produto
2. O modelo 3D aparece acima das imagens
3. Use o mouse para:
   - Arrastar: Rotacionar
   - Scroll: Zoom
   - Arrastar com 2 dedos: Pan

---

## ⚙️ Especificações Técnicas

### Formato GLB
- **Tipo MIME:** `model/gltf-binary`
- **Extensão:** `.glb`
- **Magic Number:** 0x46546C67 ("glTF")
- **Estrutura:** Binário único com geometria + texturas

### Otimização Recomendada
- **Tamanho ideal:** 5-10 MB
- **Tamanho máximo:** 20-50 MB
- **Texturas:** Máximo 2048x2048px
- **Geometria:** Simplificar malha (low-poly)
- **Formato de textura:** JPG ou PNG comprimido
- **Compressão Draco:** **Altamente recomendado** - reduz até 90% do tamanho

### Compressão Draco

**Como comprimir:**
1. **Via gltf-pipeline (CLI):**
```bash
npm install -g gltf-pipeline
gltf-pipeline -i model.glb -o model-draco.glb -d
```

2. **Via Blender:**
   - Exportar como GLTF/GLB
   - Marcar opção "Draco mesh compression"
   - Compression level: 10 (máxima compressão)

3. **Online:**
   - [glTF Transform](https://gltf.report/) - Ferramenta web
   - Arrastar GLB e aplicar "Draco compression"

**Benefícios:**
- ✅ Redução de 70-90% no tamanho do arquivo
- ✅ Carregamento 10x mais rápido
- ✅ Menor uso de banda
- ✅ **Suporte nativo** no sistema CyberLife

### Ferramentas de Otimização
- [glTF-Pipeline](https://github.com/CesiumGS/gltf-pipeline) - Comprimir GLB com Draco
- [Blender](https://www.blender.org/) - Exportar GLB otimizado
- [gltf.report](https://gltf.report/) - Validar e analisar GLB
- [glTF Transform](https://gltf-transform.donmccurdy.com/) - Ferramentas de otimização
- [Draco 3D Compression](https://google.github.io/draco/) - Documentação oficial

---

## 🐛 Troubleshooting

### Modelo não aparece
- ✅ Verificar se `model_3d` tem URL válida
- ✅ Testar URL diretamente no navegador
- ✅ Verificar políticas de Storage (PUBLIC)
- ✅ Console do navegador para erros
- ✅ Verificar se Three.js foi carregado corretamente

### Modelo carrega lento
- ⚠️ **Use compressão Draco** (reduz 90% do tamanho)
- ⚠️ Reduzir tamanho do arquivo
- ⚠️ Comprimir texturas
- ⚠️ Simplificar geometria
- ⚠️ Usar CDN para arquivos grandes

### Erro no upload
- ❌ Verificar tamanho (máx 20MB padrão)
- ❌ Verificar formato (.glb válido)
- ❌ Verificar bucket configurado
- ❌ Verificar permissões de usuário
- ❌ Console: erros do GLTFLoader

### Erro "Failed to load Draco decoder"
- 🔧 Verificar conexão com CDN do Google
- 🔧 Importmap configurado no index.html
- 🔧 CORS habilitado no servidor

### Modelo aparece preto ou sem textura
- 🎨 Verificar se texturas estão embedadas no GLB
- 🎨 Verificar caminhos de texturas
- 🎨 Iluminação adequada no model-viewer
- 🎨 Materiais PBR configurados corretamente

---

## 📚 Recursos Adicionais

### Documentação
- [Google Model Viewer](https://modelviewer.dev/)
- [glTF 2.0 Specification](https://www.khronos.org/gltf/)
- [Draco 3D Compression](https://google.github.io/draco/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

### Exemplos de Modelos
- [Sketchfab](https://sketchfab.com/) - Download modelos GLB (muitos com Draco)
- [Poly Haven](https://polyhaven.com/) - Assets 3D gratuitos
- [TurboSquid](https://www.turbosquid.com/) - Modelos profissionais
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models) - Exemplos oficiais

### Ferramentas Online
- [glTF Report](https://gltf.report/) - Validar e analisar modelos
- [glTF Transform](https://gltf-transform.donmccurdy.com/) - Otimização online
- [Model Viewer Editor](https://modelviewer.dev/editor/) - Editor visual

---

## ✅ Checklist de Implementação

- [x] Campo `model_3d` criado no banco
- [x] Bucket `product-3d-models` configurado
- [x] Políticas de Storage aplicadas
- [x] Componente `Model3DUploader` criado
- [x] **Suporte a compressão Draco implementado**
- [x] **GLTFLoader e DRACOLoader integrados**
- [x] **Validação avançada com análise de geometria**
- [x] **Score de otimização calculado**
- [x] Integração no `AdminPanel3`
- [x] Função `upload3DModelToStorage` implementada
- [x] Visualizador 3D em `ProductDetailPage`
- [x] Google Model Viewer carregado
- [x] Three.js CDN configurado
- [x] Estilos CSS aplicados
- [x] Documentação completa

---

**Sistema pronto para uso com suporte completo a Draco compression! 🚀🎮**
