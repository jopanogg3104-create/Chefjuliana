import {databaseUrl} from '../leads.js';
export default function handler(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='GET')return res.status(405).json({error:'Método não permitido.'});return res.status(200).json({whatsapp:process.env.WHATSAPP_NUMBER||'5514997563799',storageAvailable:Boolean(databaseUrl())});}
