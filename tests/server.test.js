import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
const dir=await mkdtemp(join(tmpdir(),'soup-test-'));let child;const base='http://127.0.0.1:3199';
async function start(){child=spawn(process.execPath,['server.js'],{env:{...process.env,PORT:'3199',DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((ok,bad)=>{child.stdout.once('data',ok);child.once('error',bad);child.once('exit',code=>bad(Error('Server exited '+code)))});}
async function stop(){await new Promise(ok=>{child.once('exit',ok);child.kill()})}
const payload={key:randomUUID(),name:'Pessoa de teste',phone:'11999999999',event:'Aniversário',guests:'31–50',city:'Teste, SP',date:'',notes:'Teste',email:'',privacy:true};
const post=d=>fetch(base+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});
test('orçamento: validação, acesso privado, idempotência, edição e persistência',async()=>{try{await start();assert.equal((await fetch(base)).status,200);assert.equal((await post({...payload,name:''})).status,400);assert.equal((await fetch(base+'/api/leads')).status,405);assert.equal((await fetch(base+'/data/leads.json')).status,404);const a=await post(payload);assert.equal(a.status,201);const first=await a.json();const second=await(await post(payload)).json();assert.equal(first.id,second.id);await post({...payload,notes:'Alterado'});let rows=JSON.parse(await readFile(join(dir,'leads.json'),'utf8'));assert.equal(rows.length,1);assert.equal(rows[0].notes,'Alterado');await stop();await start();await post(payload);rows=JSON.parse(await readFile(join(dir,'leads.json'),'utf8'));assert.equal(rows.length,1);const denied=await fetch(base+'/api/leads',{method:'POST',headers:{Origin:'https://outside.example','Content-Type':'application/json'},body:JSON.stringify(payload)});assert.equal(denied.status,403);}finally{if(child?.exitCode===null)await stop();await rm(dir,{recursive:true,force:true})}});
