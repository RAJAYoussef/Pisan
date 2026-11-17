export type FractionWidgetKind = 'fraction-equivalence' | 'fraction-addition' | 'fraction-numberline';

export type FractionWidgetSpec =
  | { kind: 'fraction-equivalence'; source: { n: number; d: number }; factor: number }
  | { kind: 'fraction-addition'; left: { n: number; d: number }; right: { n: number; d: number } }
  | { kind: 'fraction-numberline'; target: { n: number; d: number } };

export type FractionReasoningEvent = {
  widgetKind: FractionWidgetKind;
  sequence: number;
  occurredAtClient: string;
  action: 'part-toggled' | 'position-changed' | 'verified' | 'reset';
  state: { selectedParts?: number[]; position?: number; correct?: boolean };
  skillId: string;
  activitySeed: number;
  stepIndex: number;
  widget: FractionWidgetSpec;
};

export type FractionObservation = {
  code: 'attempted-construction' | 'verification-failed' | 'self-correction' | 'construction-reset' | 'position-adjusted' | 'verification-succeeded';
  level: 'observation';
  message: string;
  evidenceSequences: number[];
};

export type FractionVerificationCheck = {
  id: string;
  prompt: string;
  options: { value: string; label: string }[];
  expectedValue: string;
};

export type FractionHypothesis = {
  code: 'fraction-scale-one-term' | 'fraction-count-one-addend';
  level: 'hypothesis';
  confidence: 'low';
  explanation: string;
  evidenceSequences: number[];
  checks: [FractionVerificationCheck, FractionVerificationCheck];
};

export type FractionDiagnostic = {
  level: 'diagnostic';
  status: 'confirmed' | 'not-confirmed' | 'inconclusive';
  hypothesisCode: FractionHypothesis['code'];
  checkResults: { checkId: string; correct: boolean }[];
  explanation: string;
};

export type FractionSequenceAnalysis = {
  observations: FractionObservation[];
  hypotheses: FractionHypothesis[];
  diagnostic: FractionDiagnostic | null;
  summary: string;
};

function groupKey(event: FractionReasoningEvent) {
  return [event.skillId, event.activitySeed, event.stepIndex, event.widgetKind].join(':');
}

/** Lit une seule séquence d'un atelier. Ne calcule jamais un score de maîtrise. */
export function readFractionSequence(input: FractionReasoningEvent[]): FractionSequenceAnalysis {
  const events = [...input].sort((a, b) => a.sequence - b.sequence);
  if (!events.length) return { observations: [], hypotheses: [], diagnostic: null, summary: 'Aucune manipulation observée.' };
  const key = groupKey(events[0]!);
  const sequence = events.filter(e => groupKey(e) === key);
  const observations: FractionObservation[] = [];
  const toggles = sequence.filter(e => e.action === 'part-toggled');
  const moves = sequence.filter(e => e.action === 'position-changed');
  const resets = sequence.filter(e => e.action === 'reset');
  const checks = sequence.filter(e => e.action === 'verified');
  const failed = checks.filter(e => e.state.correct === false);
  const succeeded = checks.filter(e => e.state.correct === true);
  const evidence = (...items: FractionReasoningEvent[]) => items.map(e => e.sequence);

  if (toggles.length || moves.length) observations.push({
    code: 'attempted-construction', level: 'observation',
    message: `L'élève a effectué ${toggles.length} changement(s) de parts et ${moves.length} déplacement(s) sur la droite.`,
    evidenceSequences: evidence(...toggles, ...moves),
  });
  if (failed.length) observations.push({
    code: 'verification-failed', level: 'observation',
    message: `${failed.length} vérification(s) ont été refusée(s).`,
    evidenceSequences: evidence(...failed),
  });
  if (resets.length) observations.push({
    code: 'construction-reset', level: 'observation',
    message: `L'élève a recommencé ${resets.length} fois.`,
    evidenceSequences: evidence(...resets),
  });
  const correctedAfterFailure = failed.length > 0 && succeeded.some(s => s.sequence > failed[0]!.sequence && sequence.some(e => e.sequence > failed[0]!.sequence && e.sequence < s.sequence && (e.action === 'part-toggled' || e.action === 'position-changed' || e.action === 'reset')));
  if (correctedAfterFailure) observations.push({
    code: 'self-correction', level: 'observation',
    message: 'Après une validation incorrecte, l’élève a modifié sa construction et obtenu ensuite une validation correcte.',
    evidenceSequences: evidence(failed[0]!, ...succeeded.filter(s => s.sequence > failed[0]!.sequence)),
  });
  if (moves.length > 1) observations.push({
    code: 'position-adjusted', level: 'observation',
    message: `Le point a été déplacé ${moves.length} fois avant la fin de la séquence.`,
    evidenceSequences: evidence(...moves),
  });
  if (checks.length && checks[checks.length - 1]!.state.correct === true) observations.push({
    code: 'verification-succeeded', level: 'observation',
    message: 'La dernière validation observée est correcte.',
    evidenceSequences: evidence(succeeded[succeeded.length - 1]!),
  });

  const hypotheses: FractionHypothesis[] = [];
  const firstFailed = failed[0];
  if (firstFailed?.state.selectedParts && firstFailed.widgetKind === 'fraction-equivalence') {
    const spec = firstFailed.widget;
    if (spec.kind === 'fraction-equivalence' && spec.source.n !== spec.source.n * spec.factor &&
      firstFailed.state.selectedParts.length === spec.source.n) {
      hypotheses.push({
        code: 'fraction-scale-one-term', level: 'hypothesis', confidence: 'low',
        explanation: 'La première construction incorrecte conserve le numérateur de départ alors que le nombre de parts a changé. Cela peut indiquer que seul un terme de la fraction a été transformé ; une construction isolée ne suffit pas à l’affirmer.',
        evidenceSequences: [firstFailed.sequence],
        checks: [
          { id: 'scale-both-terms', prompt: 'Pour conserver la valeur de 1/2 en multipliant par 2, que faut-il faire ?', options: [{ value: 'both', label: 'Multiplier le numérateur et le dénominateur par 2' }, { value: 'top', label: 'Multiplier seulement le numérateur par 2' }, { value: 'bottom', label: 'Multiplier seulement le dénominateur par 2' }], expectedValue: 'both' },
          { id: 'scale-transfer', prompt: 'Quelle fraction est équivalente à 3/5 ?', options: [{ value: 'a', label: '9/15' }, { value: 'b', label: '9/5' }, { value: 'c', label: '3/15' }], expectedValue: 'a' },
        ],
      });
    }
  }
  if (firstFailed?.state.selectedParts && firstFailed.widgetKind === 'fraction-addition') {
    const spec = firstFailed.widget;
    if (spec.kind === 'fraction-addition' && spec.left.n !== spec.right.n &&
      [spec.left.n, spec.right.n].includes(firstFailed.state.selectedParts.length)) {
      hypotheses.push({
        code: 'fraction-count-one-addend', level: 'hypothesis', confidence: 'low',
        explanation: 'La construction validée contient autant de parts que l’un des deux termes, ce qui peut signaler que l’élève n’a pris en compte qu’un seul des deux apports.',
        evidenceSequences: [firstFailed.sequence],
        checks: [
          { id: 'add-count', prompt: 'Combien de quarts représentent 1/4 + 2/4 ?', options: [{ value: '1', label: '1/4' }, { value: '2', label: '2/4' }, { value: '3', label: '3/4' }], expectedValue: '3' },
          { id: 'add-denominator', prompt: 'Dans 1/4 + 2/4, pourquoi le dénominateur reste-t-il 4 ?', options: [{ value: 'same-size', label: 'Parce que les parts ont déjà la même taille' }, { value: 'add', label: 'Parce qu’on additionne aussi les dénominateurs' }, { value: 'guess', label: 'Parce que le dénominateur ne change jamais' }], expectedValue: 'same-size' },
        ],
      });
    }
  }

  return {
    observations,
    hypotheses,
    diagnostic: null,
    summary: observations.length
      ? `${observations.length} observation(s) factuelle(s), ${hypotheses.length} hypothèse(s) à vérifier. Aucun diagnostic confirmé.`
      : 'La séquence ne contient pas encore assez d’actions interprétables.',
  };
}

/** Confirme une hypothèse uniquement si les deux vérifications complémentaires sont correctes. */
export function verifyFractionHypothesis(
  hypothesis: FractionHypothesis,
  responses: Record<string, string>,
): FractionDiagnostic {
  const checkResults = hypothesis.checks.map(check => ({
    checkId: check.id,
    correct: responses[check.id] === check.expectedValue,
  }));
  const answered = hypothesis.checks.every(check => Object.prototype.hasOwnProperty.call(responses, check.id));
  const allCorrect = checkResults.every(result => result.correct);
  const anyWrong = checkResults.some(result => !result.correct);
  const status = answered && allCorrect ? 'confirmed' : answered && anyWrong ? 'not-confirmed' : 'inconclusive';
  return {
    level: 'diagnostic',
    status,
    hypothesisCode: hypothesis.code,
    checkResults,
    explanation: status === 'confirmed'
      ? 'Les deux vérifications complémentaires corroborent l’hypothèse. Le diagnostic est confirmé pour cette difficulté ciblée, pas pour l’ensemble de la compétence.'
      : status === 'not-confirmed'
        ? 'Les vérifications ne corroborent pas l’hypothèse initiale. Il faut conserver les observations sans attribuer cette difficulté à l’élève.'
        : 'Les deux vérifications sont nécessaires avant de conclure.',
  };
}
