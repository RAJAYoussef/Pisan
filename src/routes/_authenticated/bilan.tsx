import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PlacementReport } from '@/components/pisan/placement-report';
export const Route = createFileRoute('/_authenticated/bilan')({
  validateSearch: z.object({ classe: z.string().uuid() }),
  head: () => ({ meta: [{ title: 'PiSan — Bilan de classe' }, { name: 'robots', content: 'noindex' }] }),
  component: BilanPage,
});
function BilanPage() { const { classe } = Route.useSearch(); return <PlacementReport classId={classe} />; }
