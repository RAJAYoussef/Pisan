import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { DYS_PRESET } from './dys';
import type { ClassStudent } from './classroom';

export const teacherOverview = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
 const [teacher, classes] = await Promise.all([context.supabase.from('teachers').select('id,display_name,school_name').eq('id',context.userId).maybeSingle(), context.supabase.from('classes').select('*').eq('teacher_id',context.userId).order('created_at')]);
 if (teacher.error || classes.error) throw new Error('Unavailable');
 let partner = false;
 if (teacher.data) {
   const {supabaseAdmin} = await import('@/integrations/supabase/client.server');
   const privateTeacher = await supabaseAdmin.from('teachers').select('partner_code').eq('id',context.userId).single();
   if (privateTeacher.error) throw new Error('Unavailable');
   if (privateTeacher.data.partner_code) {
     const active = await supabaseAdmin.from('partner_codes').select('active').eq('code',privateTeacher.data.partner_code).single();
     if (active.error) throw new Error('Unavailable');
     partner = active.data.active === true;
   }
 }
 return { teacher: teacher.data ? { ...teacher.data, partner } : null, classes: classes.data ?? [] };
});
export const saveTeacher = createServerFn({ method:'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ display_name:z.string().trim().min(1).max(80), school_name:z.string().trim().min(1).max(120), code:z.string().trim().max(100).optional() })).handler(async ({data,context}) => {
 const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
 let partnerCode: string | undefined;
 if (data.code) {
  if (!/^[A-Za-z0-9-]{4,40}$/.test(data.code)) throw new Error('Invalid code');
  const match = await supabaseAdmin.from('partner_codes').select('code').eq('active',true).ilike('code',data.code).maybeSingle();
  if (match.error || !match.data) throw new Error('Invalid code');
  partnerCode = match.data.code;
 }
 const { error } = await supabaseAdmin.from('teachers').upsert({id:context.userId,display_name:data.display_name,school_name:data.school_name,...(partnerCode ? {partner_code:partnerCode} : {})});
 if(error) throw new Error('Unavailable');
 return {ok:true};
});
export const createClass = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({name:z.string().trim().min(1).max(80),country:z.string().max(10),grade:z.number().int().min(0).max(6)})).handler(async ({data,context}) => {
 const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 for(let i=0;i<5;i++) {
  const code=Array.from(crypto.getRandomValues(new Uint8Array(6)),b=>alphabet[b%alphabet.length]).join('');
  const {data:row,error}=await context.supabase.from('classes').insert({...data,teacher_id:context.userId,join_code:code}).select('*').single();
  if(!error) return row;
  if(error.code !== '23505') throw new Error('Unavailable');
 }
 throw new Error('Unavailable');
});
export const classDashboard = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async ({data,context}) => {
 const owned=await context.supabase.from('classes').select('*').eq('id',data.id).eq('teacher_id',context.userId).single();
 if(owned.error || !owned.data) throw new Error('Forbidden');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const members=await supabaseAdmin.from('class_members').select('id,token_hash').eq('class_id',data.id);
 if(members.error) throw new Error('Unavailable');
 if(!members.data.length) return { classroom:owned.data, students:[] as ClassStudent[] };
 const sessions=await supabaseAdmin.from('learning_sessions').select('token_hash,profile,progress,last_active_at,dys_default').in('token_hash',members.data.map(m=>m.token_hash));
 if(sessions.error) throw new Error('Unavailable');
 return {classroom:owned.data, students:members.data.flatMap(m=>{const s=sessions.data.find(s=>s.token_hash===m.token_hash); return s ? [{id:m.id,profile:s.profile,progress:s.progress,last_active_at:s.last_active_at,dys_default:s.dys_default} as unknown as ClassStudent] : [];})};
});
export const setStudentDys = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({classId:z.string().uuid(),memberId:z.string().uuid(),enabled:z.boolean()})).handler(async ({data,context}) => {
 const owned=await context.supabase.from('classes').select('id').eq('id',data.classId).eq('teacher_id',context.userId).single();
 if(owned.error || !owned.data) throw new Error('Forbidden');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const member=await supabaseAdmin.from('class_members').select('token_hash').eq('class_id',data.classId).eq('id',data.memberId).single();
 if(member.error || !member.data) throw new Error('Forbidden');
 const result=await supabaseAdmin.from('learning_sessions').update({dys_default:data.enabled ? DYS_PRESET : null,dys_updated_at:new Date().toISOString()}).eq('token_hash',member.data.token_hash);
 if(result.error) throw new Error('Unavailable');
 return {ok:true};
});
export const joinClass = createServerFn({method:'POST'}).inputValidator(z.object({token:z.string().regex(/^[a-f0-9]{64}$/),code:z.string().trim().regex(/^[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/)})).handler(async ({data})=>{
 const {sessionHash}=await import('./classroom.server');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const hash=await sessionHash(data.token);
 const {data:name,error}=await supabaseAdmin.rpc('join_pisan_class',{p_hash:hash,p_code:data.code});
 if(error) throw new Error('Invalid class code');
 return {name};
});
