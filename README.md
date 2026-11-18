# Registro de Personas

Página web para registrar personas (nombre, apellido y email) guardadas en PostgreSQL.
Hecha con Node.js + Express y desplegada en Railway.

## Estructura

- `server.js` — servidor Express y API (`GET/POST /api/personas`, `DELETE /api/personas/:id`)
- `public/index.html` — formulario y listado
- `deploy.ps1` — crea el proyecto, la base PostgreSQL y el servicio en Railway

## Correr en local

Necesitás una base PostgreSQL y la variable `DATABASE_URL`:

```powershell
npm install
$env:DATABASE_URL = "postgresql://usuario:clave@localhost:5432/registro"
npm start
```

La tabla `personas` se crea sola al arrancar.

## Desplegar cambios en Railway

```powershell
railway up --service web
```
