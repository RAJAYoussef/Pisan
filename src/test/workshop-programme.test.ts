import { describe, expect, it } from 'vitest';
import { checkCalculation, checkConcrete, concreteSpec, exerciseById, generateAdaptedExercise, highSchoolModes, highSchoolNotion, TEMPLATE_NOTIONS, workshopExercises, demonstrationsForLevel } from '@/lib/exercises';
import { getLevel } from '@/lib/curriculum';
import { programmeFor, programmeNotions } from '@/lib/programmes';

const ids = (country: string, grade: number, track?: string) => programmeNotions(programmeFor(country, grade, track)!).map(n => n.id);

describe('Atelier adapté au programme', () => {
  it('only offers problems that serve the programme, tagged with a programme notion', () => {
    for (const [country, grade] of [['ma', 0], ['ma', 2], ['fr', 0], ['fr', 3], ['ci', 0], ['sn', 3], ['us', 0]] as const) {
      const notions = ids(country, grade);
      const list = workshopExercises(getLevel(country, grade), notions);
      expect(list.length, `${country} ${grade}`).toBeGreaterThan(0);
      expect(list.length).toBeLessThanOrEqual(3);
      for (const ex of list) {
        expect(notions, `${country} ${grade} ${ex.template}`).toContain(ex.notion);
        expect(TEMPLATE_NOTIONS[ex.template]).toContain(ex.notion);
      }
    }
  });
  it('puts the current chapter first', () => {
    const notions = ids('ma', 2);
    const list = workshopExercises(getLevel('ma', 2), notions, 'systems');
    expect(list[0]!.notion).toBe('systems');
    expect(workshopExercises(getLevel('fr', 0), ids('fr', 0), 'fractions')[0]!.notion).toBe('fractions');
  });
  it('keeps the age-based demonstrations without a programme', () => {
    expect(workshopExercises(3).map(e => e.id)).toEqual(demonstrationsForLevel(3).map(e => e.id));
  });
  it('offers no bar problems but the right graph activities in Terminale', () => {
    const spe = ids('fr', 6, 'spe');
    expect(workshopExercises(6, spe)).toEqual([]);
    expect(highSchoolModes(spe)).toEqual(expect.arrayContaining(['graph', 'tree']));
    expect(highSchoolNotion('tree', spe)).toBe('probability-laws');
    expect(spe).toContain(highSchoolNotion('graph', spe));
  });
  it('builds solvable exercises whose concrete model and calculation agree', () => {
    for (const level of [0, 1, 2, 3, 4, 5, 6]) for (const notions of [ids('ma', 2), ids('fr', 0), ids('us', 0)]) {
      for (const ex of workshopExercises(level, notions)) {
        const spec = concreteSpec(ex);
        expect(Number.isInteger(spec.part), ex.id).toBe(true);
        expect(checkConcrete(ex, spec.groups.map(g => g.target)), ex.id).toBe(true);
        expect(checkCalculation(ex, ex.equationAnswer, String(spec.part), String(ex.answer)), ex.id).toBe(true);
      }
    }
  });
  it('lets the server rebuild programme and generated exercises from their id (coach Pi)', async () => {
    const notions = ids('ma', 2);
    for (const ex of workshopExercises(2, notions)) expect(exerciseById(ex.id)?.answer, ex.id).toBe(ex.answer);
    for (const seed of [1, 42, 777, 123456]) {
      const ex = await generateAdaptedExercise({ level: 2, countryId: 'ma', lang: 'fr', notions, focus: 'systems' }, seed);
      expect(notions).toContain(ex.notion);
      expect(exerciseById(ex.id)?.story.fr, ex.id).toBe(ex.story.fr);
      const spec = concreteSpec(ex);
      expect(checkConcrete(ex, spec.groups.map(g => g.target)), ex.id).toBe(true);
    }
  });
});
