// Séries d'entraînement : niveau 2 (en autonomie) et niveau 3 (défi mélangé), après le parcours guidé (niveau 1).
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localizeMath, type L } from '@/lib/curriculum';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { reviewIndex } from '@/lib/reports';
import { POINTS_FIRST_TRY, starsFor } from '@/lib/rewards';
import { getSkill, reviewStep, spoken, type Skill } from '@/lib/skills';
import type { SeriesLevel, SkillEngine, StepAnswer } from '@/lib/skill-session';
import { CHAPTER_NAMES } from './chapter-names';
import { Rich } from './math-text';
import { ReportQuestion } from './report-question';
import { Speaker, Tutor } from './shared';
import { Celebration } from './skill-intro';
import { StepView } from './skills';
import { LEVEL_NAMES, LevelPicker } from './level-picker';

/** Une série de niveau 2 ou 3 : le serveur tire les questions, corrige chaque réponse et enregistre le score à la fin. */
export function SeriesActivity({ lang, skill, level, engine, onLevel, onBack }: { lang: Lang; skill: Skill; level: SeriesLevel; engine: SkillEngine; onLevel: (level: 1 | SeriesLevel) => void; onBack: () => void }) {
  const [drawn, setDrawn] = useState<{ seeds: number[]; skills: string[] } | null>(null);
  const [ticket, setTicket] = useState('');
  const [round, setRound] = useState(0);
  const [startError, setStartError] = useState(false);
  const [index, setIndex] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { correct: number; total: number }>(null);
  const [saveError, setSaveError] = useState('');
  useEffect(() => {
    let off = false;
    setDrawn(null); setStartError(false); setIndex(0); setErrors([]); setSolved(false); setDone(null); setSaveError('');
    engine.start('series', [skill.id], level).then(r => { if (!off) { setDrawn({ seeds: r.seeds, skills: r.skills ?? r.seeds.map(() => skill.id) }); setTicket(r.ticket); } }).catch(() => { if (!off) setStartError(true); });
    return () => { off = true; };
  }, [engine, skill.id, level, round]);
  const items = useMemo(() => drawn?.skills.map((id, i) => { const s = getSkill(id); return s ? { skill: s, seed: drawn.seeds[i]!, step: reviewStep(s, drawn.seeds[i]!) } : null; }) ?? null, [drawn]);
  const show = (l: L) => localizeMath(l[lang], lang);
  const back = <Button variant="ghost" onClick={onBack} className="mb-4">← {say(lang, 'Retour', 'Back', 'رجوع', 'Volver')}</Button>;
  const heading = <div className="section-heading"><span className="eyebrow">{say(lang, `Niveau ${level}`, `Level ${level}`, `المستوى ${level}`, `Nivel ${level}`)} · {say(lang, ...LEVEL_NAMES[level])}</span><h1>{skill.title[lang]}</h1></div>;
  const picker = <LevelPicker lang={lang} current={level} unlocked onPick={onLevel} />;
  if (!items || items.some(x => !x)) return <section className="mx-auto max-w-4xl">{back}{heading}
    {startError ? <div role="alert" className="activity-panel"><p>{say(lang, 'La série n’a pas pu démarrer. Vérifie ta connexion.', 'The series could not start. Check your connection.', 'تعذر بدء السلسلة. تحقق من اتصالك.', 'La serie no pudo empezar. Revisa tu conexión.')}</p><Button className="mt-4" onClick={() => setRound(r => r + 1)}><RefreshCw />{say(lang, 'Réessayer', 'Try again', 'أعد المحاولة', 'Reintentar')}</Button></div>
      : <p className="animate-pulse text-muted-foreground">PiSan…</p>}
  </section>;
  const list = items as { skill: Skill; seed: number; step: ReturnType<typeof reviewStep> }[];
  const current = list[index]!;
  const total = list.length;
  const wrong = errors.filter(i => i === index).length;
  const hintAfter = level === 2 ? 1 : 2;
  const missed = [...new Set(errors)];
  async function answer(reply: StepAnswer) {
    if (checking) return;
    setChecking(true); setSaveError('');
    try {
      const r = await engine.check(ticket, reply);
      setTicket(r.ticket);
      if (r.ok) setSolved(true); else setErrors(e => [...e, index]);
    } catch { setSaveError(say(lang, 'Vérification impossible (connexion ?). Réessaie.', 'Could not check (connection?). Try again.', 'تعذر التحقق. حاول مجددًا.', 'No se pudo comprobar. Reintenta.')); }
    finally { setChecking(false); }
  }
  async function next() {
    if (index + 1 < total) { setIndex(index + 1); setSolved(false); return; }
    setBusy(true); setSaveError('');
    try { const r = await engine.finish(ticket); const a = r.attempts[0]!; setDone({ correct: a.correct, total: a.total }); }
    catch { setSaveError(say(lang, 'Résultat non sauvegardé. Réessaie.', 'Result not saved. Try again.', 'لم تُحفظ النتيجة. حاول مجددًا.', 'Resultado no guardado. Reintenta.')); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-4xl">
    {back}{heading}{picker}
    <div className="skill-progress" aria-hidden>{list.map((_, i) => <span key={i} className={done || i < index ? (missed.includes(i) ? 'skill-dot skill-dot-missed' : 'skill-dot skill-dot-done') : i === index ? 'skill-dot skill-dot-active' : 'skill-dot'} />)}</div>
    <div className="activity-panel">
      {done
        ? <Celebration lang={lang} stars={starsFor(done.correct, done.total)} points={done.correct * POINTS_FIRST_TRY} bestCombo={0} message={say(lang, `${done.correct} réponse${done.correct > 1 ? 's' : ''} juste${done.correct > 1 ? 's' : ''} du premier coup sur ${done.total}.`, `${done.correct} of ${done.total} right first time.`, `${done.correct} من ${done.total} صحيحة من أول محاولة.`, `${done.correct} de ${done.total} correctas a la primera.`)}>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button onClick={() => setRound(r => r + 1)}><RefreshCw />{say(lang, 'Une autre série', 'Another series', 'سلسلة أخرى', 'Otra serie')}</Button>
            {level === 2 ? <Button variant="soft" onClick={() => onLevel(3)}>{say(lang, 'Passer au niveau 3', 'Go to level 3', 'انتقل إلى المستوى 3', 'Pasar al nivel 3')}<ArrowRight /></Button>
              : <Button variant="soft" onClick={onBack}>{say(lang, 'Retour à l’atelier', 'Back to the workshop', 'العودة إلى الورشة', 'Volver al taller')}</Button>}
          </div>
        </Celebration>
        : <>
          {current.skill.id !== skill.id && <p className="mb-2 text-xs font-bold text-primary-deep">{CHAPTER_NAMES[current.skill.chapter][lang]} · {current.skill.title[lang]}</p>}
          <p className="mb-3 text-sm font-semibold text-muted-foreground">{say(lang, 'Question', 'Question', 'سؤال', 'Pregunta')} {index + 1} / {total}</p>
          <div className="mb-5 flex items-start justify-between gap-4"><p className="text-lg font-semibold leading-snug"><Rich lang={lang} text={show(current.step.prompt)} /></p><Speaker text={spoken(show(current.step.prompt), lang)} lang={lang} /></div>
          <StepView key={`${drawn!.seeds.join('-')}-${index}`} lang={lang} step={current.step} solved={solved} onAnswer={answer} />
          {solved && <Button className="mt-5 w-full" disabled={busy} onClick={() => void next()}>{index + 1 < total ? say(lang, 'Question suivante', 'Next question', 'السؤال التالي', 'Siguiente pregunta') : say(lang, 'Terminer', 'Finish', 'إنهاء', 'Terminar')}<ArrowRight /></Button>}
          {!solved && wrong > 0 && (wrong >= hintAfter
            ? <div className="mt-4"><Tutor><Rich lang={lang} text={show(current.step.hint)} /></Tutor></div>
            : <p role="status" className="mt-4 text-sm font-semibold text-destructive">{say(lang, 'Pas tout à fait. Relis l’énoncé et réessaie : l’indice viendra à la prochaine erreur.', 'Not quite. Reread and try again: a hint comes after the next mistake.', 'ليس تمامًا. أعد القراءة وحاول؛ سيأتي التلميح بعد الخطأ التالي.', 'Casi. Relee e inténtalo: la pista llega tras el próximo error.')}</p>)}
          {saveError && <p role="alert" className="mt-3 text-destructive">{saveError}</p>}
          <ReportQuestion key={`report-${current.seed}-${index}`} lang={lang} skill={current.skill.id} seed={current.seed} step={reviewIndex(current.skill.id, current.seed)} context="other" />
        </>}
    </div>
  </section>;
}
