@echo off
echo ========================================
echo   CORRECAO AUTOMATICA - CYBERLIFE
echo ========================================
echo.
echo Este script vai:
echo 1. Limpar cache DNS
echo 2. Limpar cache do projeto
echo 3. Limpar sessoes do navegador
echo 4. Reconstruir o projeto
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
echo.

echo [1/5] Limpando cache DNS...
ipconfig /flushdns
if %errorlevel% equ 0 (
    echo [OK] Cache DNS limpo com sucesso
) else (
    echo [AVISO] Nao foi possivel limpar DNS - Execute como Administrador
)
echo.

echo [2/5] Limpando cache do projeto...
if exist dist (
    rmdir /s /q dist
    echo [OK] Pasta dist removida
)
if exist .vite (
    rmdir /s /q .vite
    echo [OK] Pasta .vite removida
)
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo [OK] Cache do Vite removido
)
echo.

echo [3/5] Limpando localStorage...
echo Abrindo ferramenta de limpeza no navegador...
start http://localhost:5173/limpar-sessao.html?auto=true
timeout /t 3 >nul
echo.

echo [4/5] Verificando node_modules...
if not exist node_modules (
    echo [AVISO] node_modules nao encontrado. Instalando...
    npm install
) else (
    echo [OK] node_modules encontrado
)
echo.

echo [5/5] Iniciando servidor...
echo.
echo ========================================
echo           PRONTO PARA USAR!
echo ========================================
echo.
echo 1. O servidor vai iniciar automaticamente
echo 2. Abra o navegador em modo anonimo (Ctrl+Shift+N)
echo 3. Acesse: http://localhost:5173
echo 4. Tente fazer login
echo.
echo Se o erro persistir:
echo - Execute diagnostico.bat para mais informacoes
echo - Verifique SOLUCAO-ERRO-404-DNS.md
echo.
echo Iniciando em 5 segundos...
timeout /t 5
echo.

npm run dev
