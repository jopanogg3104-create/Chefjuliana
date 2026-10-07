export default function Sitemap(){return null;}
export async function getServerSideProps({req,res}){
 const base=(process.env.SITE_URL||'https://'+(process.env.VERCEL_PROJECT_PRODUCTION_URL||req.headers.host)).replace(/\/$/,'');
 const safe=base.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
 res.setHeader('Content-Type','application/xml');res.write('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/orcamento','/privacidade'].map(path=>'<url><loc>'+safe+path+'</loc></url>').join('')+'</urlset>');res.end();return {props:{}};
}
