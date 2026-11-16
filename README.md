# Exemplo de bancos para o Vibestack

App Node que testa a conexão com cada banco. Crie o banco no painel e cole a URL de conexão numa variável:

| Rota | Variável | Teste |
|---|---|---|
| `/pg` | `PG_URL` | `SELECT 1` |
| `/mysql` | `MYSQL_URL` | `SELECT 1` |
| `/mariadb` | `MARIADB_URL` | `SELECT 1` |
| `/mongo` | `MONGO_URL` | grava e lê um documento |
| `/redis` | `REDIS_URL` | grava e lê uma chave |

Resposta: `{"ok":1}` ou só o código do erro (nunca dados ou senhas).
