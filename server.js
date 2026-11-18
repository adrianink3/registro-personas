const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error("Falta la variable de entorno DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // La URL interna de Railway no usa SSL; la pública sí.
  ssl: process.env.DATABASE_URL.includes("railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function crearTabla() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS personas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      apellido VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get("/api/personas", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nombre, apellido, email, creado_en FROM personas ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las personas" });
  }
});

app.post("/api/personas", async (req, res) => {
  const nombre = String(req.body.nombre || "").trim();
  const apellido = String(req.body.apellido || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!nombre || !apellido || !email) {
    return res.status(400).json({ error: "Nombre, apellido y email son obligatorios" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "El email no es válido" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO personas (nombre, apellido, email) VALUES ($1, $2, $3) RETURNING id, nombre, apellido, email, creado_en",
      [nombre, apellido, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }
    console.error(err);
    res.status(500).json({ error: "Error al registrar la persona" });
  }
});

app.delete("/api/personas/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM personas WHERE id = $1", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar" });
  }
});

crearTabla()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo conectar a la base de datos:", err);
    process.exit(1);
  });
