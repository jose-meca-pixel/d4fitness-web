/* Atlas anónimo de visitas por país (ESTIMADO por zona horaria del navegador). Leaflet + GeoJSON locales, sin teselas ni CDN.
   k-anonimato: países con menos de 3 visitas en la vista se agrupan en «Otros» y no se iluminan. */
(function(){const K=1;/* panel privado: se ilumina todo país con ≥1 visita; poner 3 para agrupar en «Otros» */let GEO=null,PROV=null,provCapa=null,map=null,capa=null,datos={},vis=[];
const flag=c=>/^[A-Z]{2}$/.test(c)?String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0))):'';
const nom=c=>{try{return new Intl.DisplayNames(['es'],{type:'region'}).of(c)}catch(e){return c}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function geo(){if(!GEO)GEO=await (await fetch('vendor/paises_110m.geojson?v=1')).json();return GEO}
async function provincias(){if(!map)return;const ver=map.getZoom()>=4.5;document.querySelector('.aprov')&&(document.querySelector('.aprov').hidden=!ver);if(ver&&!provCapa){if(!PROV)PROV=await (await fetch('vendor/provincias_es.geojson?v=1')).json();provCapa=L.geoJSON(PROV,{style:{color:'#8f93c9',weight:.8,opacity:.9,fillColor:'#fff',fillOpacity:0},onEachFeature:(f,l)=>l.bindTooltip(esc(f.properties.name),{sticky:true,className:'tprov'})})}if(provCapa){if(ver&&!map.hasLayer(provCapa))provCapa.addTo(map);if(!ver&&map.hasLayer(provCapa))map.removeLayer(provCapa)}}
function espana(){map&&map.fitBounds([[35.2,-9.6],[43.9,4.5]])}
function mundo(){map&&map.fitBounds([[-56,-168],[78,190]])}
function zoom(){if(!map||!capa)return;const b=L.latLngBounds([]);capa.eachLayer(l=>{if(datos[l.feature.properties.iso])b.extend(l.getBounds())});b.isValid()?map.fitBounds(b.pad(.35),{maxZoom:5}):mundo()}
async function render(el,V,o){
 const cnt={};let sin=0;V.forEach(v=>{if(v.pais)cnt[v.pais]=(cnt[v.pais]||0)+1;else sin++});
 datos={};let otros=0;Object.entries(cnt).forEach(([c,n])=>n>=K?datos[c]=n:otros+=n);
 vis=Object.entries(datos).sort((a,b)=>b[1]-a[1]);const conPais=V.length-sin;
 const mesTxt=o.dias+' días'+(o.filtro==='app'?' · app':o.filtro==='web'?' · web':'');
 if(!el.querySelector('.atlas')){el.innerHTML=`<div class="atlas"><div class="atop"><b class="atit">ATLAS DE VISITAS</b><span class="vivo"><i></i>EN DIRECTO</span><span class="aper"></span></div>
 <div class="amap"><div id="amapa"></div><div class="acont"><b></b><span></span><em class="asin" hidden>Aún sin datos de país</em></div><div class="aprov" hidden>Límites de provincias (solo referencia; las visitas se cuentan por país)</div><div class="abtn"><button data-m="mundo" class="on">MUNDO</button><button data-m="zoom">ZOOM</button><button data-m="es">ESPAÑA</button></div><ol class="arank"></ol></div>
 <p class="aaviso">País <b>estimado por la zona horaria del navegador</b> (no por IP): puede fallar con VPN o zonas compartidas. El dato de visitas es <b>solo por país</b>: al ampliar se ven los límites de provincias de España como referencia, sin datos de visitas. Panel privado del administrador: se ilumina <b>todo país con al menos 1 visita</b>; más dorado = más visitas. Las visitas anteriores al 31/10 no tienen país y se cuentan aparte.</p>
 <h2>Top países</h2><table class="tbar atabla"></table></div>`;
  el.querySelectorAll('.abtn button').forEach(b=>b.onclick=()=>{el.querySelectorAll('.abtn button').forEach(x=>x.classList.toggle('on',x===b));b.dataset.m==='zoom'?zoom():b.dataset.m==='es'?espana():mundo()});
  map=L.map('amapa',{attributionControl:false,zoomControl:false,maxBounds:[[-85,-200],[85,220]],worldCopyJump:false,minZoom:0,maxZoom:7,zoomSnap:.25});
  L.control.zoom({position:'topright'}).addTo(map);map.on('zoomend',provincias);map.attributionControl=L.control.attribution({prefix:false,position:'topright'}).addAttribution('Natural Earth').addTo(map);
  capa=L.geoJSON(await geo(),{style:()=>({})}).addTo(map);new ResizeObserver(()=>map.invalidateSize()).observe(el.querySelector('#amapa'));mundo()}
 const mx=Math.max(1,...vis.map(x=>x[1]));
 capa.setStyle(f=>{const n=datos[f.properties.iso];return n?{color:'#ffd34d',weight:1,fillColor:'#f5b301',fillOpacity:.35+.65*Math.sqrt(n/mx),className:'pon'}:{color:'#454a7d',weight:.7,fillColor:'#23274a',fillOpacity:1,className:''}});
 capa.eachLayer(l=>{const c=l.feature.properties.iso,n=datos[c];l.unbindTooltip();if(n)l.bindTooltip(`${flag(c)} ${esc(nom(c))}: ${n}`,{sticky:true})});
 el.querySelector('.asin').hidden=conPais>0;
 el.querySelector('.aper').textContent=mesTxt.toUpperCase();
 el.querySelector('.acont b').textContent=conPais;el.querySelector('.acont span').textContent=`visitas · ${vis.length} ${vis.length===1?'país':'países'}${otros?' + otros':''}${sin?` · ${sin} sin país (antes del 31/10)`:''}`;
 el.querySelector('.arank').innerHTML=vis.slice(0,5).map(([c,n],i)=>`<li><em>#${i+1}</em> <span class="fl">${flag(c)}</span> ${esc(nom(c))}</li>`).join('');
 const filas=vis.map(([c,n])=>[`${flag(c)} ${nom(c)}`,n]);if(otros)filas.push(['Otros (<'+K+' visitas por país)',otros]);if(sin)filas.push(['Sin país (antes del 31/10)',sin]);
 const t=Math.max(1,...filas.map(x=>x[1]));
 el.querySelector('.atabla').innerHTML=filas.map(([k,n])=>`<tr><td class="k">${esc(k)}</td><td class="b"><div class="bar oro" style="width:${Math.max(3,n/t*100)}%"></div></td><td class="n">${n}</td></tr>`).join('')||'<tr><td>Sin datos de país todavía</td></tr>';
 if(el.querySelector('.abtn .on').dataset.m==='zoom')zoom()}
window.D4Atlas={render}})();
