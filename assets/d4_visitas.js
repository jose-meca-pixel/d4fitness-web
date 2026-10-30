/* Visitas anónimas D4FITNESSHOP: sin cookies, sin IP, sin identificadores. Desactivado salvo CONFIG.registrarVisitas=true */
(function(){var C=window.CONFIG||{};if(!C.registrarVisitas||!C.SUPABASE_URL||!C.SUPABASE_KEY)return;
 try{if(navigator.doNotTrack==='1'||sessionStorage.getItem('d4v:'+location.pathname))return;sessionStorage.setItem('d4v:'+location.pathname,'1')}catch(e){}
 var ref=null;try{if(document.referrer){var h=new URL(document.referrer).hostname.toLowerCase();if(h&&h!==location.hostname)ref=h.slice(0,100)}}catch(e){}
 var ua=navigator.userAgent||'',dis=/iPad|Tablet/i.test(ua)?'tablet':/Mobi|Android|iPhone/i.test(ua)?'movil':'escritorio';
 var ruta=(location.pathname.replace(/[^A-Za-z0-9\/_.\-]/g,'')||'/').slice(0,150);
 fetch(C.SUPABASE_URL+'/rest/v1/visitas',{method:'POST',keepalive:true,headers:{apikey:C.SUPABASE_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({ruta:ruta,referrer:ref,dispositivo:dis})}).catch(function(){})})();
