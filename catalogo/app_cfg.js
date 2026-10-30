'use strict';
(function(){const C=window.CONFIG||{};const TIT=['TITULAR','NIF','DOMICILIO'];
 const d=(C.WHATSAPP_PEDIDOS||'').replace(/\D/g,'').replace(/^34(?=\d{9}$)/,'');C.ENVIO_TEXTO=C.ENVIO_GRATIS?'Envío gratis.':'[A RELLENAR]';C.WHATSAPP_MOSTRAR=d.length===9?d.replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3'):(C.WHATSAPP_PEDIDOS||'[A RELLENAR]');
 const val=k=>TIT.includes(k)&&!C.MOSTRAR_DATOS_TITULAR?'[A CONFIRMAR POR JOSE]':(C[k]||'[A RELLENAR]');
 const pend=Object.entries(C).filter(([k,v])=>typeof v==='string'&&/A RELLENAR|A CONFIRMAR/.test(v)).map(([k])=>k);if(!C.MOSTRAR_DATOS_TITULAR)pend.push('MOSTRAR_DATOS_TITULAR');window.PENDIENTES=[...new Set(pend)];
 if(C.MODO_BORRADOR){const m=document.createElement('meta');m.name='robots';m.content='noindex,nofollow';document.head.appendChild(m);
  document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('div');b.className='aviso';b.setAttribute('role','alert');
   b.textContent='⚠️ BORRADOR SIN PUBLICAR · catálogo de consulta'+(window.PENDIENTES.length?' · Pendiente de confirmar: '+window.PENDIENTES.join(', '):'');document.body.prepend(b)})}
 document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('[data-cfg]').forEach(e=>{e.textContent=val(e.dataset.cfg)});
  document.querySelectorAll('a[data-wa]').forEach(a=>{const n=(C.WHATSAPP_PEDIDOS||'').replace(/\D/g,'');if(n)a.href='https://wa.me/'+n})});})();
