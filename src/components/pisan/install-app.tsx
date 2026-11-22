// « Installer PiSan sur mon téléphone » : bouton natif sur Android/Chrome, consigne pas à pas sur iPhone.
import { useState } from 'react';
import { Check, Download, Share, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/lib/i18n';
import { say } from '@/lib/pisan';
import { promptInstall, useInstallState } from '@/lib/install';

const DISMISS_KEY = 'pisan-install-dismissed';
const dismissed = () => { try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; } };

function IosSteps({ lang }: { lang: Lang }) {
  return <ol className="install-steps">
    <li>{say(lang, 'Ouvre PiSan dans Safari.', 'Open PiSan in Safari.', 'افتح PiSan في Safari.', 'Abre PiSan en Safari.')}</li>
    <li><span>{say(lang, 'Touche le bouton Partager', 'Tap the Share button', 'اضغط على زر المشاركة', 'Toca el botón Compartir')}</span> <Share className="inline h-4 w-4" aria-hidden /></li>
    <li>{say(lang, 'Choisis « Sur l’écran d’accueil », puis « Ajouter ».', 'Choose “Add to Home Screen”, then “Add”.', 'اختر « إضافة إلى الشاشة الرئيسية » ثم « إضافة ».', 'Elige «Añadir a pantalla de inicio» y luego «Añadir».')}</li>
  </ol>;
}

/** Dans « Mon profil » : toujours visible, avec la consigne adaptée à l'appareil. */
export function InstallCard({ lang }: { lang: Lang }) {
  const state = useInstallState();
  const [open, setOpen] = useState(false);
  return <section className="install-card" aria-labelledby="install-title">
    <h3 id="install-title" className="flex items-center gap-2 text-lg font-bold"><Smartphone className="h-5 w-5 text-primary-deep" aria-hidden />{say(lang, 'PiSan sur mon téléphone', 'PiSan on my phone', 'PiSan على هاتفي', 'PiSan en mi móvil')}</h3>
    {state === 'installed'
      ? <p role="status" className="mt-1 flex items-center gap-2 text-sm text-primary-deep"><Check className="h-4 w-4" aria-hidden />{say(lang, 'PiSan est installé sur cet appareil.', 'PiSan is installed on this device.', 'PiSan مثبت على هذا الجهاز.', 'PiSan está instalado en este dispositivo.')}</p>
      : <>
        <p className="mt-1 text-sm text-muted-foreground">{say(lang, 'Ajoute PiSan à ton écran d’accueil : il s’ouvrira en plein écran, comme une application, sans rien télécharger dans un store.', 'Add PiSan to your home screen: it opens full screen like an app, with nothing to download from a store.', 'أضف PiSan إلى شاشتك الرئيسية ليفتح كتطبيق دون تحميل من المتجر.', 'Añade PiSan a tu pantalla de inicio: se abrirá como una app, sin descargar nada.')}</p>
        {state === 'prompt' && <Button size="sm" className="mt-3" onClick={() => void promptInstall()}><Download />{say(lang, 'Installer PiSan', 'Install PiSan', 'تثبيت PiSan', 'Instalar PiSan')}</Button>}
        {state === 'ios' && <IosSteps lang={lang} />}
        {state === 'none' && <>
          <Button size="sm" variant="soft" className="mt-3" aria-expanded={open} onClick={() => setOpen(o => !o)}>{say(lang, 'Comment faire ?', 'How?', 'كيف؟', '¿Cómo?')}</Button>
          {open && <div className="mt-2 text-sm">
            <p><b>Android</b> : {say(lang, 'ouvre PiSan dans Chrome, menu ⋮ puis « Installer l’application » (ou « Ajouter à l’écran d’accueil »).', 'open PiSan in Chrome, menu ⋮ then “Install app” (or “Add to Home screen”).', 'افتح PiSan في Chrome، ثم القائمة ⋮ و« تثبيت التطبيق ».', 'abre PiSan en Chrome, menú ⋮ y «Instalar aplicación».')}</p>
            <p className="mt-1"><b>iPhone / iPad</b> :</p>
            <IosSteps lang={lang} />
          </div>}
        </>}
      </>}
  </section>;
}

/** Sur l'accueil, téléphones et tablettes seulement : une invitation discrète, que l'élève peut fermer. */
export function InstallBanner({ lang }: { lang: Lang }) {
  const state = useInstallState();
  const [hidden, setHidden] = useState(dismissed);
  const touch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true;
  if (hidden || !touch || (state !== 'prompt' && state !== 'ios')) return null;
  const close = () => { try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* fermé pour cette visite seulement */ } setHidden(true); };
  return <div className="install-banner" role="region" aria-label={say(lang, 'Installer PiSan', 'Install PiSan', 'تثبيت PiSan', 'Instalar PiSan')}>
    <Smartphone className="h-6 w-6 shrink-0 text-primary-deep" aria-hidden />
    <div className="min-w-0 flex-1">
      <p className="font-bold">{say(lang, 'Mets PiSan sur ton écran d’accueil', 'Put PiSan on your home screen', 'ضع PiSan على شاشتك الرئيسية', 'Pon PiSan en tu pantalla de inicio')}</p>
      {state === 'prompt'
        ? <Button size="sm" className="mt-2" onClick={() => void promptInstall()}><Download />{say(lang, 'Installer', 'Install', 'تثبيت', 'Instalar')}</Button>
        : <IosSteps lang={lang} />}
    </div>
    <button type="button" className="install-close" onClick={close} aria-label={say(lang, 'Fermer', 'Close', 'إغلاق', 'Cerrar')}><X className="h-4 w-4" /></button>
  </div>;
}
