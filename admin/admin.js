/* Panel admin D4FITNESSHOP. Solo usa la clave publicable; los permisos los impone RLS en Supabase (tabla admins). */
/* Detecta el retorno desde enlace de recuperación/invitación ANTES de que supabase-js consuma el hash. */
const HASH0=new URLSearchParams(location.hash.slice(1)),QS0=new URLSearchParams(location.search);let RECUPERANDO=['recovery','invite'].includes(HASH0.get('type')||QS0.get('type'));
const C=window.CONFIG||{};const sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY);
const $=s=>document.querySelector(s);const ESTADOS={pendiente_pago:'Pendiente de pago',pagado:'Pagado',tramitado_proveedor:'Tramitado con proveedor',enviado:'Enviado',entregado:'Entregado',cancelado:'Cancelado'};
const eur=n=>n==null?'—':Number(n).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let PEDIDOS=[],actual=null;
/* MODO DEMO solo en localhost con ?demo=1: datos agregados de EJEMPLO para probar el gráfico. No funciona en d4fitness.com ni escribe nada. */
const DEMO=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('demo');
for(const [k,v] of Object.entries(ESTADOS)){$('#festado').add(new Option(v,k));$('#destado').add(new Option(v,k))}
async function esAdmin(){const {data:{user}}=await sb.auth.getUser();if(!user)return false;const {data}=await sb.from('admins').select('user_id').eq('user_id',user.id).maybeSingle();return !!data}
function vista(v){['login','recuperar','nueva','app'].forEach(x=>$('#'+x).hidden=x!==v);$('#salir').hidden=v!=='app'}
async function arranca(){if(DEMO){vista('app');$('main').insertAdjacentHTML('afterbegin','<div class="demo">MODO DEMO LOCAL · DATOS DE EJEMPLO</div>');document.querySelector('.tabs button[data-t="visitas"]').click();return}if(RECUPERANDO){vista('nueva');return}$('#recuperar').hidden=true;$('#nueva').hidden=true;if(await esAdmin()){$('#login').hidden=true;$('#app').hidden=false;$('#salir').hidden=false;cargaPedidos()}else{const {data:{user}}=await sb.auth.getUser();if(user){await sb.auth.signOut();$('#lmsg').textContent='Esta cuenta no tiene permisos de administrador.'}$('#login').hidden=false;$('#app').hidden=true;$('#salir').hidden=true}}
$('#flogin').onsubmit=async e=>{e.preventDefault();$('#lmsg').textContent='';const {error}=await sb.auth.signInWithPassword({email:$('#email').value.trim(),password:$('#pass').value});$('#pass').value='';if(error){$('#lmsg').textContent='No se pudo entrar: '+error.message;return}RECUPERANDO=false;arranca()};
$('#olvido').onclick=e=>{e.preventDefault();$('#remail').value=$('#email').value.trim();$('#rmsg').textContent='';vista('recuperar')};
$('#rvolver').onclick=()=>{$('#lmsg').textContent='';vista('login')};
$('#frec').onsubmit=async e=>{e.preventDefault();const b=e.submitter;if(b)b.disabled=true;
 await sb.auth.resetPasswordForEmail($('#remail').value.trim(),{redirectTo:'https://d4fitness.com/admin/'}).catch(()=>{});
 /* Mensaje neutro: no revela si el correo existe ni si hubo error. */
 $('#rmsg').textContent='Si el correo es de un administrador, recibirás un enlace en unos minutos. Revisa también la carpeta de spam.';if(b)setTimeout(()=>b.disabled=false,30000)};
sb.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY'){RECUPERANDO=true;vista('nueva')}});
$('#fnueva').onsubmit=async e=>{e.preventDefault();const p1=$('#np1'),p2=$('#np2');$('#nmsg').className='msg';
 if(p1.value.length<12){$('#nmsg').textContent='La contraseña debe tener al menos 12 caracteres.';return}
 if(p1.value!==p2.value){$('#nmsg').textContent='Las contraseñas no coinciden.';return}
 const {data:{session}}=await sb.auth.getSession();if(!session){$('#nmsg').textContent='El enlace ha caducado o ya se usó. Pide uno nuevo.';return}
 const {error}=await sb.auth.updateUser({password:p1.value});p1.value='';p2.value='';
 if(error){$('#nmsg').textContent='No se pudo guardar: '+error.message;return}
 RECUPERANDO=false;history.replaceState(null,'',location.pathname);$('#lmsg').textContent='';
 if(await esAdmin()){arranca()}else{await sb.auth.signOut();vista('login');$('#lmsg').textContent='Contraseña guardada, pero esta cuenta no tiene permisos de administrador.'}};
$('#salir').onclick=async()=>{await sb.auth.signOut();location.reload()};
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));['pedidos','visitas','descuentos'].forEach(t=>$('#t-'+t).hidden=t!==b.dataset.t);if(b.dataset.t==='visitas')cargaVisitas();if(b.dataset.t==='descuentos')cargaDtos()});
async function cargaPedidos(){const {data,error}=await sb.from('pedidos').select('*').order('created_at',{ascending:false}).limit(1000);if(error){$('#lista').textContent='Error: '+error.message;return}PEDIDOS=data;pinta()}
function filtrados(){const e=$('#festado').value,q=$('#fbuscar').value.trim().toLowerCase();return PEDIDOS.filter(p=>(!e||p.estado===e)&&(!q||[p.referencia,p.cliente_nombre,p.cliente_telefono,p.cliente_email,p.poblacion,p.seguimiento].join(' ').toLowerCase().includes(q)))}
function pinta(){const L=filtrados();$('#lista').innerHTML=L.length?'':'<p>No hay pedidos.</p>';L.forEach(p=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<b>${esc(p.referencia)}</b> <span class="est ${esc(p.estado)}">${esc(ESTADOS[p.estado])}</span><br>${esc(p.cliente_nombre)} · ${esc(p.cliente_telefono)}<br>${new Date(p.created_at).toLocaleString('es-ES',{timeZone:'Europe/Madrid'})} · <b>${eur(p.total)}</b>${p.codigo_descuento?' (código '+esc(p.codigo_descuento)+')':''}`;d.onclick=()=>abre(p);$('#lista').appendChild(d)})}
$('#festado').onchange=pinta;$('#fbuscar').oninput=pinta;$('#recargar').onclick=cargaPedidos;
function abre(p){actual=p;$('#dmsg').textContent='';const ls=(p.lineas||[]).map(l=>`<li>${esc(l.cantidad)} × ${esc(l.producto)} ${esc(l.variante||'')} · ${l.precio_unit==null?'precio por confirmar':eur(l.precio_unit)}</li>`).join('');
 $('#detinfo').innerHTML=`<h2>${esc(p.referencia)}</h2><p>${esc(p.cliente_nombre)} · ${esc(p.cliente_telefono)} ${p.cliente_email?'· '+esc(p.cliente_email):''}<br>${esc([p.direccion_envio,p.cp,p.poblacion,p.provincia].filter(Boolean).join(', '))}<br>Pago: ${esc(p.metodo_pago||'—')}</p><ul>${ls}</ul><p>Subtotal: ${eur(p.total_bruto)} · Descuento: ${eur(p.descuento)} ${p.codigo_descuento?'('+esc(p.codigo_descuento)+')':''}<br><b>Total: ${eur(p.total)}</b></p>`;
 $('#destado').value=p.estado;$('#dseg').value=p.seguimiento||'';$('#dnotas').value=p.notas_internas||'';$('#det').showModal()}
$('#dguardar').onclick=async e=>{e.preventDefault();const {error}=await sb.from('pedidos').update({estado:$('#destado').value,seguimiento:$('#dseg').value.trim()||null,notas_internas:$('#dnotas').value.trim()||null}).eq('id',actual.id);if(error){$('#dmsg').textContent='Error: '+error.message;return}$('#det').close();cargaPedidos()};
$('#csv').onclick=()=>{const cols=['referencia','created_at','estado','cliente_nombre','cliente_telefono','cliente_email','direccion_envio','cp','poblacion','provincia','metodo_pago','total_bruto','codigo_descuento','descuento','total','seguimiento','notas_internas'];
 const q=v=>{let s=v==null?'':String(v);if(/^[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
 const rows=filtrados().map(p=>cols.map(c=>q(p[c])).concat(q((p.lineas||[]).map(l=>l.cantidad+'x '+l.producto+' '+(l.variante||'')).join(' | '))).join(';'));
 const blob=new Blob(['\ufeff'+cols.concat('lineas').join(';')+'\n'+rows.join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pedidos_d4fitnesshop_'+new Date().toISOString().slice(0,10)+'.csv';a.click()};
async function cargaVisitas(){const dias=+$('#vdias').value;const desde=new Date(Date.now()-dias*864e5).toISOString().slice(0,10);
 let {data,error}=DEMO?{data:demoVisitas(dias)}:await sb.from('visitas').select('dia,ruta,referrer,dispositivo,origen,pais').gte('dia',desde).limit(50000);
 if(error&&/pais/.test(error.message))({data,error}=await sb.from('visitas').select('dia,ruta,referrer,dispositivo,origen').gte('dia',desde).limit(50000));
 if(error&&/origen/.test(error.message))({data,error}=await sb.from('visitas').select('dia,ruta,referrer,dispositivo').gte('dia',desde).limit(50000));
 if(error){$('#vres').textContent='Error: '+error.message;return}
 const todos=data.map(v=>({...v,origen:v.origen||'web'})),o=$('#vorig').value,V=o?todos.filter(v=>v.origen===o):todos;
 const cuenta=(k,arr)=>{const m={};(arr||V).forEach(v=>{const x=v[k]||'(directo)';m[x]=(m[x]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])};
 const tabla=(t,arr,max)=>{const top=arr.slice(0,max||15),mx=Math.max(1,...top.map(x=>x[1]));return `<h2>${t}</h2><table class="tbar">${top.map(([k,n])=>`<tr><td class="k">${esc(k)}</td><td class="b"><div class="bar" style="width:${Math.max(3,n/mx*100)}%"></div></td><td class="n">${n}</td></tr>`).join('')||'<tr><td>Sin datos</td></tr>'}</table>`};
 if(window.D4Atlas)D4Atlas.render($('#vatlas'),V,{dias,filtro:o});const nApp=todos.filter(v=>v.origen==='app').length,nWeb=todos.length-nApp;
 const pd=cuenta('dia').sort((a,b)=>a[0]<b[0]?1:-1),hoy=new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Madrid'});
 $('#vres').innerHTML=`<div class="kpi"><div><b>${V.length}</b>visitas${o?' ('+(o==='app'?'app':'web')+')':''}</div><div><b>${(V.length/dias).toFixed(1)}</b>por día</div><div><b>${V.filter(v=>v.dia===hoy).length}</b>hoy</div><div><b>${nWeb}</b>web</div><div><b>${nApp}</b>desde la app${todos.length?' · '+Math.round(nApp/todos.length*100)+' %':''}</div></div>`+tabla('Visitas por día',pd,dias)+tabla('Páginas más vistas',cuenta('ruta'))+tabla('Origen',cuenta('referrer'))+tabla('Dispositivo',cuenta('dispositivo'))}
$('#vorig').onchange=cargaVisitas;
setInterval(()=>{if(!document.hidden&&!$('#t-visitas').hidden&&!$('#app').hidden)cargaVisitas()},60000);
function demoVisitas(dias){const r=[],rutas=['/catalogo/','/','/cuenta/'],dis=['movil','escritorio','movil','tablet'];r.push({dia:new Date().toISOString().slice(0,10),ruta:'/catalogo/',referrer:null,dispositivo:'movil',origen:'web',pais:'JP'},{dia:new Date().toISOString().slice(0,10),ruta:'/',referrer:null,dispositivo:'movil',origen:'web',pais:'IT'});for(let d=0;d<Math.min(dias,30);d++){const dia=new Date(Date.now()-d*864e5).toISOString().slice(0,10);for(let i=0;i<(d*7%5)+2;i++)r.push({dia,ruta:rutas[i%3],referrer:i%2?'instagram.com':null,dispositivo:dis[i%4],origen:i%3===0?'app':'web',pais:['ES','ES','ES','MX','ES','AR','CO','ES','FR','PT','ES','MX','CL','US','DE'][(i+d)%15]})}return r}
$('#vdias').onchange=cargaVisitas;
async function cargaDtos(){const {data,error}=await sb.from('codigos_descuento').select('*').order('codigo');if(error){$('#codigos').textContent='Error: '+error.message;return}
 $('#codigos').innerHTML='';data.forEach(c=>{const d=document.createElement('div');d.className='card';d.innerHTML=`<b>${esc(c.codigo)}</b> · ${esc(c.porcentaje)} % · ${c.solo_usuarios_app?'solo usuarios app':'para todos'} · ${c.caduca?'caduca '+new Date(c.caduca).toLocaleDateString('es-ES'):'sin caducidad'} · <b>${c.activo?'ACTIVO':'inactivo'}</b> `;const b=document.createElement('button');b.textContent=c.activo?'Desactivar':'Activar';b.onclick=async ev=>{ev.stopPropagation();await sb.from('codigos_descuento').update({activo:!c.activo}).eq('codigo',c.codigo);cargaDtos()};d.appendChild(b);$('#codigos').appendChild(d)});
 const u=await sb.from('usuarios_app').select('email').order('email');$('#appusers').innerHTML='';(u.data||[]).forEach(r=>{const d=document.createElement('div');d.className='card';d.textContent=r.email+' ';const b=document.createElement('button');b.className='sec';b.textContent='Quitar';b.onclick=async()=>{await sb.from('usuarios_app').delete().eq('email',r.email);cargaDtos()};d.appendChild(b);$('#appusers').appendChild(d)})}
$('#fapp').onsubmit=async e=>{e.preventDefault();const {error}=await sb.from('usuarios_app').insert({email:$('#appemail').value.trim().toLowerCase()});if(error)alert(error.message);$('#appemail').value='';cargaDtos()};
arranca();
