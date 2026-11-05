import fs from 'fs'; import vm from 'vm';
const html=fs.readFileSync('index.html','utf8');
const js=html.split('<script id="app">')[1].split('</script>')[0];
const cut=js.slice(js.indexOf('/*DATA-START*/'),js.indexOf('/*LOGIC-END*/'));
const ctx={URLSearchParams,TextEncoder,console,Date,String,Object,Array,Math,Number};vm.createContext(ctx);
vm.runInContext(cut+';globalThis.X={EVENTS,parseOcc,slot,icsText,icsName,googleUrl,outlookUrl,upcoming:null,place,occsOf};',ctx);
const {EVENTS,parseOcc,icsText,icsName,googleUrl,outlookUrl,slot,place,occsOf}=ctx.X;
fs.rmSync('ics',{recursive:true,force:true});fs.mkdirSync('ics');
const WD=['dim','lun','mar','mer','jeu','ven','sam'];const now=new Date('2026-11-04T15:00:00Z');let n=0;const names=new Set();const table=[];
for(const e of EVENTS){
  const occs=occsOf(e);
  for(const o of occs){const f=icsName(e,o);if(names.has(f))throw Error('dup '+f);names.add(f);fs.writeFileSync(f,icsText(e,o,now));n++}
  table.push((e.r?e.r.join('→'):e.o.slice(0,3).map(s=>WD[new Date(s.slice(0,10)+'T00:00Z').getUTCDay()]+' '+s).join(', ')+(e.o.length>3?` …(${e.o.length})`:''))+'  '+e.n);
}
fs.writeFileSync('check.txt',table.join('\n'));
fs.writeFileSync('files.json',JSON.stringify(Object.fromEntries([...names].map(f=>[f,{from:'/home/claude/sortir/'+f,contentType:'text/calendar'}]))));
console.log('events',EVENTS.length,'public',EVENTS.filter(e=>!e.m).length,'ics',n);
const e=EVENTS.find(e=>e.n.startsWith('Camille'));const o=parseOcc(e.o[0]);
console.log(icsText(e,o,now));console.log(googleUrl(e,o));console.log(outlookUrl(e,o,'https://outlook.live.com'));
const c=EVENTS.find(e=>e.n==='Noël au jardin');console.log(icsText(c,{},now).split('\r\n').filter(l=>/DT(START|END)/.test(l)));console.log(googleUrl(c,{}).match(/dates=[^&]+/)[0]);
// Application installable : page, fichiers d'agenda, manifeste, icônes et service worker.
import crypto from 'crypto';
fs.rmSync('site',{recursive:true,force:true});fs.mkdirSync('site/icons',{recursive:true});fs.cpSync('ics','site/ics',{recursive:true});
const pg=html.replace('const HOSTED=false;','const HOSTED=true;').replace('<meta name="claude:viewport-fit-sides" content="cover">\n','');
const cutAt=pg.indexOf('<div class="wrap">');
const head=pg.slice(0,cutAt),bodyHtml=pg.slice(cutAt);
fs.writeFileSync('site/index.html',`<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Les événements à Saint-Cloud, jour par jour : date, lieu, tarif et ajout à votre agenda.">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3f6f8">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#101a23">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="32x32" href="icons/icon-32.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Sortir">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
${head}</head><body>${bodyHtml}</body></html>
`);
fs.writeFileSync('site/manifest.webmanifest',JSON.stringify({name:'Sortir à Saint-Cloud',short_name:'Sortir',description:'Les événements à Saint-Cloud, jour par jour.',lang:'fr',start_url:'./',scope:'./',display:'standalone',background_color:'#f3f6f8',theme_color:'#1d4fa8',icons:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}]},null,1));
const ver=crypto.createHash('sha1').update(fs.readFileSync('site/index.html')).digest('hex').slice(0,10);
fs.writeFileSync('site/sw.js',`const CACHE="sortir-${ver}";
const SHELL=["./","manifest.webmanifest","icons/icon-32.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith(".ics"))return;
  // La page vient du réseau quand c'est possible, pour afficher la liste la plus récente.
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put("./",copy));return r}).catch(()=>caches.match("./")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
`);
fs.writeFileSync('site/_headers','/sw.js\n  Cache-Control: no-cache\n/index.html\n  Cache-Control: no-cache\n/ics/*\n  Content-Type: text/calendar; charset=utf-8\n');
fs.writeFileSync('site/LISEZMOI.txt',`Sortir à Saint-Cloud : application web installable

Mise en ligne simple : déposez ce dossier sur https://app.netlify.com/drop
Autre hébergement : copiez tout le dossier sur un site en HTTPS.
L'installation sur téléphone exige une adresse en HTTPS.
`);
