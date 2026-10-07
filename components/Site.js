import AnimatedLoadingSkeleton from './ui/animated-loading-skeleton';
import Head from 'next/head';
import Script from 'next/script';
import {useRouter} from 'next/router';
export default function Site({html,siteUrl}){
 const {pathname}=useRouter();const canonical=siteUrl?siteUrl+pathname:null;
 return <><Head><title>Chef Juliana Nogueira — Chef domiciliar e gastronomia para eventos</title><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="theme-color" content="#f5f1e8"/><meta name="description" content="Chef domiciliar e gastronomia para eventos com Juliana Nogueira. Atendimento em casa, tábuas gastronômicas e almoços e jantares sob consulta."/><meta property="og:title" content="Chef Juliana Nogueira"/><meta property="og:type" content="website"/><meta property="og:locale" content="pt_BR"/><meta property="og:description" content="Sua celebração começa à mesa."/><meta property="og:image" content={(siteUrl||'')+'/media/hero.webp'}/>{canonical&&<><link rel="canonical" href={canonical}/><meta property="og:url" content={canonical}/></>}</Head><div dangerouslySetInnerHTML={{__html:html}}/><AnimatedLoadingSkeleton/><Script src="/app.js" type="module" strategy="afterInteractive"/></>;
}
