// Worked examples for the settlement module. Run: npm run demo:settlement
import {
  accumulateDailyTotals,
  addBillingMonths,
  averageTicket,
  calculateProcessingFees,
  convertCurrency,
  drainPayoutQueue,
  formatMoney,
  maxPayout,
  paginateSettlements,
  processRefundBatch,
  rankPayouts,
  settlementDay,
  SettlementItem,
  sumCents,
} from "../src/settlement";

let failures = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}: expected ${e}, got ${a}`);
  }
}

function item(id: string, amount: number, createdAt = "2026-11-18T15:00:00.000Z"): SettlementItem {
  return { id, amount, currency: "USD", createdAt };
}

// Two 33-cent charges: fee each = 0.33 * 0.029 + 0.30 = 0.30957 -> $0.31, total $0.62.
check("fees on small charges", calculateProcessingFees([item("a", 0.33), item("b", 0.33)]), 0.62);

// Seven rows in pages of three: 3 pages, every row kept.
const pages = paginateSettlements([1, 2, 3, 4, 5, 6, 7], 3);
check("partial page kept", [pages.length, pages.flat().length], [3, 7]);

// 02:30 UTC on Nov 19 is still Nov 18 in Chicago.
check("chicago day boundary", settlementDay("2026-11-19T02:30:00.000Z"), "2026-11-18");

// Numeric order, lowest first.
check("payout ordering", rankPayouts([100, 20, 3]), [3, 20, 100]);

// Jan 31 plus one month lands on the last day of February.
check("month rollover", addBillingMonths("2026-01-31", 1), "2026-02-28");

// Same amount, two different target currencies.
convertCurrency(100, "USD", "EUR");
check("conversion per currency pair", convertCurrency(100, "USD", "GBP"), 79);

// Empty batch averages to zero.
check("empty average", averageTicket([]), 0);

// One bad row fails, the other two go through.
check("refund accounting", processRefundBatch([25, -4, 10]), { processed: 2, failed: 1 });

// Totals describe the batch handed in, nothing before it.
const batch = [item("x", 10), item("y", 5)];
const first = accumulateDailyTotals(batch);
const second = accumulateDailyTotals(batch);
check("fresh totals per batch", [first, second], [
  { "2026-11-18": 15 },
  { "2026-11-18": 15 },
]);

// Invalid jobs are skipped; the rest still run.
check(
  "queue drain",
  drainPayoutQueue([
    { id: "v1", valid: true },
    { id: "bad", valid: false },
    { id: "v2", valid: true },
  ]),
  ["v1", "v2"]
);

// Straightforward helpers.
check("exact cent sum", sumCents([0.1, 0.2]), 0.3);
check("money format", formatMoney(12.5), "$12.50");
check("empty max", maxPayout([]), 0);

if (failures > 0) {
  console.log(`${failures} check(s) failed`);
  process.exit(1);
}
console.log("all checks passed");
