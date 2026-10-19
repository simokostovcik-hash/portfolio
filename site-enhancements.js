(() => {
  'use strict';
  const sections=[...document.querySelectorAll('main > section[id]')];
  const dock=[...document.querySelectorAll('.quick-dock a')];
  const nav=[...document.querySelectorAll('#nav a[href^="#"]')];
  const progress=document.getElementById('page-progress-bar');
  const palette=document.getElementById('nav-palette');
  const trigger=document.getElementById('nav-search-trigger');
  const close=document.getElementById('palette-close');
  const search=document.getElementById('palette-search');
  const links=[...document.querySelectorAll('#palette-links a')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const activate=id=>{
    for(const a of [...dock,...nav]){
      const active=a.getAttribute('href')==='#'+id;
      a.classList.toggle('is-active',active);
      if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    }
  };
  let scheduled=false;
  const onScroll=()=>{
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      progress.style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';
      const threshold=innerHeight*.34+80;
      let current=sections[0]?.id;
      for(const section of sections)if(section.getBoundingClientRect().top<=threshold)current=section.id;
      if(current)activate(current);
      scheduled=false;
    });
  };
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});onScroll();
  const open=()=>{palette.hidden=false;document.body.style.overflow='hidden';search.value='';filter();search.focus();};
  const shut=()=>{palette.hidden=true;document.body.style.overflow='';trigger?.focus();};
  const filter=()=>{const q=search.value.trim().toLocaleLowerCase('cs');for(const a of links)a.hidden=!a.textContent.toLocaleLowerCase('cs').includes(q);};
  trigger?.addEventListener('click',open);close?.addEventListener('click',shut);search?.addEventListener('input',filter);
  palette?.addEventListener('click',e=>{if(e.target===palette)shut();});
  links.forEach(a=>a.addEventListener('click',shut));
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();palette.hidden?open():shut();}
    if(e.key==='Escape'&&!palette.hidden){e.preventDefault();shut();}
    if(e.key==='Enter'&&!palette.hidden&&document.activeElement===search){const first=links.find(a=>!a.hidden);if(first){e.preventDefault();first.click();}}
  });
  if(!reduced&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}, {threshold:.08,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.reveal-on-scroll').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('js-motion');
  }
})();
