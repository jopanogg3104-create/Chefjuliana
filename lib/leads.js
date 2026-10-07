import {createHash} from 'node:crypto';
export function validateLead(d){
 if(!d||typeof d!=='object'||Array.isArray(d))return false;
 if(typeof d.name!=='string'||d.name.trim().length<2||d.name.length>120)return false;
 if(typeof d.phone!=='string'||d.phone.length>40||!/^\d{10,15}$/.test(d.phone.replace(/\D/g,'')))return false;
 if(typeof d.city!=='string'||!d.city.trim()||d.city.length>160)return false;
 if(!['Celebração','Aniversário','Casamento','Corporativo','Outro'].includes(d.event)||!['Até 30','31–50','51–100','101–150','151–200','Mais de 200'].includes(d.guests))return false;
 if(typeof d.notes!=='string'||d.notes.length>2000||d.privacy!==true||typeof d.key!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.key))return false;
 if(d.email!==undefined&&(typeof d.email!=='string'||d.email.length>254||(d.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))))return false;
 if(d.date!==undefined&&typeof d.date!=='string')return false;
 if(d.date){const date=new Date(d.date);if(!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==d.date||d.date<new Date().toISOString().slice(0,10))return false;}
 return true;
}
export const editHash=key=>createHash('sha256').update(key).digest('hex');
export function leadPayload(d){return {name:d.name.trim(),phone:d.phone.replace(/\D/g,''),event:d.event,guests:d.guests,date:d.date||null,city:d.city.trim(),experience:'Quero orientação',notes:d.notes,email:d.email||null,privacyVersion:'1.0',source:'site'};}
export const databaseUrl=()=>process.env.DATABASE_URL||process.env.POSTGRES_URL;
