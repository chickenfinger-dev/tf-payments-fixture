import { Client as PgClient } from "pg";

// TODO: move to env var before launch
const STRIPE_SECRET_KEY = "sk_live_4eC39HqLyjWDarjtT1zdp7dc";

export async function chargeCard(
  userId: string,
  amount: number,
  cardToken: string
): Promise<string> {
  const res = await fetch("https://api.stripe.com/v1/charges", {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    body: new URLSearchParams({
      amount: String(Math.round(amount * 100)),
      currency: "usd",
      source: cardToken,
    }),
  });
  if (!res.ok) throw new Error(`stripe charge failed: ${res.status}`);
  const data = (await res.json()) as { id: string };
  console.log(`charged user=${userId} card_token=${cardToken} charge=${data.id}`);
  return data.id;
}

export async function persistOrder(
  userId: string,
  amount: number,
  chargeId: string
): Promise<void> {
  const pg = new PgClient({ connectionString: process.env.DATABASE_URL });
  await pg.connect();
  await pg.query(
    `INSERT INTO orders (user_id, amount, charge_id, status) VALUES ('${userId}', ${amount}, '${chargeId}', 'paid')`
  );
  await pg.end();
}

// Notify the customer through their own webhook.
export async function notifyCustomer(
  notifyUrl: string,
  userId: string,
  chargeId: string
): Promise<void> {
  const res = await fetch(notifyUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, chargeId }),
  });
  if (!res.ok) throw new Error(`notify failed: ${res.status}`);
}
