import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import avatar from '@/assets/pisan-avatar.png';
import { useDys } from './dys';

export function Speaker({ text, lang }: { text: string; lang: Lang }) {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const { prefs } = useDys();
  const speakRef = useRef<() => void>(() => {});
  // Mode DYS « lecture automatique » : lit l'énoncé dès qu'il s'affiche ou change.
  useEffect(() => {
    if (!prefs.autoRead) return;
    const id = window.setTimeout(() => speakRef.current(), 350);
    return () => window.clearTimeout(id);
  }, [prefs.autoRead, text, lang]);
  function speak() {
    if (!('speechSynthesis' in window)) { setError(say(lang, 'Lecture audio indisponible dans ce navigateur.', 'Audio unavailable in this browser.', 'الصوت غير متاح في هذا المتصفح.', 'Audio no disponible en este navegador.')); return; }
    window.speechSynthesis.cancel();
    if (speaking) { setSpeaking(false); return; }
    startSpeaking();
  }
  function startSpeaking() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = { fr: 'fr-FR', en: 'en-US', ar: 'ar-MA', es: 'es-ES' }[lang];
    utterance.rate = .88 * prefs.speechRate;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => { setSpeaking(false); setError(say(lang, 'Lecture audio indisponible.', 'Audio unavailable.', 'الصوت غير متاح.', 'Audio no disponible.')); };
    setSpeaking(true); window.speechSynthesis.speak(utterance);
  }
  speakRef.current = startSpeaking;
  return <span><Button size="icon" variant="ghost" onClick={speak} title={say(lang, 'Écouter l’énoncé', 'Listen to the question', 'استمع إلى السؤال', 'Escuchar el enunciado')} aria-label={say(lang, 'Écouter l’énoncé', 'Listen to the question', 'استمع إلى السؤال', 'Escuchar el enunciado')}>{speaking ? <VolumeX /> : <Volume2 />}</Button>{error && <span role="status" className="text-xs text-destructive">{error}</span>}</span>;
}
export function Tutor({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 rounded-lg bg-primary-soft p-4"><img src={avatar} alt="π" className="h-12 w-12 shrink-0 object-contain" /><div><p className="mb-1 text-xs font-bold text-primary-deep">PiSan</p><div className="text-sm leading-relaxed">{children}</div></div></div>;
}
export function Meter({ value }: { value: number }) {
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full bg-primary meter-${Math.round(value / 10)}`} /></div>;
}