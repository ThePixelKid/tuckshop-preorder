// Simple cart drawer toggle and accessibility helpers
(function(){
  const openButtons = document.querySelectorAll('[data-cart-toggle]');
  const drawer = document.querySelector('.cart-drawer');
  const closeBtn = drawer && drawer.querySelector('.close');

  function openDrawer(){
    if(!drawer) return;
    drawer.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    // focus first focusable
    const focusable = drawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(focusable) focusable.focus();
  }
  function closeDrawer(){
    if(!drawer) return;
    drawer.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  }

  openButtons.forEach(btn=> btn.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(); }));
  if(closeBtn) closeBtn.addEventListener('click', (e)=>{ e.preventDefault(); closeDrawer(); });

  // close on Escape
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeDrawer(); });

  // close when clicking outside drawer on small screens
  document.addEventListener('click', (e)=>{
    if(!drawer || !drawer.classList.contains('is-open')) return;
    if(!drawer.contains(e.target) && !e.target.closest('[data-cart-toggle]')) closeDrawer();
  });
})();
