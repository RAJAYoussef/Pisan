import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPage } from '@/components/pisan/legal';
export const Route = createFileRoute('/confidentialite')({
  head: () => ({ meta: [{ title: 'PiSan — Confidentialité et mentions légales' }, { name: 'description', content: 'Données collectées par PiSan, finalités, hébergement, durée de conservation et droits (RGPD, loi 09-08).' }] }),
  component: PrivacyPage,
});
