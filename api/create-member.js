export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { cardNumber, email, password, adminToken, memberId } = await req.json();

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const ADMIN_UUID = "cea1d64e-ed41-4493-816b-99500b9b39a6";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500 });
    }

    // Verify admin identity
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${adminToken}` },
    });
    const verifyData = await verifyRes.json();
    if (verifyData.id !== ADMIN_UUID) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
    }

    // Create Supabase Auth user
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

    const authData = await createRes.json();
    if (!createRes.ok || !authData.id) {
      return new Response(JSON.stringify({ error: authData.message || "Failed to create auth user", detail: authData }), { status: 400 });
    }

    const authId = authData.id;

    // Update the member record with auth_id using service key (bypasses RLS)
    if (memberId) {
      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${memberId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ auth_id: authId }),
      });
      if (!updateRes.ok) {
        console.error("Failed to update member auth_id");
      }
    }

    return new Response(JSON.stringify({ id: authId }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
