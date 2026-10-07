import Site from '../components/Site.js';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
export default Site;
export async function getStaticProps(){
 const html=await readFile(join(process.cwd(),'content/site.html'),'utf8');
 const siteUrl=(process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:null))?.replace(/\/$/,'')||null;
 return {props:{html,siteUrl}};
}
