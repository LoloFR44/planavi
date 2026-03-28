import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface EmailPayload {
  to: string;
  residentName: string;
  planningTitle: string;
  visitorFirstName: string;
  visitorLastName: string;
  visitorRelation?: string;
  visitorCount: number;
  date: string;
  startTime: string;
  endTime: string;
  comment?: string;
  planningSlug: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildEmailHtml(data: EmailPayload): string {
  const relationLine = data.visitorRelation
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Lien</td><td style="padding:6px 12px;font-size:14px;">${data.visitorRelation}</td></tr>`
    : '';

  const commentLine = data.comment
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Commentaire</td><td style="padding:6px 12px;font-size:14px;font-style:italic;">${data.comment}</td></tr>`
    : '';

  const visitorsLine = data.visitorCount > 1
    ? `<tr><td style="padding:6px 12px;color:#6b7280;font-size:14px;">Visiteurs</td><td style="padding:6px 12px;font-size:14px;">${data.visitorCount} personne${data.visitorCount > 1 ? 's' : ''}</td></tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e3a8a,#3db54a);padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Planavi</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nouvelle réservation de visite</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 24px;">
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.5;">
        Une nouvelle visite a été réservée pour <strong>${data.residentName}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:6px 12px;color:#6b7280;font-size:14px;">Visiteur</td>
          <td style="padding:6px 12px;font-size:14px;font-weight:600;">${data.visitorFirstName} ${data.visitorLastName}</td>
        </tr>
        ${relationLine}
        <tr>
          <td style="padding:6px 12px;color:#6b7280;font-size:14px;">Date</td>
          <td style="padding:6px 12px;font-size:14px;">${formatDate(data.date)}</td>
        </tr>
        <tr>
          <td style="padding:6px 12px;color:#6b7280;font-size:14px;">Créneau</td>
          <td style="padding:6px 12px;font-size:14px;font-weight:600;">${data.startTime} - ${data.endTime}</td>
        </tr>
        ${visitorsLine}
        ${commentLine}
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://planavi.vercel.app'}/admin/dashboard/plannings"
           style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#1e3a8a,#3db54a);color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          Voir le planning
        </a>
      </div>
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
    const body: EmailPayload = await request.json();

    if (!body.to || !body.visitorFirstName || !body.visitorLastName) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const { data, error } = await getResend().emails.send({
      from: 'Planavi <onboarding@resend.dev>',
      to: body.to,
      subject: `Nouvelle visite : ${body.visitorFirstName} ${body.visitorLastName} — ${formatDate(body.date)}`,
      html: buildEmailHtml(body),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Email send error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
