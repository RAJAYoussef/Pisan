import { beforeEach,describe,it,expect,vi } from 'vitest';
const {from,adminFrom}=vi.hoisted(()=>({from:vi.fn(),adminFrom:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>{const builder={middleware:()=>builder,inputValidator:()=>builder,handler:(fn:unknown)=>fn};return builder;}}));
vi.mock('@/integrations/supabase/auth-middleware',()=>({requireSupabaseAuth:{}}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:adminFrom}}));
import {classDashboard,setStudentDys,saveTeacher} from '@/lib/teacher.functions';
const context={userId:'teacher-a',supabase:{from}};
const dashboard=classDashboard as unknown as (input:{data:{id:string};context:typeof context})=>Promise<unknown>;
const dys=setStudentDys as unknown as (input:{data:{classId:string;memberId:string;enabled:boolean};context:typeof context})=>Promise<unknown>;
beforeEach(()=>{vi.clearAllMocks();});
describe('Teacher private data authorization',()=>{
 it('denies access to another teacher’s class before privileged reads',async()=>{
  const eq=vi.fn();const chain={select:()=>chain,eq:(key:string,value:string)=>{eq(key,value);return chain;},single:async()=>({data:null,error:{message:'missing'}})};from.mockReturnValue(chain);
  await expect(dashboard({data:{id:'other-class'},context})).rejects.toThrow('Forbidden');
  expect(eq).toHaveBeenCalledWith('teacher_id','teacher-a');expect(adminFrom).not.toHaveBeenCalled();
 });
 it('denies changing DYS for pupils of another teacher',async()=>{
  const chain={select:()=>chain,eq:()=>chain,single:async()=>({data:null,error:{message:'missing'}})};from.mockReturnValue(chain);
  await expect(dys({data:{classId:'other-class',memberId:'pupil',enabled:true},context})).rejects.toThrow('Forbidden');expect(adminFrom).not.toHaveBeenCalled();
 });
 it('only permits DYS on a membership within the authorized class',async()=>{
  const owner={select:()=>owner,eq:()=>owner,single:async()=>({data:{id:'own'},error:null})};from.mockReturnValue(owner);
  const eq=vi.fn();const member={select:()=>member,eq:(key:string,value:string)=>{eq(key,value);return member;},single:async()=>({data:null,error:{message:'missing'}})};adminFrom.mockReturnValue(member);
  await expect(dys({data:{classId:'own',memberId:'foreign-pupil',enabled:true},context})).rejects.toThrow('Forbidden');expect(eq).toHaveBeenCalledWith('class_id','own');expect(eq).toHaveBeenCalledWith('id','foreign-pupil');
 });
 it('rejects wildcard partner codes before querying the private registry',async()=>{
  const save=saveTeacher as unknown as (input:{data:{display_name:string;school_name:string;code:string};context:typeof context})=>Promise<unknown>;
  await expect(save({data:{display_name:'Teacher',school_name:'School',code:'%'},context})).rejects.toThrow('Invalid code');expect(adminFrom).not.toHaveBeenCalled();
 });
});
