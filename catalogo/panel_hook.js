/* Hook opcional: guarda el pedido en el panel (Supabase) antes de abrir WhatsApp. Solo activo si CONFIG.guardarPedidosEnPanel=true.
   El descuento se calcula y valida en el servidor (RPC crear_pedido); el cliente solo envía el código. */
/* Enlace desde la app: ?app=<token de un solo uso>. Se guarda en sessionStorage (se borra al cerrar la pestaña), sin cookies.
   El aviso del 15 % solo se muestra si el servidor confirma el token (RPC verificar_token_app). Solo con CONFIG.descuentoAppActivo=true. */
(function(){var C=window.CONFIG||{};if(!C.descuentoAppActivo||!C.SUPABASE_URL)return;
 var tk=null;try{var q=new URLSearchParams(location.search),t=q.get('app');if(t&&/^[A-Za-z0-9_-]{43,44}$/.test(t)){sessionStorage.setItem('d4app',t);q.delete('app');history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash)}tk=sessionStorage.getItem('d4app')}catch(e){}
 if(!tk)return;
 fetch(C.SUPABASE_URL+'/rest/v1/rpc/verificar_token_app',{method:'POST',headers:{apikey:C.SUPABASE_KEY,Authorization:'Bearer '+C.SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_token:tk})})
 .then(function(r){return r.json()}).then(function(j){if(!j||!j.valido){try{sessionStorage.removeItem('d4app')}catch(e){}window.__d4appOK=false;return}
  window.__d4appOK=true;window.__d4appPct=Number(j.porcentaje)||0;if(window.pintaCesta)try{window.pintaCesta()}catch(e){};var pinta=function(){if(document.getElementById('d4app_aviso'))return;var d=document.createElement('div');d.id='d4app_aviso';d.setAttribute('role','status');
   d.style.cssText='background:#b30000;color:#fff;text-align:center;padding:10px;font-weight:700';d.textContent='Descuento del '+Number(j.porcentaje).toLocaleString('es-ES')+' % para usuarios de la app';document.body.insertAdjacentElement('afterbegin',d)};
  if(document.body)pinta();else document.addEventListener('DOMContentLoaded',pinta)}).catch(function(){})})();
(function(){var C=window.CONFIG||{};if(!C.guardarPedidosEnPanel)return;
 function token(){try{var k=Object.keys(localStorage).find(function(x){return /^sb-.*-auth-token$/.test(x)});var t=k&&JSON.parse(localStorage.getItem(k));return t&&t.access_token&&t.expires_at*1000>Date.now()?t.access_token:null}catch(e){return null}}
 function val(id){var e=document.getElementById(id);return e&&e.value?e.value.trim():''}
 document.addEventListener('DOMContentLoaded',function(){if(!C.descuentoAppActivo)return;var dir=document.getElementById('dir');if(!dir)return;
  var i=document.createElement('input');i.id='codigo_dto';i.placeholder='Código de descuento (usuarios app D4 FITNESS, con sesión iniciada)';i.maxLength=30;i.autocomplete='off';dir.insertAdjacentElement('afterend',i)});
 window.D4Panel={enviar:function(C2,txt,WAURL,RES){
  var w=window.__TEST?null:window.open('about:blank','_blank');
  var ir=function(t){var u=WAURL(t);window.__ultimoEnlace=u;if(w)w.location.href=u;else if(!window.__TEST)window.open(u,'_blank','noopener')};
  var p={cliente_nombre:val('nombre')||'Sin nombre',cliente_telefono:val('tel')||null,direccion_envio:val('dir'),total:(C2.total/100).toFixed(2),
   lineas:C2.lineas.map(function(l){return{producto:String(l.p.nombre).slice(0,200),variante:[l.p.formato,l.p.sabor,l.p.sku].filter(Boolean).join(' · ').slice(0,200),cantidad:l.q,precio_unit:l.pu===null?null:l.pu/100}})};
  var cod=C.descuentoAppActivo?val('codigo_dto').toUpperCase():'';var tapp=null;try{tapp=C.descuentoAppActivo&&window.__d4appOK?sessionStorage.getItem('d4app'):null}catch(e){}var tk=token();
  fetch(C.SUPABASE_URL+'/rest/v1/rpc/crear_pedido',{method:'POST',headers:{apikey:C.SUPABASE_KEY,Authorization:'Bearer '+(tk||C.SUPABASE_KEY),'Content-Type':'application/json'},body:JSON.stringify(tapp?{p:p,p_codigo:null,p_token_app:tapp}:{p:p,p_codigo:cod||null})})
  .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.message||'error');return j})})
  .then(function(j){if(tapp){try{sessionStorage.removeItem('d4app')}catch(e){}}var pc=j.codigo&&Number(j.total)>0&&Number(C2.total)>0?Math.round((1-Number(j.total)*100/C2.total)*100):0;ir(RES?RES({srv:j.codigo?{pct:pc||Number(window.__d4appPct)||15,descuento:j.descuento,total:j.total}:null,ref:j.referencia}):txt+'\nRef. pedido: '+j.referencia)})
  .catch(function(err){var m=document.getElementById('err');if((cod||tapp)&&m){m.textContent=tapp?'No se pudo registrar el pedido en el panel; te abrimos WhatsApp y D4 verificará el descuento.':'Descuento no aplicado: '+err.message+'. Te abrimos WhatsApp sin descuento.'}ir(RES?RES(tapp?{pendiente:true}:{srv:null}):txt)})}};
 function eur2(n){return Number(n).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}})();
