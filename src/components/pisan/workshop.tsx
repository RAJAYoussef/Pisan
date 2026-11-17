import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Lightbulb, Plus, Minus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DICTS, type Lang } from '@/lib/i18n';
import { checkModel, checkConcrete, concreteMistake, checkCalculation, concreteSpec, generateAdaptedExercise, highSchoolModes, highSchoolNotion, workshopExercises, type Exercise, type HighSchoolMode, type Slot } from '@/lib/exercises';
import type { Notion, NotionId } from '@/lib/curriculum';
import type { Programme } from '@/lib/programmes';
import { say, type Attempt } from '@/lib/pisan';
import { Speaker, Tutor } from './shared';
import { AskPi } from './coach';
import { ConcreteObjects } from './concrete';
import { ReviewActivity, SkillActivity } from './skills';
import { ChapterPath, WorkshopHome, type Tile } from './workshop-home';
import { dueReviews, getSkill, nextSkill, type Skill } from '@/lib/skills';
import { assignmentNext, visibleAssignments, type Assignment } from '@/lib/assignments';
import type { SkillEngine } from '@/lib/skill-session';
import { AssignmentRow } from './assignment-row';
import { figureChapter, figuresFor, type FigureKind } from '@/lib/figures';
import { ArrowLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { emptyProgress, type Progress } from '@/lib/pisan';

type Props = { engine: SkillEngine; onJournalEvent?: (skillId: string, event: { activityId: string; type: import('@/lib/fraction-journal').FractionJournalEventType; payload: Record<string, unknown>; clientOccurredAt?: string }) => void; lang: Lang; level: number; country: string; onSave: (a: Attempt) => Promise<void>; onStart: () => Promise<boolean>; notions?: Notion[] | undefined; focus?: NotionId | undefined; programme?: Programme | null | undefined; progress?: Progress | undefined; assignments?: Assignment[] | undefined };

function figureChapterTitle(programme: Programme | null | undefined, kind: FigureKind, lang: Lang): string | null {
  return figureChapter(programme, kind)?.[lang] ?? null;
}

/** Le titre du chapitre du programme qui contient cette notion (la notion visée en priorité). */
function chapterOf(programme: Programme | null | undefined, notion: NotionId, lang: Lang): string | null {
  return programme?.chapters.find(c => c.notions.includes(notion))?.title[lang] ?? null;
}
export function Workshop(props: Props) {
  const { lang, level, country, onStart, notions, focus, programme } = props;
  const ids = notions?.map(n => n.id);
  const exercises = workshopExercises(level, ids, focus);
  const modes = highSchoolModes(ids);
  const showGraphs = modes.length > 0 && (level >= 4 || exercises.length === 0);
  const d = DICTS[lang];
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [busy, setBusy] = useState(false);
  const [highActive, setHighActive] = useState(false);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [adaptiveSkillId, setAdaptiveSkillId] = useState<string | null>(null);
  const [review, setReview] = useState<Skill[] | null>(null);
  const [chapter, setChapter] = useState<FigureKind | null>(null);
  const [bars, setBars] = useState(false);
  // Chaque changement d'écran repart du haut de la page.
  useEffect(() => { if (typeof window !== 'undefined') window.scrollTo(0, 0); }, [chapter, bars, skill, review, exercise, highActive]);
  const attempts = (props.progress ?? emptyProgress).attempts;
  // Parcours de compétences en géométrie : quand le programme les contient (ou par niveau, sans programme connu).
  const figures = figuresFor(programme, ids, level);
  const [error, setError] = useState('');
  async function start(ex?: Exercise) {
    setBusy(true); setError('');
    try { if (await onStart()) { setExercise(ex ?? await generateAdaptedExercise({ level, countryId: country, lang, notions: ids, focus })); } }
    catch { setError(say(lang, 'Exercice indisponible. Réessaie.', 'Exercise unavailable. Try again.', 'التمرين غير متاح.', 'Ejercicio no disponible.')); }
    setBusy(false);
  }
  const due = dueReviews(attempts);
  if (review) return <ReviewActivity lang={lang} skills={review} engine={props.engine} onBack={() => setReview(null)} />;
  if (skill) return <SkillActivity key={skill.id} lang={lang} skill={skill} engine={props.engine} onBack={() => setSkill(null)} onAdaptiveSkill={setAdaptiveSkillId} onJournalEvent={event => props.onJournalEvent?.(skill.id, event)} />;
  async function openReview() { setBusy(true); setError(''); try { if (await onStart()) setReview(due); } catch { setError(say(lang, 'Exercice indisponible. Réessaie.', 'Exercise unavailable. Try again.', 'التمرين غير متاح.', 'Ejercicio no disponible.')); } finally { setBusy(false); } }
  async function openSkill(next: Skill) { setBusy(true); setError(''); try { if (await onStart()) { setSkill(next); setAdaptiveSkillId(null); } } catch { setError(say(lang, 'Exercice indisponible. Réessaie.', 'Exercise unavailable. Try again.', 'التمرين غير متاح.', 'Ejercicio no disponible.')); } finally { setBusy(false); } }
  if (highActive) return <HighSchool {...props} modes={modes} onBack={() => setHighActive(false)} />;
  if (exercise) return <BarExercise key={exercise.id} {...props} exercise={exercise} onBack={() => setExercise(null)} />;
  const back = say(lang, 'Atelier', 'Workshop', 'الورشة', 'Taller');
  const errorBox = error && <p role="alert" className="mt-3 text-destructive">{error}</p>;
  if (chapter) return <><ChapterPath lang={lang} kind={chapter} attempts={attempts} chapterLabel={figureChapterTitle(programme, chapter, lang)} busy={busy} onSkill={next => void openSkill(next)} onBack={() => setChapter(null)} />{errorBox}</>;
  if (bars) return <section className="mx-auto max-w-5xl"><Button variant="ghost" onClick={() => setBars(false)} className="mb-4"><ArrowLeft className="rtl:rotate-180" />{back}</Button><div className="section-heading"><span className="eyebrow">{say(lang, 'Méthode de Singapour', 'Singapore method', 'طريقة سنغافورة', 'Método de Singapur')}</span><h1>{say(lang, 'Problèmes en barres', 'Bar-model problems', 'مسائل بالنماذج الشريطية', 'Problemas con barras')}</h1><p>{d.ws.intro}</p></div><div className="mb-7 flex flex-wrap items-center justify-between gap-4">{exercises.length > 0 && <span className="pill">{programme ? say(lang, 'Problèmes de ton programme', 'Problems from your curriculum', 'مسائل من برنامجك', 'Problemas de tu programa') : say(lang, 'Démonstrations adaptées à ta classe', 'Demonstrations for your grade', 'تمارين مناسبة لصفك', 'Ejercicios para tu curso')}</span>}{exercises.length > 0 && <Button variant="soft" disabled={busy} onClick={() => start()}><RefreshCw />{say(lang, 'Nouvel exercice', 'New exercise', 'تمرين جديد', 'Nuevo ejercicio')}</Button>}</div><div className="ws-list">{exercises.map((ex, i) => <button key={ex.id} type="button" className="ws-problem" disabled={busy} onClick={() => start(ex)}><span className={`mini-model ws-problem-model model-${i % 3}`} aria-hidden>{ex.bars.map((b, j) => <span className="flex gap-0.5" key={j}>{Array.from({ length: b.units }, (_, k) => <span className="min-w-0 flex-1" key={k} />)}{b.extra && <span className="extra" />}</span>)}</span><span className="min-w-0 flex-1 text-start">{chapterOf(programme, ex.notion, lang) && <span className="block text-xs font-bold text-primary-deep">{chapterOf(programme, ex.notion, lang)}</span>}<span className="block font-bold">{ex.title[lang]}</span><span className="block text-sm text-muted-foreground">{ex.story[lang]}</span></span><ChevronRight className="h-5 w-5 shrink-0 self-center text-muted-foreground rtl:rotate-180" aria-hidden /></button>)}</div>{errorBox}</section>;
  const extras: Tile[] = [
    ...(exercises.length ? [{ id: 'bars', tone: 'module-sun', icon: <BarsGlyph />, title: say(lang, 'Problèmes en barres', 'Bar-model problems', 'مسائل بالنماذج الشريطية', 'Problemas con barras'), note: say(lang, `Méthode de Singapour · ${exercises.length} problèmes de ton programme`, `Singapore method · ${exercises.length} problems from your curriculum`, `طريقة سنغافورة · ${exercises.length} مسائل من برنامجك`, `Método de Singapur · ${exercises.length} problemas de tu programa`), onOpen: () => setBars(true) }] : []),
    ...(showGraphs ? [{ id: 'graphs', tone: 'module-sky', icon: <TrendingUp />, title: say(lang, 'Graphiques, arbres et tableaux de signes', 'Graphs, trees and sign tables', 'المنحنيات والأشجار وجداول الإشارة', 'Gráficos, árboles y tablas de signos'), note: say(lang, 'Lire et construire', 'Read and build', 'القراءة والإنشاء', 'Leer y construir'), onOpen: () => void (async () => { setBusy(true); setError(''); try { if (await onStart()) setHighActive(true); } catch { setError(d.ws.almost); } finally { setBusy(false); } })() }] : []),
  ];
  const adaptiveSkill = adaptiveSkillId ? (getSkill(adaptiveSkillId)) : null;
  const next = adaptiveSkill ? { skill: adaptiveSkill, resumed: true } : nextSkill(attempts, figures);
  return <><WorkshopHome lang={lang} assignments={visibleAssignments(props.assignments ?? [], attempts).map(a => <AssignmentRow key={a.id} lang={lang} assignment={a} attempts={attempts} onOpen={() => { const next = assignmentNext(attempts, a); if (next) void openSkill(next); }} />)} kinds={figures} attempts={attempts} chapterLabel={k => figureChapterTitle(programme, k, lang)} next={next} due={due.length} extras={extras} busy={busy} onChapter={setChapter} onSkill={next => void openSkill(next)} onReview={() => void openReview()} />{errorBox}</>;
}

/** Icône des problèmes en barres. */
const BarsGlyph = () => <svg viewBox="0 0 24 24" aria-hidden><rect x="3" y="6" width="18" height="4" rx="1" fill="currentColor" /><rect x="3" y="13" width="5" height="4" rx="1" fill="currentColor" /><rect x="9.5" y="13" width="5" height="4" rx="1" fill="currentColor" /><rect x="16" y="13" width="5" height="4" rx="1" fill="currentColor" opacity=".5" /></svg>;

function BarExercise({ lang, exercise: ex, onSave, onBack }: Props & { exercise: Exercise; onBack: () => void }) {
  const d = DICTS[lang];
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<(number | null)[]>(ex.verbal.blanks.map(() => null));
  const [units, setUnits] = useState(ex.bars.map(() => 1));
  const [extras, setExtras] = useState(ex.bars.map(() => false));
  const [placed, setPlaced] = useState<Partial<Record<Slot, string>>>({});
  const [chip, setChip] = useState(ex.chips[0] ?? 'x');
  const [equation, setEquation] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [partAnswer, setPartAnswer] = useState('');
  const [objects, setObjects] = useState(() => concreteSpec(ex).groups.map(() => 0));
  const [hint, setHint] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  function put(slot: Slot) { setPlaced(p => ({ ...p, [slot]: chip })); }
  async function check() {
    setError('');
    const valid = step === 0 ? ex.verbal.blanks.every((b, i) => choices[i] === b.answer) : step === 1 ? checkConcrete(ex, objects) : step === 2 ? Object.values(checkModel(ex, units, extras, placed)).every(Boolean) : checkCalculation(ex, equation, partAnswer, answer);
    if (!valid) {
      const m = step === 1 ? concreteMistake(ex, objects) : null;
      setError(m === 'extra' ? say(lang, 'Les totaux sont justes ! Mets dans chaque « Part » autant de jetons que les autres parts, et le reste dans « En plus ».', 'The totals are right! Put the same number of tokens in each "Part" as the other parts, and the rest in "Extra".', 'المجاميع صحيحة! ضع في كل «جزء» عدد الرموز نفسه كباقي الأجزاء، والباقي في «الزيادة».', '¡Los totales están bien! Pon en cada «Parte» tantas fichas como en las demás partes, y el resto en «Extra».')
        : m === 'equal' ? say(lang, 'Toutes les « Parts » doivent avoir le même nombre de jetons.', 'All the "Parts" must have the same number of tokens.', 'يجب أن تحتوي كل «الأجزاء» على العدد نفسه من الرموز.', 'Todas las «Partes» deben tener el mismo número de fichas.')
        : d.ws.almost);
      setHint(true); return;
    }
    if (step < 3) { setStep(step + 1); setHint(false); return; }
    setBusy(true);
    try { await onSave({ kind: 'workshop', notion: ex.notion, correct: 1, total: 1, date: new Date().toISOString(), minutes: 8 }); setDone(true); }
    catch { setError(say(lang, 'Sauvegarde indisponible. Réessaie.', 'Save unavailable. Try again.', 'الحفظ غير متاح.', 'No se pudo guardar.')); }
    setBusy(false);
  }
  const hintKey = step === 0 ? 'verbal' : step <= 2 ? 'model' : 'equation';
  return <section className="mx-auto max-w-4xl"><Button variant="ghost" onClick={onBack} className="mb-4">← {d.common.back}</Button><div className="section-heading"><span className="eyebrow">{say(lang, 'Atelier de Singapour', 'Singapore workshop', 'ورشة سنغافورة', 'Taller de Singapur')}</span><h1>{ex.title[lang]}</h1></div>{done ? <div className="activity-panel text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-primary" /><h2 className="my-5 text-3xl">{d.ws.solvedTitle}</h2><p className="mb-6">{d.ws.solvedBody.replace('{stars}', '3')}</p><Button onClick={onBack}>{d.ws.next}<ArrowRight /></Button></div> : <><ol className="cpa-steps">{d.ws.steps.map((label, i) => <li className={`cpa-step ${step === i ? 'cpa-step-active' : ''}`} aria-current={step === i ? 'step' : undefined} key={i}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">{i + 1}</span><span>{label}</span></li>)}</ol><div className="activity-panel"><div className="mb-7 flex items-start justify-between gap-4"><div><p className="text-lg leading-relaxed">{ex.story[lang]}</p><p className="mt-3 font-bold">{ex.question[lang]}</p></div><Speaker text={`${ex.story[lang]} ${ex.question[lang]}`} lang={lang} /></div>
    {step === 0 && <><p className="mb-5 rounded-lg bg-muted p-4 text-base font-semibold">{ex.verbal.sentence[lang].replace(/\{(\d+)\}/g, (_, i) => { const index = choices[Number(i)]; return index != null ? ex.verbal.blanks[Number(i)]?.options[index]?.[lang] ?? '…' : ' […] '; })}</p>{ex.verbal.blanks.map((blank, i) => <div className="mb-5 flex flex-wrap gap-2" key={i}>{blank.options.map((option, j) => <Button key={j} variant={choices[i] === j ? 'default' : 'soft'} className="h-auto min-h-11 whitespace-normal py-2" aria-pressed={choices[i] === j} onClick={() => setChoices(old => old.map((v, k) => k === i ? j : v))}>{option[lang]}</Button>)}</div>)}</>}
    {step === 2 && <><details className="mb-5"><summary className="cursor-pointer text-sm font-bold text-primary-deep">{say(lang, 'Mes objets manipulés', 'My concrete objects', 'الأقراص التي وزعتها', 'Mis objetos repartidos')}</summary><div className="mt-3"><ConcreteObjects exercise={ex} lang={lang} counts={objects} onChange={setObjects} readonly /></div></details><div className="mb-6 flex flex-wrap items-center gap-2"><span className="me-2 text-sm font-bold">{d.ws.labels}</span>{ex.chips.map(c => <Button size="sm" key={c} variant={chip === c ? 'default' : 'soft'} onClick={() => setChip(c)} aria-pressed={chip === c}>{c}</Button>)}<Button variant="ghost" size="sm" onClick={() => setPlaced({})}>{d.ws.clear}</Button></div><div className="bar-board" dir="ltr">{ex.bars.map((bar, i) => <div className="mb-5" key={i}><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="font-bold">{bar.name[lang]}</span><div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label={`${bar.name[lang]} −`} onClick={() => setUnits(v => v.map((n, j) => i === j ? Math.max(1, n - 1) : n))}><Minus /></Button><span className="w-14 text-center text-xs">{units[i]} {d.ws.parts}</span><Button variant="ghost" size="icon" aria-label={`${bar.name[lang]} +`} onClick={() => setUnits(v => v.map((n, j) => i === j ? Math.min(10, n + 1) : n))}><Plus /></Button><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={extras[i]} onChange={e => setExtras(v => v.map((x, j) => j === i ? e.target.checked : x))} />{d.ws.extra}</label></div></div><div className={`flex gap-1 meter-${Math.round(((units[i] ?? 1) + (extras[i] ? 0.5 : 0)) / Math.max(...units.map((n, j) => n + (extras[j] ? 0.5 : 0))) * 10)}`}>{Array.from({ length: units[i] ?? 1 }, (_, j) => <Button key={j} className={`bar-piece bar-color-${bar.color}`} variant="outline" onClick={() => put(`unit:${i}`)} onDragOver={e => e.preventDefault()} onDrop={() => put(`unit:${i}`)} aria-label={`${bar.name[lang]} ${j + 1}`}>{placed[`unit:${i}`] ?? '?'}</Button>)}{extras[i] && <Button variant="outline" className="bar-piece bar-color-4 max-w-24" onClick={() => put(`extra:${i}`)}>{placed[`extra:${i}`] ?? '?'}</Button>}</div><Button variant="ghost" className="mt-1 w-full" onClick={() => put(`total:${i}`)}>{d.ws.total} : {placed[`total:${i}`] ?? '?'}</Button></div>)}<Button variant="soft" className="mt-2 w-full" onClick={() => put('all')}>{d.ws.allBars} : {placed.all ?? '?'}</Button></div></>}
    {step === 1 && <ConcreteObjects exercise={ex} lang={lang} counts={objects} onChange={setObjects} />}
    {step === 3 && <><p className="mb-3 font-bold">{d.ws.equationInstr}</p><div className="grid gap-3 sm:grid-cols-2">{ex.equations.map((eq, i) => <Button key={i} variant={equation === i ? 'default' : 'soft'} onClick={() => setEquation(i)} className="h-14 text-lg"><span dir="ltr">{eq}</span></Button>)}</div><label className="field-label mt-6" htmlFor="part-answer">{say(lang, 'La valeur d’une part (x)', 'Value of one part (x)', 'قيمة جزء واحد (x)', 'Valor de una parte (x)')}</label><div className="flex items-center gap-3"><input id="part-answer" inputMode="decimal" className="form-input max-w-48" value={partAnswer} onChange={e => setPartAnswer(e.target.value)} /><span>{ex.unit[lang]}</span></div><label className="field-label mt-6" htmlFor="answer">{d.ws.answerInstr}</label><div className="flex items-center gap-3"><input id="answer" type="text" inputMode="decimal" className="form-input max-w-48" value={answer} onChange={e => setAnswer(e.target.value)} /><span>{ex.unit[lang]}</span></div></>}
    <div className="mt-6 flex flex-wrap justify-between gap-3"><Button variant="ghost" onClick={() => setHint(!hint)}><Lightbulb />{d.ws.hint}</Button><Button onClick={check} disabled={busy}>{step < 3 ? d.ws.check : d.ws.finish}<ArrowRight /></Button></div>{error && <p role="alert" className="mt-4 text-accent-deep">{error}</p>}<AskPi lang={lang} activity="workshop" coachRef={{ kind: 'exercise', id: ex.id }} step={step} />{hint && <div className="mt-4"><Tutor>{step === 1 ? say(lang, `Répartis les jetons en parts égales. Un jeton vaut ${concreteSpec(ex).value} ${ex.unit[lang]}.`, `Distribute counters equally. One counter represents ${concreteSpec(ex).value} ${ex.unit[lang]}.`, `وزع الأقراص بالتساوي. القرص يمثل ${concreteSpec(ex).value} ${ex.unit[lang]}.`, `Reparte las fichas por igual. Cada ficha representa ${concreteSpec(ex).value} ${ex.unit[lang]}.`) : ex.hints[hintKey][lang]}{step === 3 && <p className="mt-2">{ex.hints.answer[lang]}</p>}</Tutor></div>}</div></>}</section>;
}

function HighSchool({ lang, onSave, onBack, modes, notions }: Props & { onBack: () => void; modes: HighSchoolMode[] }) {
  const [mode, setMode] = useState<string>(modes[0] ?? 'graph');
  const [a, setA] = useState(1);
  const [p, setP] = useState(50);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const d = DICTS[lang];
  const statement = mode === 'tree' ? say(lang, `Deux tirages indépendants : P(A) = ${p / 100}. Quelle est P(A puis A) ?`, `Two independent draws: P(A) = ${p / 100}. What is P(A then A)?`, `سحبان مستقلان: P(A) = ${p / 100}. ما احتمال A ثم A؟`, `Dos sorteos independientes: P(A) = ${p / 100}. ¿Cuál es P(A y luego A)?`) : mode === 'sign' ? say(lang, 'Quel est le signe de x² − 4 entre −2 et 2 ?', 'What is the sign of x² − 4 between −2 and 2?', 'ما إشارة x² − 4 بين −2 و2؟', '¿Cuál es el signo de x² − 4 entre −2 y 2?') : say(lang, `Pour f(x) = ${a}x², quelles sont les variations ?`, `For f(x) = ${a}x², what are the variations?`, `ما تغيرات الدالة f(x) = ${a}x²؟`, `Para f(x) = ${a}x², ¿cuáles son sus variaciones?`);
  const options = mode === 'tree' ? [String(Math.round((p / 100) ** 2 * 10000) / 10000), String(p / 100), '1'] : mode === 'sign' ? [say(lang, 'Négatif', 'Negative', 'سالب', 'Negativo'), say(lang, 'Positif', 'Positive', 'موجب', 'Positivo'), '0'] : [a > 0 ? '↘ puis ↗' : '↗ puis ↘', a > 0 ? '↗ puis ↘' : '↘ puis ↗', '→'];
  async function check() { if (selected !== 0) { setError(d.ws.almost); return; } setBusy(true); try { await onSave({ kind: 'workshop', notion: highSchoolNotion(mode as HighSchoolMode, notions?.map(n => n.id)), correct: 1, total: 1, date: new Date().toISOString(), minutes: 5 }); setDone(true); } catch { setError(say(lang, 'Sauvegarde indisponible.', 'Save unavailable.', 'الحفظ غير متاح.', 'No se pudo guardar.')); } setBusy(false); }
  const curve = Array.from({ length: 81 }, (_, i) => { const x = (i - 40) / 10; return `${250 + x * 50},${220 - a * x * x * 10}`; }).join(' ');
  return <section className="mx-auto max-w-4xl"><Button variant="ghost" onClick={onBack}>← {d.common.back}</Button><div className="section-heading mt-5"><span className="eyebrow">{say(lang, 'Lycée', 'High school', 'الثانوي', 'Bachillerato')}</span><h1>{say(lang, 'Explorer les mathématiques', 'Explore mathematics', 'استكشف الرياضيات', 'Explorar las matemáticas')}</h1></div><div className="mb-6 flex flex-wrap gap-2">{[['graph', say(lang, 'Graphique', 'Graph', 'منحنى', 'Gráfico')], ['tree', say(lang, 'Arbre pondéré', 'Probability tree', 'شجرة احتمالية', 'Árbol ponderado')], ['sign', say(lang, 'Tableau de signes', 'Sign table', 'جدول الإشارة', 'Tabla de signos')]].filter(([id]) => modes.includes(id as HighSchoolMode)).map(([id, label]) => <Button key={id} variant={mode === id ? 'default' : 'soft'} onClick={() => { setMode(id ?? 'graph'); setSelected(null); setDone(false); setError(''); }}>{label}</Button>)}</div><div className="activity-panel"><div className="flex items-center justify-between"><p className="text-lg font-semibold">{statement}</p><Speaker text={statement} lang={lang} /></div>{mode === 'graph' && <><div className="visual-graph my-6"><svg viewBox="0 0 500 300" role="img" aria-label={`f(x) = ${a}x²`}><path d="M30 220H470 M250 15V280" className="graph-axis" /><polyline points={curve} className="graph-curve" /><text x="460" y="240">x</text><text x="265" y="30">f(x)</text><text x="258" y="238">0</text></svg></div><label className="flex items-center gap-4 font-bold">a = {a}<input aria-label="a" type="range" min="-2" max="2" step="1" value={a} onChange={e => { const n = Number(e.target.value); setA(n === 0 ? 1 : n); setSelected(null); setDone(false); }} className="w-full accent-primary" /></label><div className="mt-5 grid grid-cols-4 border border-border text-center"><span className="bg-muted p-3">x</span><span className="p-3">−∞</span><span className="p-3">0</span><span className="p-3">+∞</span><span className="bg-muted p-3">f(x)</span><span className="p-3">{a > 0 ? '↘' : '↗'}</span><span className="p-3">0</span><span className="p-3">{a > 0 ? '↗' : '↘'}</span></div></>}{mode === 'tree' && <><div className="probability-tree my-7" dir="ltr"><div className="tree-start">●</div><div className="tree-branches"><div className="tree-node">A · {p / 100}<div className="tree-leaves"><span>A · {p / 100}</span><span>Ā · {1 - p / 100}</span></div></div><div className="tree-node">Ā · {1 - p / 100}<div className="tree-leaves"><span>A · {p / 100}</span><span>Ā · {1 - p / 100}</span></div></div></div></div><label className="flex items-center gap-4">P(A) = {p}%<input aria-label="P(A)" type="range" min="10" max="90" step="10" value={p} onChange={e => { setP(Number(e.target.value)); setSelected(null); setDone(false); }} className="w-full accent-primary" /></label></>}{mode === 'sign' && <div className="my-8 overflow-x-auto"><table className="w-full border-collapse text-center" dir="ltr"><tbody><tr><th>x</th><td>−∞ …</td><td>−2</td><td>…</td><td>2</td><td>… +∞</td></tr><tr><th>x + 2</th><td>−</td><td>0</td><td>+</td><td>+</td><td>+</td></tr><tr><th>x − 2</th><td>−</td><td>−</td><td>−</td><td>0</td><td>+</td></tr><tr><th>x² − 4</th><td>+</td><td>0</td><td>−</td><td>0</td><td>+</td></tr></tbody></table></div>}<div className="mt-7 flex flex-wrap gap-3">{options.map((option, i) => <Button key={i} variant={selected === i ? 'default' : 'soft'} onClick={() => { setSelected(i); setError(''); }} aria-pressed={selected === i}>{option.includes('puis') ? option.replace('puis', say(lang, 'puis', 'then', 'ثم', 'luego')) : option}</Button>)}</div>{done ? <div className="mt-5"><Tutor>{d.ws.great}</Tutor></div> : <Button onClick={check} disabled={selected === null || busy} className="mt-6">{d.ws.check}<ArrowRight /></Button>}{error && <div className="mt-4"><Tutor>{error}<p className="mt-2">{mode === 'tree' ? 'P(A ∩ A) = P(A) × P(A)' : mode === 'graph' ? 'f′(x) = 2ax' : '(x − 2)(x + 2)'}</p></Tutor></div>}</div></section>;
}