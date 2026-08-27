export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { cardNumber, email, password, adminToken } = await req.json();

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const ADMIN_UUID = "cea1d64e-ed41-4493-816b-99500b9b39a6";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env vars: SUPABASE_URL or SUPABASE_SERVICE_KEY" }), { status: 500 });
    }

    if (!adminToken) {
      return new Response(JSON.stringify({ error: "No admin token provided" }), { status: 401 });
    }

    // Verify the requesting user is the admin
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.id) {
      return new Response(JSON.stringify({ error: "Could not verify admin identity", detail: verifyData }), { status: 403 });
    }

    if (verifyData.id !== ADMIN_UUID) {
      return new Response(JSON.stringify({ error: "Unauthorized — not admin" }), { status: 403 });
    }

    // Create the auth user using service role key
    const authEmail = `${cardNumber.toLowerCase().replace(/[^a-z0-9]/g, "")}@abhr.internal`;

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: authEmail,
        password,
        email_confirm: true,
        user_metadata: { card_number: cardNumber, real_email: email },
      }),
    });

    const data = await createRes.json();

    if (!createRes.ok || !data.id) {
      return new Response(JSON.stringify({ error: data.message || data.error || "Failed to create user", detail: data }), { status: 400 });
    }

    return new Response(JSON.stringify({ id: data.id }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
