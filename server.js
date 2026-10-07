import http from 'node:http';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
const root=resolve('public'), folder=resolve(process.env.DATA_DIR || 'data');
await mkdir(folder,{recursive:true});
const file=resolve(folder,'leads.json');
let leads;try{leads=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;leads=[];}
let queue=Promise.resolve();
const attempts=new Map();
const publicUrl=process.env.SITE_URL?.replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.mp4':'video/mp4','.woff2':'font/woff2'};
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/robots.txt'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('User-agent: *\nAllow: /\nDisallow: /api/\n'+(publicUrl?'Sitemap: '+publicUrl+'/sitemap.xml\n':''));}
 if(url.pathname==='/sitemap.xml' && publicUrl){res.writeHead(200,{'Content-Type':'application/xml'});return res.end('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/orcamento','/privacidade'].map(p=>'<url><loc>'+publicUrl+p+'</loc></url>').join('')+'</urlset>');}
 if(url.pathname==='/api/config')return json(res,200,{whatsapp:process.env.WHATSAPP_NUMBER||'5514997563799'});
 if(url.pathname==='/api/leads'){
 if(req.method!=='POST')return json(res,405,{error:'Método não permitido.'});
 if(req.headers.origin && req.headers.origin!==`http://${req.headers.host}` && req.headers.origin!==`https://${req.headers.host}`)return json(res,403,{error:'Origem inválida.'});
 const ip=req.socket.remoteAddress;const now=Date.now();const times=(attempts.get(ip)||[]).filter(t=>now-t<60000);if(times.length>=20)return json(res,429,{error:'Muitas tentativas. Aguarde um minuto.'});times.push(now);attempts.set(ip,times);
 let body='';for await(const chunk of req){body+=chunk;if(body.length>12000)return json(res,413,{error:'Pedido muito longo.'});}
 let d;try{d=JSON.parse(body);}catch{return json(res,400,{error:'Dados inválidos.'});}
 if(!d || typeof d!=='object' || typeof d.name!=='string'||d.name.trim().length<2||d.name.length>120||typeof d.phone!=='string'||!/^\d{10,15}$/.test(d.phone.replace(/\D/g,''))||typeof d.city!=='string'||!d.city.trim()||d.city.length>160||!['Celebração','Aniversário','Casamento','Corporativo','Outro'].includes(d.event)||!['Até 30','31–50','51–100','101–150','151–200','Mais de 200'].includes(d.guests)||typeof d.notes!=='string'||d.notes.length>2000||!d.privacy||typeof d.key!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.key)|| (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) || (d.date && (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(Date.parse(d.date))||new Date(d.date).toISOString().slice(0,10)!==d.date||d.date<new Date().toISOString().slice(0,10))))return json(res,400,{error:'Confira os campos do pedido.'});
 const work=queue.then(async()=>{const existing=leads.find(x=>x.key===d.key);
 const lead={id:existing?.id||randomUUID(),key:d.key,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),status:'novo',name:d.name.trim(),phone:d.phone,event:d.event,guests:d.guests,date:d.date||null,city:d.city.trim(),experience:'Quero orientação',notes:d.notes,email:d.email||null,privacyVersion:'1.0',source:'site'};
 const next=existing?leads.map(x=>x.id===existing.id?lead:x):[...leads,lead];await writeFile(file+'.tmp',JSON.stringify(next,null,2),{mode:0o600});await rename(file+'.tmp',file);leads=next;return lead.id;});queue=work.catch(()=>{});return json(res,201,{id:await work});
 }
 if(req.method!=='GET')return json(res,405,{error:'Método não permitido.'});
 const name=url.pathname==='/'||url.pathname==='/orcamento'||url.pathname==='/privacidade'?'/index.html':decodeURIComponent(url.pathname);const path=resolve(root,'.'+name);
 if(!path.startsWith(root+'/'))return json(res,403,{error:'Acesso negado.'});
 const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch(e){json(res,e.code==='ENOENT'?404:500,{error:e.code==='ENOENT'?'Página não encontrada.':'Não foi possível salvar. Tente novamente.'});}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Site disponível na porta '+(process.env.PORT||3000)));
