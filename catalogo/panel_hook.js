/* Hook opcional: guarda el pedido en el panel (Supabase) antes de abrir WhatsApp. Solo activo si CONFIG.guardarPedidosEnPanel=true.
   El descuento se calcula y valida en el servidor (RPC crear_pedido); el cliente solo envía el código. */
(function(){var C=window.CONFIG||{};if(!C.guardarPedidosEnPanel)return;
 function token(){try{var k=Object.keys(localStorage).find(function(x){return /^sb-.*-auth-token$/.test(x)});var t=k&&JSON.parse(localStorage.getItem(k));return t&&t.access_token&&t.expires_at*1000>Date.now()?t.access_token:null}catch(e){return null}}
 function val(id){var e=document.getElementById(id);return e&&e.value?e.value.trim():''}
 document.addEventListener('DOMContentLoaded',function(){if(!C.descuentoAppActivo)return;var dir=document.getElementById('dir');if(!dir)return;
  var i=document.createElement('input');i.id='codigo_dto';i.placeholder='Código de descuento (usuarios app D4 FITNESS, con sesión iniciada)';i.maxLength=30;i.autocomplete='off';dir.insertAdjacentElement('afterend',i)});
 window.D4Panel={enviar:function(C2,txt,WAURL){
  var w=window.__TEST?null:window.open('about:blank','_blank');
  var ir=function(t){var u=WAURL(t);window.__ultimoEnlace=u;if(w)w.location.href=u;else if(!window.__TEST)window.open(u,'_blank','noopener')};
  var p={cliente_nombre:val('nombre')||'Sin nombre',cliente_telefono:val('tel'),direccion_envio:val('dir'),total:(C2.total/100).toFixed(2),
   lineas:C2.lineas.map(function(l){return{producto:String(l.p.nombre).slice(0,200),variante:[l.p.formato,l.p.sabor,l.p.sku].filter(Boolean).join(' · ').slice(0,200),cantidad:l.q,precio_unit:l.pu===null?null:l.pu/100}})};
  var cod=C.descuentoAppActivo?val('codigo_dto').toUpperCase():'';var tk=token();
  fetch(C.SUPABASE_URL+'/rest/v1/rpc/crear_pedido',{method:'POST',headers:{apikey:C.SUPABASE_KEY,Authorization:'Bearer '+(tk||C.SUPABASE_KEY),'Content-Type':'application/json'},body:JSON.stringify({p:p,p_codigo:cod||null})})
  .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.message||'error');return j})})
  .then(function(j){var e=eur2;var extra='\nRef. pedido: '+j.referencia+(j.codigo?'\nCódigo '+j.codigo+': -'+e(j.descuento)+' · TOTAL con descuento: '+e(j.total):'');ir(txt+extra)})
  .catch(function(err){var m=document.getElementById('err');if(cod&&m){m.textContent='Código no aplicado: '+err.message+'. Te abrimos WhatsApp sin descuento.'}ir(txt)})}};
 function eur2(n){return Number(n).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}})();
