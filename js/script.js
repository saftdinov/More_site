/* Интерактивность сайта кавер-группы «Море».
   Хранилище localStorage используется для учебной демонстрации.
*/
const STORAGE = { members: 'more_members_v2', reviews: 'more_reviews_v2' };
let bookingStartDate = new Date();
let participantPosition = 0;

const defaultMembers = [
 {id:'nikita',name:'Тюрин Никита',role:'Соло гитарист',quote:'«Когда играю — время замирает»',photo:'img/nikita%20.png'},
 {id:'dmitriy',name:'Мишур Дмитрий',role:'Вокалист',quote:'«На сцене каждый звук — это магия.»',photo:'img/dmitriy.png'},
 {id:'aleksey',name:'Сафтдинов Алексей',role:'Лидер кавер группы, ритм гитара',quote:'«Ритм — мое второе дыхание»',photo:'img/aleksey.png'}
];
function readStore(key, fallback) { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; } }
function writeStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e) { showNotification('Не удалось сохранить данные. Возможно, переполнено хранилище браузера.', true); return false; } }
function getMembers() { return readStore(STORAGE.members, defaultMembers); }
function getReviews() { return readStore(STORAGE.reviews, []); }

// 1. Мобильное меню: кнопка всегда создаётся в шапке и корректно переключает навигацию.
function toggleMobileMenu() { const nav=document.querySelector('.header-nav'); const btn=document.querySelector('.mobile-menu-button'); if(!nav)return; const opened=nav.classList.toggle('menu-open'); if(btn)btn.setAttribute('aria-expanded',String(opened)); }
// 2. Плавный переход наверх.
function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }
// 3. Поиск по репертуару.
function filterRepertoire() { const input=document.getElementById('repertoireSearch'); if(!input)return; const q=input.value.trim().toLocaleLowerCase('ru'); const items=[...document.querySelectorAll('.repertuar-item')]; items.forEach(el=>el.hidden=!el.textContent.toLocaleLowerCase('ru').includes(q)); const empty=document.getElementById('repertoireEmpty'); if(empty)empty.hidden=items.some(el=>!el.hidden); }
// 4. Добавление выбранной песни в пожелания с переходом на форму бронирования.
function chooseSong(songText) { const clean=songText.replace(/\s+/g,' ').trim(); if(!clean)return; sessionStorage.setItem('more_selected_song',clean); const target='index_bronirovanie.html'; if(!location.pathname.endsWith(target)){ location.href=target+'?song='+encodeURIComponent(clean); return; } const wishes=document.getElementById('bookingWishes'); if(wishes){const old=wishes.value.split(';').map(x=>x.trim()).filter(Boolean);if(!old.includes(clean))old.push(clean);wishes.value=old.join('; ');showNotification('Песня добавлена в пожелания.',false);} }
// 6. Форматирование номера телефона.
function formatPhone(value) { let d=value.replace(/\D/g,'');if(d.startsWith('8'))d='7'+d.slice(1);if(d.startsWith('7'))d=d.slice(0,11);else d=d.slice(0,10);if(!d)return '';if(d.startsWith('7'))return '+7'+(d.length>1?' ('+d.slice(1,4):'')+(d.length>=4?') '+d.slice(4,7):'')+(d.length>=7?'-'+d.slice(7,9):'')+(d.length>=9?'-'+d.slice(9,11):'');return d; }
// 7. Проверка полей формы.
function validateBookingForm() { const n=document.getElementById('bookingName'),g=document.getElementById('bookingGuests'),p=document.getElementById('bookingPhone'),ds=document.getElementById('bookingDateStart');const ts=document.getElementById('bookingTimeStart'),te=document.getElementById('bookingTimeEnd');if(ds&&!ds.value){showNotification('Выберите дату мероприятия.',true);ds.focus();return false;}if(ts&&te&&(!ts.value||!te.value||te.value<=ts.value)){showNotification('Время окончания должно быть позже времени начала.',true);te.focus();return false;}if(!n||n.value.trim().length<2){showNotification('Введите имя (не менее двух символов).',true);n?.focus();return false;}if(!g||Number(g.value)<1||Number(g.value)>500){showNotification('Укажите от 1 до 500 гостей.',true);g?.focus();return false;}if(!p||p.value.replace(/\D/g,'').length<10){showNotification('Введите корректный номер телефона.',true);p?.focus();return false;}return true; }
// 8. Демонстрационная отправка заявки.
function submitBookingForm(event) { event.preventDefault();if(!validateBookingForm())return;const name=document.getElementById('bookingName').value.trim(),guests=document.getElementById('bookingGuests').value;showNotification('Спасибо, '+name+'! Заявка на выступление для '+guests+' гостей подготовлена.',false);event.currentTarget.reset(); }
// 9. Уведомления.
function showNotification(message,isError=false) { let box=document.getElementById('siteNotice');if(!box){box=document.createElement('div');box.id='siteNotice';box.className='site-notice';box.setAttribute('role','status');document.body.appendChild(box);}box.textContent=message;box.classList.toggle('notice-error',!!isError);box.classList.add('notice-visible');clearTimeout(showNotification.timer);showNotification.timer=setTimeout(()=>box.classList.remove('notice-visible'),4500); }
// 10. Листалка участников: одна карточка в области просмотра.
function moveParticipantSlider(direction) {
    const cards=[...document.querySelectorAll('#membersDynamic .participant-card')];
    if(cards.length<2)return;
    participantPosition=(participantPosition+direction+cards.length)%cards.length;
    renderMembers();
}
function updateParticipantSlider() {
    const cards=[...document.querySelectorAll('#membersDynamic .participant-card')];
    if(!cards.length)return;
    cards.forEach((card,i)=>{const rel=(i-participantPosition+cards.length)%cards.length;card.classList.remove('participant-card-left','participant-card-center','participant-card-right');if(rel===0)card.classList.add('participant-card-center');else if(rel===1)card.classList.add('participant-card-right');else if(rel===cards.length-1)card.classList.add('participant-card-left');else card.classList.add('participant-card-hidden');});
    const counter=document.getElementById('participantCounter');if(counter)counter.textContent=`${participantPosition+1} / ${cards.length}`;
}
// 11. Одновременно играет только одно видео.
function pauseOtherVideos(current) { document.querySelectorAll('.media-card video').forEach(v=>{if(v!==current)v.pause();}); }
// 12. Общая инициализация страниц, меню, формы, репертуара и видео.
function initializeSiteInteractions() {
 const nav=document.querySelector('.header-nav');if(nav&&!document.querySelector('.mobile-menu-button')){const btn=document.createElement('button');btn.type='button';btn.className='mobile-menu-button';btn.textContent='☰';btn.setAttribute('aria-label','Открыть меню');btn.setAttribute('aria-expanded','false');nav.parentElement.insertBefore(btn,nav);btn.addEventListener('click',toggleMobileMenu);}
 document.querySelectorAll('.header-nav a').forEach(a=>a.addEventListener('click',()=>{nav?.classList.remove('menu-open');document.querySelector('.mobile-menu-button')?.setAttribute('aria-expanded','false');}));
 // Репертуаром управляет initSongCart(): поддерживается множественный выбор.
 document.getElementById('repertoireSearch')?.addEventListener('input',filterRepertoire);
 document.querySelectorAll('.media-card video').forEach(v=>v.addEventListener('play',()=>pauseOtherVideos(v)));
 const form=document.getElementById('bookingForm');if(form)form.addEventListener('submit',submitBookingForm);
 const phone=document.getElementById('bookingPhone');phone?.addEventListener('input',e=>e.target.value=formatPhone(e.target.value));

 document.querySelectorAll('[data-participant-move]').forEach(b=>b.addEventListener('click',()=>moveParticipantSlider(Number(b.dataset.participantMove))));
 const top=document.createElement('button');top.type='button';top.className='back-to-top';top.textContent='Наверх ↑';top.addEventListener('click',scrollToTop);document.querySelectorAll('.footer-bottom').forEach(f=>{if(!f.querySelector('.back-to-top'))f.appendChild(top.cloneNode(true));f.querySelector('.back-to-top')?.addEventListener('click',scrollToTop);});
 const params=new URLSearchParams(location.search),song=params.get('song')||sessionStorage.getItem('more_selected_song');const wishes=document.getElementById('bookingWishes');if(wishes&&song){wishes.value=song;sessionStorage.removeItem('more_selected_song');}
 renderMembers();renderPublicReviews();loadAboutVideo();window.addEventListener('resize',()=>updateParticipantSlider());
}

function renderMembers() {
    const host = document.getElementById('membersDynamic');
    if (!host) return;
    let viewport = host.closest('.participants-viewport');
    if (!viewport) {
        viewport = document.createElement('div');
        viewport.className = 'participants-viewport';
        host.parentNode.insertBefore(viewport, host);
        viewport.appendChild(host);
    }
    host.classList.add('participant-track');
    host.innerHTML = '';
    const members=getMembers();
    members.forEach((member, index) => {
        const card = document.createElement('article');
        card.className = 'participant-card';
        const image = document.createElement('img');
        image.src = member.photo || 'img/Group%2010.png';
        image.alt = member.name;
        image.loading = index > 1 ? 'lazy' : 'eager';
        const info = document.createElement('div');
        info.className = 'participant-info';
        const name = document.createElement('div'); name.className = 'participant-name'; name.textContent = member.name;
        const role = document.createElement('div'); role.className = 'participant-role'; role.textContent = member.role || '';
        const quote = document.createElement('div'); quote.className = 'participant-quote'; quote.textContent = member.quote || '';
        info.append(name, role, quote); card.append(image, info); host.appendChild(card);
    });
    updateParticipantSlider();
    const controls = document.querySelector('.slider');
    if (controls && !document.getElementById('participantCounter')) {
        const counter = document.createElement('span');
        counter.id = 'participantCounter'; counter.className = 'participant-counter';
        controls.appendChild(counter);
    }
}
function renderPublicReviews() { const host=document.getElementById('publicReviews');if(!host)return;host.innerHTML='';const approved=getReviews().filter(r=>r.status==='approved');if(!approved.length){const empty=document.createElement('p');empty.className='reviews-empty';empty.textContent='Пока нет опубликованных отзывов. Станьте первым!';host.appendChild(empty);return;}approved.forEach(r=>{const article=document.createElement('article');article.className='review-card';const title=document.createElement('strong');title.textContent=r.name;const rating=document.createElement('span');rating.className='review-stars';rating.textContent='★'.repeat(Number(r.rating)||5);const body=document.createElement('p');body.textContent=r.text;article.append(title,rating,body);host.appendChild(article);}); }
function submitReview(event) { event.preventDefault();const form=event.currentTarget,name=form.elements.reviewName.value.trim(),text=form.elements.reviewText.value.trim(),rating=form.elements.reviewRating.value;if(name.length<2||text.length<5){showNotification('Укажите имя и отзыв не короче 5 символов.',true);return;}const reviews=getReviews();reviews.unshift({id:Date.now().toString(),name,text,rating,status:'pending',date:new Date().toISOString()});if(writeStore(STORAGE.reviews,reviews)){form.reset();showNotification('Спасибо! Отзыв отправлен на проверку администратору.',false);} }
document.addEventListener('DOMContentLoaded',()=>{initializeSiteInteractions();document.getElementById('reviewForm')?.addEventListener('submit',submitReview);});

// Дополнительные улучшения: выбор диапазона дат, корзина песен и события портфолио.
const SONG_CART_KEY='more_song_cart_v1', EVENTS_KEY='more_portfolio_events_v1';
function getSongCart(){try{return JSON.parse(sessionStorage.getItem(SONG_CART_KEY)||'[]')}catch(e){return []}}
function setSongCart(items){sessionStorage.setItem(SONG_CART_KEY,JSON.stringify(items));renderSongCart()}
function renderSongCart(){const count=document.getElementById('songCartCount');if(!count)return;const items=getSongCart();count.textContent=items.length;const summary=document.getElementById('songCartSummary');if(summary)summary.textContent=items.length?items.map(x=>x.title).join('; '):'Отметьте песни, которые хотите услышать на мероприятии.';document.querySelectorAll('.repertuar-item').forEach(item=>{const title=item.dataset.song||item.innerText.replace(/\s+/g,' ').trim();const active=items.some(x=>x.title===title);item.classList.toggle('song-selected',active);item.setAttribute('aria-checked',String(active));const dot=item.querySelector('.song-check');if(dot)dot.textContent=active?'✓':'';});}
function toggleSong(item){const title=item.dataset.song||item.innerText.replace(/\s+/g,' ').trim();let items=getSongCart();items=items.some(x=>x.title===title)?items.filter(x=>x.title!==title):[...items,{title}];setSongCart(items)}
function transferSongCart(){const items=getSongCart();if(!items.length){showNotification('Сначала выберите хотя бы одну песню.',true);return}sessionStorage.setItem('more_selected_songs',JSON.stringify(items.map(x=>x.title)));location.href='index_bronirovanie.html?songs=cart'}
function initSongCart(){
 const items=[...document.querySelectorAll('.repertuar-item')];if(!items.length)return;
 items.forEach(item=>{
  if(item.dataset.songCartReady==='1')return;
  item.dataset.songCartReady='1';item.setAttribute('role','checkbox');item.setAttribute('aria-checked','false');item.setAttribute('tabindex','0');
  const artist=item.querySelector('.repertuar-artist')?.textContent.trim()||'';
  const song=item.querySelector('.repertuar-song')?.textContent.trim()||'';
  item.dataset.song=`${artist} — ${song}`;
  let check=item.querySelector('.song-check');if(!check){check=document.createElement('span');check.className='song-check';check.setAttribute('aria-hidden','true');item.prepend(check)}
  item.addEventListener('click',()=>toggleSong(item));
  item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleSong(item)}});
 });
 const clear=document.getElementById('clearSongCart'),send=document.getElementById('sendSongCart');
 if(clear&&clear.dataset.bound!=='1'){clear.dataset.bound='1';clear.addEventListener('click',()=>setSongCart([]))}
 if(send&&send.dataset.bound!=='1'){send.dataset.bound='1';send.addEventListener('click',transferSongCart)}
 renderSongCart();
}
function initBookingDates(){const start=document.getElementById('bookingDateStart');if(!start)return;const today=new Date();const local=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)};start.min=local(today);start.value=local(today);}
function readEvents(){try{return JSON.parse(localStorage.getItem(EVENTS_KEY)||'null')||[{id:'seed1',name:'Свадьба',date:'2024-08-20',place:'Отель «Юпитер»',photo:'img/svad.jpg'},{id:'seed2',name:'Корпоратив',date:'2024-09-15',place:'«Арена»',photo:'img/korpo.jpg'},{id:'seed3',name:'Посвящение в студенты',date:'2024-10-05',place:'«ОблСовПроф»',photo:'img/dr.png'}]}catch(e){return []}}
function renderPortfolioEvents(){const host=document.getElementById('portfolioEvents');if(!host)return;host.innerHTML='';readEvents().forEach(ev=>{const card=document.createElement('article');card.className='gallery-item event-card';const media=document.createElement('div');media.className='event-media';(ev.photos||[ev.photo||'img/Group%2010.png']).slice(0,3).forEach(src=>{const img=document.createElement('img');img.src=src;img.alt=ev.name;media.append(img)});const info=document.createElement('div');info.className='gallery-info';const date=ev.date?new Date(ev.date+'T12:00:00').toLocaleDateString('ru-RU'):'Дата уточняется';info.textContent=ev.name+' · '+date+' · '+ev.place;card.append(media,info);host.append(card)})}
// Reinitialize the additions after the original site setup.
document.addEventListener('DOMContentLoaded',()=>{initSongCart();initBookingDates();renderPortfolioEvents();const params=new URLSearchParams(location.search);if(params.get('songs')==='cart'){const chosen=JSON.parse(sessionStorage.getItem('more_selected_songs')||'[]');const wishes=document.getElementById('bookingWishes');if(wishes&&chosen.length){wishes.value=[wishes.value,...chosen].filter(Boolean).join('; ');sessionStorage.removeItem('more_selected_songs');showNotification('Выбранные песни добавлены в пожелания.',false)}}});

// Видео страницы «О нас» хранится в IndexedDB, чтобы не упираться в лимит localStorage.
function videoDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('more_site_media',1);req.onupgradeneeded=()=>req.result.createObjectStore('media');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function loadAboutVideo(){const host=document.getElementById('aboutVideoFrame');if(!host)return;try{const db=await videoDb();const req=db.transaction('media').objectStore('media').get('about-video');req.onsuccess=()=>{if(req.result){host.innerHTML='';const v=document.createElement('video');v.controls=true;v.playsInline=true;v.src=URL.createObjectURL(req.result);host.append(v)}}}catch(e){console.warn('Видео недоступно',e)}}

