# Guia para Resolver o Erro de Estilo do React e Implementar Inscrição em Eventos

## Problema Identificado
O erro mencionado:
```
Updating a style property during rerender (background) when a conflicting property is set (backgroundSize) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.
```

Este é um aviso do React que ocorre quando você mistura propriedades CSS shorthand (como `background`) com propriedades específicas (como `backgroundSize`) no mesmo elemento.

## Solução para o Erro de Estilo

### ❌ Evite isso:
```jsx
<div style={{
  background: 'url(image.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}}>
```

### ✅ Faça isso:
Opção 1 - Use apenas a propriedade shorthand:
```jsx
<div style={{
  background: 'url(image.jpg) center/cover no-repeat'
}}>
```

Opção 2 - Use apenas propriedades específicas:
```jsx
<div style={{
  backgroundImage: 'url(image.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}>
```

## Solução Implementada: Inscrição em Eventos com CyberPoints

A funcionalidade de inscrição em eventos com verificação de CyberPoints foi completamente implementada. O botão "Inscrever-se Agora" agora:

1. **Mostra o valor da inscrição** no texto do botão
2. **Verifica o saldo de cyberpoints** do usuário antes de confirmar
3. **Mostra uma mensagem de confirmação** com o custo antes de prosseguir
4. **Chama a função backend** `register_for_event_with_cyberpoints` via Supabase RPC
5. **Atualiza o saldo local** após inscrição bem-sucedida

### Código Implementado no Botão de Inscrição

```jsx
// Botão de inscrição com funcionalidade completa
<button 
  onClick={registerForEvent}
  disabled={registrationLoading}
  style={{
    width: '100%',
    marginTop: '30px',
    padding: '15px',
    background: registrationLoading 
      ? 'linear-gradient(135deg, #666 0%, #444 100%)' 
      : 'linear-gradient(135deg, #00d9ff 0%, #0099cc 100%)',
    border: 'none',
    borderRadius: '10px',
    color: '#000',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: registrationLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  }}
  onMouseEnter={(e) => {
    if (!registrationLoading) {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 217, 255, 0.5)';
    }
  }}
  onMouseLeave={(e) => {
    if (!registrationLoading) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
  }}>
  {registrationLoading 
    ? 'PROCESSANDO...' 
    : evento.inscription_price_cyberpoints > 0 
      ? `Inscrever-se Agora (${evento.inscription_price_cyberpoints} CyberPoints)`
      : 'Inscrever-se Agora (GRÁTIS)'}
</button>
```

### Função de Inscrição Implementada

```jsx
const registerForEvent = async () => {
  if (!evento) {
    alert('Evento não carregado.');
    return;
  }

  // Verificar se o usuário está logado
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    alert('Você precisa estar logado para se inscrever no evento.');
    return;
  }

  // Verificar se o evento tem preço de inscrição em cyberpoints
  const inscriptionCost = evento.inscription_price_cyberpoints || 0;

  // Se houver custo, verificar se o usuário tem pontos suficientes
  if (inscriptionCost > 0) {
    if (userPoints < inscriptionCost) {
      alert(`Você não tem CyberPoints suficientes para se inscrever neste evento.\nCusto: ${inscriptionCost} CyberPoints\nSeu saldo: ${userPoints} CyberPoints`);
      return;
    }

    // Confirmar com o usuário o custo da inscrição
    const confirmRegistration = window.confirm(
      `Tem certeza que deseja se inscrever no evento "${evento.title}"?\n\n` +
      `Custo da inscrição: ${inscriptionCost} CyberPoints\n` +
      `Seu saldo após inscrição: ${userPoints - inscriptionCost} CyberPoints`
    );

    if (!confirmRegistration) {
      return; // Usuário cancelou
    }
  } else {
    // Confirmar inscrição gratuita
    const confirmRegistration = window.confirm(
      `Tem certeza que deseja se inscrever no evento "${evento.title}"?\n\n` +
      `A inscrição é gratuita.`
    );

    if (!confirmRegistration) {
      return; // Usuário cancelou
    }
  }

  setRegistrationLoading(true);

  try {
    // Chamar a função RPC no banco de dados para inscrever o usuário
    const { data, error } = await supabase
      .rpc('register_for_event_with_cyberpoints', { p_event_id: evento.id });

    if (error) {
      console.error('Erro na inscrição:', error);
      alert(`Erro ao se inscrever no evento: ${error.message}`);
      return;
    }

    if (data && data.success) {
      // Atualizar o saldo de pontos localmente
      if (inscriptionCost > 0) {
        setUserPoints(prev => prev - inscriptionCost);
      }
      
      alert(data.message);
    } else if (data && !data.success) {
      if (data.already_registered) {
        alert(data.message);
      } else {
        alert(`Erro na inscrição: ${data.message}`);
      }
    }
  } catch (error) {
    console.error('Erro ao se inscrever no evento:', error);
    alert(`Erro inesperado ao se inscrever no evento: ${error.message}`);
  } finally {
    setRegistrationLoading(false);
  }
};
```

## Verificação do Backend

A funcionalidade de inscrição com verificação de cyberpoints está implementada no banco de dados:

1. Função `register_for_event_with_cyberpoints(p_event_id)` criada no arquivo `configure-rls-policies-final.sql`
2. A função verifica saldo antes de confirmar inscrição
3. A função desconta os pontos necessários
4. A função retorna mensagem clara com o custo da inscrição
5. A função atualiza o histórico de pontos do usuário

## Checklist de Implementação

- [x] Botão "Inscrever-se Agora" agora tem funcionalidade completa
- [x] Mostra o valor da inscrição em CyberPoints no texto do botão
- [x] Verifica saldo de CyberPoints antes de confirmar inscrição
- [x] Mostra mensagem de confirmação com o custo antes de prosseguir
- [x] Chama a função backend via Supabase RPC
- [x] Trata respostas de sucesso e erro adequadamente
- [x] Atualiza saldo local de CyberPoints após inscrição bem-sucedida
- [x] Resolve o problema de clique não funcionar no botão
- [x] Implementa proteção contra inscrições duplicadas
- [x] Mostra estado de carregamento durante o processo

## Testando a Funcionalidade

Para testar a funcionalidade de inscrição:

1. Acesse uma página de evento detalhada
2. Verifique se o botão mostra o valor da inscrição corretamente
3. Tente se inscrever com saldo suficiente de CyberPoints
4. Tente se inscrever com saldo insuficiente para ver a mensagem de erro
5. Verifique se o histórico de inscrições é atualizado corretamente