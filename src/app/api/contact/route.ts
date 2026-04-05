import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

function buildContactHtml(data: ContactPayload): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a,#3db54a);padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Planavi</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nouveau message de contact</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:10px 14px;color:#6b7280;font-size:14px;width:100px;">Nom</td>
          <td style="padding:10px 14px;font-size:14px;font-weight:600;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#6b7280;font-size:14px;">Email</td>
          <td style="padding:10px 14px;font-size:14px;">
            <a href="mailto:${data.email}" style="color:#1e3a8a;">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#6b7280;font-size:14px;">Objet</td>
          <td style="padding:10px 14px;font-size:14px;">${data.subject}</td>
        </tr>
      </table>

      <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:10px;">
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;">Message</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Envoyé depuis le formulaire de contact Planavi
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();

    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
    }

    const { data, error } = await getResend().emails.send({
      from: 'Planavi <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'loic@linkera.com',
      replyTo: body.email,
      subject: `[Planavi Contact] ${body.subject}`,
      html: buildContactHtml(body),
    });

    if (error) {
      console.error('Resend contact error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
