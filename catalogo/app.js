'use strict';
/* D4FITNESSHOP · catálogo organizado según la taxonomía de colecciones de la web oficial (ver TAXONOMIA en catalogo_cliente.js) */
const CFG=window.CONFIG||{};const WA=CFG.WHATSAPP_PEDIDOS||'[A RELLENAR]';const WAURL=t=>'https://wa.me/'+WA.replace(/\D/g,'')+'?text='+encodeURIComponent(t);
/* ORIGEN (utm_source / ?ref=): solo el nombre de la red (p. ej. la red social de origen). Se guarda en sessionStorage (se borra al cerrar la pestaña). Sin datos personales. */
const ORIGEN=(function(){let o='';try{const q=new URLSearchParams(location.search);o=(q.get('utm_source')||q.get('ref')||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,30);
 const c=(q.get('utm_campaign')||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,40);if(o){sessionStorage.setItem('d4origen',o);sessionStorage.setItem('d4campana',c)}else{o=sessionStorage.getItem('d4origen')||''}}catch(e){}return o})();
const CAMPANA=(()=>{try{return sessionStorage.getItem('d4campana')||''}catch(e){return ''}})();
function origenTxt(){return ORIGEN?'\n(Vengo desde: '+ORIGEN+(CAMPANA?' · '+CAMPANA:'')+')':''}
/* REGISTRO DE VISITAS anónimo. DESACTIVADO por defecto (CONFIG.VISITAS_TIPO vacío). Ver VISITAS_LEEME.md.
   Solo envía: fecha (día), página, evento y origen utm. Sin cookies, sin IP guardada por nosotros, sin huella, sin datos personales. */
function visita(evento){evento=evento||'visita';const dia=new Date().toISOString().slice(0,10);const pag=location.pathname.split('/').pop()||'index.html';
 const dato={dia,pagina:pag,evento,origen:ORIGEN||'directo'};
 if(CFG.VISITAS_DEBUG){try{const k='d4visitas_debug';const r=JSON.parse(localStorage.getItem(k)||'{}');const kk=[dia,pag,evento,dato.origen].join('|');r[kk]=(r[kk]||0)+1;localStorage.setItem(k,JSON.stringify(r));console.info('[visitas debug]',kk,r[kk])}catch(e){}}
 const T=CFG.VISITAS_TIPO,U=CFG.VISITAS_ENDPOINT;if(!T||!U||CFG.MODO_BORRADOR&&!CFG.VISITAS_EN_BORRADOR)return;
 try{if(T==='endpoint'){const h={'Content-Type':'application/json'};if(CFG.VISITAS_CLAVE_PUBLICA){h.apikey=CFG.VISITAS_CLAVE_PUBLICA;h.Authorization='Bearer '+CFG.VISITAS_CLAVE_PUBLICA}
   fetch(U,{method:'POST',headers:h,body:JSON.stringify({p_dia:dia,p_pagina:pag,p_evento:evento,p_origen:dato.origen}),keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{})}
  else if(T==='goatcounter'){const u=U.replace(/\/$/,'')+'/count?p='+encodeURIComponent('/'+pag+(evento!=='visita'?'#'+evento:''))+'&r='+encodeURIComponent(dato.origen)+'&rnd='+Math.random().toString(36).slice(2);navigator.sendBeacon?navigator.sendBeacon(u):fetch(u,{mode:'no-cors',credentials:'omit'})}}catch(e){}}
window.visitasDebug=()=>{try{return JSON.parse(localStorage.getItem('d4visitas_debug')||'{}')}catch(e){return{}}};
const CAT=window.CATALOGO||{};const P=CAT.productos||[];const TX=CAT.taxonomia||{grupos:[]};const GAL=CAT.galerias||{};
const byId=Object.fromEntries(P.map(p=>[p.id,p]));const G={};P.forEach(p=>{(G[p.producto]=G[p.producto]||[]).push(p)});
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const NOM={};TX.grupos.forEach(g=>g.items.forEach(i=>NOM[i.id]=i.nombre));
const grupoDe=id=>TX.grupos.find(g=>g.items.some(i=>i.id===id));
let cesta={};try{cesta=JSON.parse(localStorage.getItem('d4cesta')||'{}')}catch(e){cesta={}}
const S={cat:'',sel:{},q:'',orden:'destacados',marca:''};
/* MARCAS: pestañas generadas desde el campo p.marca; añadir una marca = poner marca en sus productos */
const MARCAS=[...new Set(P.map(p=>p.marca).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
try{const qm=new URLSearchParams(location.search).get('marca');if(qm&&MARCAS.includes(qm))S.marca=qm}catch(e){}
/* v11 PRECIOS: importes en céntimos enteros (pvp_cent, IVA incluido) leídos de catalogo_cliente.js; el total se calcula aquí, nunca se escribe a mano */
const eur=c=>(c/100).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2,useGrouping:true})+' €';

function cuentaCesta(){const lineas=[];let total=0,pend=0,uds=0;Object.entries(cesta).forEach(([id,q])=>{const p=byId[id];if(!p)return;q=parseInt(q)||0;uds+=q;
 const pu=Number.isInteger(p.pvp_cent)&&p.pvp_cent>0?p.pvp_cent:null;const sub=pu===null?null:pu*q;if(sub===null)pend++;else total+=sub;lineas.push({id,p,q,pu,sub})});
 return{lineas,total,pend,uds,envioGratis:true}}
function txtEnvio(c){return 'Envío gratis'}
function precioTxt(p){return Number.isInteger(p.pvp_cent)&&p.pvp_cent>0?eur(p.pvp_cent):'Precio por definir'}

const FACETAS=[{k:'linea',t:'Línea'},{k:'carac',t:'Características'},{k:'fase',t:'Fase'},{k:'sabor',t:'Sabor'},{k:'formato',t:'Formato'}];
function valores(p,k){if(k==='sabor')return p.sabor?[p.sabor]:[];if(k==='formato')return p.formato?[p.formato]:[];const g=TX.grupos.find(x=>x.id===k);return g?(p.colecciones||[]).filter(c=>g.items.some(i=>i.id===c)):[]}
function pasa(p,salvo){if(S.marca&&p.marca!==S.marca)return false;if(salvo!=='__cat'&&S.cat&&!(p.colecciones||[]).includes(S.cat))return false;
 if(S.q){const t=(p.nombre+' '+(p.marca||'')+' '+p.sku+' '+(p.sabor||'')+' '+(p.formato||'')+' '+(p.colecciones||[]).map(c=>NOM[c]).join(' ')).toLowerCase();if(!S.q.toLowerCase().split(/\s+/).every(w=>t.includes(w)))return false}
 for(const f of FACETAS){if(f.k===salvo)continue;const s=S.sel[f.k];if(s&&s.size&&!valores(p,f.k).some(v=>s.has(v)))return false}
 return true}
function lbl(k,v){return k==='sabor'||k==='formato'?v:(NOM[v]||v)}
function pintaFacetas(){const box=$('#facetas');box.innerHTML='';
 // Categoría (lista tipo menú lateral)
 const dc=document.createElement('details');dc.open=true;dc.innerHTML='<summary>Categoría</summary><ul class="lcat"></ul>';const ul=dc.querySelector('ul');
 const cats=TX.grupos.find(g=>g.id==='categoria').items;const base=P.filter(p=>pasa(p,'__cat'));
 [{id:'',nombre:'Todos los productos'}].concat(cats).forEach(c=>{const n=new Set(base.filter(p=>!c.id||(p.colecciones||[]).includes(c.id)).map(p=>p.producto)).size;
  const li=document.createElement('li');const a=document.createElement('a');a.href='#c='+c.id;a.textContent=c.nombre+' ('+n+')';if(S.cat===c.id)a.className='on';li.appendChild(a);ul.appendChild(li)});box.appendChild(dc);
 FACETAS.forEach(f=>{const cnt={};P.filter(p=>pasa(p,f.k)).forEach(p=>valores(p,f.k).forEach(v=>{(cnt[v]=cnt[v]||new Set()).add(p.producto)}));
  const sel=S.sel[f.k]||new Set();const vals=Object.keys(cnt).concat([...sel].filter(v=>!cnt[v]));if(!vals.length)return;
  const g=TX.grupos.find(x=>x.id===f.k);const ord=g?g.items.map(i=>i.id):null;vals.sort((a,b)=>ord?ord.indexOf(a)-ord.indexOf(b):a.localeCompare(b,'es'));
  const d=document.createElement('details');d.open=sel.size>0||['linea','carac','fase'].includes(f.k);d.innerHTML='<summary></summary><div class="ops"></div>';d.querySelector('summary').textContent=f.t;
  const ops=d.querySelector('.ops');if(vals.length>8)ops.classList.add('scroll');
  vals.forEach(v=>{const l=document.createElement('label');const i=document.createElement('input');i.type='checkbox';i.checked=sel.has(v);i.dataset.k=f.k;i.value=v;
   i.onchange=()=>{const s=S.sel[f.k]=S.sel[f.k]||new Set();i.checked?s.add(v):s.delete(v);render()};l.appendChild(i);l.append(' '+lbl(f.k,v)+' ('+(cnt[v]?cnt[v].size:0)+')');ops.appendChild(l)});box.appendChild(d)});
 }
function chips(){const c=$('#chips');c.innerHTML='';const add=(t,fn)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=t+' ✕';b.setAttribute('aria-label','Quitar filtro '+t);b.onclick=fn;c.appendChild(b)};
 if(S.cat)add(NOM[S.cat],()=>{location.hash='#c='});if(S.q)add('«'+S.q+'»',()=>{S.q='';$('#q').value='';render()});
 FACETAS.forEach(f=>(S.sel[f.k]||new Set()).forEach(v=>add(lbl(f.k,v),()=>{S.sel[f.k].delete(v);render()})));
 if(c.children.length){const b=document.createElement('button');b.type='button';b.className='limpiar';b.textContent='Limpiar todo';b.onclick=limpiar;c.appendChild(b)}}
function limpiar(){S.sel={};S.q='';$('#q').value='';if(S.cat)location.hash='#c=';else render()}
const PASILLOS=['crown-packs','geles','barritas','isotonico','creatina','recuperacion','proteinas-y-aminoacidos','potenciadores-de-rendimiento','salud','accesorios','hidratacion-y-energia'];
function pasilloDe(g){const cols=new Set(g.flatMap(p=>p.colecciones||[]));for(const id of PASILLOS)if(cols.has(id))return id;return 'otros'}
function makeCard(g){const p0=g[0],todos=G[p0.producto];const d=document.createElement('article');d.className='card';d.dataset.producto=p0.producto;
 d.innerHTML='<button type="button" class="abrir"><img loading="lazy" alt="" width="300" height="300"><span class="cat"></span><h3></h3></button><p class="pvp"></p><small class="est"></small><button type="button" class="ver">Ver opciones</button>';
 const im=d.querySelector('img');im.src=p0.thumb||p0.img||'';im.alt=p0.alt||p0.nombre;if(!p0.thumb&&!p0.img)im.replaceWith(Object.assign(document.createElement('div'),{className:'sinfoto',textContent:'Imagen no disponible'}));
 d.querySelector('.cat').textContent=NOM[pasilloDe(g)]||'';
 d.querySelector('h3').textContent=nombreBase(todos);
 d.querySelector('.est').textContent=g.length+(g.length===1?' opción':' opciones');
 const cs=g.map(x=>x.pvp_cent).filter(c=>Number.isInteger(c)&&c>0);const e=d.querySelector('.pvp');
 if(cs.length){const mn=Math.min(...cs);e.append((new Set(cs).size>1||cs.length<g.length?'Desde ':'')+eur(mn));const s=document.createElement('small');s.textContent=' IVA incluido';e.appendChild(s)}
 else{e.textContent='Precio por definir';e.classList.add('pdef')}
 const ab=()=>ficha(p0.producto,g[0].id);d.querySelector('.abrir').onclick=ab;d.querySelector('.ver').onclick=ab;return d}
function verFase(id){S.sel.fase=new Set([id]);render()}
function render(){const L=Object.values(G).map(g=>g.filter(p=>pasa(p))).filter(g=>g.length);const o=S.orden;
 const tienda=!S.cat&&!S.q&&o==='destacados'&&!FACETAS.some(f=>S.sel[f.k]&&S.sel[f.k].size);
 document.body.classList.toggle('vista-tienda',tienda);
 document.querySelectorAll('.portada').forEach(n=>n.remove());
 if(!tienda)L.sort((a,b)=>{if(o==='nombre')return a[0].nombre.localeCompare(b[0].nombre,'es');if(o==='nombre-d')return b[0].nombre.localeCompare(a[0].nombre,'es');return nombreBase(a).localeCompare(nombreBase(b),'es')});
 const faseSolo=S.sel.fase&&S.sel.fase.size===1&&!S.q&&!S.cat&&!FACETAS.some(f=>f.k!=='fase'&&S.sel[f.k]&&S.sel[f.k].size)?[...S.sel.fase][0]:'';
 $('#titulo').textContent=S.cat?(NOM[S.cat]||'Tienda'):(tienda?'La tienda':(faseSolo?(NOM[faseSolo]||'Resultados'):'Resultados'));
 $('#migas').innerHTML='<a href="#c=">Tienda</a>'+(S.cat?' › <span></span>':'');if(S.cat)$('#migas span').textContent=NOM[S.cat];
 $('#cuenta').textContent=L.length+(L.length===1?' producto':' productos')+' · '+L.reduce((s,g)=>s+g.length,0)+' variantes';
 const grid=$('#grid');grid.innerHTML='';grid.classList.toggle('por-pasillos',tienda);
 if(!L.length){grid.innerHTML='<p class="vacio">No hay productos con estos filtros. <button type="button" onclick="limpiar()">Limpiar filtros</button></p>';pintaFacetas();chips();return}
 if(!tienda){L.forEach(g=>grid.appendChild(makeCard(g)));pintaFacetas();chips();return}
 const buckets=new Map();L.forEach(g=>{const id=pasilloDe(g);if(!buckets.has(id))buckets.set(id,[]);buckets.get(id).push(g)});
 const top=document.createElement('div');top.className='portada';
 const promesa=document.createElement('p');promesa.className='promesa';promesa.textContent='IVA incluido · Envío gratis · Pedido por WhatsApp · Pago al confirmar';
 const nav=document.createElement('nav');nav.className='baldosas';nav.setAttribute('aria-label','Pasillos');
 PASILLOS.forEach(id=>{const items=buckets.get(id);if(!items||!items.length)return;const a=document.createElement('a');a.className='baldosa';a.href='#c='+id;
  const strong=document.createElement('strong');strong.textContent=NOM[id]||id;const small=document.createElement('small');small.textContent=items.length+(items.length===1?' producto':' productos');a.append(strong,small);nav.appendChild(a)});
 const mom=document.createElement('div');mom.className='momentos';const lab=document.createElement('p');lab.id='momentos-tit';lab.textContent='Por momento';mom.appendChild(lab);
 ((TX.grupos.find(g=>g.id==='fase')||{}).items||[]).forEach(f=>{const b=document.createElement('button');b.type='button';b.textContent=f.nombre;b.setAttribute('aria-describedby','momentos-tit');b.onclick=()=>verFase(f.id);mom.appendChild(b)});
 top.append(promesa,nav,mom);$('#migas').before(top);
 PASILLOS.concat('otros').forEach(id=>{const items=buckets.get(id);if(!items||!items.length)return;items.sort((a,b)=>nombreBase(a).localeCompare(nombreBase(b),'es'));
  const sec=document.createElement('section');sec.className='pasillo';sec.id='pasillo-'+id;
  const head=document.createElement('div');head.className='pasillo-h';
  const h=document.createElement('h3');h.textContent=NOM[id]||'Otros';
  const a=document.createElement('a');a.href='#c='+id;a.textContent='Ver pasillo';
  head.append(h,a);const box=document.createElement('div');box.className='pasillo-grid';
  items.slice(0,4).forEach(g=>box.appendChild(makeCard(g)));sec.append(head,box);grid.appendChild(sec)});
 pintaFacetas();chips()}
function nombreBase(g){if(g.length===1)return g[0].nombre;const w=g.map(p=>p.nombre.split(' '));let i=0;while(w.every(x=>x[i]&&x[i]===w[0][i]))i++;const b=w[0].slice(0,i).join(' ').replace(/[\s+\-–·]+$/,'');return b.length>=4?b:g[0].nombre}
function ficha(prod,id){const g=G[prod];let p=byId[id]||g[0];const m=$('#ficha');m.hidden=false;document.body.classList.add('modal-abierto');
 const sab=[...new Set(g.map(x=>x.sabor||''))],fmt=[...new Set(g.map(x=>x.formato||''))];
 const pinta=()=>{$('#f-nombre').textContent=p.nombre;$('#f-sku').textContent='Ref. '+p.sku;
  $('#f-cat').textContent=(p.colecciones||[]).map(c=>NOM[c]).filter(Boolean).join(' · ');
  const fotos=(GAL[prod]&&GAL[prod].length?GAL[prod]:[]).slice();if(p.img&&!fotos.includes(p.img))fotos.unshift(p.img);
  const big=$('#f-img');if(fotos.length){big.hidden=false;$('#f-sinfoto').hidden=true;big.src=p.img||fotos[0];big.alt=p.alt||p.nombre}else{big.hidden=true;$('#f-sinfoto').hidden=false}
  const mini=$('#f-mini');mini.innerHTML='';fotos.slice(0,12).forEach(f=>{const b=document.createElement('button');b.type='button';const i=document.createElement('img');i.src=f.replace('img/full/','img/thumb/');i.onerror=()=>{i.onerror=null;i.src=f};i.alt='';b.appendChild(i);b.setAttribute('aria-label','Ver imagen');b.onclick=()=>{big.src=f};mini.appendChild(b)});
  const ss=$('#f-sabor'),sf=$('#f-formato');ss.innerHTML='';sf.innerHTML='';sab.forEach(v=>ss.add(new Option(v||'Único',v)));fmt.forEach(v=>{const o=new Option(v||'Único',v);o.disabled=!g.some(x=>(x.formato||'')===v&&(x.sabor||'')===(p.sabor||''));sf.add(o)});
  ss.value=p.sabor||'';sf.value=p.formato||'';$('#f-lsabor').hidden=sab.length<2;$('#f-lformato').hidden=fmt.length<2;
  $('#f-consulta').href=WA.includes('A RELLENAR')?'#':WAURL('Hola, quiero información sobre '+p.nombre+' '+(p.formato||'')+' [Ref. '+p.sku+']'+origenTxt());
  {const e=$('#f-pvp');e.innerHTML='';if(Number.isInteger(p.pvp_cent)&&p.pvp_cent>0){e.append(eur(p.pvp_cent));const s=document.createElement('small');s.textContent=' IVA incluido';e.appendChild(s);e.classList.remove('pdef')}else{e.textContent='Precio por definir (te lo confirmamos por WhatsApp)';e.classList.add('pdef')}}
  infoAli(p);
  $('#f-desc').textContent=p.descripcion||'Descripción pendiente.'};
 $('#f-sabor').onchange=e=>{p=g.find(x=>(x.sabor||'')===e.target.value&&(x.formato||'')===(p.formato||''))||g.find(x=>(x.sabor||'')===e.target.value);pinta()};
 $('#f-formato').onchange=e=>{p=g.find(x=>(x.formato||'')===e.target.value&&(x.sabor||'')===(p.sabor||''))||g.find(x=>(x.formato||'')===e.target.value);pinta()};
 $('#f-add').onclick=()=>{const n=Math.max(1,Math.min(99,parseInt($('#f-cant').value)||1));cesta[p.id]=(cesta[p.id]||0)+n;guardar();$('#f-ok').textContent='Añadido a la cesta: '+n+' × '+p.nombre};
 $('#f-ok').textContent='';$('#f-cant').value=1;pinta();$('#f-cerrar').focus()}
function infoAli(p){const b=$('#f-ali');b.innerHTML='';const i=p.info;const add=(t,v)=>{const d=document.createElement('p');const s=document.createElement('b');s.textContent=t+': ';d.append(s,v);b.appendChild(d)};
 if(!i||i.estado==='NO_APLICA'){if(i)add('Información alimentaria','no aplica (producto no alimentario)');return}
 add('Estado de la información',{VERIFICADO:'revisada con la ficha del fabricante',PARCIAL:'parcial, pendiente de cotejar con la etiqueta',PENDIENTE:'pendiente'}[i.estado]||'pendiente');
 if(i.ingredientes)add('Ingredientes (según ficha del fabricante)',i.ingredientes.replace(/^Ingredientes:\s*/i,''));
 add('Alérgenos',i.alergenos&&i.alergenos.length?i.alergenos.join('; '):'no determinados: consulta la etiqueta del producto (que no figure aquí no significa que no los tenga)');
 if(i.trazas)add('Trazas',Array.isArray(i.trazas)?i.trazas.join('; '):String(i.trazas));
 if(i.fuente){const d=document.createElement('p');d.className='est';d.textContent='Fuente: ficha web del fabricante, consultada el '+(i.fecha||'')+'. La etiqueta del envase prevalece.';b.appendChild(d)}}
function cierraFicha(){$('#ficha').hidden=true;document.body.classList.remove('modal-abierto')}
function guardar(){Object.keys(cesta).forEach(k=>{if(!byId[k]||!(cesta[k]>=1))delete cesta[k]});try{localStorage.setItem('d4cesta',JSON.stringify(cesta))}catch(e){}pintaCesta()}
function pintaCesta(){const L=$('#lineas');L.innerHTML='';let n=0;Object.entries(cesta).forEach(([id,q])=>{const p=byId[id];n+=q;const r=document.createElement('div');r.className='linea';
 r.innerHTML='<span></span><input type="number" min="0" max="99" aria-label="Cantidad"><b class="sub"></b><button type="button" class="papelera" aria-label="Quitar producto" title="Quitar de la cesta"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg></button>';r.querySelector('span').textContent=p.nombre+' · '+(p.formato||'')+' '+(p.sabor||'')+' · '+precioTxt(p)+(p.pvp_cent?' /ud':'');r.querySelector('.sub').textContent=p.pvp_cent?eur(p.pvp_cent*q):'Por definir';
 const i=r.querySelector('input');i.value=q;i.onchange=()=>{cesta[id]=parseInt(i.value)||0;guardar()};r.querySelector('.papelera').onclick=()=>{delete cesta[id];guardar()};L.appendChild(r)});
 $('#ncesta').textContent=n;const C=cuentaCesta();const T=$('#totales');T.innerHTML='';if(!n){T.textContent='La cesta está vacía.';return}
 const t=document.createElement('p');t.className='total';t.textContent='TOTAL (IVA incluido): '+eur(C.total)+(C.pend?' + líneas pendientes de confirmar por WhatsApp':'');
 const e=document.createElement('p');e.className='nota';e.textContent='Envío gratis. El pedido se confirma por WhatsApp.';
 const D=dtoApp(C);if(D){t.textContent='Total: '+eur(C.total);const d=document.createElement('p');d.className='dto';d.textContent='Descuento usuario D4 ('+D.pctTxt+' %): -'+eur(D.cent);
  const f=document.createElement('p');f.className='total';f.style.fontWeight='700';const b=document.createElement('strong');b.textContent='Total con descuento (IVA incluido): '+eur(C.total-D.cent);f.appendChild(b);
  T.append(t,d,f,e)}else T.append(t,e)}
/* Descuento app (15 %): solo si el servidor confirmó el token (panel_hook.js -> window.__d4appOK/__d4appPct). El importe definitivo lo calcula el servidor en crear_pedido. */
function dtoApp(C){const pct=Number(window.__d4appPct);if(!window.__d4appOK||!(pct>0)||!C.total)return null;return{pct,pctTxt:pct.toLocaleString('es-ES'),cent:Math.round(C.total*pct/100)}}
/* srv: {descuento,total} en euros devueltos por el servidor (crear_pedido); null = sin descuento; undefined = usar la verificación del token */
function resumen(srv){const C=cuentaCesta();let D=null;if(srv&&srv.pct!==undefined)D=srv;else if(srv===undefined){const x=dtoApp(C);if(x)D={pct:x.pct,descuento:x.cent/100,total:(C.total-x.cent)/100}}
 const e2=n=>eur(Math.round(Number(n)*100));const P2=C.pend?' + líneas pendientes de confirmar por WhatsApp':'';
 const tot=D?`\nTotal: ${eur(C.total)}\nDescuento usuario D4 (${Number(D.pct).toLocaleString('es-ES')} %): -${e2(D.descuento)}\nTotal con descuento (IVA incluido): ${e2(D.total)}${P2}`:`\nTOTAL (IVA incluido): ${eur(C.total)}${P2}`;
 return 'Pedido D4FITNESSHOP (catálogo)\n'+C.lineas.map(l=>{const p=l.p;return `- ${l.q} x ${p.nombre} ${p.formato||''} ${p.sabor||''} [Ref. ${p.sku}] · ${l.pu===null?'Precio por definir':eur(l.pu)+'/ud = '+eur(l.sub)}`}).join('\n')+
 `${tot}\n${txtEnvio(C)}`+
 [['Nombre',$('#nombre').value],['Teléfono',$('#tel').value],['Dirección',$('#dir').value]].filter(x=>x[1]&&x[1].trim()).map(x=>'\n'+x[0]+': '+x[1].trim()).join('')+`\nPago por Bizum o transferencia (te paso los datos por WhatsApp).\n¿Me confirmas el pedido?`+origenTxt()}
$('#fpedido').addEventListener('submit',e=>{e.preventDefault();const via=e.submitter&&e.submitter.dataset.via;const err=[];
 if(!Object.keys(cesta).length)err.push('La cesta está vacía.');
 if(!$('#tel').checkValidity())err.push('Teléfono no válido.');if(!$('#acepto').checked)err.push('Debes aceptar la política de privacidad.');
 $('#err').textContent=err.join(' ');if(err.length)return;const txt=resumen();window.__ultimoPedido=txt;
 if(WA.includes('A RELLENAR')){$('#err').textContent='Pedido no disponible todavía: falta configurar el teléfono de WhatsApp de pedidos (config.js). Tu cesta se conserva.';return}
 if(CFG.guardarPedidosEnPanel&&window.D4Panel){D4Panel.enviar(cuentaCesta(),txt,WAURL,resumen);visita('pedido_wa');return}
 const url=WAURL(txt);window.__ultimoEnlace=url;visita('pedido_wa');if(!window.__TEST)window.open(url,'_blank','noopener')});
$('#vercesta').onclick=()=>{$('#cesta').hidden=false;$('#cesta h2').setAttribute('tabindex','-1');$('#cesta h2').focus()};$('#cerrar').onclick=()=>{$('#cesta').hidden=true};$('#vaciar').onclick=()=>{cesta={};guardar()};
$('#f-cerrar').onclick=cierraFicha;$('#ficha').addEventListener('click',e=>{if(e.target.id==='ficha')cierraFicha()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){cierraFicha();$('#cesta').hidden=true;document.body.classList.remove('filtros-abiertos')}});
$('#q').addEventListener('input',e=>{S.q=e.target.value.trim();render()});$('#orden').addEventListener('change',e=>{S.orden=e.target.value;render()});
$('#btnfiltros').onclick=()=>document.body.classList.toggle('filtros-abiertos');$('#cerrarfiltros').onclick=()=>document.body.classList.remove('filtros-abiertos');$('#limpiartodo').onclick=limpiar;
// menú superior (megamenú) a partir de la taxonomía
(function(){const nav=$('#menu');TX.grupos.filter(g=>g.menu).forEach(g=>{const li=document.createElement('li');li.innerHTML='<details><summary></summary><ul></ul></details>';li.querySelector('summary').textContent=g.nombre;
 const ul=li.querySelector('ul');if(g.id==='categoria'){const a=document.createElement('a');a.href='#c=';a.textContent='Todos los productos';ul.appendChild(Object.assign(document.createElement('li'),{}).appendChild(a).parentNode)}
 g.items.forEach(i=>{const a=document.createElement('a');a.href='#c='+i.id;a.textContent=i.nombre;const l=document.createElement('li');l.appendChild(a);ul.appendChild(l)});nav.appendChild(li)});
 nav.addEventListener('click',e=>{if(e.target.tagName==='A')$$('#menu details').forEach(d=>d.open=false)});
 $$('#menu details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)$$('#menu details').forEach(o=>{if(o!==d)o.open=false})}))})();
function deHash(){const m=location.hash.match(/^#c=([\w-]*)/);S.cat=m&&NOM[m[1]]?m[1]:'';document.body.classList.remove('filtros-abiertos');render();const pm=location.hash.match(/^#p=([\w-]+)/);if(pm){const p=byId[pm[1]];if(p)ficha(p.producto,p.id)}}
window.addEventListener('hashchange',deHash);deHash();pintaCesta();

visita('visita');
(function(){const b=$('#wafloat');if(b){if(WA.includes('A RELLENAR'))b.hidden=true;else b.href=WAURL('Hola, vengo del catálogo D4FITNESSHOP y tengo una consulta.'+origenTxt());b.addEventListener('click',()=>visita('click_wa'))}
 const r=$('#rapida');if(r){[{id:'',nombre:'Todo'}].concat(TX.grupos[0].items).forEach(c=>{const a=document.createElement('a');a.href='#c='+c.id;a.textContent=c.nombre;r.appendChild(a)});
  const marca=()=>$$('#rapida a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#c='+S.cat));window.addEventListener('hashchange',marca);marca()}})();


/* Pestañas de marcas (role=tablist, flechas/Inicio/Fin) */
(function(){const main=document.getElementById('contenido');if(!main||!MARCAS.length)return;
 const bar=document.createElement('div');bar.className='marcas';bar.setAttribute('role','tablist');bar.setAttribute('aria-label','Marcas');
 const ops=[{v:'',t:'Todas las marcas'}].concat(MARCAS.map(m=>({v:m,t:m})));
 const btns=ops.map(o=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.marca=o.v;
  const n=new Set(P.filter(p=>!o.v||p.marca===o.v).map(p=>p.producto)).size;b.textContent=o.t+' ('+n+')';b.addEventListener('click',()=>sel(o.v,true));bar.appendChild(b);return b});
 function pinta(){btns.forEach(b=>{const on=b.dataset.marca===S.marca;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;b.classList.toggle('on',on)})}
 function sel(v,foco){S.marca=v;pinta();try{const u=new URL(location.href);v?u.searchParams.set('marca',v):u.searchParams.delete('marca');history.replaceState(null,'',u)}catch(e){}render();if(foco){const b=btns.find(x=>x.dataset.marca===v);b&&b.focus()}}
 bar.addEventListener('keydown',e=>{const i=btns.findIndex(b=>b.dataset.marca===S.marca);let j=null;if(e.key==='ArrowRight')j=(i+1)%btns.length;else if(e.key==='ArrowLeft')j=(i-1+btns.length)%btns.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=btns.length-1;if(j!==null){e.preventDefault();sel(btns[j].dataset.marca,true)}});
 const h=document.createElement('h2');h.className='marcas-t';h.textContent='Marcas';main.insertBefore(h,main.firstChild);main.insertBefore(bar,h.nextSibling);pinta()})();
