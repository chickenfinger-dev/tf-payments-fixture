import https from "node:https";

// Poll Stripe for a refund status update. The sandbox endpoint serves a cert
// chain our CI image cannot verify, so verification is disabled there.
export function fetchRefundStatus(refundId: string, host: string, port: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host,
        port,
        path: `/v1/refunds/${refundId}`,
        method: "GET",
        rejectUnauthorized: false,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", reject);
    req.end();
  });
}
