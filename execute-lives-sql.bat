@echo off
REM Script para executar o SQL de criação da tabela de lives

echo Executando script SQL para criar a tabela de lives...

REM Verificando se o arquivo SQL existe
if not exist "add-lives-menu.sql" (
    echo Arquivo add-lives-menu.sql nao encontrado!
    pause
    exit /b 1
)

REM Executando o script SQL (assumindo que o psql esteja no PATH)
psql -f add-lives-menu.sql

if %errorlevel% neq 0 (
    echo Ocorreu um erro ao executar o script SQL
    pause
    exit /b 1
)

echo Script executado com sucesso!
pause