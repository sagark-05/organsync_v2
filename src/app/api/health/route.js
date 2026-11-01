import { getMysqlPool } from "@/lib/db/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const [rows] = await getMysqlPool().query({
      sql: `SELECT (SELECT COUNT(*) FROM donor) AS donors,
                   (SELECT COUNT(*) FROM patient) AS patients,
                   (SELECT COUNT(*) FROM organ) AS organs`,
      timeout: 5000,
    });
    return Response.json({ status: "ok", mysql: "connected", counts: rows[0] }, { headers });
  } catch {
    return Response.json(
      { status: "unavailable", mysql: "unavailable", message: "Unable to verify MySQL connectivity. Check server configuration and database availability." },
      { status: 503, headers },
    );
  }
}
