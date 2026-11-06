import './styles.css';
import mapUrl from './mapa.webp';

declare global{interface Window{route:()=>void;_bp:any}}
export {};
const BASES=['/api','https://fortnite-api.com/v2'],L='language=pt-BR';
const $=(s:string,r:ParentNode=document):any=>r.querySelector(s),bad=v=>v==null||/^\s*(null|undefined|n\/a)?\s*$/i.test(String(v)),esc=s=>String(bad(s)?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cache={};
async function api(p,force){if(!force&&cache[p])return cache[p];let last;
for(const b of BASES){try{const r=await fetch(b+p+(p.includes('?')?'&':'?')+L,{signal:AbortSignal.timeout(60000),cache:force?'no-store':'default'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(!j.data)throw new Error('Resposta inválida');return cache[p]=j.data}catch(e){last=e}}
throw last}
const err=(el,m)=>el.innerHTML=`<div class="msg err">Dados temporariamente indisponíveis. ${esc(m||'')} <button class="btn" onclick="route()">Tentar de novo</button></div>`;
const load=el=>el.innerHTML='<div class="sk"></div>'.repeat(4);
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let favs=ls('fh_fav',[]);
const RAR={legendary:'Lendária',epic:'Épica',rare:'Rara',uncommon:'Incomum',common:'Comum',marvel:'Marvel',dc:'DC',icon:'Icon Series',starwars:'Star Wars',gaminglegends:'Gaming Legends',shadow:'Sombra',slurp:'Slurp',lava:'Lava',frozen:'Gelo',dark:'Dark'};
const rk=r=>RAR[r]||r;
const img=i=>i?.images?.icon||i?.images?.smallIcon||i?.images?.featured||'';
function card(i){const r=i.rarity?.value||'common',f=favs.includes(i.id);
return `<div class="card r-${esc(r)}" data-id="${esc(i.id)}" tabindex="0"><img loading="lazy" referrerpolicy="no-referrer" src="${esc(img(i))}" alt="${esc(i.name)}"><button class="fav ${f?'on':''}" data-f="${esc(i.id)}" aria-label="Favorito">${f?'★':'☆'}</button><div class="cap">${esc(i.name)}<small>${esc(i.rarity?.displayValue||rk(r))}</small></div></div>`}

/* contador: a loja renova às 00:00 UTC */
let NEXT=null;
function tick(){const n=new Date();if(NEXT&&n>=NEXT&&!rolling){NEXT=null;rollover()}
const t=NEXT&&NEXT>n?NEXT:new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate()+1)),s=Math.max(0,Math.floor((t-n)/1e3)),p=x=>String(x).padStart(2,'0');
document.querySelectorAll('.timer').forEach(e=>e.textContent=`${p(s/3600|0)}:${p(s/60%60|0)}:${p(s%60)}`);
if(s===0&&!rolling)rollover()}
setInterval(tick,1000);tick();

/* modal */
function open(i){const big=i.images?.featured||img(i);$('#mimg').src=big;$('#mimg').alt=i.name;
$('.mb').dataset.r=i.rarity?.value||'common';
const v=(i.variants||[]).flatMap(x=>x.options.map(o=>o.name)).join(', ');
const rows=[['Raridade',i.rarity?.displayValue],['Tipo',i.type?.displayValue],['Preço hoje',i.price?i.price+' V-Bucks':''],['Identificador',String(i.id).startsWith('n')&&!i.type?'':i.id],['Lançamento',i.added?new Date(i.added).toLocaleDateString('pt-PT'):''],['Introdução',i.introduction?.text],['Já esteve na loja',i.shopHistory?.length?i.shopHistory.length+' vez(es)':''],['Estilos',v]].filter(r=>!bad(r[1]));
const fv=!i.type?'':`<button class="btn" data-f="${esc(i.id)}" style="margin-top:14px">${favs.includes(i.id)?'★':'☆'} Favorito</button>`;
$('#mtx').innerHTML=`<h3>${esc(i.name)}</h3><p>${esc(i.description||'')}</p><dl>${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>${fv}`;
$('#md').classList.add('on');$('#mx').focus()}
$('#mx').onclick=()=>$('#md').classList.remove('on');
$('#md').onclick=e=>{if(e.target.id==='md')e.target.classList.remove('on')};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#md').classList.remove('on')});
const byId={},shopMap={},newsMap={};let nk=0;
document.addEventListener('click',e=>{
const f=e.target.closest('[data-f]');
if(f){e.stopPropagation();const id=f.dataset.f;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];sv('fh_fav',favs);f.classList.toggle('on');f.textContent=f.classList.contains('on')?'★':'☆';if(location.hash==='#perfil')renderProfile();return}
const c=e.target.closest('.card');if(!c)return;const o=c.dataset.shop?shopMap[c.dataset.shop]:c.dataset.news?newsMap[c.dataset.news]:byId[c.dataset.id];if(o)open(o)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.classList?.contains('card'))e.target.click()});
const reg=a=>a.forEach(i=>byId[i.id]=i);

/* secções */
const R={};
R.home=async()=>{
const n=$('#hnews'),s=$('#hshop');load(n);load(s);
const f=['Em 2019, o evento The End fez o Battle Royale original terminar num buraco negro.','O Fortnite foi lançado em 2017 como modo Salvar o Mundo; o Battle Royale chegou meses depois.','O concerto do Travis Scott em 2020 reuniu mais de 12 milhões de jogadores em simultâneo.'];
$('#hfact').innerHTML=`<div class="fact"><h3>Sabias que…</h3><p>${f[Math.random()*f.length|0]}</p></div>`;
try{const m=await newsData();n.innerHTML=m.slice(0,6).map(newsCard).join('')||'<div class="msg">Sem novidades de momento.</div>'}catch(e){err(n,e.message)}
try{const d=await getShop();const it=shopItems(d).slice(0,12);s.innerHTML=it.map(x=>shopCard(x)).join('')}catch(e){err(s,e.message)}};
const newsCard=m=>{const a=[m.image,m.tileImage].filter(Boolean);
const k='n'+(nk++);newsMap[k]={id:k,name:m.title,description:m.body,images:{icon:a[0],featured:a[0]},rarity:{value:'common',displayValue:'Notícia'}};
return `<div class="card news" data-news="${k}" tabindex="0"><img referrerpolicy="no-referrer" src="${esc(a[0]||'')}" data-alt="${esc(a[1]||'')}" alt="" onerror="if(this.dataset.alt){this.src=this.dataset.alt;this.dataset.alt=''}else{this.style.display='none'}"><div class="cap">${esc(m.title)}<small>${esc(m.body)}</small></div></div>`};
async function newsData(){const d=await api('/news/br');let m=d.motds||[];
if(!m.length){try{const a=await api('/news');m=a.br?.motds||a.motds||[]}catch{}}
if(!m.length&&d.image)m=[{title:'Novidades',body:'',image:d.image}];
return m}
async function getShop(force){try{return await api('/shop',force)}catch(e){try{return await api('/shop/br',force)}catch{throw e}}}
function shopItems(d){const list=d.entries||[...(d.featured?.entries||[]),...(d.daily?.entries||[])];
return list.map((e,n)=>{try{const its=e.brItems||e.items||[],b=its[0],o=b||e.tracks?.[0]||e.instruments?.[0]||e.cars?.[0]||e.legoKits?.[0]||{};
const im=e.newDisplayAsset?.materialInstances?.[0]?.images?.Background||e.newDisplayAsset?.renderImages?.[0]?.image||(b&&img(b))||o.albumArt||o.images?.large||o.images?.small||'';
if(its.length)reg(its);
const key='s'+(e.offerId||b?.id||n),name=[e.bundle?.name,o.name,o.title].find(x=>!bad(x))||'Artigo',rar=b?.rarity?.value||'common';
shopMap[key]={id:b?.id||key,name,description:b?.description||(e.bundle?'Pacote com '+its.length+' artigos.':(o.artist?o.artist:'')),images:{icon:im,featured:b?.images?.featured||im},rarity:b?.rarity||{value:rar,displayValue:rk(rar)},type:b?.type,price:e.finalPrice,added:b?.added,introduction:b?.introduction,variants:b?.variants,shopHistory:b?.shopHistory};
return{key,name,img:im,price:e.finalPrice,cat:e.layout?.name||'Outros',rar}}catch(x){return null}}).filter(Boolean)}
const shopCard=x=>`<div class="card r-${esc(x.rar)}" data-shop="${esc(x.key)}" tabindex="0"><img loading="lazy" referrerpolicy="no-referrer" src="${esc(x.img)}" alt="${esc(x.name)}"><div class="cap">${esc(x.name)}<small>${x.price} V-Bucks</small></div></div>`;
/* loja em tempo real: atualiza a cada 30 s, ao voltar ao separador e na hora da renovação */
let SHOP_HASH=null,shopDone=false,rolling=false;
function setLive(ok,changed){const l=$('#live');if(!l)return;l.classList.toggle('off',!ok);l.classList.toggle('flash',!!changed);
$('#lt').textContent=!ok?'Sem ligação, a tentar de novo…':(changed?'A loja foi atualizada! ':'Ao vivo · ')+'atualizado às '+new Date().toLocaleTimeString('pt-PT');
if(changed)setTimeout(()=>l.classList.remove('flash'),6000)}
async function renderShop(silent){const el=$('#shop');if(!silent||!shopDone)load(el);
try{const d=await getShop(true);const changed=!!(SHOP_HASH&&d.hash&&d.hash!==SHOP_HASH);SHOP_HASH=d.hash||SHOP_HASH;
const outs=(d.entries||[]).map(e=>Date.parse(e.outDate)).filter(t=>t>Date.now());NEXT=outs.length?new Date(Math.min(...outs)):null;
const it=shopItems(d);
if(!it.length){el.innerHTML='<div class="msg">A loja de hoje não está disponível.</div>';return setLive(true)}
if(!silent||changed||!shopDone){const g={};it.forEach(x=>(g[x.cat]??=[]).push(x));
el.innerHTML=Object.entries(g).map(([k,v])=>`<h2 style="font-size:26px">${esc(k)}</h2><div class="grid">${v.map(shopCard).join('')}</div>`).join('');shopDone=true}
setLive(true,changed)}catch(e){if(!silent||!shopDone){err(el,e.message)}setLive(false)}}
async function rollover(){if(rolling)return;rolling=true;const old=SHOP_HASH;
for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,i?20000:3000));await renderShop(true);if(SHOP_HASH!==old)break}
rolling=false}
R.loja=()=>renderShop(false);
setInterval(()=>{if(!document.hidden&&location.hash==='#loja'&&!rolling)renderShop(true)},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&location.hash==='#loja')renderShop(true)});

let CB=null;const CBC={};
async function cosm(t){const k=t||'all';if(!CBC[k]){const d=await api(t?`/cosmetics/br/search/all?type=${t}`:'/cosmetics/br');if(!Array.isArray(d))throw new Error('Resposta inesperada');CBC[k]=d.filter(i=>!bad(i.name)&&img(i));reg(CBC[k])}return CBC[k]}
const typeOf=i=>{const t=i.type?.value;return['outfit','pickaxe','backpack','emote','glider','wrap','loadingscreen','music','contrail'].includes(t)?t:'other'};
let shown=60,list=[];
async function loadC(){const el=$('#cl');load(el);$('#cc').style.display='none';$('#more').style.display='none';
try{const t=$('#ft').value;CB=await cosm(t==='other'?'':t);
const rs=[...new Set(CB.map(i=>i.rarity?.value))].filter(Boolean);
$('#fr').innerHTML='<option value="">Todas as raridades</option>'+rs.map(r=>`<option value="${esc(r)}">${esc(rk(r))}</option>`).join('');
filt()}catch(e){err(el,e.name==='TimeoutError'?'O pedido demorou demasiado.':e.message)}}
R.cosmeticos=loadC;
function filt(){shown=60;const q=$('#q').value.toLowerCase(),t=$('#ft').value,r=$('#fr').value,s=$('#fs').value,fo=$('#ff').checked;
list=CB.filter(i=>(!q||i.name.toLowerCase().includes(q)||i.id.toLowerCase().includes(q))&&(!t||typeOf(i)===t)&&(!r||i.rarity?.value===r)&&(!fo||favs.includes(i.id)));
const o=['common','uncommon','rare','epic','legendary'];
if(s==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'pt'));else if(s==='rar')list.sort((a,b)=>o.indexOf(b.rarity?.value)-o.indexOf(a.rarity?.value));else list.sort((a,b)=>new Date(b.added||0)-new Date(a.added||0));
draw()}
function draw(){$('#cl').innerHTML=list.slice(0,shown).map(card).join('');const c=$('#cc');c.style.display='block';c.textContent=list.length?`${list.length} artigos encontrados`:'Nenhum artigo corresponde aos filtros.';$('#more').style.display=shown<list.length?'':'none'}
$('#more').onclick=()=>{shown+=60;draw()};
['#q','#fr','#fs','#ff'].forEach(s=>$(s).addEventListener('input',()=>CB&&filt()));
$('#ft').addEventListener('input',loadC);

const num=v=>{const n=parseInt(v);return isNaN(n)?-1:n};
R.passes=async()=>{const el=$('#bp');load(el);$('#bpd').innerHTML='';
try{const all=await cosm('outfit');
const tag=i=>/battle\s*-?pass/i.test((i.gameplayTags||[]).join(' ')+' '+(i.set?.value||'')+' '+(i.set?.text||''));
let src=all.filter(i=>i.introduction&&tag(i)),aprox=false;
if(src.length<5){aprox=true;src=all.filter(i=>i.introduction&&!i.shopHistory?.length&&['rare','epic','legendary'].includes(i.rarity?.value))}
const g=new Map();
src.forEach(i=>{const k=`${num(i.introduction.chapter)}-${num(i.introduction.season)}`;if(!g.has(k))g.set(k,{ch:i.introduction.chapter,se:i.introduction.season,items:[]});g.get(k).items.push(i)});
const ks=[...g.entries()].sort((a,b)=>num(b[1].ch)-num(a[1].ch)||num(b[1].se)-num(a[1].se));
if(!ks.length)return el.innerHTML='<div class="msg">Dados de Battle Passes indisponíveis de momento.</div>';
window._bp=Object.fromEntries(ks);
const nm=v=>`Capítulo ${v.ch} · Temporada ${v.se}`;
el.innerHTML=(aprox?'<div class="msg" style="grid-column:1/-1">Lista aproximada: skins de cada temporada que nunca estiveram na loja (passes e eventos).</div>':'')+ks.map(([k,v])=>`<div class="pass" data-k="${k}" tabindex="0"><h3>${esc(nm(v))}</h3><p style="color:var(--mut)">${v.items.length} skins</p><div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:10px">${v.items.slice(0,3).map(i=>`<img src="${esc(img(i))}" alt="${esc(i.name)}" style="width:100%;border-radius:8px;background:#0003" loading="lazy" referrerpolicy="no-referrer">`).join('')}</div></div>`).join('')}catch(e){err(el,e.name==='TimeoutError'?'O pedido demorou demasiado.':e.message)}};
function openPass(p){const v=window._bp[p.dataset.k];if(!v)return;$('#bpd').innerHTML=`<h2>Capítulo ${esc(v.ch)} · Temporada ${esc(v.se)}</h2><div class="grid">${v.items.map(card).join('')}</div>`;$('#bpd').scrollIntoView({behavior:'smooth'})}
$('#bp').onclick=e=>{const p=e.target.closest('.pass');if(p)openPass(p)};
$('#bp').onkeydown=e=>{if(e.key==='Enter'){const p=e.target.closest('.pass');if(p)openPass(p)}};
R.noticias=async()=>{const el=$('#nw');load(el);try{const m=await newsData();el.innerHTML=m.map(newsCard).join('')||'<div class="msg">Sem notícias de momento.</div>'}catch(e){err(el,e.message)}};

R.curiosidades=()=>{const f=[['Fim do mundo antigo','O evento The End (2019) apagou o mapa original e abriu caminho ao Capítulo 2.'],['Origem do Fortnite','O jogo estreou em 2017 como Salvar o Mundo, contra zombies; o Battle Royale surgiu depois, em setembro desse ano.'],['Evento ao vivo gigante','O concerto Astronomical, com Travis Scott, em 2020, foi visto por mais de 12 milhões de jogadores ao mesmo tempo.'],['Armas removidas','O Canhão de Mão e o Rifle de Caçador já saíram e voltaram em temporadas diferentes. O arsenal muda a cada temporada.'],['Skins raras','Skins de Battle Passes antigos, como a Renegade Raider, já não podem ser compradas e são das mais cobiçadas.'],['Capítulos','O jogo organiza-se em capítulos, cada um com um mapa novo, divididos em várias temporadas.']];
$('#cur').innerHTML=f.map(x=>`<div class="fact"><h3>${x[0]}</h3><p>${x[1]}</p></div>`).join('')};
const META={season:'Capítulo 7 · Temporada 4 (Override)',date:'5 de novembro de 2026',g:[
['Combate de perto',[
['Pump Shotgun','S','Melhor caçadeira para combates com construção. Foi melhorada na atualização v42.10, com mais dano e equipamento mais rápido.',['Lendária: 205 de dano na cabeça (antes do buff)','Equipamento lento']],
['8-Bit Shotgun','A','Alternativa à Pump: abate em dois tiros com construção ou três em Zero Build. Teve o dano reduzido na v42.10.',['100+ de dano ao corpo (Incomum ou superior)']],
['Bonerattler SMG','Novo','SMG nova do Fortnitemares. Ao mirar, revela os inimigos através das paredes.',['Revela alvos através de paredes']]]],
['Média distância',[
['Enhanced Assault Rifle','S','Muito mais precisa que a versão antiga e rivaliza em DPS com a pistola mítica, mesmo depois da redução de dano e de cabeça de 3 de setembro.',['Nerf a 3 de setembro']],
['Heavy Assault Rifle','Regressou','Voltou no Fortnitemares. A versão Lendária dá dano elevado por tiro e pune bem a média distância.',['Lendária: 44 de dano por tiro']]]],
['Longa distância',[]],
['Mobilidade',[
['Overdrive Grenades','A','Recomendadas para o espaço de utilidade, pela mobilidade que dão.',[]],
['Sonic Power Sneakers','C','Consideradas fracas pelas tier lists desta temporada.',[]]]],
['Cura',[
['Chug Jug e Shield Potion','Seguro','Escolhas seguras quando não sabes o que levar.',[]]]],
['Topo da tier list',[
["Midas' Masterpiece",'S','Pistola mítica nova. Só há uma por partida, num local aleatório. Exige muita pontaria.',['125 ao corpo, 313 na cabeça','7 balas, sem recarga']],
['Pump Shotgun','S','Continua no topo da tier list, depois do buff da v42.10.',[]]]],
['Armas removidas',[
['Drum Gun','Removida','Saiu do conjunto de armas na atualização v42.30, em outubro de 2026.',[]]]]]};
const META_SRC=[['Dexerto','https://www.dexerto.com/fortnite/best-weapons-fortnite-ultimate-gun-tier-list-1535100/'],['Game Rant','https://gamerant.com/fortnite-override-chapter-7-season-4-best-weapons-items-meta-tier-list/'],['Hotspawn','https://www.hotspawn.com/fortnite/guide/best-weapons-in-fortnite'],['MetaMMO','https://metammo.com/fortnite-guide/meta'],['DigitalTQ','https://www.digitaltq.com/fortnite-chapter-7-season-4-loot-table'],['AllThings.how','https://allthings.how/fortnite-override-tier-list/']];
R.meta=()=>{$('#metaw').innerHTML=`<div class="msg" style="margin-bottom:18px"><b>${esc(META.season)}</b> · dados recolhidos a ${esc(META.date)} em guias e tier lists de terceiros. Podem mudar com a próxima atualização. Não existem estatísticas oficiais de utilização.</div>`+
META.g.map(([t,it])=>`<h2 style="font-size:26px">${esc(t)}</h2><div class="grid wide">${it.length?it.map(([n,tier,w,st])=>`<div class="fact"><h3>${esc(n)} <span class="tier t-${esc(tier)}">${esc(tier)}</span></h3><p>${esc(w)}</p>${st.length?'<ul>'+st.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>':''}</div>`).join(''):'<div class="msg">Dados indisponíveis de momento: não encontrei fontes fiáveis para sniper nesta temporada.</div>'}</div>`).join('')+
`<p class="msg" style="margin-top:22px">Fontes: ${META_SRC.map(([n,u])=>`<a href="${u}" target="_blank" rel="noopener" style="color:var(--yel)">${n}</a>`).join(' · ')}</p>`};

/* mapa */
let M={z:1,x:0,y:0,w:0,done:0};
const mp=()=>$('#mi').style.transform=`translate(${M.x}px,${M.y}px) scale(${M.z})`;
function zoom(f,cx,cy){const n=Math.min(6,Math.max(.2,M.z*f)),k=n/M.z;M.x=cx-(cx-M.x)*k;M.y=cy-(cy-M.y)*k;M.z=n;mp()}
const MAP_IMG=mapUrl,MW=928,MH=751;
const MAP_POIS=[['Rubber Resort',297,139],['The Chest',268,226],['Loot Lagoon',435,223],["Fortune's Fort",558,205],['Lantern Landing',342,320],['Arlong Park',198,360],['Cursed Cavern',497,374],['The S.S. Rocky',611,411],['Loguetown',390,501],['Windmill Village',264,531],['Busy Bay',608,556],['Plunder Port',478,624]];
function fit(){const b=$('#map').getBoundingClientRect();M.z=Math.min(b.width/MW,b.height/MH);M.x=(b.width-MW*M.z)/2;M.y=(b.height-MH*M.z)/2;mp()}
R.mapa=()=>{if(M.done)return fit();
$('#mi').innerHTML=`<img id="mimg2" src="${MAP_IMG}" alt="Mapa do Fortnite" style="width:${MW}px;max-width:none">`+MAP_POIS.map((p,i)=>`<span class="poi hit" data-i="${i}" style="left:${p[1]}px;top:${p[2]}px">${esc(p[0])}</span>`).join('');
M.pois=MAP_POIS.map(p=>({name:p[0]}));M.done=1;fit()};
const mapEl=$('#map');let drag=null;
mapEl.onpointerdown=e=>{if(e.target.closest('.zb'))return;drag={x:e.clientX-M.x,y:e.clientY-M.y};mapEl.setPointerCapture(e.pointerId)};
mapEl.onpointermove=e=>{if(!drag)return;M.x=e.clientX-drag.x;M.y=e.clientY-drag.y;mp()};
mapEl.onpointerup=()=>drag=null;
mapEl.onwheel=e=>{e.preventDefault();const b=mapEl.getBoundingClientRect();zoom(e.deltaY<0?1.15:.87,e.clientX-b.left,e.clientY-b.top)};
mapEl.addEventListener('click',e=>{const z=e.target.closest('[data-z]');if(z){const b=mapEl.getBoundingClientRect();zoom(+z.dataset.z,b.width/2,b.height/2);return}
const p=e.target.closest('.poi');if(p){const o=M.pois[p.dataset.i];$('#pi').innerHTML=`<b>${esc(o.name)}</b><br>Ponto de interesse do mapa atual. Usa a roda do rato ou os botões + e − para ampliar.`}});

/* perfil e pesquisa */
function renderProfile(){const n=ls('fh_name','');$('#pn').value=n;$('#pm').textContent=n?`Olá, ${n}! Tens ${favs.length} favoritos.`:'Define um nome para personalizares o teu perfil.';
const f=favs.map(id=>byId[id]).filter(Boolean);$('#pf').innerHTML=f.length?f.map(card).join(''):'<div class="msg">Ainda sem favoritos. Carrega na estrela de qualquer cosmético.</div>';
if(favs.length&&!f.length)cosm().then(renderProfile).catch(()=>{})}
R.perfil=renderProfile;
$('#ps').onclick=()=>{sv('fh_name',$('#pn').value.trim());renderProfile()};
let gt;$('#gs').oninput=e=>{clearTimeout(gt);gt=setTimeout(async()=>{const q=e.target.value.trim().toLowerCase();if(q.length<2)return;location.hash='#pesquisa';const el=$('#gr');load(el);try{await cosm();const r=CB.filter(i=>i.name.toLowerCase().includes(q)).slice(0,60);el.innerHTML=r.length?r.map(card).join(''):'<div class="msg">Sem resultados.</div>'}catch(x){err(el,x.message)}},400)};

function route(){const h=(location.hash||'#home').slice(1);const id=document.getElementById(h)?h:'home';
document.querySelectorAll('.sec').forEach(s=>s.classList.toggle('on',s.id===id));
document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));
scrollTo(0,0);R[id]&&R[id]()}

/* entrada escalonada dos cartões */
new MutationObserver(m=>m.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType!==1)return;const cs=n.matches?.('.card')?[n]:[...n.querySelectorAll?.('.card')||[]];cs.slice(0,24).forEach((c,i)=>c.style.animationDelay=i*45+'ms')}))).observe(document.querySelector('main'),{childList:true,subtree:true});
addEventListener('hashchange',route);route();
setInterval(()=>{for(const k of ['/shop','/news/br'])delete cache[k]},600000);
window.route=route;

document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$('#gs').focus()}});
