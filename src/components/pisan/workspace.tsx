import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Brain, ChevronDown, ClipboardCheck, Crown, Flame, GraduationCap, Home, LayoutDashboard, Menu, Settings2, ShieldCheck, Sparkles, Star, TrendingUp, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/integrations/supabase/client';
import { teacherText } from '@/lib/teacher-i18n';
import { joinClass, leaveClass, studentClasses } from '@/lib/teacher.functions';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { COUNTRIES, getCountry, getLevel } from '@/lib/curriculum';
import { programmeFor, programmeNotions, tracksFor } from '@/lib/programmes';
import { DICTS, LANGS, dirOf, type Lang } from '@/lib/i18n';
import { consumeExercise, openSession, saveAttempt } from '@/lib/session.functions';
import { say, type Attempt, type LearningSession, type Profile } from '@/lib/pisan';
import { todayKey } from '@/lib/plan';
import { shouldShowTestBar } from '@/lib/test-mode';
import logo from '@/assets/pisan-logo.png';
import avatar from '@/assets/pisan-avatar.png';
import { Diagnostic } from './diagnostic';
import { Workshop } from './workshop';
import { Exam } from './exam';
import { Dashboard, Journey } from './progress';
import { Tutor } from './shared';
import { DysButton, DysPanel, DysProvider } from './dys';
import { CoachTokenProvider } from './coach';
import { DailyChallenge } from './daily-challenge';
import { StreakBadge, browserTimeZone } from './streak';
import { Speaker } from './shared';
import { CHALLENGE_STARS } from '@/lib/challenge';
import type { StreakResult, Progress } from '@/lib/pisan';

type Tab = 'home' | 'diagnostic' | 'workshop' | 'exam' | 'journey' | 'tracking';
const icons = { home: Home, diagnostic: Brain, workshop: BookOpen, exam: ClipboardCheck, journey: TrendingUp, tracking: LayoutDashboard };

export function Workspace() {
  const open = useServerFn(openSession);
  const join = useServerFn(joinClass);
  const leave = useServerFn(leaveClass);
  const listClasses = useServerFn(studentClasses);
  const [memberships, setMemberships] = useState<{id:string;name:string}[]>([]);
  const [classBusy,setClassBusy] = useState(false);
  const [leaveId,setLeaveId] = useState('');
  const routeNavigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { void supabase.auth.getUser().then(({data}) => setSignedIn(Boolean(data.user))); }, []);
  const consume = useServerFn(consumeExercise);
  const save = useServerFn(saveAttempt);
  const [token, setToken] = useState('');
  const [session, setSession] = useState<LearningSession | null>(null);
  const [lang, setLang] = useState<Lang>('fr');
  const [tab, setTab] = useState<Tab>('home');
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
  useEffect(() => {
    let cancelled = false;
    setShowTestBar(shouldShowTestBar(import.meta.env.DEV, window.location.hostname));
    let credential = localStorage.getItem('pisan-session');
    if (!credential || !/^[a-f0-9]{64}$/.test(credential)) { credential = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('pisan-session', credential); }
    setToken(credential);
    open({ data: { token: credential } }).then(result => { if (cancelled) return; if (result) { setSession(result); setLang(result.profile.lang); setSetup(false); } setReady(true); }).catch(() => { if (!cancelled) { setError('La sauvegarde est temporairement indisponible. Réessayez dans un instant.'); setReady(true); } });
    return () => { cancelled = true; window.speechSynthesis?.cancel(); };
  }, [open]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = dirOf(lang); window.speechSynthesis?.cancel(); }, [lang]);
  const country = getCountry(session?.profile.country ?? 'ma');
  const level = getLevel(country.id, session?.profile.grade ?? 0);
  const programme = programmeFor(country.id, session?.profile.grade ?? 0, session?.profile.track);
  const programmeChapters = programme ? programmeNotions(programme) : undefined;
  const programmeKey = `${level}-${country.id}-${session?.profile.track ?? ''}`;
  const left = session?.partner ? null : Math.max(0, 3 - (session?.usage_date === todayKey() ? session.usage_count : 0));
  const label = (id: Tab) => id === 'exam' ? say(lang, 'Mon prochain contrôle', 'My next test', 'اختباري القادم', 'Mi próximo examen') : id === 'journey' ? say(lang, 'Parcours Confiance', 'Confidence journey', 'مسار الثقة', 'Camino de confianza') : id === 'tracking' ? say(lang, 'Suivi Parent / Prof', 'Parent / Teacher view', 'متابعة الأهل / المعلم', 'Seguimiento familiar') : d.nav[id];
  const navigate = (next: Tab) => { window.speechSynthesis?.cancel(); setTab(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  useEffect(() => { if (!session || !token) return; let cancelled=false; listClasses({data:{token}}).then(rows=>{if(!cancelled)setMemberships(rows);}).catch(()=>{if(!cancelled)setError(teacherText(lang).error);}); return ()=>{cancelled=true;}; }, [settingsOpen,token,!!session,listClasses,lang]);
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
  async function record(attempt: Attempt) { const r = await save({ data: { token, attempt: attempt as Attempt & { kind: Exclude<Attempt['kind'], 'challenge'> }, timezone: browserTimeZone() } }); applyStreak(r.progress, r.streak); }
  const switchView = (next: Tab) => { if (setup) { setError(say(lang, 'Choisis un pseudonyme et ta classe pour commencer.', 'Choose a nickname and grade to begin.', 'اختر اسمًا مستعارًا وصفك للبدء.', 'Elige un alias y curso para empezar.')); return; } navigate(next); };
  return <DysProvider defaults={session?.dys_default} revision={session?.dys_updated_at}><CoachTokenProvider token={session ? token : ''} eligible={!!session && (session.partner || memberships.length > 0)}><div dir={dirOf(lang)} className="pisan-root min-h-screen">{showTestBar && <div className="test-strip"><div className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-2 px-4"><span className="me-2 hidden text-[10px] font-bold uppercase sm:block">{d.test.label}</span><Button variant="ghost" size="sm" onClick={() => switchView('home')} className={tab !== 'tracking' ? 'bg-testbar-foreground/10' : ''}><GraduationCap />{d.test.student}</Button><Button variant="ghost" size="sm" onClick={() => switchView('tracking')} className={tab === 'tracking' ? 'bg-testbar-foreground/10' : ''}><LayoutDashboard />{d.test.parent}</Button></div></div>}
    <header className="app-header"><div className="header-inner"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" aria-label={say(lang, 'Ouvrir le menu', 'Open menu', 'افتح القائمة', 'Abrir menú')} onClick={() => setMobileNav(!mobileNav)}><Menu /></Button><Button variant="ghost" onClick={() => !setup && navigate('home')} className="h-auto p-0 hover:bg-transparent" aria-label="PiSan"><img src={logo} alt="PiSan" className="header-logo" /></Button><div className="hidden border-s border-border ps-4 sm:block"><p className="text-xs font-semibold text-muted-foreground">{say(lang, 'Les maths deviennent enfin visuelles', 'Math finally becomes visual', 'الرياضيات تصبح أخيرًا بصرية', 'Las matemáticas por fin son visuales')}</p></div></div><div className="flex items-center gap-3"><label className="sr-only" htmlFor="global-language">{d.setup.lang}</label><select id="global-language" className="language-select" value={lang} onChange={e => setLang(e.target.value as Lang)}>{LANGS.map(l => <option key={l.id} value={l.id}>{l.id.toUpperCase()}</option>)}</select><Button variant="ghost" size="sm" onClick={() => routeNavigate({to:signedIn ? "/teacher" : "/auth"})}><GraduationCap/><span className="hidden md:inline">{teacherText(lang).teacher}</span></Button><DysButton lang={lang} onClick={() => setDysOpen(true)} />{!setup && <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label={d.setup.settings} title={d.setup.settings}><Settings2 /></Button>}<div className="hidden h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-deep sm:flex">{session?.profile.nickname.slice(0, 1).toUpperCase() ?? 'π'}</div></div></div></header>
    {streakNote && <div role="status" className="mx-auto my-3 flex max-w-5xl items-center gap-2 bg-sun-soft px-5 py-3 text-sm">{streakNote}<Speaker text={streakNote} lang={lang} /><Button variant="ghost" size="sm" onClick={() => setStreakNote('')} className="ms-auto" aria-label={d.common.close}><X /></Button></div>}
    {error && <div role="alert" className="mx-auto my-3 max-w-5xl bg-accent-soft px-5 py-3 text-sm text-accent-deep">{error}<Button variant="ghost" size="sm" onClick={() => setError('')} className="ms-3" aria-label={d.common.close}><X /></Button></div>}
    {!ready ? <main className="mx-auto max-w-5xl p-10"><p className="animate-pulse text-muted-foreground">PiSan…</p></main> : setup ? <Setup lang={lang} setLang={setLang} onSubmit={register} /> : session && <div className="workspace-layout"><aside className={`app-sidebar ${mobileNav ? 'mobile-open' : ''}`}><p className="sidebar-label">{say(lang, 'MON ESPACE', 'MY SPACE', 'مساحتي', 'MI ESPACIO')}</p><nav className="space-y-1" aria-label={say(lang, 'Navigation principale', 'Main navigation', 'القائمة الرئيسية', 'Navegación principal')}>{(['home', 'diagnostic', 'workshop', 'exam', 'journey', 'tracking'] as Tab[]).map(id => { const Icon = icons[id]; return <Button key={id} variant="ghost" className={`sidebar-link ${tab === id ? 'sidebar-active' : ''}`} onClick={() => navigate(id)} aria-current={tab === id ? 'page' : undefined}><Icon /><span>{label(id)}</span>{tab === id && <span className="ms-auto h-1.5 w-1.5 rounded-full bg-primary" />}</Button>; })}</nav><div className="sidebar-bottom"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="h-4 w-4 text-primary-deep" />{session.partner ? d.plan.partnerShort : d.plan.discovery}</div><p className="mt-2 text-xs text-muted-foreground">{session.partner ? d.plan.unlimited : d.plan.left.replace('{n}', String(left))}</p>{!session.partner && <Button variant="sun" size="sm" className="mt-4 w-full" onClick={() => setUpgrade(true)}><Crown />{say(lang, 'Passer à l’illimité', 'Go unlimited', 'انتقل إلى اللامحدود', 'Acceso ilimitado')}</Button>}<div className="mt-7 border-t border-border pt-4 text-[11px] text-muted-foreground">PiSan · {say(lang, 'À ton rythme.', 'At your pace.', 'على وتيرتك.', 'A tu ritmo.')}</div></div></aside><main className="workspace-main">{tab === 'home' && <HomePage session={session} lang={lang} left={left} onNavigate={navigate} onUpgrade={() => setUpgrade(true)} />}{tab === 'diagnostic' && <Diagnostic key={`diag-${programmeKey}`} lang={lang} level={level} notions={programmeChapters} onSave={record} onWorkshop={() => navigate('workshop')} />}{tab === 'workshop' && <Workshop key={`ws-${level}`} lang={lang} level={level} country={country.id} onSave={record} onStart={start} />}{tab === 'exam' && <Exam key={`exam-${programmeKey}`} lang={lang} level={level} notions={programmeChapters} onSave={record} onStart={start} />}{tab === 'journey' && <Journey lang={lang} level={level} programme={programme} progress={session.progress} onPractice={() => navigate('workshop')} />}{tab === 'tracking' && <Dashboard lang={lang} level={level} chapters={programmeChapters} progress={session.progress} nickname={session.profile.nickname} />}</main></div>}
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogTitle>{d.setup.settings}</DialogTitle><DialogDescription>{session?.profile.nickname}</DialogDescription><div className="space-y-3">{memberships.map(m=><div key={m.id} className="flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">{m.name}</span><Button variant="ghost" disabled={classBusy} onClick={()=>setLeaveId(m.id)}>{teacherText(lang).leave}</Button></div>)}</div><Setup compact lang={lang} setLang={setLang} initial={session?.profile} onSubmit={register} /></DialogContent></Dialog>
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
  const [classCode, setClassCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(''); try { await onSubmit({ nickname: nickname.trim(), country, grade, lang, ...(track ? { track } : {}) }, code, classCode); } catch { setError(say(lang, 'Impossible de créer votre espace. Réessayez.', 'Could not create your space. Try again.', 'تعذر إنشاء مساحتك. حاول مجددًا.', 'No se pudo crear tu espacio. Reintenta.')); } setBusy(false); }
  return <main className={compact ? '' : 'setup-page'}>{!compact && <div className="setup-intro"><span className="eyebrow">{say(lang, 'UN PETIT PAS, UN GRAND DÉCLIC', 'SMALL STEPS, BIG DISCOVERIES', 'خطوة صغيرة، اكتشاف كبير', 'PASOS PEQUEÑOS, GRANDES DESCUBRIMIENTOS')}</span><h1>{say(lang, 'Bienvenue chez PiSan', 'Welcome to PiSan', 'مرحبًا بك في PiSan', 'Bienvenido a PiSan')}</h1><p>{say(lang, 'Les maths deviennent enfin visuelles', 'Math finally becomes visual', 'الرياضيات تصبح أخيرًا بصرية', 'Las matemáticas por fin son visuales')}</p></div>}<div className={compact ? '' : 'setup-content'}>{!compact && <div className="setup-companion"><img src={avatar} alt="Le symbole π de PiSan" className="setup-mascot" /><div className="setup-quote"><span className="text-2xl font-display">{say(lang, 'On commence ensemble ?', 'Shall we start together?', 'هل نبدأ معًا؟', '¿Empezamos juntos?')}</span><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{say(lang, 'Pas de pression. Pas de classement. Juste toi, et le plaisir de comprendre.', 'No pressure. No rankings. Just you, and the joy of understanding.', 'لا ضغط ولا ترتيب. أنت ومتعة الفهم فقط.', 'Sin presión. Sin rankings. Solo tú y el placer de comprender.')}</p><div className="mt-5 flex items-center gap-2 text-xs text-primary-deep"><ShieldCheck className="h-4 w-4" />{say(lang, 'Pseudonyme uniquement · sans email', 'Nickname only · no email', 'اسم مستعار فقط · بدون بريد', 'Solo un alias · sin email')}</div></div></div>}<form onSubmit={submit} className={compact ? '' : 'setup-form'}><div className="mb-6 flex flex-wrap gap-2" role="group" aria-label={d.setup.lang}>{LANGS.map(l => <Button key={l.id} size="sm" variant={lang === l.id ? 'default' : 'soft'} onClick={() => setLang(l.id)} type="button" aria-pressed={lang === l.id}>{l.flag} {l.id.toUpperCase()}</Button>)}</div><label className="field-label" htmlFor="nickname">{say(lang, 'Ton pseudonyme', 'Your nickname', 'اسمك المستعار', 'Tu alias')}</label><input id="nickname" className="form-input" required maxLength={40} autoComplete="off" placeholder={say(lang, 'Ex. : Explorateur', 'e.g. Explorer', 'مثال: المستكشف', 'Ej.: Explorador')} value={nickname} onChange={e => setNickname(e.target.value)} /><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="country">{d.setup.country}</label><select id="country" className="form-select" value={country} onChange={e => { setCountry(e.target.value); setGrade(0); }}>{COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.flag} {c.name[lang]}</option>)}</select></div><div><label className="field-label" htmlFor="grade">{d.setup.grade}</label><select id="grade" className="form-select" value={grade} onChange={e => setGrade(Number(e.target.value))}>{getCountry(country).grades.map((g, i) => <option key={i} value={i}>{g.label[lang]}</option>)}</select></div></div>{tracks.length > 0 && <div className="mt-5"><label className="field-label" htmlFor="track">{say(lang, 'Ta filière', 'Your track', 'شعبتك', 'Tu modalidad')}</label><select id="track" className="form-select" value={track} onChange={e => setTrack(e.target.value)}>{tracks.map(t => <option key={t.id} value={t.id}>{t.label[lang]}</option>)}</select></div>}<label className="field-label mt-5" htmlFor="partner-code">{d.setup.code}<span className="ms-2 text-xs font-normal text-muted-foreground">({d.setup.optional})</span></label><input id="partner-code" className="form-input" value={code} onChange={e => setCode(e.target.value)} placeholder={d.setup.codePlaceholder} maxLength={100} autoComplete="off" /><label className="field-label mt-5" htmlFor="class-code">{teacherText(lang).joinOptional}</label><input id="class-code" className="form-input" value={classCode} onChange={e=>setClassCode(e.target.value)} maxLength={7} autoComplete="off" aria-describedby="class-privacy"/><p id="class-privacy" className="mt-2 text-xs leading-relaxed text-muted-foreground">{teacherText(lang).privacy}</p><p className="mt-3 text-xs leading-relaxed text-muted-foreground">{d.setup.discovery}</p><Button size="lg" type="submit" disabled={busy || !nickname.trim()} className="mt-6 w-full">{compact ? d.setup.save : say(lang, 'Créer mon espace', 'Create my space', 'إنشاء مساحتي', 'Crear mi espacio')}<ArrowRight /></Button>{error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}<p className="mt-4 text-center text-[11px] text-muted-foreground">{say(lang, 'Aucun email personnel. Aucun nom de famille.', 'No personal email. No family name.', 'بدون بريد شخصي أو اسم عائلي.', 'Sin email personal. Sin apellidos.')}</p></form></div>{!compact && <div className="setup-footer"><span>PiSan</span><span>{say(lang, 'Comprendre. Visualiser. Prendre confiance.', 'Understand. Visualise. Build confidence.', 'افهم. تصوّر. اكتسب الثقة.', 'Comprender. Visualizar. Ganar confianza.')}</span></div>}</main>;
}

function HomePage({ session, lang, left, onNavigate, onUpgrade }: { session: LearningSession; lang: Lang; left: number | null; onNavigate: (t: Tab) => void; onUpgrade: () => void }) {
  const d = DICTS[lang];
  const country = getCountry(session.profile.country);
  const modules: { id: Tab; title: string; desc: string; time: string; color: string }[] = [
    { id: 'diagnostic', title: say(lang, 'Diagnostic & fondamentaux', 'Diagnostic & foundations', 'التشخيص والأساسيات', 'Diagnóstico y fundamentos'), desc: say(lang, 'Découvre tes forces et le bon point de départ.', 'Discover your strengths and your starting point.', 'اكتشف نقاط قوتك ونقطة البداية.', 'Descubre tus fortalezas y tu punto de partida.'), time: '4 min', color: 'module-teal' },
    { id: 'workshop', title: say(lang, 'Mon atelier visuel', 'My visual workshop', 'ورشتي البصرية', 'Mi taller visual'), desc: say(lang, 'Des problèmes qui prennent forme sous tes yeux.', 'Problems take shape before your eyes.', 'مسائل تتشكل أمام عينيك.', 'Problemas que toman forma ante tus ojos.'), time: '8 min', color: 'module-coral' },
    { id: 'exam', title: say(lang, 'Mon prochain contrôle', 'My next test', 'اختباري القادم', 'Mi próximo examen'), desc: say(lang, 'Entraîne-toi, puis fais le point sur tes acquis.', 'Practise and check what you have learned.', 'تدرب وقيّم ما تعلمته.', 'Practica y comprueba lo aprendido.'), time: '5 min', color: 'module-sky' },
    { id: 'journey', title: say(lang, 'Parcours Confiance', 'Confidence journey', 'مسار الثقة', 'Camino de confianza'), desc: say(lang, 'Ton chemin, tes chapitres, tes petits succès.', 'Your path, chapters and small wins.', 'مسارك وفصولك ونجاحاتك الصغيرة.', 'Tu camino, capítulos y pequeños logros.'), time: '', color: 'module-sun' },
    { id: 'tracking', title: say(lang, 'Suivi Parent / Prof', 'Parent / Teacher view', 'متابعة الأهل / المعلم', 'Seguimiento familiar'), desc: say(lang, 'Une vue claire des progrès, pour mieux encourager.', 'A clear view of progress to offer encouragement.', 'رؤية واضحة للتقدم من أجل التشجيع.', 'Una visión clara del progreso para animar.'), time: '', color: 'module-neutral' },
  ];
  const success = session.progress.attempts.filter(a => a.correct === a.total && a.kind !== 'challenge').length;
  const challengeWins = session.progress.attempts.filter(a => a.kind === 'challenge' && a.correct === a.total).length;
  return <section><div className="home-greeting"><div><div className="mb-3 flex flex-wrap items-center gap-2"><span className="eyebrow">{say(lang, 'TON AVENTURE MATHÉMATIQUE', 'YOUR MATH ADVENTURE', 'مغامرتك الرياضية', 'TU AVENTURA MATEMÁTICA')}</span></div><h1>{say(lang, 'Salut', 'Hello', 'مرحبًا', 'Hola')} {session.profile.nickname} <span className="inline-block text-3xl">👋</span></h1><p className="mt-3 text-base text-muted-foreground">{say(lang, 'Un petit pas aujourd’hui. Un grand déclic demain.', 'One small step today. A big discovery tomorrow.', 'خطوة صغيرة اليوم. اكتشاف كبير غدًا.', 'Un pequeño paso hoy. Un gran descubrimiento mañana.')}</p><div className="mt-5 flex flex-wrap items-center gap-2 text-xs"><span className="pill">{country.flag} {country.name[lang]}</span><span className="pill">{country.grades[session.profile.grade]?.label[lang]}</span>{session.partner && <span className="pill bg-primary-soft text-primary-deep"><ShieldCheck className="h-3.5 w-3.5" />{d.plan.partnerShort}</span>}</div></div><div className="greeting-mascot"><img src={avatar} alt="π PiSan" /><span className="mascot-star mascot-star-one">✦</span><span className="mascot-star mascot-star-two">✧</span></div></div>
    <div className="home-summary"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-soft"><Star className="h-5 w-5 text-sun-deep" /></span><div><p className="text-lg font-bold">{success * 3 + challengeWins * CHALLENGE_STARS} <span className="text-sm font-normal text-muted-foreground">{d.home.stars}</span></p><p className="text-xs text-muted-foreground">{say(lang, 'Chaque effort compte', 'Every effort matters', 'كل مجهود مهم', 'Cada esfuerzo cuenta')}</p></div></div><span className="hidden h-10 border-s border-border sm:block" /><StreakBadge lang={lang} streak={{ count: session.streak_count, lastDay: session.streak_last_day, freezes: session.freezes, timezone: session.profile.timezone }} /><div className="ms-auto text-end"><p className="text-sm font-bold text-primary-deep">{left === null ? d.plan.unlimited : d.plan.left.replace('{n}', String(left))}</p>{left !== null && <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onUpgrade}>{say(lang, 'Passer à PiSan Illimité', 'Go PiSan Unlimited', 'انتقل إلى PiSan بلا حدود', 'Pasar a PiSan Ilimitado')}<ArrowRight /></Button>}</div></div>
    <div className="next-step"><div className="flex-1"><span className="eyebrow">{say(lang, 'TON PROCHAIN PETIT PAS', 'YOUR NEXT SMALL STEP', 'خطوتك الصغيرة التالية', 'TU SIGUIENTE PEQUEÑO PASO')}</span><h2 className="mt-3 text-2xl">{session.progress.attempts.length ? say(lang, 'Et si on passait à la pratique ?', 'Ready to put it into practice?', 'هل نبدأ التطبيق؟', '¿Pasamos a la práctica?') : say(lang, 'Faisons connaissance avec tes maths', 'Let’s get to know your maths', 'لنتعرف على مهاراتك الرياضية', 'Conozcamos tus matemáticas')}</h2><p className="mt-2 text-sm text-muted-foreground">{session.progress.attempts.length ? d.home.suggestWorkshop : say(lang, '6 questions, sans note. Juste pour savoir par où commencer.', '6 questions, no grade. Just to find your starting point.', '6 أسئلة بدون علامة، لمعرفة من أين نبدأ.', '6 preguntas, sin nota. Para saber por dónde empezar.')}</p></div><Button onClick={() => onNavigate(session.progress.attempts.length ? 'workshop' : 'diagnostic')}>{session.progress.attempts.length ? d.journey.practice : d.diag.start}<ArrowRight /></Button></div>
    <div className="mb-5 flex items-center justify-between"><h2 className="text-2xl">{say(lang, 'À chaque envie, son espace', 'A space for every goal', 'مساحة لكل هدف', 'Un espacio para cada objetivo')}</h2><span className="hidden text-xs text-muted-foreground sm:block">{say(lang, '5 façons de progresser', '5 ways to grow', '5 طرق للتقدم', '5 formas de progresar')}</span></div><div className="module-grid">{modules.map((m, i) => { const Icon = icons[m.id]; return <div className={`module-card ${m.color}`} key={m.id}><div className="flex items-center justify-between"><span className="module-icon"><Icon /></span><span className="text-[11px] text-muted-foreground">{m.time || `0${i + 1}`}</span></div><h3 className="mb-2 mt-5 text-xl">{m.title}</h3><p className="mb-6 min-h-10 text-sm leading-relaxed text-muted-foreground">{m.desc}</p><Button variant="ghost" className="mt-auto h-auto justify-between p-0 text-sm" onClick={() => onNavigate(m.id)}>{say(lang, 'C’est parti', 'Let’s go', 'لنبدأ', 'Vamos')}<ArrowRight /></Button></div>; })}</div><div className="mt-7"><Tutor>{say(lang, 'Une erreur ? C’est une information, pas un échec. On essaie, on comprend, on avance.', 'A mistake is information, not failure. We try, understand and move forward.', 'الخطأ معلومة وليس فشلًا. نحاول ونفهم ونتقدم.', 'Un error es información, no un fracaso. Intentamos, comprendemos y avanzamos.')}</Tutor></div>
  </section>;
}