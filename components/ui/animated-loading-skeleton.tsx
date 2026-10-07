import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {animate,motion,useAnimation} from 'framer-motion';

type Position={x:number;y:number};

/** Adaptation of the supplied effect for the existing real-photo gallery. */
export default function AnimatedLoadingSkeleton(){
 const [root,setRoot]=useState<HTMLElement|null>(null);
 const [positions,setPositions]=useState<Position[]>([]);
 const [visible,setVisible]=useState(false);
 const [paused,setPaused]=useState(false);
 const controls=useAnimation();
 const [reduceMotion,setReduceMotion]=useState(true);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduceMotion(preference.matches);
  update();preference.addEventListener('change',update);
  return()=>preference.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const gallery=document.querySelector<HTMLElement>('#eventos .editorial');
  if(!gallery)return;
  setRoot(gallery);
  const figures=Array.from(gallery.querySelectorAll<HTMLElement>(':scope > figure'));
  const measure=()=>{
   const origin=gallery.getBoundingClientRect();
   setPositions(figures.map(figure=>{
    const media=figure.querySelector('img,video')!.getBoundingClientRect();
    return {x:media.left-origin.left+media.width/2-24,y:media.top-origin.top+media.height/2-24};
   }));
  };
  measure();const resize=new ResizeObserver(measure);resize.observe(gallery);
  figures.forEach(figure=>resize.observe(figure));
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0.05});observer.observe(gallery);
  const cleanups:(()=>void)[]=[];
  figures.forEach(figure=>{
   const image=figure.querySelector('img');
   if(!image||image.complete)return;
   figure.classList.add('gallery-loading');
   const ready=()=>{figure.classList.remove('gallery-loading');measure();};
   image.addEventListener('load',ready);image.addEventListener('error',ready);
   cleanups.push(()=>{image.removeEventListener('load',ready);image.removeEventListener('error',ready);figure.classList.remove('gallery-loading');});
  });
  return()=>{resize.disconnect();observer.disconnect();cleanups.forEach(fn=>fn());};
 },[]);
 useEffect(()=>{
  if(!root||reduceMotion)return;
  const figures=Array.from(root.querySelectorAll<HTMLElement>(':scope > figure'));
  const animations:ReturnType<typeof animate>[]=[];
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(!entry.isIntersecting)return;const i=figures.indexOf(entry.target as HTMLElement);animations.push(animate(entry.target as HTMLElement,{opacity:[0,1],y:[20,0]},{duration:0.5,delay:(i%2)*0.1,ease:'easeOut'}));observer.unobserve(entry.target);});
  },{threshold:0.12});figures.forEach(figure=>observer.observe(figure));
  return()=>{observer.disconnect();animations.forEach(animation=>animation.stop());figures.forEach(figure=>{figure.style.opacity="";figure.style.transform="";});};
 },[root,reduceMotion]);
 useEffect(()=>{
  controls.stop();
  if(!positions.length||!visible||paused||reduceMotion)return;
  const order=positions.length===4?[0,1,3,2,0]:[...positions.map((_,i)=>i),0];
  const path=order.map(i=>positions[i]);
  controls.set({x:path[0].x,y:path[0].y});
  void controls.start({x:path.map(p=>p.x),y:path.map(p=>p.y),transition:{duration:path.length*2,repeat:Infinity,ease:'easeInOut',times:path.map((_,i)=>i/(path.length-1))}});
  return()=>controls.stop();
 },[positions,visible,paused,reduceMotion,controls]);
 if(!root||reduceMotion)return null;
 return createPortal(<>
  <motion.div className="gallery-search" animate={controls} initial={false} style={{opacity:visible&&!paused?1:0}} aria-hidden="true">
   <motion.div className="gallery-search-circle" animate={visible&&!paused?{scale:[1,1.08,1]}:{scale:1}} transition={{duration:2,repeat:visible&&!paused?Infinity:0,ease:'easeInOut'}}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
   </motion.div>
  </motion.div>
  <button type="button" className="gallery-effect-toggle" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'Retomar efeito':'Pausar efeito'}</button>
 </>,root);
}
