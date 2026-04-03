'use client';

import { useRouter } from 'next/navigation';
import PlanningForm from '@/components/admin/PlanningForm';
import { createPlanning } from '@/services/plannings';
import type { PlanningFormData } from '@/types';

export default function NewPlanningPage() {
  const router = useRouter();

  const handleSubmit = async (data: PlanningFormData) => {
    const id = await createPlanning(data);
    router.push(`/gestion/dashboard/plannings/${id}`);
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Nouveau planning</h1>
        <p className="text-sm text-gray-500 mt-1">
          Créez un planning de visites pour un proche.
        </p>
      </div>

      <div className="max-w-2xl">
        <PlanningForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
