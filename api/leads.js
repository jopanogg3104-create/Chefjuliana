import postgres from 'postgres';
import {randomUUID,createHash} from 'node:crypto';
import {validateLead,leadPayload,editHash,databaseUrl} from '../lib/leads.js';
let sql,schema;
function database(){if(!sql)sql=postgres(databaseUrl(),{max:1,ssl:{rejectUnauthorized:true},connect_timeout:10,idle_timeout:20});return sql;}
async function prepare(db){if(!schema)schema=(async()=>{await db`CREATE TABLE IF NOT EXISTS chef_leads (id uuid PRIMARY KEY, edit_hash text UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), status text NOT NULL DEFAULT 'novo', payload jsonb NOT NULL)`;await db`CREATE TABLE IF NOT EXISTS chef_lead_limits (ip_hash text PRIMARY KEY, window_start timestamptz NOT NULL DEFAULT now(), count integer NOT NULL)`;})();try{await schema;}catch(e){schema=undefined;throw e;}}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método não permitido.'});
 const origin=req.headers.origin,host=req.headers.host;
 if(origin&&origin!==`https://${host}`&&origin!==`http://${host}`)return res.status(403).json({error:'Origem inválida.'});
 let d;try{d=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Dados inválidos.'});}
 if(JSON.stringify(d??{}).length>12000)return res.status(413).json({error:'Pedido muito longo.'});
 if(!validateLead(d))return res.status(400).json({error:'Confira os campos do pedido.'});
 if(!databaseUrl())return res.status(503).json({error:'O armazenamento ainda não está configurado. Continue pelo WhatsApp para enviar seu pedido.',canUseWhatsapp:true});
 try{
 const db=database();await prepare(db);
 const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
 const hash=createHash('sha256').update(new Date().toISOString().slice(0,10)+ip).digest('hex');
 const [limit]=await db`INSERT INTO chef_lead_limits (ip_hash,count) VALUES (${hash},1) ON CONFLICT (ip_hash) DO UPDATE SET count=CASE WHEN chef_lead_limits.window_start<now()-interval '1 minute' THEN 1 ELSE chef_lead_limits.count+1 END, window_start=CASE WHEN chef_lead_limits.window_start<now()-interval '1 minute' THEN now() ELSE chef_lead_limits.window_start END RETURNING count`;
 if(limit.count>20)return res.status(429).json({error:'Muitas tentativas. Aguarde um minuto.'});
 await db`DELETE FROM chef_lead_limits WHERE window_start<now()-interval '1 day'`;
 const [row]=await db`INSERT INTO chef_leads (id,edit_hash,payload) VALUES (${randomUUID()},${editHash(d.key)},${db.json(leadPayload(d))}) ON CONFLICT (edit_hash) DO UPDATE SET payload=EXCLUDED.payload, updated_at=now() RETURNING id`;
 return res.status(201).json({id:row.id});
 }catch{return res.status(503).json({error:'Não foi possível salvar o pedido agora. Tente novamente ou envie o resumo pelo WhatsApp.',canUseWhatsapp:true});}
}
