// Interface utilities are independent of Firebase: navigation stays usable offline.
export const $ = id => document.getElementById(id);
export const categories = ['Notes', 'Books', 'Lab Equipment', 'Question Papers', 'Assignments'];
const categoryIcons = {Notes:'notes', Books:'book', 'Lab Equipment':'flask', 'Question Papers':'question', Assignments:'checklist'};
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `icons.svg#${name}`); svg.append(use); return svg;
}
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}
export function busy(button, active, label='Please wait…') {
  if (!button) return;
  if (active) {
    if (!button._originalNodes) button._originalNodes = [...button.childNodes];
    button.replaceChildren(el('span','spinner'),document.createTextNode(label));
    button.disabled = true; button.setAttribute('aria-busy','true');
  } else {
    if (button._originalNodes) button.replaceChildren(...button._originalNodes);
    delete button._originalNodes;
    button.disabled = false; button.removeAttribute('aria-busy');
  }
}
export function message(text, success=false, id='formMessage') {
  const target=$(id); if (!target) return;
  target.textContent=text; target.hidden=!text; target.classList.toggle('success',success);
}
export function fieldError(id,text='') {
  const input=$(id), error=$(`err-${id}`);
  if (error) error.textContent=text;
  if (input) {if (text) input.setAttribute('aria-invalid','true'); else input.removeAttribute('aria-invalid');}
}
export function clearErrors(form) {
  form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(error=>error.textContent='');
  message('');
}
export function focusError(form) {form.querySelector('[aria-invalid="true"]')?.focus();}
export function toast(text,error=false) {
  const target=$('toastRegion'); if (!target) return;
  const item=el('div',`toast${error?' error':''}`);
  item.append(icon(error?'info':'check'),document.createTextNode(text));
  target.append(item); setTimeout(()=>item.remove(),5000);
}
export function skeletons(container,count=6) {
  container.setAttribute('aria-busy','true');
  const label=el('p','visually-hidden','Loading resources…'); label.setAttribute('role','status');
  const cards=Array.from({length:count},()=>{
    const card=el('div','ad-card skeleton-card');card.setAttribute('aria-hidden','true');
    card.append(el('div','skeleton skeleton-image'));
    const content=el('div','ad-content');
    ['short','title','','medium','skeleton-price'].forEach(size=>content.append(el('div',`skeleton skeleton-line ${size}`)));
    card.append(content);return card;
  });
  container.replaceChildren(label,...cards);
}
export function state(container,{title,description,action,label='Try again',type='empty',href}) {
  container.setAttribute('aria-busy','false');
  const box=el('div','empty-state');const badge=el('span','tile-icon mint');badge.append(icon(type==='error'?'refresh':'search'));
  box.append(badge,el('h3','',title),el('p','',description));
  if(action||href){const btn=el(href?'a':'button','btn btn-outline',label);if(href)btn.href=href;else {btn.type='button';btn.addEventListener('click',action);}box.append(btn);}
  container.replaceChildren(box);
}
export const priceLabel = price => Number(price)===0?'Free':`৳${Number.isFinite(Number(price))?new Intl.NumberFormat('en-BD').format(Number(price)):'—'}`;
function safeImage(raw){try{const url=new URL(raw,location.href);return /^https?:$/.test(url.protocol)?url.href:'';}catch{return '';}}
function resourceImage(ad) {
  const wrap=el('div','ad-image');
  const fallback=()=>{const place=el('div','no-image');place.append(icon(categoryIcons[ad.category]||'book'),el('span','',ad.category||'Academic resource'));wrap.replaceChildren(place);};
  const src=ad.image && safeImage(ad.image);
  if(src){const img=el('img');img.src=src;img.alt=ad.title||'Academic resource';img.loading='lazy';img.decoding='async';img.addEventListener('error',fallback,{once:true});wrap.append(img);}else fallback();
  return wrap;
}
export function adCard(ad,{onDelete}={}) {
  // Firestore text is inserted as textContent, never interpreted as markup.
  const card=el('article','ad-card');card.dataset.adId=ad.id;
  card.append(resourceImage(ad));
  const content=el('div','ad-content');const title=el('h3','ad-title');
  const open=el('button','',ad.title||'Untitled resource');open.type='button';open.addEventListener('click',()=>showResource(ad));title.append(open);
  const footer=el('div','ad-footer');footer.append(el('span','ad-price',priceLabel(ad.price)),el('span','ad-user',onDelete?'Posted by you':ad.displayName||ad.email?.split('@')[0]||'Student'));
  content.append(el('p','ad-category',ad.category||'Resource'),title,el('p','ad-description',ad.description||'Open this resource for more details.'),footer);card.append(content);
  const details=el('button','view-ad','View resource');details.type='button';details.append(icon('arrow'));details.setAttribute('aria-label',`View ${ad.title||'resource'}`);details.addEventListener('click',()=>showResource(ad));card.append(details);
  if(onDelete){const del=el('button','delete-ad-btn');del.type='button';del.setAttribute('aria-label',`Delete ${ad.title||'ad'}`);del.append(icon('delete'));del.addEventListener('click',()=>onDelete(ad,del));card.append(del);}
  return card;
}
export function renderAds(container,ads,options={}) {container.replaceChildren(...ads.map(ad=>adCard(ad,options)));container.setAttribute('aria-busy','false');}
function showResource(ad) {
  const modal=el('dialog','detail-modal');modal.setAttribute('aria-label',ad.title||'Resource details');
  const heading=el('div','dialog-heading');heading.append(el('span','eyebrow','RESOURCE DETAILS'));
  const close=el('button','icon-btn');close.type='button';close.setAttribute('aria-label','Close resource');close.append(icon('close'));close.addEventListener('click',()=>modal.close());heading.append(close);
  const contact=el('div','detail-contact');const person=el('div');person.append(el('p','','SHARED BY'),el('strong','',ad.displayName||'Student'));contact.append(person);
  const email=String(ad.email||'').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const mail=el('a','btn btn-primary','Contact student');mail.append(icon('mail'));
    mail.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`ARMS: ${ad.title||'Resource enquiry'}`)}`;contact.append(mail);
  }else contact.append(el('p','','No contact email was provided.'));
  modal.append(heading,resourceImage(ad),el('p','ad-category',ad.category||'Resource'),el('h2','detail-title',ad.title||'Academic resource'),el('p','detail-description',ad.description||'No description provided.'),el('div','ad-price',priceLabel(ad.price)),contact);
  document.body.append(modal);modal.addEventListener('close',()=>modal.remove(),{once:true});backdropClose(modal);modal.showModal();
}
export function confirmAction(title,description) {
  return new Promise(resolve=>{
    const modal=el('dialog','confirm-modal');modal.setAttribute('aria-label',title);
    modal.append(el('h2','',title),el('p','',description));const actions=el('div','actions');
    const cancel=el('button','btn btn-outline','Keep ad');cancel.type='button';cancel.autofocus=true;
    const yes=el('button','btn btn-danger','Delete ad');yes.type='button';
    cancel.addEventListener('click',()=>modal.close('cancel'));yes.addEventListener('click',()=>modal.close('delete'));actions.append(cancel,yes);modal.append(actions);document.body.append(modal);
    modal.addEventListener('close',()=>{const accepted=modal.returnValue==='delete';modal.remove();resolve(accepted);},{once:true});backdropClose(modal);modal.showModal();
  });
}
function backdropClose(dialog){dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});}
export function safeNext(){const next=new URLSearchParams(location.search).get('next');return ['post-ad.html','ads.html','index.html'].includes(next)?next:'index.html';}
// A non-blocking progress line: no fixed waiting period, no invisible body.
const progress=document.querySelector('.page-progress');let navigationTimer;
function beginNavigation(){clearTimeout(navigationTimer);progress?.classList.remove('is-done');progress?.classList.add('is-active');navigationTimer=setTimeout(endNavigation,8000);}
function endNavigation(){clearTimeout(navigationTimer);progress?.classList.remove('is-active');}
window.addEventListener('pageshow',endNavigation);
document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||a.target==='_blank'||a.hasAttribute('download'))return;const next=new URL(a.href,location.href);if(next.origin===location.origin&&next.pathname!==location.pathname)beginNavigation();});
document.querySelector('.hero-search')?.addEventListener('submit',beginNavigation);
document.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
document.querySelectorAll('[data-toggle-password]').forEach(btn=>btn.addEventListener('click',()=>{const input=$(btn.dataset.togglePassword);const show=input.type==='password';input.type=show?'text':'password';btn.setAttribute('aria-pressed',String(show));btn.setAttribute('aria-label',`${show?'Hide':'Show'} ${input.id==='confirmPassword'?'confirm password':'password'}`);}));
document.querySelectorAll('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(backdropClose);
const drawer=$('slideMenu'), menuButton=$('kebabBtn');
menuButton?.addEventListener('click',()=>{drawer.showModal();menuButton.setAttribute('aria-expanded','true');});
drawer?.addEventListener('close',()=>menuButton?.setAttribute('aria-expanded','false'));
drawer?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>drawer.close()));
document.querySelector('.scroll-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
function networkStatus() {const node=$('networkBanner');if(node)node.hidden=navigator.onLine;}
networkStatus();window.addEventListener('offline',networkStatus);window.addEventListener('online',networkStatus);
