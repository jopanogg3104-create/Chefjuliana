import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import leads from '../api/leads.js';
import config from '../api/config.js';
import {validateLead,editHash,leadPayload} from '../lib/leads.js';
function response(){return {code:0,body:null,setHeader(){},status(n){this.code=n;return this;},json(value){this.body=value;return this;}};}
const valid={key:randomUUID(),name:'Pessoa de teste',phone:'11999999999',event:'Aniversário',guests:'31–50',city:'Teste, SP',date:'',notes:'Teste',email:'',privacy:true};
test('validação serverless: data inválida, dados e chave de edição',()=>{assert.ok(validateLead(valid));for(const change of [{date:'2099-02-30'},{privacy:'yes'},{email:[]},{name:''},{key:'predictable'},{phone:'123'}])assert.equal(validateLead({...valid,...change}),false);assert.equal(editHash(valid.key).length,64);assert.notEqual(editHash(valid.key),valid.key)});
test('Vercel sem banco não confirma recebimento e permite WhatsApp',async()=>{const previous=[process.env.DATABASE_URL,process.env.POSTGRES_URL];delete process.env.DATABASE_URL;delete process.env.POSTGRES_URL;try{let res=response();config({method:'GET'},res);assert.equal(res.body.whatsapp,'5514997563799');assert.equal(res.body.storageAvailable,false);res=response();await leads({method:'POST',headers:{host:'example.vercel.app',origin:'https://example.vercel.app'},body:valid},res);assert.equal(res.code,503);assert.equal(res.body.canUseWhatsapp,true);assert.equal(res.body.id,undefined);res=response();await leads({method:'GET',headers:{}},res);assert.equal(res.code,405);res=response();await leads({method:'POST',headers:{host:'example.vercel.app',origin:'https://outside.example'},body:valid},res);assert.equal(res.code,403)}finally{for(const [n,v]of [['DATABASE_URL',previous[0]],['POSTGRES_URL',previous[1]]]){if(v===undefined)delete process.env[n];else process.env[n]=v}}});

test('serviços domiciliares: aceita poucos convidados e preserva experiência',()=>{for(const experience of ['Chef em domicílio','Tábuas gastronômicas','Encontros à mesa']){const request={...valid,event:'Pedido gastronômico',guests:'1–10',experience};assert.ok(validateLead(request));assert.equal(leadPayload(request).experience,experience);}assert.equal(validateLead({...valid,experience:'Serviço inexistente'}),false);});
