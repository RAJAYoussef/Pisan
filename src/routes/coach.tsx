import { createFileRoute } from '@tanstack/react-router';
import { CoachPage } from '@/components/pisan/legal';
export const Route = createFileRoute('/coach')({
  head: () => ({ meta: [{ title: 'PiSan — Coach Pi : ce qu’il fait, et ses limites' }, { name: 'description', content: 'Comment fonctionne l’assistant IA de PiSan : des indices sans donner la réponse, une correction faite par le serveur, et ses limites.' }] }),
  component: CoachPage,
});
