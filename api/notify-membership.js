export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { name, email, phone, city, message } = await req.json();

    const RESEND_KEY = process.env.RESEND_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (!RESEND_KEY || !ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
    }

    const htmlBody = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #0a2540, #0d3d45); border-radius: 10px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">ABHR — Cerere Nouă de Membru</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 14px;">Alianța pentru Boli Hepatice Rare din Moldova</p>
        </div>

        <div style="background: white; border-radius: 10px; padding: 24px; margin-bottom: 16px; border-left: 4px solid #2ecc8a;">
          <h2 style="color: #1a1a1a; margin: 0 0 20px; font-size: 18px;">Detalii solicitant</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888; font-size: 13px; width: 140px;">Nume</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-weight: 700; font-size: 14px;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888; font-size: 13px;">Email</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;"><a href="mailto:${email}" style="color: #1a6b4a;">${email}</a></td>
            </tr>
            ${phone ? `<tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888; font-size: 13px;">Telefon</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;"><a href="tel:${phone}" style="color: #1a6b4a;">${phone}</a></td>
            </tr>` : ""}
            ${city ? `<tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 10px 0; color: #888; font-size: 13px;">Oraș</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px;">${city}</td>
            </tr>` : ""}
            ${message ? `<tr>
              <td style="padding: 10px 0; color: #888; font-size: 13px; vertical-align: top;">Mesaj</td>
              <td style="padding: 10px 0; color: #1a1a1a; font-size: 14px; line-height: 1.6;">${message}</td>
            </tr>` : ""}
          </table>
        </div>

        <div style="background: #e8f5ee; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;">
          <p style="margin: 0; color: #1a6b4a; font-size: 13px;">
            📋 Această cerere a fost salvată și în baza de date Supabase sub tabelul <strong>membership_requests</strong>.
          </p>
        </div>

        <p style="color: #aaa; font-size: 12px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} Alianța pentru Boli Hepatice Rare — abhr-website.vercel.app
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ABHR Website <onboarding@resend.dev>",
        to: [ADMIN_EMAIL],
        subject: `Cerere nouă de membership — ${name}`,
        html: htmlBody,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Resend error");

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    console.error("Email error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
