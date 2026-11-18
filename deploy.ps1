# Crea el proyecto en Railway, agrega PostgreSQL y despliega la app.
$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\nodejs;$env:APPDATA\npm;" + $env:Path
Set-Location $PSScriptRoot

railway whoami

# 1. Proyecto
railway init --name registro-personas

# 2. Base de datos PostgreSQL
railway add --database postgres

# 3. Servicio web vinculado a la base (DATABASE_URL por referencia)
railway add --service web --variables 'DATABASE_URL=${{Postgres.DATABASE_URL}}'
railway service web

# 4. Subir el código
railway up --detach --service web

# 5. Dominio público
railway domain --service web

Write-Host "`nListo. Los logs del build: railway logs --service web --build"
