import {beforeEach,describe,it,expect,vi} from 'vitest';
import {DEFAULT_DYS,DYS_PRESET,saveDys,teacherDysSettings,loadDys} from '@/lib/dys';
const {from,adminFrom,rpc}=vi.hoisted(()=>({from:vi.fn(),adminFrom:vi.fn(),rpc:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>{const b={middleware:()=>b,inputValidator:()=>b,handler:(fn:unknown)=>fn};return b;}}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:{}}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:adminFrom,rpc}}));
import {joinClass,leaveClass,removeClassStudent} from '@/lib/teacher.functions';
const context={userId:'teacher',supabase:{from}};
type Call=(arg:{data:Record<string,unknown>;context?:typeof context})=>Promise<unknown>;
const join=joinClass as unknown as Call,leave=leaveClass as unknown as Call,remove=removeClassStudent as unknown as Call;
beforeEach(()=>{vi.clearAllMocks();localStorage.clear();});
describe('Class corrections',()=>{
 it('returns an invalid code without failing the learner registration',async()=>{
  rpc.mockResolvedValue({data:{status:'invalid'},error:null});
  await expect(join({data:{token:'a'.repeat(64),code:'wrong'}})).resolves.toEqual({status:'invalid',name:''});
  expect(rpc).toHaveBeenCalledWith('join_pisan_class_limited',{p_hash:expect.stringMatching(/^[a-f0-9]{64}$/),p_code:'wrong'});
 });
 it('surfaces the server attempt limit instead of allowing the join',async()=>{
  rpc.mockResolvedValue({data:{status:'limited'},error:null});
  await expect(join({data:{token:'a'.repeat(64),code:'PI-7KQ2'}})).resolves.toMatchObject({status:'limited'});
 });
 it('restores all personal settings from before teacher DYS, including after learner adjustments and reload',()=>{
  const personal={...DEFAULT_DYS,font:'andika' as const,scale:150,background:'blue' as const,speechRate:0.75,readingRuler:true};
  saveDys(personal);
  expect(teacherDysSettings(DYS_PRESET,'on')).toEqual(DYS_PRESET);
  saveDys({...DYS_PRESET,scale:175});
  expect(teacherDysSettings(DYS_PRESET,'on').scale).toBe(175);
  expect(teacherDysSettings(DYS_PRESET,'on-again')).toEqual(DYS_PRESET);
  expect(teacherDysSettings(null,'off')).toEqual(personal);
  expect(loadDys()).toEqual(personal);
 });
 it('does not reset personal preferences when no previous teacher preset exists',()=>{
  saveDys({...DEFAULT_DYS,scale:150});
  expect(teacherDysSettings(null,'off').scale).toBe(150);
 });
 it('denies removing a pupil from another teacher’s class',async()=>{
  const q={select:()=>q,eq:()=>q,single:async()=>({error:null,data:null})};from.mockReturnValue(q);
  await expect(remove({data:{classId:'foreign',memberId:'member'},context})).rejects.toThrow('Forbidden');
  expect(from).toHaveBeenCalledTimes(1);expect(adminFrom).not.toHaveBeenCalled();
 });
 it('teacher removal deletes only the specified membership and preserves learning progress',async()=>{
  const q={select:()=>q,eq:()=>q,single:async()=>({error:null,data:{id:'own'}})};
  const eq=vi.fn();const del=vi.fn();const m={delete:()=>{del();return m;},eq:(k:string,v:string)=>{eq(k,v);return m;},select:()=>m,single:async()=>({error:null,data:{id:'member'}})};
  from.mockReturnValueOnce(q).mockReturnValueOnce({...q,single:async()=>({error:null,data:{id:'member'}})});adminFrom.mockReturnValue(m);
  await remove({data:{classId:'own',memberId:'member'},context});
  expect(from.mock.calls.map(c=>c[0])).toEqual(['classes','class_members']);expect(del).toHaveBeenCalledTimes(1);
  expect(eq).toHaveBeenCalledWith('class_id','own');expect(eq).toHaveBeenCalledWith('id','member');expect(adminFrom).toHaveBeenCalledExactlyOnceWith('class_members');
 });
 it('learner departure targets only their own hashed capability and keeps progress',async()=>{
  const eq=vi.fn();const q={delete:()=>q,eq:(k:string,v:string)=>{eq(k,v);return q;},select:()=>q,single:async()=>({error:null,data:{id:'member'}})};adminFrom.mockReturnValue(q);
  await leave({data:{token:'a'.repeat(64),memberId:'member'}});
  expect(adminFrom).toHaveBeenCalledExactlyOnceWith('class_members');
  expect(eq).toHaveBeenCalledWith('token_hash',expect.stringMatching(/^[a-f0-9]{64}$/));expect(eq).not.toHaveBeenCalledWith('token_hash','a'.repeat(64));
  expect(eq).toHaveBeenCalledWith('id','member');
 });
});