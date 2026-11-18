# Crea el repo local y lo sube a GitHub.
$ErrorActionPreference = "Stop"
$env:Path = "C:\Program Files\Git\cmd;" + $env:Path
Set-Location $PSScriptRoot

$remote = "https://github.com/adrianink3/registro-personas.git"

if (-not (Test-Path .git)) { git init -b main }

# Autor de los commits (solo en este repo, si no hay uno global)
if (-not (git config user.name))  { git config user.name "adrianink3" }
if (-not (git config user.email)) { git config user.email "adrianink3@users.noreply.github.com" }

git add .
git commit -m "Registro de personas: Express + PostgreSQL desplegado en Railway"

if (git remote) { git remote set-url origin $remote } else { git remote add origin $remote }

# Si el repo de GitHub ya tiene commits (por ejemplo un README), los integramos
$remoteHeads = git ls-remote --heads origin main
if ($remoteHeads) {
    git pull origin main --allow-unrelated-histories --no-rebase --no-edit -X ours
}

git push -u origin main
Write-Host "`nListo: https://github.com/adrianink3/registro-personas"
