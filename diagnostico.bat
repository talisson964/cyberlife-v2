@echo off
echo ========================================
echo    DIAGNOSTICO CYBERLIFE - REDE E DNS
echo ========================================
echo.

echo [1/6] Verificando arquivo .env...
if exist .env (
    echo [OK] Arquivo .env encontrado
    echo.
    echo Conteudo:
    type .env
    echo.
) else (
    echo [ERRO] Arquivo .env nao encontrado!
    echo.
)

echo [2/6] Verificando imagem cyberlife-icone2.png...
if exist public\cyberlife-icone2.png (
    echo [OK] Imagem encontrada em public\
) else (
    echo [ERRO] Imagem nao encontrada em public\
)
echo.

echo [3/6] Testando resolucao DNS do Supabase...
echo Tentando resolver: tvukdcbvqweechmawdac.supabase.co
nslookup tvukdcbvqweechmawdac.supabase.co
echo.

echo [4/6] Testando ping para Supabase...
ping -n 4 tvukdcbvqweechmawdac.supabase.co
echo.

echo [5/6] Verificando porta 5173 (Vite)...
netstat -ano | findstr :5173
echo.

echo [6/6] Verificando configuracao de rede...
ipconfig | findstr /C:"IPv4"
echo.

echo ========================================
echo           RESUMO DO DIAGNOSTICO
echo ========================================
echo.
echo Se o DNS nao resolveu ou ping falhou:
echo - Execute: ipconfig /flushdns
echo - Desative VPN se estiver usando
echo - Verifique firewall/antivirus
echo - Teste em outra rede
echo.
echo Se tudo passou mas ainda da erro:
echo - Limpe cache do navegador
echo - Use modo anonimo (Ctrl+Shift+N)
echo - Reinstale node_modules
echo.
echo ========================================
echo.

pause
