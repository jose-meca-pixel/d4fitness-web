// Opcional: sin JS el carrusel sigue funcionando con scroll, teclado y swipe.
(function(){var l=document.getElementById('shots');if(!l)return;var c=l.parentNode.querySelector('.ctrl');c.hidden=false;
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
c.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var it=l.querySelector('li');var step=it?it.getBoundingClientRect().width+16:300;
l.scrollBy({left:step*Number(b.dataset.dir),behavior:rm?'auto':'smooth'});});})();
