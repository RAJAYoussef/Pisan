import { createFileRoute, useNavigate, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { teacherText } from '@/lib/teacher-i18n';
import { LANGS, dirOf, type Lang } from '@/lib/i18n';
import { BrandMark } from '@/components/pisan/brand';
import { TeacherLogin } from '@/components/pisan/teacher-login';
export const Route=createFileRoute('/auth')({head:()=>({meta:[{title:'PiSan — Connexion enseignant'},{name:'description',content:'Connectez-vous à votre espace enseignant PiSan.'},{property:'og:title',content:'PiSan — Connexion enseignant'},{property:'og:description',content:'Accédez à vos classes et au suivi privé de vos élèves.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),component:AuthLayout});
function TeacherAuth(){const [lang,setLang]=useState<Lang>('fr');const navigate=useNavigate();const d=teacherText(lang);
useEffect(()=>{void supabase.auth.getUser().then(({data})=>{if(data.user) void navigate({to:'/teacher',replace:true});});},[navigate]);
return <main dir={dirOf(lang)} className="mx-auto max-w-lg px-5 py-12"><div className="mb-8 flex justify-center"><BrandMark size="large" /></div><div className="mb-6 flex justify-end"><select aria-label="Language" className="language-select" value={lang} onChange={e=>setLang(e.target.value as Lang)}>{LANGS.map(l=><option key={l.id}>{l.id}</option>)}</select></div><TeacherLogin lang={lang} /><Button variant="link" className="mt-6" onClick={()=>navigate({to:'/'})}>{d.student}</Button></main>;}

function AuthLayout(){const location=useLocation();return location.pathname === "/auth" ? <><TeacherAuth/><Outlet/></> : <Outlet/>;}
