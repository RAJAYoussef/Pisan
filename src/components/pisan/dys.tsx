import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { RotateCcw, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  applyDys,
  BACKGROUNDS,
  DEFAULT_DYS,
  DYS_PRESET,
  FONTS,
  isDysActive,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
  loadDys,
  saveDys,
  teacherDysSettings,
  SCALE_MAX,
  SCALE_MIN,
  SCALE_STEP,
  SPEECH_RATES,
  type DysPrefs,
} from "@/lib/dys";
import type { Lang } from "@/lib/i18n";
import { say } from "@/lib/pisan";

type DysContextValue = {
  prefs: DysPrefs;
  update: (patch: Partial<DysPrefs>) => void;
  replace: (next: DysPrefs) => void;
};
const DysContext = createContext<DysContextValue>({
  prefs: DEFAULT_DYS,
  update: () => {},
  replace: () => {},
});

export function DysProvider({ children, defaults, revision }: { children: ReactNode; defaults?: DysPrefs | null | undefined; revision?: string | null | undefined }) {
  const [prefs, setPrefs] = useState<DysPrefs>(DEFAULT_DYS);
  useEffect(() => {
    setPrefs(loadDys());
  }, []);
  useEffect(() => {
    try { setPrefs(teacherDysSettings(defaults, revision)); } catch { /* Keep current preferences if browser storage is unavailable. */ }
  }, [defaults, revision]);
  useEffect(() => {
    applyDys(prefs);
  }, [prefs]);
  const replace = (next: DysPrefs) => {
    setPrefs(next);
    saveDys(next);
  };
  const update = (patch: Partial<DysPrefs>) =>
    setPrefs((current) => {
      const next = { ...current, ...patch };
      saveDys(next);
      return next;
    });
  return (
    <DysContext.Provider value={{ prefs, update, replace }}>
      {children}
      {prefs.readingRuler && <ReadingRuler />}
    </DysContext.Provider>
  );
}

export const useDys = () => useContext(DysContext);

/** Bande de lecture qui suit le pointeur ou le doigt : tout est assombri sauf la ligne lue. */
function ReadingRuler() {
  const [y, setY] = useState<number | null>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => setY(e.clientY);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
    };
  }, []);
  if (y === null) return null;
  return (
    <div className="reading-ruler" aria-hidden="true" style={{ ["--ruler-y" as string]: `${y}px` }}>
      <div className="reading-ruler-top" />
      <div className="reading-ruler-band" />
      <div className="reading-ruler-bottom" />
    </div>
  );
}

export function DysButton({ lang, onClick }: { lang: Lang; onClick: () => void }) {
  const { prefs } = useDys();
  const label = say(
    lang,
    "Confort de lecture (mode DYS)",
    "Reading comfort (dyslexia mode)",
    "راحة القراءة (وضع عسر القراءة)",
    "Comodidad de lectura (modo DYS)",
  );
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative"
    >
      <Type />
      {isDysActive(prefs) && (
        <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
      )}
    </Button>
  );
}

function Choice<T extends string | number>({
  legend,
  options,
  value,
  onChange,
  render,
}: {
  legend: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => ReactNode;
}) {
  return (
    <fieldset className="dys-field">
      <legend className="field-label">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={String(option)}
            type="button"
            size="sm"
            variant={value === option ? "default" : "soft"}
            aria-pressed={value === option}
            onClick={() => onChange(option)}
          >
            {render(option)}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({
  id,
  label,
  help,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="dys-field flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="field-label mb-0">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{help}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function DysPanel({
  lang,
  open,
  onOpenChange,
}: {
  lang: Lang;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { prefs, update, replace } = useDys();
  const s = (fr: string, en: string, ar: string, es: string) => say(lang, fr, en, ar, es);
  const fontNames = {
    default: s("Habituelle", "Usual", "المعتاد", "Habitual"),
    lexend: "Lexend",
    opendyslexic: "OpenDyslexic",
    andika: "Andika",
  };
  const fontClass = {
    default: "",
    lexend: "dys-font-lexend",
    opendyslexic: "dys-font-opendyslexic",
    andika: "dys-font-andika",
  };
  const bgNames = {
    default: s("Habituel", "Usual", "المعتاد", "Habitual"),
    cream: s("Crème", "Cream", "كريمي", "Crema"),
    blue: s("Bleu pâle", "Pale blue", "أزرق فاتح", "Azul claro"),
    dark: s("Sombre", "Dark", "داكن", "Oscuro"),
  };
  const spacingNames = {
    normal: s("Normal", "Normal", "عادي", "Normal"),
    wide: s("Large", "Wide", "واسع", "Amplio"),
    wider: s("Très large", "Extra wide", "واسع جدًا", "Muy amplio"),
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle className="font-display text-2xl">
          {s("Confort de lecture", "Reading comfort", "راحة القراءة", "Comodidad de lectura")}
        </DialogTitle>
        <DialogDescription>
          {s(
            "Pour les élèves DYS, et pour tous ceux qui lisent mieux autrement. Les changements s’appliquent tout de suite, sur tout PiSan.",
            "For dyslexic learners and anyone who reads better another way. Changes apply instantly, everywhere in PiSan.",
            "لتلاميذ عسر القراءة ولكل من يقرأ بشكل أفضل بطريقة أخرى. تُطبَّق التغييرات فورًا في كل PiSan.",
            "Para alumnos con DYS y para quien lee mejor de otra forma. Los cambios se aplican al instante en todo PiSan.",
          )}
        </DialogDescription>

        <div className="dys-preview" aria-live="polite">
          <p>
            {s(
              "Léa achète 3 cahiers à 2,50 € chacun. Combien paie-t-elle ?",
              "Lea buys 3 notebooks at €2.50 each. How much does she pay?",
              "تشتري ليلى 3 دفاتر بثمن 2,50 درهم للواحد. كم تدفع؟",
              "Lea compra 3 cuadernos a 2,50 € cada uno. ¿Cuánto paga?",
            )}
          </p>
          <p dir="ltr" className="mt-2 text-center font-display text-xl">
            3 × 2,50 = 7,50
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => replace(DYS_PRESET)}>
            <Sparkles />
            {s(
              "Activer le mode DYS",
              "Turn on dyslexia mode",
              "تفعيل وضع عسر القراءة",
              "Activar el modo DYS",
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => replace(DEFAULT_DYS)}
            disabled={!isDysActive(prefs)}
          >
            <RotateCcw />
            {s("Tout réinitialiser", "Reset all", "إعادة الضبط", "Restablecer")}
          </Button>
        </div>

        <Choice
          legend={s("Police", "Font", "الخط", "Tipo de letra")}
          options={FONTS}
          value={prefs.font}
          onChange={(font) => update({ font })}
          render={(f) => <span className={fontClass[f]}>{fontNames[f]}</span>}
        />
        {lang === "ar" && prefs.font !== "default" && (
          <p className="-mt-2 text-xs text-muted-foreground">
            هذه الخطوط للحروف اللاتينية. يبقى النص العربي بخط تجوّل، مع إعدادات الحجم والتباعد.
          </p>
        )}

        <div className="dys-field">
          <label htmlFor="dys-scale" className="field-label">
            {s("Taille du texte", "Text size", "حجم النص", "Tamaño del texto")} · {prefs.scale} %
          </label>
          <input
            id="dys-scale"
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={SCALE_STEP}
            value={prefs.scale}
            onChange={(e) => update({ scale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        <Choice
          legend={s("Interligne", "Line spacing", "تباعد الأسطر", "Interlineado")}
          options={LINE_HEIGHTS}
          value={prefs.lineHeight}
          onChange={(lineHeight) => update({ lineHeight })}
          render={(v) => spacingNames[v]}
        />
        <Choice
          legend={s(
            "Espacement des lettres et des mots",
            "Letter and word spacing",
            "تباعد الحروف والكلمات",
            "Espaciado de letras y palabras",
          )}
          options={LETTER_SPACINGS}
          value={prefs.letterSpacing}
          onChange={(letterSpacing) => update({ letterSpacing })}
          render={(v) => spacingNames[v]}
        />
        <Choice
          legend={s("Couleur du fond", "Background colour", "لون الخلفية", "Color de fondo")}
          options={BACKGROUNDS}
          value={prefs.background}
          onChange={(background) => update({ background })}
          render={(v) => (
            <span className="flex items-center gap-2">
              <span className={`dys-swatch dys-swatch-${v}`} aria-hidden="true" />
              {bgNames[v]}
            </span>
          )}
        />

        <Toggle
          id="dys-ruler"
          label={s("Règle de lecture", "Reading ruler", "مسطرة القراءة", "Regla de lectura")}
          help={s(
            "Une bande qui suit ton doigt ou ta souris, pour lire une ligne à la fois.",
            "A band that follows your finger or mouse, to read one line at a time.",
            "شريط يتبع إصبعك أو الفأرة لقراءة سطر واحد في كل مرة.",
            "Una banda que sigue tu dedo o ratón para leer una línea a la vez.",
          )}
          checked={prefs.readingRuler}
          onChange={(readingRuler) => update({ readingRuler })}
        />
        <Toggle
          id="dys-autoread"
          label={s(
            "Lecture automatique",
            "Read aloud automatically",
            "القراءة التلقائية",
            "Lectura automática",
          )}
          help={s(
            "L’énoncé est lu à voix haute dès qu’il s’affiche.",
            "Each question is read aloud as soon as it appears.",
            "تُقرأ كل مسألة بصوت عالٍ فور ظهورها.",
            "El enunciado se lee en voz alta en cuanto aparece.",
          )}
          checked={prefs.autoRead}
          onChange={(autoRead) => update({ autoRead })}
        />
        <Choice
          legend={s("Vitesse de la voix", "Voice speed", "سرعة الصوت", "Velocidad de la voz")}
          options={SPEECH_RATES}
          value={prefs.speechRate as (typeof SPEECH_RATES)[number]}
          onChange={(speechRate) => update({ speechRate })}
          render={(v) =>
            v === 0.75
              ? s("Lente", "Slow", "بطيئة", "Lenta")
              : v === 1
                ? s("Normale", "Normal", "عادية", "Normal")
                : s("Rapide", "Fast", "سريعة", "Rápida")
          }
        />
        <Toggle
          id="dys-notimer"
          label={s("Sans chrono", "No timer", "بدون مؤقت", "Sin cronómetro")}
          help={s(
            "Aucun compte à rebours : tu prends tout le temps qu’il te faut.",
            "No countdowns: take all the time you need.",
            "لا عدّ تنازلي: خذ كل الوقت الذي تحتاجه.",
            "Sin cuentas atrás: tómate todo el tiempo que necesites.",
          )}
          checked={prefs.noTimer}
          onChange={(noTimer) => update({ noTimer })}
        />

        <p className="text-xs text-muted-foreground">
          {s(
            "Ces réglages sont gardés sur cet appareil.",
            "These settings are saved on this device.",
            "تُحفظ هذه الإعدادات على هذا الجهاز.",
            "Estos ajustes se guardan en este dispositivo.",
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
