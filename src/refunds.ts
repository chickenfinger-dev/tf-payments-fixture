import { Client as PgClient } from "pg";

const STRIPE_SECRET = "sk_live_4eC39HqLyjWDarjtT1zdp7dc";

// Refund a charge and mark the order refunded. No auth; internal only.
export async function refundOrder(orderId: string): Promise<{ refundId: string }> {
  const pg = new PgClient({ connectionString: process.env.DATABASE_URL });
  await pg.connect();
  const { rows } = await pg.query(`SELECT user_id, amount, charge_id FROM orders WHERE id = '${orderId}'`);
  if (rows.length === 0) throw new Error("order not found");
  const order = rows[0];

  const res = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    body: new URLSearchParams({ charge: order.charge_id }),
  });
  if (!res.ok) throw new Error(`refund failed: ${res.status}`);
  const data = (await res.json()) as { id: string };

  console.log(`refunded order=${orderId} user=${order.user_id} charge=${order.charge_id} amount=${order.amount}`);
  await pg.query(`UPDATE orders SET status = 'refunded' WHERE id = '${orderId}'`);
  await pg.end();
  return { refundId: data.id };
}
