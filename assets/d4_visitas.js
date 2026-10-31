/* Visitas anónimas D4FITNESSHOP: SIN cookies, SIN IP guardada, SIN huella, SIN identificadores ni datos personales. Solo con CONFIG.registrarVisitas=true.
   Se envía: ruta, dominio de procedencia, tipo de dispositivo y origen agregado 'web'|'app'.
   - Una visita por página y pestaña (sessionStorage, se borra al cerrar la pestaña): recargas no cuentan doble.
   - No cuenta bots obvios, navegadores automatizados, prerender, Do Not Track, ni /admin/.
   - 'app' = la sesión entró con el enlace de la app (?app=). El token NO se envía ni se guarda aquí; solo un indicador '1' en sessionStorage. */
(function(){var C=window.CONFIG||{};if(!C.registrarVisitas||!C.SUPABASE_URL||!C.SUPABASE_KEY)return;
 var ua=navigator.userAgent||'';
 if(/^\/admin(\/|$)/.test(location.pathname))return;
 if(navigator.webdriver||/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegrambot|python|curl|wget/i.test(ua))return;
 if(document.visibilityState==='prerender')return;
 var app=false;
 try{if(navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
  if(new URLSearchParams(location.search).has('app')||sessionStorage.getItem('d4app'))sessionStorage.setItem('d4v_app','1');
  app=sessionStorage.getItem('d4v_app')==='1';
  if(sessionStorage.getItem('d4v:'+location.pathname))return;sessionStorage.setItem('d4v:'+location.pathname,'1')}catch(e){return}
 var ref=null;try{if(document.referrer){var h=new URL(document.referrer).hostname.toLowerCase();if(h&&h!==location.hostname)ref=h.slice(0,100)}}catch(e){}
 var dis=/iPad|Tablet/i.test(ua)?'tablet':/Mobi|Android|iPhone/i.test(ua)?'movil':'escritorio';
 var ruta=(location.pathname.replace(/[^A-Za-z0-9\/_.\-]/g,'')||'/').slice(0,150);
 fetch(C.SUPABASE_URL+'/rest/v1/visitas',{method:'POST',keepalive:true,credentials:'omit',referrerPolicy:'no-referrer',headers:{apikey:C.SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({ruta:ruta,referrer:ref,dispositivo:dis,origen:app?'app':'web'})}).catch(function(){})})();
