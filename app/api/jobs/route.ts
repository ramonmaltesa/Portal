import { NextResponse } from "next/server";

type Source = "Chilquinta" | "Esval y Aguas del Valle" | "USM";
type Job = { id:string; title:string; company:string; source:Source; location:string; career:string; type:string; date:string; url:string; description:string };

const headers={"user-agent":"Mozilla/5.0 (compatible; OportunidadesLaborales/1.0)","accept-language":"es-CL,es;q=0.9"};
const clean=(s:string)=>s.replace(/<[^>]+>/g," ").replace(/&nbsp;|&#xA0;/gi," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
const slugTitle=(url:string)=>decodeURIComponent(url.split("/").pop()||"").replace(/-[0-9a-f]{8}(?:-[0-9a-f-]{27,})?$/i,"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const career=(title:string)=>{const t=title.toLowerCase(); if(/qu[ií]mic|bioqu/.test(t))return "Ingeniería Química";if(/industrial/.test(t))return "Ingeniería Industrial";if(/inform[aá]tic|digital|software|datos|simulaci/.test(t))return "Tecnología e Ingeniería";if(/finanz|cuentas|contab|conciliaci/.test(t))return "Finanzas y Contabilidad";if(/administr|personas|organizacional|recursos humanos/.test(t))return "Administración y Personas";if(/construcci|proyectista|civil|mec[aá]nic|fabricaci/.test(t))return "Ingeniería y Construcción";if(/docente|acad[eé]mic|profesor/.test(t))return "Educación y Docencia";return "Otras áreas"};
const uniq=(jobs:Job[])=>[...new Map(jobs.map(j=>[j.url,j])).values()];

async function chilquinta():Promise<Job[]>{
  const html=await (await fetch("https://chilquinta.trabajando.cl/",{headers})).text(); const jobs:Job[]=[];
  const re=/<a[^>]+href=["']([^"']*\/trabajo\/\d+[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi; let m;
  while((m=re.exec(html))){const block=clean(m[2]);const url=new URL(m[1],"https://chilquinta.trabajando.cl").href;const title=(block.match(/(?:Publicada hoy|Publicada ayer|Hace \d+ d[ií]as?)\s+(.+?)\s+Chilquinta/i)?.[1]||slugTitle(url)).trim();const company=block.match(/Chilquinta[^,.]{0,45}(?:S\.A\.)?/i)?.[0]||"Chilquinta";const loc=block.match(/(?:Valpara[ií]so|Viña del Mar|Quilpu[eé]|San Felipe|Los Andes|Quillota)[^.!]{0,30}/i)?.[0]||"Región de Valparaíso";jobs.push({id:"chil-"+(url.match(/trabajo\/(\d+)/)?.[1]||url),title,company,source:"Chilquinta",location:loc,career:career(title),type:"Jornada completa",date:block.match(/Publicada hoy|Publicada ayer|Hace \d+ d[ií]as?/i)?.[0]||"Publicación reciente",url,description:"Oferta publicada por Chilquinta. Revisa los requisitos, funciones y condiciones completas en el portal de origen."})}
  return uniq(jobs);
}

async function aira():Promise<Job[]>{
  const html=await (await fetch("https://jobs.airavirtual.com/esval-aguasdelvalle",{headers})).text(); const jobs:Job[]=[];
  const re=/<a[^>]+href=["'](https?:\/\/login\.airavirtual\.com\/postula\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;let m;
  while((m=re.exec(html))){const title=clean(m[2]);if(!title||/^postular$/i.test(title))continue;const context=clean(html.slice(m.index,m.index+1800));const location=context.match(/(?:Viña del Mar|La Serena|Ovalle|Valpara[ií]so|Coquimbo)[^|<]{0,28}/i)?.[0]||"Regiones de Valparaíso y Coquimbo";const company=/aguas del valle/i.test(title)?"Aguas del Valle":"Esval";jobs.push({id:"aira-"+m[1].split("/").pop(),title,company,source:"Esval y Aguas del Valle",location,career:career(title),type:/pr[aá]ctica/i.test(context)?"Práctica / Pasantía":"Jornada completa",date:context.match(/Publicado hace \d+ d[ií]as?/i)?.[0]?.replace("Publicado ","")||"Publicación reciente",url:m[1],description:`Oferta publicada por ${company}. Revisa los requisitos y postula en el portal oficial.`})}
  return uniq(jobs);
}

async function usm():Promise<Job[]>{
  const html=await (await fetch("https://usm.rexmas.com/jobs/universidad-tecnica-federico-santa-maria",{headers})).text();const jobs:Job[]=[];
  const re=/<a[^>]+href=["'](https?:\/\/publications\.rexmas\.com\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;let m;
  while((m=re.exec(html))){const text=clean(m[2]);const title=text.split(/Tiempo completo|Media jornada|Part time/i)[0].trim()||slugTitle(m[1]);const context=clean(html.slice(m.index,m.index+1800));jobs.push({id:"usm-"+m[1].split("-").pop(),title,company:"Universidad Técnica Federico Santa María",source:"USM",location:context.match(/(?:Valpara[ií]so|San Joaqu[ií]n|Santiago|Concepci[oó]n)[^,]{0,20}, Chile/i)?.[0]||"Chile",career:career(title),type:context.match(/Tiempo completo|Media jornada|Part time/i)?.[0]||"Jornada completa",date:context.match(/hace \d+ d[ií]as?|\d{1,2} de [a-z]+/i)?.[0]||"Publicación reciente",url:m[1],description:"Oferta publicada por la Universidad Técnica Federico Santa María. Consulta funciones, requisitos y beneficios en la publicación original."})}
  return uniq(jobs);
}

export async function GET(){
  const results=await Promise.allSettled([chilquinta(),aira(),usm()]);
  const jobs=results.flatMap(r=>r.status==="fulfilled"?r.value:[]);
  return NextResponse.json({jobs,updatedAt:new Date().toISOString(),sources:results.map(r=>r.status)} ,{headers:{"Cache-Control":"no-store"}});
}
