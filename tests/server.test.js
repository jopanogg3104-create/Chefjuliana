import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomUUID} from 'node:crypto';
test('Next.js em produção: páginas, APIs e WhatsApp sem credenciais',async()=>{
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3199'],{env:{...process.env,DATABASE_URL:'',POSTGRES_URL:'',WHATSAPP_NUMBER:'5514997563799'},stdio:['ignore','pipe','pipe']});
 try{
 await new Promise((ok,bad)=>{let output='';const timer=setTimeout(()=>bad(Error('Next.js não iniciou')),30000);child.stdout.on('data',chunk=>{output+=chunk;if(output.includes('Ready')){clearTimeout(timer);ok();}});child.on('error',e=>{clearTimeout(timer);bad(e)});child.on('exit',code=>{clearTimeout(timer);bad(Error('Next.js saiu: '+code))});});
 const base='http://127.0.0.1:3199';
 for(const route of ['/','/orcamento','/privacidade']){const r=await fetch(base+route);assert.equal(r.status,200);const html=await r.text();assert.ok(html.includes('__NEXT_DATA__'));assert.ok(html.includes('Esta é'));}
 const settings=await(await fetch(base+'/api/config')).json();assert.equal(settings.whatsapp,'5514997563799');assert.equal(settings.storageAvailable,false);
 const payload={key:randomUUID(),name:'Pessoa de teste',phone:'11999999999',event:'Atendimento em domicílio',guests:'1–10',experience:'Encontros à mesa',city:'Teste, SP',date:'',notes:'Teste',email:'',privacy:true};
 const response=await fetch(base+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(response.status,503);assert.equal((await response.json()).canUseWhatsapp,true);assert.equal((await fetch(base+'/api/leads')).status,405);assert.equal((await fetch(base+'/sitemap.xml')).status,200);
 }finally{if(child.exitCode===null)await new Promise(ok=>{child.once('exit',ok);child.kill()});}
});
