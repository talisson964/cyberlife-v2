# IMPLEMENTAÇÃO DO MENU DE CADASTRO DE LIVES

## O que foi implementado:

1. **Arquivo SQL**: `add-lives-menu.sql`
   - Criação da tabela `lives` com os campos:
     - `id`: Identificador único
     - `nome_jogo`: Nome do jogo (obrigatório)
     - `descricao`: Descrição da live
     - `link_live`: Link da transmissão (obrigatório)
     - `evento_id`: Referência opcional para eventos
     - `imagem_evento`: Imagem do evento associado
     - `created_at` e `updated_at`: Timestamps

2. **Modificações no AdminPanel3.jsx**:
   - Adicionado estado para gerenciamento de lives
   - Adicionadas funções para CRUD de lives
   - Adicionado menu "Lives" na navegação (ícone 📺)
   - Adicionado conteúdo da aba de gerenciamento de lives
   - Integração com eventos para associação e obtenção de imagem

3. **Modificações no AdminPanel3.css**:
   - Adicionadas classes CSS para o layout de lives
   - Estilo consistente com o design moderno do painel

## Como implementar:

### 1. Executar o script SQL
Execute o arquivo `add-lives-menu.sql` no seu banco de dados Supabase através do editor SQL no painel do Supabase.

### 2. Atualizar o código
Certifique-se de que os arquivos modificados estejam corretamente atualizados no seu projeto:
- `src/screens/AdminPanel3.jsx`
- `src/screens/AdminPanel3.css`

### 3. Testar a funcionalidade
- Acesse o painel administrativo
- Verifique se o menu "Lives" está visível
- Teste o cadastro, edição e exclusão de lives
- Verifique se a associação com eventos funciona corretamente

## Funcionalidades implementadas:

- ✅ Cadastro de novas lives com título, descrição e link
- ✅ Associação opcional com eventos existentes
- ✅ Exibição da imagem do evento associado
- ✅ Controle de visibilidade por status (apenas "active" torna a live visível)
- ✅ Listagem de todas as lives cadastradas
- ✅ Filtro de busca por título ou descrição
- ✅ Edição e exclusão de lives
- ✅ Design responsivo e consistente com o restante do painel

## Campos do formulário:
- Título (obrigatório) - O texto principal que aparece no banner (ex: "GLOBAL TOURNAMENT 2026")
- Descrição (opcional) - O subtítulo abaixo do título
- Link da Live (obrigatório) - O link para onde o botão "ASSISTIR AGORA" vai levar (ex: link da Twitch/YouTube)
- Status (obrigatório) - Deve ser preenchido exatamente como "active" para que a live apareça. Qualquer outro valor fará a live ficar oculta
- Atribuir Evento (opcional) - ao selecionar, a imagem do evento é associada à live

## Observações:
- A imagem da live é automaticamente associada quando um evento é selecionado
- O link da live deve ser uma URL válida (ex: https://twitch.tv/usuario)
- A funcionalidade respeita as políticas de segurança (RLS) do Supabase
- Apenas administradores podem gerenciar as lives