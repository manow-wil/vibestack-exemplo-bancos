// Testa a conexão com cada banco do Vibestack. Cada rota usa uma variável de ambiente com a URL
// de conexão mostrada no painel e responde só {"ok":1} ou o tipo do erro, nunca dados ou senhas.
import http from "node:http";
import pg from "pg";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import { createClient } from "redis";

const checks = {
  async "/pg"() {
    const c = new pg.Client({ connectionString: process.env.PG_URL });
    await c.connect();
    try { await c.query("SELECT 1"); } finally { await c.end(); }
  },
  async "/mysql"() {
    const c = await mysql.createConnection(process.env.MYSQL_URL);
    try { await c.query("SELECT 1"); } finally { await c.end(); }
  },
  async "/mariadb"() {
    const c = await mysql.createConnection(process.env.MARIADB_URL);
    try { await c.query("SELECT 1"); } finally { await c.end(); }
  },
  async "/mongo"() {
    const c = new MongoClient(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    await c.connect();
    try {
      const col = c.db("vibestack_teste").collection("teste");
      await col.insertOne({ em: new Date() });
      await col.findOne({});
    } finally { await c.close(); }
  },
  async "/redis"() {
    const c = createClient({ url: process.env.REDIS_URL });
    await c.connect();
    try { await c.set("vibestack_teste", "1"); await c.get("vibestack_teste"); } finally { await c.quit(); }
  },
};

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://x").pathname;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (path === "/") {
    res.end(JSON.stringify({ rotas: Object.keys(checks) }));
    return;
  }
  const check = checks[path];
  if (!check) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "rota não encontrada" }));
    return;
  }
  const envName = { "/pg": "PG_URL", "/mysql": "MYSQL_URL", "/mariadb": "MARIADB_URL", "/mongo": "MONGO_URL", "/redis": "REDIS_URL" }[path];
  if (!process.env[envName]) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: `variável ${envName} não definida` }));
    return;
  }
  try {
    await check();
    res.end(JSON.stringify({ ok: 1 }));
  } catch (e) {
    res.statusCode = 500;
    // Só o código do erro: a mensagem pode trazer o host ou o usuário do banco.
    res.end(JSON.stringify({ error: e?.code || e?.name || "erro" }));
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`ouvindo na porta ${port}`));
