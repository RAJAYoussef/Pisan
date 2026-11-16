import { BookOpen, Brain, ClipboardCheck, Home, TrendingUp, type LucideIcon } from 'lucide-react';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';

export type Tab = 'home' | 'diagnostic' | 'workshop' | 'exam' | 'journey' | 'tracking' | 'practice';
export const TAB_ICONS: Record<Exclude<Tab, 'practice'>, LucideIcon> = { home: Home, diagnostic: Brain, workshop: BookOpen, exam: ClipboardCheck, journey: TrendingUp, tracking: TrendingUp };

/** Un seul nom par écran, partout (menu, onglets, titres). */
export function tabLabel(id: Tab, lang: Lang): string {
  switch (id) {
    case 'home': return say(lang, 'Accueil', 'Home', 'الرئيسية', 'Inicio');
    case 'diagnostic': return say(lang, 'Diagnostic', 'Diagnostic', 'التشخيص', 'Diagnóstico');
    case 'workshop': return say(lang, 'Atelier visuel', 'Visual workshop', 'الورشة البصرية', 'Taller visual');
    case 'exam': return say(lang, 'Contrôle blanc', 'Practice test', 'اختبار تجريبي', 'Examen de práctica');
    case 'journey':
    case 'practice': return say(lang, 'Mon parcours', 'My path', 'مساري', 'Mi recorrido');
    case 'tracking': return say(lang, 'Suivi pour les adultes', 'Progress for adults', 'متابعة للكبار', 'Seguimiento para adultos');
  }
}

const SHORT: Record<'home' | 'diagnostic' | 'workshop' | 'exam' | 'journey', [string, string, string, string]> = {
  home: ['Accueil', 'Home', 'الرئيسية', 'Inicio'],
  diagnostic: ['Diagnostic', 'Check-up', 'التشخيص', 'Diagnóstico'],
  workshop: ['Atelier', 'Workshop', 'الورشة', 'Taller'],
  exam: ['Contrôle', 'Test', 'اختبار', 'Examen'],
  journey: ['Parcours', 'Path', 'مساري', 'Recorrido'],
};

/** Barre d'onglets en bas de l'écran, sur téléphone et tablette. */
export function BottomTabs({ lang, tab, onNavigate }: { lang: Lang; tab: Tab; onNavigate: (t: Tab) => void }) {
  const tabs = ['home', 'diagnostic', 'workshop', 'exam', 'journey'] as const;
  return <nav className="bottom-tabs" aria-label={say(lang, 'Navigation principale', 'Main navigation', 'القائمة الرئيسية', 'Navegación principal')}>
    {tabs.map(id => {
      const Icon = TAB_ICONS[id];
      const active = tab === id || (id === 'journey' && (tab === 'practice' || tab === 'tracking'));
      const [fr, en, ar, es] = SHORT[id];
      return <button key={id} type="button" className={`bottom-tab ${active ? 'bottom-tab-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => onNavigate(id)}>
        <Icon aria-hidden /><span>{say(lang, fr, en, ar, es)}</span>
      </button>;
    })}
  </nav>;
}
