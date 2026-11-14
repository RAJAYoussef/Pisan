import { createFileRoute } from "@tanstack/react-router";
import { Workspace } from '@/components/pisan/workspace';

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'PiSan — Mon espace de maths visuelles' },
    { name: 'description', content: 'Diagnostic, atelier visuel, contrôles blancs et parcours confiance : apprends les maths à ton rythme avec PiSan.' },
    { property: 'og:title', content: 'PiSan — Les maths deviennent enfin visuelles' },
    { property: 'og:description', content: 'Un espace éducatif du collège au lycée : modèles de Singapour, graphiques et suivi des progrès.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Workspace,
});
