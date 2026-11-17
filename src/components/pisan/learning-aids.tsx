import { useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { getNotion, localizeMath, type NotionId } from '@/lib/curriculum';
import { CORRECTIONS } from '@/lib/corrections';
import { SHEETS } from '@/lib/sheets';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { Speaker } from './shared';
import { MathText, mathSpoken, Rich, vectorize } from './math-text';

/** Bouton « Pourquoi ? » : déplie la correction pas à pas d'une question. */
export function Why({ notion, index, lang, steps: given }: { notion: NotionId; index: number; lang: Lang; steps?: string[] | undefined }) {
  const [open, setOpen] = useState(false);
  const raw = given ?? CORRECTIONS[notion]?.[index] ?? [];
  const steps = raw.map(step => localizeMath(step, lang));
  if (!steps.length) return null;
  const label = say(lang, 'Pourquoi ?', 'Why?', 'لماذا؟', '¿Por qué?');
  return <div className="mt-3">
    <Button type="button" variant="soft" size="sm" aria-expanded={open} onClick={() => setOpen(o => !o)}><HelpCircle />{label}</Button>
    {open && <div className="mt-3 rounded-lg bg-muted p-4">
      <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold text-muted-foreground">{say(lang, 'Correction pas à pas', 'Step-by-step solution', 'التصحيح خطوة بخطوة', 'Corrección paso a paso')}</p><Speaker text={raw.map(step => mathSpoken(step, lang)).join('. ')} lang={lang} /></div>
      <ol className="space-y-2" dir="ltr">{steps.map((step, i) => <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary-deep">{i + 1}</span><span className="font-display text-lg"><Rich lang={lang} text={vectorize(step)} /></span></li>)}</ol>
    </div>}
  </div>;
}

/** Fiche d'une notion : l'essentiel (cours) et les étapes (méthode), avec lecture audio. */
export function SheetButton({ notion, lang, variant = 'soft' }: { notion: NotionId; lang: Lang; variant?: 'soft' | 'ghost' }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'cours' | 'methode'>('cours');
  const sheet = SHEETS[notion];
  if (!sheet) return null;
  const n = getNotion(notion);
  const items = sheet[tab].map(item => localizeMath(item[lang], lang));
  const tabs = [['cours', say(lang, 'Cours', 'Key ideas', 'الدرس', 'Teoría')], ['methode', say(lang, 'Méthode', 'Method', 'الطريقة', 'Método')]] as const;
  return <>
    <Button type="button" variant={variant} size="sm" onClick={() => setOpen(true)}><BookOpen />{say(lang, 'Fiche', 'Study sheet', 'بطاقة', 'Ficha')} · {n.name[lang]}</Button>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
      <DialogTitle className="font-display text-2xl">{n.emoji} {n.name[lang]}</DialogTitle>
      <DialogDescription>{say(lang, 'L’essentiel à retenir, puis les étapes à suivre.', 'What to remember, then the steps to follow.', 'ما يجب تذكّره، ثم الخطوات التي يجب اتباعها.', 'Lo esencial y luego los pasos a seguir.')}</DialogDescription>
      <div className="flex flex-wrap items-center gap-2" role="tablist">
        {tabs.map(([id, label]) => <Button key={id} type="button" role="tab" size="sm" aria-selected={tab === id} variant={tab === id ? 'default' : 'soft'} onClick={() => setTab(id)}>{label}</Button>)}
        <span className="ms-auto"><Speaker text={sheet[tab].map(item => mathSpoken(item[lang], lang)).join('. ')} lang={lang} /></span>
      </div>
      {tab === 'cours'
        ? <ul className="space-y-3">{items.map((item, i) => <li key={i} className="rounded-lg bg-primary-soft p-4 leading-relaxed"><Rich lang={lang} text={vectorize(item)} /></li>)}</ul>
        : <ol className="space-y-3">{items.map((item, i) => <li key={i} className="flex gap-3 rounded-lg bg-muted p-4 leading-relaxed"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span><Rich lang={lang} text={vectorize(item)} /></span></li>)}</ol>}
      <p dir="ltr" className="rounded-lg border border-border p-4 text-center font-display text-lg"><MathText lang={lang} text={n.example} /></p>
    </DialogContent></Dialog>
  </>;
}
