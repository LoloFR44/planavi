import { Metadata } from 'next';
import { getPlanningBySlug } from '@/services/plannings';
import PlanningPageClient from './PlanningPageClient';

const TYPE_LABELS: Record<string, string> = {
  home: 'A domicile',
  hospital: 'Hôpital',
  nursing_home: 'EHPAD / Maison de retraite',
  other: 'Autre',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const planning = await getPlanningBySlug(slug);

  if (!planning) {
    return {
      title: 'Planning introuvable - Planavi',
    };
  }

  const typeLabel = TYPE_LABELS[planning.residentType] || '';
  const description = `Réservez un créneau de visite pour ${planning.residentName}${typeLabel ? ` (${typeLabel})` : ''}. ${planning.title}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://planning-visites.fr';

  return {
    title: `${planning.residentName} - Planavi`,
    description,
    openGraph: {
      title: `Visites - ${planning.residentName}`,
      description,
      siteName: 'Planavi',
      type: 'website',
      url: `${appUrl}/planning/${slug}`,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary',
      title: `Visites - ${planning.residentName}`,
      description,
    },
  };
}

export default async function PlanningPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PlanningPageClient slug={slug} />;
}
