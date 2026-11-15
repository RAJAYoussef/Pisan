// Mode DYS : réglages d'affichage et de lecture. Fonctions pures, couvertes par src/test/dys.test.ts.
// Les réglages vivent dans le navigateur (localStorage) et s'appliquent via des attributs
// data-* et des variables CSS sur <html>, sans toucher aux composants.

export type DysFont = "default" | "lexend" | "opendyslexic" | "andika";
export type DysBackground = "default" | "cream" | "blue" | "dark";
export type DysSpacing = "normal" | "wide" | "wider";

export type DysPrefs = {
  font: DysFont;
  /** Taille du texte, en pourcentage (100 à 175). */
  scale: number;
  lineHeight: DysSpacing;
  letterSpacing: Exclude<DysSpacing, "wider">;
  background: DysBackground;
  readingRuler: boolean;
  autoRead: boolean;
  /** Vitesse de lecture audio : 0.75, 1 ou 1.25. */
  speechRate: number;
  noTimer: boolean;
};

export const DYS_STORAGE_KEY = "pisan-dys";
export const FONTS: DysFont[] = ["default", "lexend", "opendyslexic", "andika"];
export const BACKGROUNDS: DysBackground[] = ["default", "cream", "blue", "dark"];
export const LINE_HEIGHTS: DysSpacing[] = ["normal", "wide", "wider"];
export const LETTER_SPACINGS: DysPrefs["letterSpacing"][] = ["normal", "wide"];
export const SPEECH_RATES = [0.75, 1, 1.25] as const;
export const SCALE_MIN = 100;
export const SCALE_MAX = 175;
export const SCALE_STEP = 25;

export const DEFAULT_DYS: DysPrefs = {
  font: "default",
  scale: 100,
  lineHeight: "normal",
  letterSpacing: "normal",
  background: "default",
  readingRuler: false,
  autoRead: false,
  speechRate: 1,
  noTimer: false,
};

/** Un préréglage « tout-en-un » pour activer le mode DYS d'un seul clic. */
export const DYS_PRESET: DysPrefs = {
  font: "lexend",
  scale: 125,
  lineHeight: "wide",
  letterSpacing: "wide",
  background: "cream",
  readingRuler: false,
  autoRead: false,
  speechRate: 1,
  noTimer: true,
};

const pick = <T>(allowed: readonly T[], value: unknown, fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** Nettoie une valeur venue du stockage : toute valeur inconnue retombe sur le défaut. */
export function sanitizeDys(raw: unknown): DysPrefs {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const scale =
    typeof r["scale"] === "number" && Number.isFinite(r["scale"])
      ? Math.min(SCALE_MAX, Math.max(SCALE_MIN, Math.round(r["scale"] / SCALE_STEP) * SCALE_STEP))
      : DEFAULT_DYS.scale;
  return {
    font: pick(FONTS, r["font"], DEFAULT_DYS.font),
    scale,
    lineHeight: pick(LINE_HEIGHTS, r["lineHeight"], DEFAULT_DYS.lineHeight),
    letterSpacing: pick(LETTER_SPACINGS, r["letterSpacing"], DEFAULT_DYS.letterSpacing),
    background: pick(BACKGROUNDS, r["background"], DEFAULT_DYS.background),
    readingRuler: r["readingRuler"] === true,
    autoRead: r["autoRead"] === true,
    speechRate: pick(SPEECH_RATES, r["speechRate"], DEFAULT_DYS.speechRate),
    noTimer: r["noTimer"] === true,
  };
}

/** Vrai dès qu'un réglage diffère du défaut (pour l'indicateur sur le bouton « Aa »). */
export function isDysActive(prefs: DysPrefs): boolean {
  return (Object.keys(DEFAULT_DYS) as (keyof DysPrefs)[]).some((k) => prefs[k] !== DEFAULT_DYS[k]);
}

const LINE_HEIGHT_VALUES: Record<DysSpacing, string> = { normal: "", wide: "1.8", wider: "2.1" };
const LETTER_SPACING_VALUES: Record<DysPrefs["letterSpacing"], [string, string]> = {
  normal: ["", ""],
  wide: ["0.06em", "0.18em"],
};

/** Attributs et variables CSS à poser sur <html>. Une valeur vide = on retire la variable. */
export function dysRootStyle(prefs: DysPrefs): {
  attributes: Record<string, string>;
  variables: Record<string, string>;
} {
  const [letter, word] = LETTER_SPACING_VALUES[prefs.letterSpacing];
  return {
    attributes: {
      "data-dys-font": prefs.font,
      "data-dys-bg": prefs.background,
      "data-dys-spacing": prefs.letterSpacing,
      "data-dys-leading": prefs.lineHeight,
    },
    variables: {
      "--pisan-scale": prefs.scale === 100 ? "" : String(prefs.scale / 100),
      "--pisan-line-height": LINE_HEIGHT_VALUES[prefs.lineHeight],
      "--pisan-letter-spacing": letter,
      "--pisan-word-spacing": word,
    },
  };
}

export function applyDys(prefs: DysPrefs, root: HTMLElement = document.documentElement): void {
  const { attributes, variables } = dysRootStyle(prefs);
  for (const [name, value] of Object.entries(attributes)) root.setAttribute(name, value);
  for (const [name, value] of Object.entries(variables)) {
    if (value) root.style.setProperty(name, value);
    else root.style.removeProperty(name);
  }
}

export function loadDys(
  storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): DysPrefs {
  try {
    const raw = storage?.getItem(DYS_STORAGE_KEY);
    return raw ? sanitizeDys(JSON.parse(raw)) : DEFAULT_DYS;
  } catch {
    return DEFAULT_DYS;
  }
}

export function saveDys(
  prefs: DysPrefs,
  storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(DYS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Navigation privée ou stockage plein : les réglages restent actifs pour cette visite.
  }
}

/** Keep the learner's original settings private on this device across teacher revisions. */
export function teacherDysSettings(defaults: DysPrefs | null | undefined, revision: string | null | undefined, storage: Storage = globalThis.localStorage): DysPrefs {
 const current = loadDys(storage);
 if (!revision || storage.getItem('pisan-dys-teacher-revision') === revision) return current;
 const backupKey = 'pisan-dys-before-teacher';
 const backup = storage.getItem(backupKey);
 let next = current;
 if (defaults) {
   if (!backup) storage.setItem(backupKey, JSON.stringify(current));
   next = sanitizeDys(defaults);
 } else if (backup) {
   try { next = sanitizeDys(JSON.parse(backup)); } catch { next = current; }
   storage.removeItem(backupKey);
 }
 saveDys(next, storage);
 storage.setItem('pisan-dys-teacher-revision', revision);
 return next;
}
