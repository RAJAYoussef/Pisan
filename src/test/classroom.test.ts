import { describe,it,expect } from 'vitest';
import { masteryBand,isInactive,blockingNotions,normalizeClassCode,displayClassCode,classCsv,type ClassStudent } from '@/lib/classroom';
const student=(name:string,correct=0):ClassStudent=>({id:name,profile:{nickname:name,country:'fr',grade:0,lang:'fr'},last_active_at:'2026-11-12T12:00:00Z',dys_default:null,progress:{unlocked:[],attempts:[{notion:'fractions',kind:'workshop',correct,total:10,date:'2026-11-12T12:00:00Z',minutes:4}]}});
describe('Classroom rules',()=>{
 it('uses red for 0–39 percent',()=>{expect(masteryBand(0)).toBe('low');expect(masteryBand(39)).toBe('low');});
 it('uses yellow for 40–79 percent',()=>{expect(masteryBand(40)).toBe('medium');expect(masteryBand(79)).toBe('medium');});
 it('uses green for 80–100 percent',()=>{expect(masteryBand(80)).toBe('high');expect(masteryBand(100)).toBe('high');});
 it('flags inactivity only after three days',()=>{const now=Date.parse('2026-11-15T12:00:00Z');expect(isInactive('2026-11-12T12:00:00Z',now)).toBe(true);expect(isInactive('2026-11-12T12:00:01Z',now)).toBe(false);});
 it('requires several attempted students to identify a blocked topic',()=>{expect(blockingNotions([student('A')])).toHaveLength(0);expect(blockingNotions([student('A'),student('B')]).map(n=>n.notion.id)).toEqual(['fractions']);expect(blockingNotions([student('A'),student('B',4)])).toHaveLength(0);});
 it('stores six characters and displays the example code',()=>{expect(normalizeClassCode(' pi-7kq2 ')).toBe('PI7KQ2');expect(normalizeClassCode('PI-7KQ2')).toHaveLength(6);expect(displayClassCode('PI7KQ2')).toBe('PI-7KQ2');});
 it('exports actual mastery and neutralizes spreadsheet formulas',()=>{const csv=classCsv([student('=1+1',8)],[{id:'fractions',label:'Fractions'}],{nickname:'Pseudo',lastActive:'Activité'});expect(csv).toContain('"80"');expect(csv).toContain('"\'=1+1"');});
});
