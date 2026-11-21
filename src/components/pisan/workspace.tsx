import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { ArrowRight, BookOpen, Brain, ChevronDown, ChevronRight, CircleUserRound, ClipboardCheck, Crown, Flame, GraduationCap, Home, LayoutDashboard, LogOut, Menu, RotateCcw, ShieldCheck, Sparkles, Star, TrendingUp, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { teacherText } from '@/lib/teacher-i18n';
import { joinClass, leaveClass, studentAssignments, studentClasses } from '@/lib/teacher.functions';
import { visibleAssignments, type Assignment } from '@/lib/assignments';
import { AssignmentRow } from './assignment-row';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { countriesByName, getCountry, getLevel } from '@/lib/curriculum';
import { programmeFor, programmeNotions, tracksFor } from '@/lib/programmes';
import { DICTS, LANGS, dirOf, type Lang } from '@/lib/i18n';
import { appendFractionJournal, consumeExercise, openSession, saveAttempt } from '@/lib/session.functions';
import { say, type Attempt, type LearningSession, type Profile } from '@/lib/pisan';
import { todayKey } from '@/lib/plan';
import { shouldShowTestBar } from '@/lib/test-mode';
import { BrandMark } from './brand';
import { TeacherLogin } from './teacher-login';
import avatar from '@/assets/pisan-avatar.webp';
import { BottomTabs, tabLabel, type Tab } from './nav';
import { nextChapter, notionToPractise, studyChapters } from '@/lib/next-step';
import { chaptersForLevel, getNotion, type NotionId } from '@/lib/curriculum';
import type { Programme } from '@/lib/programmes';
import { Tutor } from './shared';
import { DysButton, DysPanel, DysProvider } from './dys';
import { CoachTokenProvider } from './coach';
import { DailyChallenge } from './daily-challenge';
import { checkSkillStep, finishSkillSession, startSkillSession, submitConsolidation, submitDiagnostic, submitExam } from '@/lib/grading.functions';
import type { Grader } from '@/lib/grading';
import type { SkillEngine } from '@/lib/skill-session';
import { AccountSection, ResumeProfile } from './account';
import { readSessionKey, SESSION_KEY, writeSessionKey } from '@/lib/recovery';
import { greeting } from '@/lib/greeting';
import { dueReviews } from '@/lib/skills';
import { StreakBadge, browserTimeZone } from './streak';
import { Speaker } from './shared';
import { CHALLENGE_STARS } from '@/lib/challenge';
import type { StreakResult, Progress } from '@/lib/pisan';

const icons = { home: Home, diagnostic: Brain, workshop: BookOpen, exam: ClipboardCheck, journey: TrendingUp, tracking: LayoutDashboard };

// Les écrans d'activité (atelier, diagnostic, contrôle, consolidation) et leurs manipulations sont chargés
// à la demande : l'accueil s'affiche sans attendre ce code, plus lourd.
const LazyWorkshop = lazy(() => import('./workshop').then(m => ({ default: m.Workshop })));
const LazyExam = lazy(() => import('./exam').then(m => ({ default: m.Exam })));
const LazyDiagnostic = lazy(() => import('./diagnostic').then(m => ({ default: m.Diagnostic })));
const LazyConsolidation = lazy(() => import('./diagnostic').then(m => ({ default: m.Consolidation })));
const LazyJourney = lazy(() => import('./progress').then(m => ({ default: m.Journey })));
const LazyDashboard = lazy(() => import('./progress').then(m => ({ default: m.Dashboard })));
const Loading = () => <p className="animate-pulse p-10 text-muted-foreground" role="status">PiSan…</p>;
function Workshop(props: ComponentProps<typeof import('./workshop').Workshop>) { return <Suspense fallback={<Loading />}><LazyWorkshop {...props} /></Suspense>; }
function Exam(props: ComponentProps<typeof import('./exam').Exam>) { return <Suspense fallback={<Loading />}><LazyExam {...props} /></Suspense>; }
function Diagnostic(props: ComponentProps<typeof import('./diagnostic').Diagnostic>) { return <Suspense fallback={<Loading />}><LazyDiagnostic {...props} /></Suspense>; }
function Journey(props: ComponentProps<typeof import('./progress').Journey>) { return <Suspense fallback={<Loading />}><LazyJourney {...props} /></Suspense>; }
function Dashboard(props: ComponentProps<typeof import('./progress').Dashboard>) { return <Suspense fallback={<Loading />}><LazyDashboard {...props} /></Suspense>; }
function Consolidation(props: ComponentProps<typeof import('./diagnostic').Consolidation>) { return <Suspense fallback={<Loading />}><LazyConsolidation {...props} /></Suspense>; }

const STORAGE_BLOCKED: Record<Lang, string> = {
  fr: 'Ton navigateur bloque l’enregistrement : tes progrès seront perdus en fermant l’onglet. Note ton code de reprise dans les réglages.',
  en: 'Your browser blocks saving: your progress will be lost when you close the tab. Write down your recovery code in the settings.',
  ar: 'متصفحك يمنع الحفظ: ستضيع نتائجك عند إغلاق الصفحة. احتفظ برمز الاسترجاع من الإعدادات.',
  es: 'Tu navegador bloquea el guardado: perderás tu progreso al cerrar la pestaña. Anota tu código de recuperación en los ajustes.',
};

export function Workspace() {
  const open = useServerFn(openSession);
  const join = useServerFn(joinClass);
  const leave = useServerFn(leaveClass);
  const listClasses = useServerFn(studentClasses);
  const listAssignments = useServerFn(studentAssignments);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [memberships, setMemberships] = useState<{id:string;name:string}[]>([]);
  const [classBusy,setClassBusy] = useState(false);
  const [leaveId,setLeaveId] = useState('');
  const routeNavigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { void supabase.auth.getUser().then(({data}) => setSignedIn(Boolean(data.user))); }, []);
  const consume = useServerFn(consumeExercise);
  const save = useServerFn(saveAttempt);
  const examFn = useServerFn(submitExam), diagnosticFn = useServerFn(submitDiagnostic), consolidationFn = useServerFn(submitConsolidation);
  const startFn = useServerFn(startSkillSession), checkFn = useServerFn(checkSkillStep), finishFn = useServerFn(finishSkillSession);
  const appendJournal = useServerFn(appendFractionJournal);
  const journalTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [token, setToken] = useState('');
  const [session, setSession] = useState<LearningSession | null>(null);
  const [lang, setLang] = useState<Lang>('fr');
  const [tab, setTab] = useState<Tab>('home');
  const [practiceNotion, setPracticeNotion] = useState<NotionId | null>(null);
  const [ready, setReady] = useState(false);
  const [showTestBar, setShowTestBar] = useState(import.meta.env.DEV);
  const [setup, setSetup] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [error, setError] = useState('');
  const [paymentNotice, setPaymentNotice] = useState(false);
  const [dysOpen, setDysOpen] = useState(false);
  const [streakNote, setStreakNote] = useState('');
  const d = DICTS[lang];
  const langRef = useRef(lang);
  langRef.current = lang;
  const hasSession = !!session;
  /** Ferme le profil sur cet appareil : la clé est oubliée, les progrès restent sur le serveur. */
  function logout() { try { localStorage.removeItem(SESSION_KEY); } catch { /* rien à effacer */ } window.location.reload(); }
  /** Reprend un profil existant avec son code ; ne crée jamais de profil vide. */
  async function resume(code: string): Promise<boolean> {
    const found = await open({ data: { token: code } });
    if (!found) return false;
    if (!writeSessionKey(code)) { setToken(code); setSession(found); setSetup(false); return true; }
    window.location.reload();
    return true;
  }
  useEffect(() => {
    let cancelled = false;
    setShowTestBar(shouldShowTestBar(import.meta.env.DEV, window.location.hostname));
    let { key: credential, persisted } = readSessionKey();
    if (!credential || !/^[a-f0-9]{64}$/.test(credential)) { credential = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join(''); persisted = writeSessionKey(credential) && persisted; }
    // Stockage bloqué : l'appli marche quand même, mais la clé sera perdue en fermant l'onglet.
    if (!persisted) setError(STORAGE_BLOCKED[langRef.current]);
    setToken(credential);
    open({ data: { token: credential } }).then(result => { if (cancelled) return; if (result) { setSession(result); const tz = browserTimeZone(); if (!result.profile.timezone && tz) { void open({ data: { token: credential, profile: { ...result.profile, timezone: tz } } }).then(r => { if (!cancelled && r) setSession(r); }).catch(() => {}); } setLang(result.profile.lang); setSetup(false); } setReady(true); }).catch(() => { if (!cancelled) { setError('La sauvegarde est temporairement indisponible. Réessayez dans un instant.'); setReady(true); } });
    return () => { cancelled = true; window.speechSynthesis?.cancel(); };
  }, [open]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = dirOf(lang); window.speechSynthesis?.cancel(); }, [lang]);
  const country = getCountry(session?.profile.country ?? 'ma');
  const level = getLevel(country.id, session?.profile.grade ?? 0);
  const programme = programmeFor(country.id, session?.profile.grade ?? 0, session?.profile.track);
  const programmeChapters = programme ? programmeNotions(programme) : undefined;
  const programmeKey = `${level}-${country.id}-${session?.profile.track ?? ''}`;
  const resumeChapter = session ? nextChapter(studyChapters(programme, chaptersForLevel(level), session.progress)) : null;
  const resumeNotion = session && resumeChapter ? notionToPractise(resumeChapter, session.progress) : undefined;
  const left = session?.partner ? null : Math.max(0, 3 - (session?.usage_date === todayKey() ? session.usage_count : 0));
  const label = (id: Tab) => tabLabel(id, lang);
  const navigate = (next: Tab) => { window.speechSynthesis?.cancel(); setTab(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // Devoirs de la classe : rechargés quand la liste des classes change ; une erreur n'empêche pas d'utiliser l'appli.
  useEffect(() => { if (!hasSession || !token) return; let cancelled=false; listAssignments({data:{token}}).then(rows=>{if(!cancelled)setAssignments(rows);}).catch(()=>{if(!cancelled)setAssignments([]);}); return ()=>{cancelled=true;}; }, [token,hasSession,memberships.length,listAssignments]);
  useEffect(() => { if (!hasSession || !token) return; let cancelled=false; listClasses({data:{token}}).then(rows=>{if(!cancelled)setMemberships(rows);}).catch(()=>{if(!cancelled)setMemberships([]);}); return ()=>{cancelled=true;}; }, [settingsOpen,token,hasSession,listClasses,lang]);
  async function depart(memberId:string) {
    setClassBusy(true);
    try { await leave({data:{token,memberId}}); setMemberships(rows=>rows.filter(m=>m.id!==memberId)); setError(teacherText(lang).left); setLeaveId(''); } catch {setError(teacherText(lang).error);} finally {setClassBusy(false);}
  }
  async function register(profile: Profile, code: string, classCode: string) {
    const result = await open({ data: { token, profile, code } });
    if (!result) throw new Error('Unavailable');
    const wasSetup=setup;
    setSession(result); setLang(profile.lang); setSetup(false); setSettingsOpen(false); setError('');
    if (classCode.trim()) {
      try {
        const joined=await join({data:{token,code:classCode.trim()}});
        if(joined.status==='invalid') {setError(wasSetup ? teacherText(profile.lang).joinMissingCreated : teacherText(profile.lang).joinMissing);return;}
        if(joined.status==='limited') {setError(teacherText(profile.lang).joinLimited);return;}
        const fresh=await open({data:{token}}); if(fresh)setSession(fresh);
      } catch {setError(teacherText(profile.lang).error);}
    }
  }
  async function start() {
    const allowed = await consume({ data: { token } });
    if (!allowed) { setUpgrade(true); return false; }
    const fresh = await open({ data: { token } });
    if (fresh) setSession(fresh);
    return true;
  }
  function applyStreak(progress: Progress, streak: StreakResult | null, extra: Partial<LearningSession> = {}) {
    setSession(s => s ? { ...s, ...extra, progress, ...(streak ? { streak_count: streak.count, streak_last_day: streak.last_day, freezes: streak.freezes } : {}) } : s);
    if (streak?.restarted) setStreakNote(say(lang, 'Nouvelle série ! Chaque jour compte.', 'New streak! Every day counts.', 'سلسلة جديدة! كل يوم مهم.', '¡Nueva racha! Cada día cuenta.'));
    else if (streak?.used_freeze) setStreakNote(say(lang, 'Un gel a gardé ta flamme allumée. Bon retour !', 'A freeze kept your flame alive. Welcome back!', 'حافظ التجميد على شعلتك. مرحبًا بعودتك!', 'Una congelación mantuvo tu llama. ¡Bienvenido de nuevo!'));
  }
  /** Petites activités sans score détaillé (problèmes en barres, graphiques) : 1 point au plus. */
  async function record(attempt: Attempt) { const r = await save({ data: { token, attempt: { kind: 'workshop', notion: attempt.notion, correct: Math.min(1, attempt.correct), total: 1, date: attempt.date, minutes: Math.min(30, attempt.minutes) } } }); applyStreak(r.progress, r.streak); }
  // Correction faite par le serveur : l'appli n'envoie que les réponses (src/lib/grading.functions.ts).
  // Le moteur reste stable entre deux rendus ; il appelle toujours la dernière version d'applyStreak.
  const applyStreakRef = useRef(applyStreak);
  applyStreakRef.current = applyStreak;
  const grader: Grader = {
    exam: async (notion, choices) => { const r = await examFn({ data: { token, notion, choices } }); applyStreak(r.progress, r.streak); },
    diagnostic: async choices => { const r = await diagnosticFn({ data: { token, choices } }); applyStreak(r.progress, r.streak); },
    consolidation: async (notion, choices) => { const r = await consolidationFn({ data: { token, notion, choices } }); applyStreak(r.progress, r.streak); },
  };
  const engine = useMemo<SkillEngine>(() => ({
    start: (kind, skills) => startFn({ data: { token, kind, skills } }),
    check: (ticket, answer) => checkFn({ data: { token, ticket, answer } }),
    finish: async ticket => { const r = await finishFn({ data: { token, ticket } }); applyStreakRef.current(r.progress, r.streak); return { attempts: r.attempts }; },
  }), [token, startFn, checkFn, finishFn]);
  function recordFractionJournal(skillId: string, event: { activityId: string; type: import('@/lib/fraction-journal').FractionJournalEventType; payload: Record<string, unknown>; clientOccurredAt?: string }) {
    if (!token) return;
    const persist = () => {
      const pending = journalTimers.current.get(event.activityId);
      if (pending) { clearTimeout(pending); journalTimers.current.delete(event.activityId); }
      void appendJournal({ data: { token, events: [{ eventId: crypto.randomUUID(), activityId: event.activityId, skillId, type: event.type, payload: event.payload, ...(event.clientOccurredAt ? { clientOccurredAt: event.clientOccurredAt } : {}) }] } }).catch(() => { /* Le journal sert à l'analyse : un échec ne doit pas interrompre l'élève. */ });
    };
    // Le curseur de la droite graduée peut émettre de nombreux changements :
    // on conserve le dernier état après une courte période sans mouvement.
    if (event.type === 'manipulation' && event.payload['action'] === 'position-changed') {
      const previous = journalTimers.current.get(event.activityId);
      if (previous) clearTimeout(previous);
      journalTimers.current.set(event.activityId, setTimeout(persist, 400));
      return;
    }
    persist();
  }
  const practise = (notion: NotionId) => { setPracticeNotion(notion); navigate('practice'); };
  const switchView = (next: Tab) => { if (setup) { setError(say(lang, 'Choisis un pseudonyme et ta classe pour commencer.', 'Choose a nickname and grade to begin.', 'اختر اسمًا مستعارًا وصفك للبدء.', 'Elige un alias y curso para empezar.')); return; } navigate(next); };
  return <DysProvider defaults={session?.dys_default} revision={session?.dys_updated_at}><CoachTokenProvider token={session ? token : ''} eligible={!!session && (session.partner || memberships.length > 0)}><div dir={dirOf(lang)} className="pisan-root min-h-screen">{showTestBar && <div className="test-strip"><div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-2 px-4"><span className="me-2 hidden text-[10px] font-bold uppercase sm:block">{d.test.label}</span><Button variant="ghost" size="sm" onClick={() => switchView('home')} className={tab !== 'tracking' ? 'bg-testbar-foreground/10' : ''}><GraduationCap />{d.test.student}</Button><Button variant="ghost" size="sm" onClick={() => switchView('tracking')} className={tab === 'tracking' ? 'bg-testbar-foreground/10' : ''}><LayoutDashboard />{d.test.parent}</Button></div></div>}
    <header className="app-header"><div className="header-inner"><div className="flex items-center gap-3"><Button variant="ghost" onClick={() => !setup && navigate('home')} className="h-auto p-0 hover:bg-transparent" aria-label="PiSan"><BrandMark /></Button><div className="hidden border-s border-border ps-4 sm:block"><p className="text-xs font-semibold text-muted-foreground">{say(lang, 'Les maths deviennent enfin visuelles', 'Math finally becomes visual', 'الرياضيات تصبح أخيرًا بصرية', 'Las matemáticas por fin son visuales')}</p></div></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="global-language">{d.setup.lang}</label><select id="global-language" className="language-select hidden sm:block" value={lang} onChange={e => setLang(e.target.value as Lang)}>{LANGS.map(l => <option key={l.id} value={l.id}>{l.id.toUpperCase()}</option>)}</select><Button variant="ghost" size="sm" className="teacher-entry" aria-label={teacherText(lang).teacher} onClick={() => routeNavigate({to:signedIn ? "/teacher" : "/auth"})}><GraduationCap/><span className="sm:hidden">{say(lang, 'Prof', 'Teacher', 'أستاذ', 'Profe')}</span><span className="hidden sm:inline">{teacherText(lang).teacher}</span></Button><DysButton lang={lang} onClick={() => setDysOpen(true)} />{!setup && <Button variant="ghost" className="profile-button" onClick={() => setSettingsOpen(true)} title={say(lang, 'Mon profil, réglages et déconnexion', 'My profile, settings and log out', 'ملفي، الإعدادات والخروج', 'Mi perfil, ajustes y cerrar sesión')}><CircleUserRound aria-hidden /><span>{say(lang, 'Profil', 'Profile', 'ملفي', 'Perfil')}</span></Button>}<div className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-deep sm:flex">{session?.profile.nickname.slice(0, 1).toUpperCase() ?? 'π'}</div></div></div></header>
    {streakNote && <div role="status" className="mx-auto my-3 flex max-w-5xl items-center gap-2 bg-sun-soft px-5 py-3 text-sm">{streakNote}<Speaker text={streakNote} lang={lang} /><Button variant="ghost" size="sm" onClick={() => setStreakNote('')} className="ms-auto" aria-label={d.common.close}><X /></Button></div>}
    {error && <div role="alert" className="mx-auto my-3 max-w-5xl bg-accent-soft px-5 py-3 text-sm text-accent-deep">{error}<Button variant="ghost" size="sm" onClick={() => setError('')} className="ms-3" aria-label={d.common.close}><X /></Button></div>}
    {!ready ? <main className="mx-auto max-w-5xl p-10"><p className="animate-pulse text-muted-foreground">PiSan…</p></main> : setup ? <><Setup lang={lang} setLang={setLang} onSubmit={register} /><div className="mx-auto max-w-xl px-4 pb-10"><ResumeProfile lang={lang} onResume={resume} /></div></> : session && <div className="workspace-layout"><aside className={`app-sidebar ${mobileNav ? 'mobile-open' : ''}`}><p className="sidebar-label">{say(lang, 'MON ESPACE', 'MY SPACE', 'مساحتي', 'MI ESPACIO')}</p><nav className="space-y-1" aria-label={say(lang, 'Navigation principale', 'Main navigation', 'القائمة الرئيسية', 'Navegación principal')}>{(['home', 'diagnostic', 'workshop', 'exam', 'journey'] as Tab[]).map(id => { const Icon = icons[id as keyof typeof icons]; return <Button key={id} variant="ghost" className={`sidebar-link ${tab === id ? 'sidebar-active' : ''}`} onClick={() => navigate(id)} aria-current={tab === id ? 'page' : undefined}><Icon /><span>{label(id)}</span>{tab === id && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />}</Button>; })}</nav><p className="sidebar-label mt-6">{say(lang, 'POUR LES ADULTES', 'FOR ADULTS', 'للكبار', 'PARA ADULTOS')}</p><Button variant="ghost" className={`sidebar-link ${tab === 'tracking' ? 'sidebar-active' : ''}`} onClick={() => navigate('tracking')} aria-current={tab === 'tracking' ? 'page' : undefined}><LayoutDashboard /><span>{label('tracking')}</span></Button><Button variant="ghost" className="sidebar-link" onClick={() => { setMobileNav(false); setSettingsOpen(true); }}><LogOut /><span>{say(lang, 'Mon profil · Se déconnecter', 'My profile · Log out', 'ملفي · الخروج', 'Mi perfil · Salir')}</span></Button><div className="sidebar-bottom"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-primary-deep" />{session.partner ? d.plan.partnerShort : d.plan.discovery}</div><p className="mt-2 text-xs text-muted-foreground">{session.partner ? d.plan.unlimited : d.plan.left.replace('{n}', String(left))}</p>{!session.partner && <Button variant="sun" size="sm" className="mt-4 w-full" onClick={() => setUpgrade(true)}><Crown />{say(lang, 'Passer à l’illimité', 'Go unlimited', 'انتقل إلى اللامحدود', 'Acceso ilimitado')}</Button>}<div className="mt-7 border-t border-border pt-4 text-[11px] text-muted-foreground">PiSan · {say(lang, 'À ton rythme.', 'At your pace.', 'على وتيرتك.', 'A tu ritmo.')}</div></div></aside><main className="workspace-main">{tab === 'home' && <HomePage assignments={assignments} session={session} token={token} programme={programme} level={level} onPractice={practise} onChallenge={r => applyStreak(r.progress, r.streak, { challenge_day: r.day, challenge_correct: r.correct })} lang={lang} left={left} onNavigate={navigate} onUpgrade={() => setUpgrade(true)} />}{tab === 'diagnostic' && <Diagnostic key={`diag-${programmeKey}`} lang={lang} level={level} notions={programmeChapters} grade={grader} onWorkshop={() => navigate('workshop')} />}{tab === 'workshop' && <Workshop key={`ws-${programmeKey}`} streak={{ count: session.streak_count, lastDay: session.streak_last_day, freezes: session.freezes, timezone: session.profile.timezone }} lang={lang} level={level} country={country.id} notions={programmeChapters} focus={resumeNotion} programme={programme} progress={session.progress} assignments={assignments} engine={engine} onSave={record} onStart={start} onJournalEvent={(skillId, event) => recordFractionJournal(skillId, event)} />}{tab === 'exam' && <Exam key={`exam-${programmeKey}`} lang={lang} level={level} notions={programmeChapters} initialNotion={resumeNotion} grade={grader} onStart={start} />}{tab === 'journey' && <Journey lang={lang} level={level} programme={programme} progress={session.progress} onPractice={practise} onTracking={() => navigate('tracking')} />}{tab === 'practice' && practiceNotion && <Consolidation key={practiceNotion} lang={lang} notion={getNotion(practiceNotion)} grade={grader} onDone={() => navigate('journey')} />}{tab === 'tracking' && <Dashboard lang={lang} level={level} programme={programme} chapters={programmeChapters} progress={session.progress} nickname={session.profile.nickname} streak={{ count: session.streak_count, lastDay: session.streak_last_day, freezes: session.freezes, timezone: session.profile.timezone }} />}</main><BottomTabs lang={lang} tab={tab} onNavigate={navigate} /></div>}
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogTitle>{d.setup.settings}</DialogTitle><DialogDescription>{session?.profile.nickname}</DialogDescription>{session && token && <AccountSection lang={lang} token={token} onLogout={logout} />}<div className="space-y-3">{memberships.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">{m.name}</span><Button variant="ghost" disabled={classBusy} onClick={()=>setLeaveId(m.id)}>{teacherText(lang).leave}</Button></div>)}</div><Setup compact lang={lang} setLang={setLang} initial={session?.profile} onSubmit={register} /></DialogContent></Dialog>
    <Dialog open={Boolean(leaveId)} onOpenChange={open=>{if(!open)setLeaveId('');}}><DialogContent><DialogTitle>{teacherText(lang).leave}</DialogTitle><DialogDescription>{teacherText(lang).confirmLeave}</DialogDescription><Button disabled={classBusy} onClick={()=>depart(leaveId)}>{teacherText(lang).leave}</Button></DialogContent></Dialog>
    <Dialog open={upgrade} onOpenChange={v => { setUpgrade(v); setPaymentNotice(false); }}><DialogContent className="max-w-2xl"><DialogTitle className="font-display text-3xl">PiSan {say(lang, 'Illimité', 'Unlimited', 'بلا حدود', 'Ilimitado')}</DialogTitle><DialogDescription>{left === 0 ? d.upgrade.limitBody : d.upgrade.subtitle}</DialogDescription><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg border-2 border-border p-5"><p className="text-sm font-bold">{d.upgrade.monthly}</p><p className="my-4 text-4xl font-bold">12 €<span className="text-sm font-normal text-muted-foreground">{d.upgrade.perMonth}</span></p><Button onClick={() => setPaymentNotice(true)} variant="soft" className="w-full">{d.upgrade.choose}</Button></div><div className="rounded-lg border-2 border-primary bg-primary-soft p-5"><p className="text-sm font-bold">{d.upgrade.yearly}</p><p className="my-4 text-4xl font-bold">89 €<span className="text-sm font-normal text-muted-foreground">{d.upgrade.perYear}</span></p><Button onClick={() => setPaymentNotice(true)} className="w-full">{d.upgrade.choose}</Button></div></div>{paymentNotice && <p role="status" className="rounded-lg bg-accent-soft p-4 text-sm">{say(lang, 'Le paiement n’est pas encore connecté. Aucun montant n’a été débité.', 'Payments are not connected yet. You have not been charged.', 'الدفع غير متصل بعد. لم يتم خصم أي مبلغ.', 'Los pagos aún no están conectados. No se ha cobrado nada.')}</p>}</DialogContent></Dialog>
    <DysPanel lang={lang} open={dysOpen} onOpenChange={setDysOpen} />
  </div></CoachTokenProvider></DysProvider>;
}

function Setup({ lang, setLang, onSubmit, initial, compact = false }: { lang: Lang; setLang: (l: Lang) => void; onSubmit: (p: Profile, code: string, classCode: string) => Promise<void>; initial?: Profile | undefined; compact?: boolean }) {
  const d = DICTS[lang];
  const [country, setCountry] = useState(initial?.country ?? 'ma');
  const [grade, setGrade] = useState(initial?.grade ?? 0);
  const tracks = tracksFor(country, grade);
  const [trackChoice, setTrack] = useState(initial?.track ?? '');
  const track = tracks.some(t => t.id === trackChoice) ? trackChoice : tracks[0]?.id;
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [code, setCode] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [classCode, setClassCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { await onSubmit({ nickname: nickname.trim(), country, grade, lang, ...(track ? { track } : {}), ...(browserTimeZone() ? { timezone: browserTimeZone() } : {}) }, code, classCode); } catch { setError(say(lang, 'Impossible de créer votre espace. Réessayez.', 'Could not create your space. Try again.', 'تعذر إنشاء مساحتك. حاول مجددًا.', 'No se pudo crear tu espacio. Reintenta.')); } setBusy(false); }
  return <main className={compact ? '' : 'setup-page'}>{!compact && <div className="setup-intro"><span className="eyebrow">{say(lang, 'UN PETIT PAS, UN GRAND DÉCLIC', 'SMALL STEPS, BIG DISCOVERIES', 'خطوة صغيرة، اكتشاف كبير', 'PASOS PEQUEÑOS, GRANDES DESCUBRIMIENTOS')}</span><h1>{say(lang, 'Bienvenue chez PiSan', 'Welcome to PiSan', 'مرحبًا بك في PiSan', 'Bienvenido a PiSan')}</h1><p>{say(lang, 'Les maths deviennent enfin visuelles', 'Math finally becomes visual', 'الرياضيات تصبح أخيرًا بصرية', 'Las matemáticas por fin son visuales')}</p></div>}<div className={compact ? '' : 'setup-content'}>{!compact && <div className="setup-companion"><img src={avatar} alt="Le symbole π de PiSan" className="setup-mascot" /><div className="setup-quote"><span className="text-2xl font-display">{say(lang, 'On commence ensemble ?', 'Shall we start together?', 'هل نبدأ معًا؟', '¿Empezamos juntos?')}</span><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{say(lang, 'Pas de pression. Pas de classement. Juste toi, et le plaisir de comprendre.', 'No pressure. No rankings. Just you, and the joy of understanding.', 'لا ضغط ولا ترتيب. أنت ومتعة الفهم فقط.', 'Sin presión. Sin rankings. Solo tú y el placer de comprender.')}</p><div className="mt-5 flex items-center gap-2 text-xs text-primary-deep"><ShieldCheck className="h-4 w-4" />{say(lang, 'Pseudonyme uniquement · sans email', 'Nickname only · no email', 'اسم مستعار فقط · بدون بريد', 'Solo un alias · sin email')}</div></div></div>}<div className={compact ? '' : 'setup-form'}>{!compact && <div className="role-tabs" role="tablist" aria-label={say(lang, 'Je suis', 'I am', 'أنا', 'Soy')}>{(['student', 'teacher'] as const).map(r => <button key={r} type="button" role="tab" aria-selected={role === r} className="role-tab" onClick={() => setRole(r)}>{r === 'student' ? <><GraduationCap className="h-5 w-5" />{say(lang, 'Élève', 'Student', 'تلميذ', 'Alumno')}</> : <><BookOpen className="h-5 w-5" />{say(lang, 'Enseignant', 'Teacher', 'أستاذ', 'Docente')}</>}</button>)}</div>}{!compact && role === 'teacher' ? <TeacherLogin lang={lang} /> : <form onSubmit={submit}><div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={d.setup.lang}>{LANGS.map(l => <Button key={l.id} size="sm" variant={lang === l.id ? 'default' : 'soft'} onClick={() => setLang(l.id)} type="button" aria-pressed={lang === l.id}>{l.flag} {l.id.toUpperCase()}</Button>)}</div><label className="field-label" htmlFor="nickname">{say(lang, 'Ton pseudonyme', 'Your nickname', 'اسمك المستعار', 'Tu alias')}</label><input id="nickname" className="form-input" required maxLength={40} autoComplete="off" placeholder={say(lang, 'Ex. : Explorateur', 'e.g. Explorer', 'مثال: المستكشف', 'Ej.: Explorador')} value={nickname} onChange={e => setNickname(e.target.value)} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="country">{d.setup.country}</label><select id="country" className="form-select" value={country} onChange={e => { setCountry(e.target.value); setGrade(0); }}>{countriesByName(lang).map(c => <option key={c.id} value={c.id}>{c.flag} {c.name[lang]}</option>)}</select></div><div><label className="field-label" htmlFor="grade">{d.setup.grade}</label><select id="grade" className="form-select" value={grade} onChange={e => setGrade(Number(e.target.value))}>{getCountry(country).grades.map((g, i) => <option key={i} value={i}>{g.label[lang]}</option>)}</select></div></div>{tracks.length > 0 && <div className="mt-5"><label className="field-label" htmlFor="track">{say(lang, 'Ta filière', 'Your track', 'شعبتك', 'Tu modalidad')}</label><select id="track" className="form-select" value={track} onChange={e => setTrack(e.target.value)}>{tracks.map(t => <option key={t.id} value={t.id}>{t.label[lang]}</option>)}</select></div>}<label className="field-label mt-5" htmlFor="partner-code">{d.setup.code}<span className="ms-2 text-xs font-normal text-muted-foreground">({d.setup.optional})</span></label><input id="partner-code" className="form-input" value={code} onChange={e => setCode(e.target.value)} placeholder={d.setup.codePlaceholder} maxLength={100} autoComplete="off" /><label className="field-label mt-5" htmlFor="class-code">{teacherText(lang).joinOptional}</label><input id="class-code" className="form-input" value={classCode} onChange={e=>setClassCode(e.target.value)} maxLength={7} autoComplete="off" aria-describedby="class-privacy"/><p id="class-privacy" className="mt-2 text-xs leading-relaxed text-muted-foreground">{teacherText(lang).privacy}</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{d.setup.discovery}</p><Button size="lg" type="submit" disabled={busy || !nickname.trim()} className="mt-6 w-full">{compact ? d.setup.save : say(lang, 'Créer mon espace', 'Create my space', 'إنشاء مساحتي', 'Crear mi espacio')}<ArrowRight /></Button>{error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}<p className="mt-4 text-center text-[11px] text-muted-foreground">{say(lang, 'Aucun email personnel. Aucun nom de famille.', 'No personal email. No family name.', 'بدون بريد شخصي أو اسم عائلي.', 'Sin email personal. Sin apellidos.')}</p></form>}</div></div>{!compact && <div className="setup-footer"><span>PiSan</span><span>{say(lang, 'Comprendre. Visualiser. Prendre confiance.', 'Understand. Visualise. Build confidence.', 'افهم. تصوّر. اكتسب الثقة.', 'Comprender. Visualizar. Ganar confianza.')}</span></div>}</main>;
}

function HomePage({ assignments, session, token, onChallenge, lang, left, onNavigate, onUpgrade, programme, level, onPractice }: { session: LearningSession; token: string; onChallenge: (r: { progress: Progress; streak: StreakResult; correct: boolean; day: string }) => void; lang: Lang; left: number | null; onNavigate: (t: Tab) => void; onUpgrade: () => void; programme: Programme | null; level: number; onPractice: (notion: NotionId) => void; assignments: Assignment[] }) {
  const d = DICTS[lang];
  const country = getCountry(session.profile.country);
  const success = session.progress.attempts.filter(a => a.correct === a.total && a.kind !== 'challenge').length;
  const challengeWins = session.progress.attempts.filter(a => a.kind === 'challenge' && a.correct === a.total).length;
  const fresh = session.progress.attempts.length === 0;
  const chapter = nextChapter(studyChapters(programme, chaptersForLevel(level), session.progress));
  const due = dueReviews(session.progress.attempts).length;
  return <section className="mx-auto max-w-3xl">
    <div className="home-head">
      <div className="min-w-0 flex-1"><h1 className="font-display text-xl leading-tight sm:text-2xl">{greeting(lang)} {session.profile.nickname} 👋</h1>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{country.flag} {country.grades[session.profile.grade]?.label[lang]}{programme?.track ? ` · ${programme.track.label[lang]}` : ''}</p></div>
      <div className="home-chips">
        <span className="home-chip"><StreakBadge compact lang={lang} streak={{ count: session.streak_count, lastDay: session.streak_last_day, freezes: session.freezes, timezone: session.profile.timezone }} /></span>
        <span className="home-chip" title={d.home.stars}><Star className="h-4 w-4 text-sun-deep" aria-hidden /><span className="font-bold">{success * 3 + challengeWins * CHALLENGE_STARS}</span><span className="sr-only"> {d.home.stars}</span></span>
      </div>
    </div>
    <div className="resume-card mb-5">
      <p className="text-xs font-bold uppercase tracking-wide text-primary-deep">{say(lang, 'Ton prochain petit pas', 'Your next small step', 'خطوتك الصغيرة التالية', 'Tu siguiente pequeño paso')}</p>
      {fresh || !chapter
        ? <><h2 className="mt-2 text-2xl leading-snug">{say(lang, 'Faisons connaissance avec tes maths', 'Let’s get to know your maths', 'لنتعرف على مهاراتك الرياضية', 'Conozcamos tus matemáticas')}</h2>
          <p className="mt-2 text-sm">{say(lang, '6 questions, sans note, pour savoir par où commencer.', '6 questions, no grade, to find where to start.', '6 أسئلة بدون علامة لمعرفة من أين نبدأ.', '6 preguntas, sin nota, para saber por dónde empezar.')}</p>
          <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={() => onNavigate('diagnostic')}>{d.diag.start}<ArrowRight /></Button></>
        : <><h2 className="mt-2 text-2xl leading-snug">{chapter.title[lang]}</h2>
          {chapter.started ? <div className="mt-3 flex items-center gap-3"><div className="flex-1"><div className="h-2 overflow-hidden rounded-full bg-card"><div className={`h-full rounded-full bg-primary meter-${Math.round(chapter.mastery / 10)}`} /></div></div><span className="text-sm font-bold">{chapter.mastery} %</span></div> : <p className="mt-2 text-sm">{say(lang, 'Nouveau chapitre : on commence en douceur.', 'New chapter: we start gently.', 'فصل جديد: نبدأ بهدوء.', 'Capítulo nuevo: empezamos con calma.')}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-3"><Button size="lg" className="w-full sm:w-auto" onClick={() => onPractice(notionToPractise(chapter, session.progress))}>{chapter.started ? say(lang, 'Continuer', 'Continue', 'متابعة', 'Continuar') : say(lang, 'Commencer ce chapitre', 'Start this chapter', 'ابدأ هذا الفصل', 'Empezar este capítulo')}<ArrowRight /></Button><Button variant="link" onClick={() => onNavigate('journey')}>{say(lang, 'Voir tout mon parcours', 'See my whole path', 'عرض مساري كاملًا', 'Ver todo mi recorrido')}</Button></div></>}
    </div>
    <h2 className="ws-heading">{say(lang, 'Aujourd’hui', 'Today', 'اليوم', 'Hoy')}</h2>
    {due > 0 && <button type="button" className="ws-review" onClick={() => onNavigate('workshop')}>
      <RotateCcw className="h-5 w-5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 text-start"><span className="block font-bold">{say(lang, 'Mini-contrôle', 'Quick check', 'مراقبة قصيرة', 'Mini control')}</span><span className="block text-sm">{say(lang, `${due} compétence${due > 1 ? 's' : ''} acquise${due > 1 ? 's' : ''} à vérifier`, `${due} mastered skill${due > 1 ? 's' : ''} to check`, `${due} كفايات مكتسبة للتحقق`, `${due} competencia(s) por comprobar`)}</span></span>
      <ChevronRight className="h-5 w-5 shrink-0 rtl:rotate-180" aria-hidden />
    </button>}
    {visibleAssignments(assignments, session.progress.attempts).slice(0, 2).map(a => <AssignmentRow key={a.id} lang={lang} assignment={a} attempts={session.progress.attempts} onOpen={() => onNavigate('workshop')} />)}
    <DailyChallenge lang={lang} token={token} onSaved={onChallenge} />
    {left !== null && <p className="mt-6 text-center text-xs text-muted-foreground">{d.plan.left.replace('{n}', String(left))} · <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onUpgrade}>{say(lang, 'Passer à PiSan Illimité', 'Go PiSan Unlimited', 'انتقل إلى PiSan بلا حدود', 'Pasar a PiSan Ilimitado')}</Button></p>}
  </section>;
}
