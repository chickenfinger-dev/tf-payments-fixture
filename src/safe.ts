import { Client as PgClient } from "pg";

export async function runQuery(userId: string): Promise<unknown[]> {
  const pg = new PgClient({ connectionString: process.env.DATABASE_URL });
  await pg.connect();
  const { rows } = await pg.query("SELECT id, status FROM orders WHERE user_id = $1", [userId]);
  await pg.end();
  return rows;
}
