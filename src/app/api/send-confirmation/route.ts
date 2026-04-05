import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface ConfirmationPayload {
  to: string;
  visitorFirstName: string;
  visitorLastName: string;
  residentName: string;
  date: string;
  startTime: string;
  endTime: string;
  visitorCount: number;
  locationName?: string;
  address?: string;
  planningSlug: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildConfirmationHtml(data: ConfirmationPayload): string {
  const locationLine = data.locationName
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Lieu</td><td style="padding:6px 12px;font-size:14px;">${data.locationName}</td></tr>`
    : '';

  const addressLine = data.address
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Adresse</td><td style="padding:6px 12px;font-size:14px;">${data.address}</td></tr>`
    : '';

  const visitorsLine = data.visitorCount > 1
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Visiteurs</td><td style="padding:6px 12px;font-size:14px;">${data.visitorCount} personne${data.visitorCount > 1 ? 's' : ''}</td></tr>`
    : '';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planning-visites.fr';

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a,#3db54a);padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Planavi</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Confirmation de votre visite</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.5;">
        Bonjour <strong>${data.visitorFirstName}</strong>, votre visite aupr\u00e8s de <strong>${data.residentName}</strong> est bien enregistr\u00e9e.
      </p>

      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:6px 12px;color:#6b7280;font-size:14px;">Date</td>
          <td style="padding:6px 12px;font-size:14px;font-weight:600;">${formatDate(data.date)}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#6b7280;font-size:14px;">Cr\u00e9neau</td>
          <td style="padding:6px 12px;font-size:14px;font-weight:600;">${data.startTime} - ${data.endTime}</td>
        </tr>
        ${visitorsLine}
        ${locationLine}
        ${addressLine}
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="${appUrl}/planning/${data.planningSlug}"
           style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#1e3a8a,#3db54a);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          Voir le planning
        </a>
      </div>

      <p style="margin:20px 0 0;font-size:13px;color:#9ca3af;text-align:center;">
        Pour annuler, rendez-vous sur le planning et cliquez sur votre nom.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Planavi — Visitez vos proches, simplement.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmationPayload = await request.json();

    if (!body.to || !body.visitorFirstName) {
      return NextResponse.json({ error: 'Donn\u00e9es manquantes' }, { status: 400 });
    }

    const { data, error } = await getResend().emails.send({
      from: 'Planavi <onboarding@resend.dev>',
      to: body.to,
      subject: `Visite confirm\u00e9e : ${formatDate(body.date)} (${body.startTime} - ${body.endTime})`,
      html: buildConfirmationHtml(body),
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Confirmation email send error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
