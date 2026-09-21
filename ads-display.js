import { $, categories, skeletons, state, renderAds, busy } from './ui.js';
import { readAds, newestFirst, friendlyError } from './data.js';
const container = $('adsContainer'), form = $('resourceSearch'), search = $('searchInput'), sort = $('sortSelect');
let ads = [], loaded = false, request = 0;
const params = new URLSearchParams(location.search);
let category = categories.includes(params.get('category')) ? params.get('category') : '';
search.value = (params.get('q') || '').slice(0, 150);
function syncUrl() { const p = new URLSearchParams(); if (category) p.set('category', category); if (search.value.trim()) p.set('q', search.value.trim()); if (sort.value !== 'newest') p.set('sort', sort.value); history.replaceState(null, '', `ads.html${p.size ? '?' + p : ''}`); }
if (['newest', 'price-asc', 'price-desc'].includes(params.get('sort'))) sort.value = params.get('sort');
function setHeading() {
  $('categoryTitle').textContent = category || 'Explore academic resources.';
  document.querySelectorAll('[data-category]').forEach(btn => { const active = btn.dataset.category === category; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active)); });
}
function display() {
  setHeading(); syncUrl(); if (!loaded) return;
  const term = search.value.trim().toLocaleLowerCase();
  const result = ads.filter(ad => (!category || ad.category === category) && (!term || [ad.title, ad.description, ad.category].some(value => String(value || '').toLocaleLowerCase().includes(term))));
  result.sort(sort.value === 'newest' ? newestFirst : (a, b) => ((Number(a.price) || 0) - (Number(b.price) || 0)) * (sort.value === 'price-asc' ? 1 : -1));
  $('resultsCount').textContent = `${result.length} ${result.length === 1 ? 'resource' : 'resources'}${term ? ` for “${search.value.trim()}”` : ''}${category ? ` in ${category}` : ''}`;
  if (result.length) renderAds(container, result);
  else state(container, { title: term || category ? 'No matching resources yet.' : 'The next great resource could be yours.', description: term || category ? 'Try a different keyword or explore another category.' : 'Nothing has been shared yet. Be the first to help your campus learn.', label: term || category ? 'Clear filters' : 'Share a resource', ...(term || category ? { action: () => { search.value = ''; category = ''; display(); } } : { href: 'post-ad.html' }) });
}
async function load() {
  const token = ++request; loaded = false; skeletons(container); $('resultsCount').textContent = 'Loading resources…'; const button = form.querySelector('button'); busy(button, true, 'Searching…');
  try { const result = await readAds(); if (token !== request) return; ads = result; loaded = true; display(); }
  catch (error) { if (token !== request) return; $('resultsCount').textContent = 'Resources unavailable'; state(container, { title: 'Let’s try that again.', description: friendlyError(error, 'We couldn’t load the resources. Please try again.'), type: 'error', action: load }); }
  finally { if (token === request) busy(button, false); }
}
form.addEventListener('submit', event => { event.preventDefault(); if (loaded) display(); else load(); });
let debounce; search.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(display, 160); });
sort.addEventListener('change', display);
document.querySelectorAll('[data-category]').forEach(btn => btn.addEventListener('click', () => { category = btn.dataset.category; display(); }));
window.addEventListener('online', () => { if (!loaded) load(); }); setHeading(); load();
