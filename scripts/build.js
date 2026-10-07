import {readFile,writeFile,access} from 'node:fs/promises';
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href|poster)="(\/(?:media|fonts)[^"]+|\/[^/]+\.(?:css|js))"/g))await access('public'+match[1]);
const url=process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:null);
await writeFile('public/robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\n'+(url?'Sitemap: '+url.replace(/\/$/,'')+'/sitemap.xml\n':''));
if(url){const base=url.replace(/\/$/,'');if(!/^https:\/\/[a-zA-Z0-9.-]+(?::\d+)?$/.test(base))throw Error('SITE_URL deve ser uma URL HTTPS sem caminho.');await writeFile('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/orcamento','/privacidade'].map(path=>'<url><loc>'+base+path+'</loc></url>').join('')+'</urlset>');const tags=`<link rel="canonical" href="${base}/"><meta property="og:url" content="${base}/">`;await writeFile('public/index.html',html.replace('</head>',tags+'</head>').replace('content="/media/hero.webp"',`content="${base}/media/hero.webp"`));}
console.log('Build concluído: arquivos estáticos e rotas serverless preparados.');
