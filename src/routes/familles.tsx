import { createFileRoute } from '@tanstack/react-router';
import { FamilyNote } from '@/components/pisan/legal';
export const Route = createFileRoute('/familles')({
  head: () => ({ meta: [{ title: 'PiSan — Note aux familles' }, { name: 'description', content: 'Note d’information aux familles sur l’utilisation de PiSan en classe.' }] }),
  component: FamilyNote,
});
