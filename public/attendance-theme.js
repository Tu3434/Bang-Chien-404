(()=>{'use strict';
 const storageKey='404_theme';
 const btn=document.getElementById('theme-toggle');
 function apply(dark){
   document.body.classList.toggle('dark',dark);
   document.documentElement.dataset.theme=dark?'dark':'light';
   if(btn){btn.textContent=dark?'☀ Nền sáng':'☾ Nền tối';btn.setAttribute('aria-pressed',String(dark));}
 }
 let dark=false;try{dark=localStorage.getItem(storageKey)==='dark';}catch(_){}
 apply(dark);
 if(btn)btn.addEventListener('click',()=>{dark=!document.body.classList.contains('dark');apply(dark);try{localStorage.setItem(storageKey,dark?'dark':'light');}catch(_){}});
})();
