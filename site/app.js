'use strict';

// Контакт Telegram. Можно указать публичный username, когда он появится;
// пока используется номер с загруженного прайс-листа.
const CONFIG = Object.freeze({
  telegramPhone: '79788716505',
  telegramUsername: '',
  storageKey: 'tarelie-domashnyaya-cart-v1'
});
function telegramLink(message='') {
  const destination = CONFIG.telegramUsername
    ? CONFIG.telegramUsername.replace(/^@/, '')
    : '+' + CONFIG.telegramPhone;
  return 'https://t.me/' + destination + (message ? '?text=' + encodeURIComponent(message) : '');
}

// Цены и названия строго соответствуют загруженному прайс-листу.
// Для товаров с unit='kg' цена указана за 1 кг, корзина позволяет задавать дробный вес.
const GROUPS = Object.freeze([
  {id:'dumplings',name:'Пельмени и хинкали',tab:'Пельмени и хинкали'},
  {id:'soups',name:'Домашние супы',tab:'Супы'},
  {id:'home',name:'Домашняя классика',tab:'Домашняя классика'},
  {id:'breakfast',name:'Завтраки и десерты',tab:'Завтраки и десерты'}
]);
const PRODUCTS = Object.freeze([
 {id:'pelmeni-chicken',category:'dumplings',name:'Пельмени ПП с куриным филе и луком',description:'Цельнозерновое тесто · куриное филе и лук',price:1000,unit:'kg',badge:'Цельнозерновые',img:'assets/pelmeni-chicken-wholegrain-20261101.webp'},
 {id:'pelmeni-beef',category:'dumplings',name:'Пельмени классические с говядиной',description:'Классический домашний вкус',price:850,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/img-79bc045f3016aa0f.webp'},
 {id:'khinkali',category:'dumplings',name:'Хинкали с говядиной',description:'Сочная начинка из говядины',price:850,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/img-941621935bb470b2.webp'},
 {id:'borscht',category:'soups',name:'Борщ',description:'Домашний обед',price:200,unit:'piece',badge:'Супы',img:'assets/img-3d8a78857a1bc7a6.webp'},
 {id:'pea-soup',category:'soups',name:'Гороховый суп',description:'Сытный домашний суп',price:200,unit:'piece',badge:'Супы',img:'assets/img-982cefe24c4a9600.webp'},
 {id:'mushroom-soup',category:'soups',name:'Крем-суп с шампиньонами',description:'С нежным грибным вкусом',price:250,unit:'piece',badge:'Супы',img:'assets/img-e1c3a1b5e5e998c7.webp'},
 {id:'vareniki',category:'home',name:'Вареники с картофелем',description:'Любимая домашняя классика',price:400,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/img-37fcb5659ca34f06.webp'},
 {id:'pepper',category:'home',name:'Перец фаршированный',description:'Домашняя классика',price:850,unit:'kg',badge:'Домашняя классика',img:'assets/pepper-stuffed-home-20261101.webp'},
 {id:'syrniki',category:'breakfast',name:'Сырники готовые',description:'6 штук в наборе',price:400,unit:'pack6',badge:'6 штук',img:'assets/img-83008923ee1ea26e.webp'},
 {id:'blini-tvorog',category:'breakfast',name:'Блинчики с творогом',description:'6 штук в наборе',price:450,unit:'pack6',badge:'6 штук',img:'assets/img-f93cbe522a7ae358.webp'},
 {id:'blini-savory',category:'breakfast',name:'Блины с курицей, сыром и шпинатом',description:'Количество в порции уточняйте',price:500,unit:'piece',badge:'Новинка',img:'assets/img-2a71b923c2099231.webp'}
]);
// КБЖУ: временные ориентиры по усреднённым типовым рецептурам, на 100 г.
// НЕ результаты лабораторного анализа и НЕ расчёт по фактическим технологическим картам производителя.
// После получения фактических рецептур/КБЖУ заменить значения здесь и изменить метку в интерфейсе.
// Полуфабрикаты (пельмени, хинкали, вареники) — 100 г до варки;
// остальные позиции — 100 г готового блюда (статус перца требует уточнения).
const NUTRITION_ESTIMATE = Object.freeze({
  'pelmeni-chicken':{kcal:180,protein:14,fat:4,carbs:22},
  'pelmeni-beef':{kcal:230,protein:12,fat:10,carbs:23},
  'khinkali':{kcal:220,protein:11,fat:8,carbs:26},
  'borscht':{kcal:55,protein:2,fat:3,carbs:5},
  'pea-soup':{kcal:90,protein:4,fat:4,carbs:9},
  'mushroom-soup':{kcal:100,protein:3,fat:6,carbs:8},
  'vareniki':{kcal:205,protein:5,fat:3,carbs:39},
  'pepper':{kcal:105,protein:6,fat:6,carbs:7},
  'syrniki':{kcal:235,protein:14,fat:12,carbs:18},
  'blini-tvorog':{kcal:215,protein:9,fat:9,carbs:24},
  'blini-savory':{kcal:225,protein:13,fat:11,carbs:18},
});

const fmt = new Intl.NumberFormat('ru-RU', {maximumFractionDigits:1});
const priceLabel = p => fmt.format(p.price)+' ₽';
const unitLabel = p => p.unit==='kg' ? '/кг' : p.unit==='pack6' ? '/6 шт.' : '';
const buttonQtyLabel = (p,n)=>p.unit==='kg' ? fmt.format(n)+' кг' : fmt.format(n);
const productById = Object.fromEntries(PRODUCTS.map(p=>[p.id,p]));
const $ = s => document.querySelector(s);
const escapeHTML = v => String(v).replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let cart={};
try { const stored=JSON.parse(localStorage.getItem(CONFIG.storageKey)||'{}');if(stored && typeof stored==='object' && !Array.isArray(stored)) for(const [k,v] of Object.entries(stored)){const p=productById[k];if(p && Number.isFinite(Number(v)) && Number(v)>0 && Number(v)<=99)cart[k]=p.unit==='kg'?Math.round(Number(v)*10)/10:Math.round(Number(v));} } catch(e) { /* private mode: just use memory */ }
let toastTimeout=null;
const alertToast = msg => {const e=$('#toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>e.classList.remove('show'),3500);};
function persist(){try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(cart));}catch(e){/* storage disabled */}}
function changeQty(id,delta){const p=productById[id];if(!p)return;const step=p.unit==='kg'?0.5:1;let next=Number(((cart[id]||0)+step*delta).toFixed(1));next=Math.min(next,99);if(next<=0)delete cart[id];else cart[id]=next;persist();renderCounters();renderCart();}
function add(id){const p=productById[id];if(!p)return;const quantity=p.unit==='kg'?1:1;cart[id]=Math.min((cart[id]||0)+quantity,99);persist();renderCounters();renderCart();alertToast('Добавлено в корзину');}

function nutritionMarkup(p){
 const n=NUTRITION_ESTIMATE[p.id];
 if(!n)return '';
 return `<div class="nutrition" aria-label="Предварительный расчёт пищевой ценности на 100 граммов">
 <div class="nutrition-heading"><span>КБЖУ <strong>на 100 г</strong></span><span class="nutrition-status">≈ ориентировочно</span></div>
 <div class="nutrition-grid">
   <div class="nutrition-cell"><strong>${n.kcal}</strong><span>ккал</span></div>
   <div class="nutrition-cell"><strong>${n.protein}</strong><span>белки, г</span></div>
   <div class="nutrition-cell"><strong>${n.fat}</strong><span>жиры, г</span></div>
   <div class="nutrition-cell"><strong>${n.carbs}</strong><span>углеводы, г</span></div>
 </div></div>`;
}

function cardMarkup(p){
 return `<article class="product-card" id="product-${p.id}">
 <div class="product-photo"><img loading="lazy" src="${p.img}" alt="${escapeHTML(p.name)} — пример подачи" width="800" height="560"><span class="product-pill">${escapeHTML(p.badge)}</span></div>
 <div class="product-content"><h4>${escapeHTML(p.name)}</h4><p class="description">${escapeHTML(p.description)}</p>${nutritionMarkup(p)}<div class="product-bottom"><div class="price"><strong>${priceLabel(p)}</strong><small>${unitLabel(p)}</small></div><div class="product-action" data-action-for="${p.id}"></div></div></div>
 </article>`;
}
function renderCatalog(){
 $('#categoryTabs').innerHTML=`<button class="tab active" data-filter="all" type="button" aria-pressed="true">Всё меню</button>`+GROUPS.map(g=>`<button class="tab" type="button" data-filter="${g.id}" aria-pressed="false">${g.tab}</button>`).join('');
 $('#catalogGroups').innerHTML=GROUPS.map(g=>{const items=PRODUCTS.filter(p=>p.category===g.id);return `<section class="category-group" data-group="${g.id}" aria-labelledby="cat-${g.id}"><div class="group-head"><h3 id="cat-${g.id}">${g.name}</h3><div class="line"></div><span class="group-count">${items.length} ${items.length===1?'позиция':items.length<5?'позиции':'позиций'}</span></div><div class="product-grid">${items.map(cardMarkup).join('')}</div></section>`}).join('');
 $('#categoryTabs').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(!btn)return;let filter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{const isOn=b===btn;b.classList.toggle('active',isOn);b.setAttribute('aria-pressed',String(isOn));});document.querySelectorAll('.category-group').forEach(g=>g.hidden=filter!=='all'&&g.dataset.group!==filter);document.getElementById('catalogGroups').scrollIntoView({behavior:'smooth',block:'start'});});
 $('#catalogGroups').addEventListener('click',e=>{const b=e.target.closest('[data-add],[data-change]');if(!b)return;const id=b.dataset.id; if(b.hasAttribute('data-add'))add(id);else changeQty(id,Number(b.dataset.change));});
}
function renderCounters(){
 let count=0,total=0;
 for(const [id,qty] of Object.entries(cart)){const p=productById[id];if(!p)continue;count++;total+=qty*p.price;}
 $('#headerCartCount').textContent=count;$('#floatingCount').textContent=count;$('#floatingTotal').textContent=fmt.format(total)+' ₽';
 $('#floatingCart').classList.toggle('visible',count>0);
 for(const p of PRODUCTS){const area=document.querySelector(`[data-action-for="${p.id}"]`);if(!area)continue;const qty=cart[p.id]||0;
 area.innerHTML=qty>0?`<div class="mini-controls" aria-label="Количество ${escapeHTML(p.name)}"><button type="button" data-id="${p.id}" data-change="-1" aria-label="Уменьшить количество ${escapeHTML(p.name)}">−</button><span>${buttonQtyLabel(p,qty)}</span><button type="button" data-id="${p.id}" data-change="1" aria-label="Увеличить количество ${escapeHTML(p.name)}">+</button></div>`:`<button type="button" class="add-btn" data-add="true" data-id="${p.id}" aria-label="Добавить ${escapeHTML(p.name)} в корзину"><span class="plus-icon">+</span> В корзину</button>`;
 }
}
function renderCart(){let total=0;const entries=PRODUCTS.filter(p=>(cart[p.id]||0)>0);
 if(!entries.length){$('#cartItems').innerHTML=`<div class="cart-empty"><svg viewBox="0 0 48 48" width="70" height="70" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M11 16h26l3 25H8l3-25Z"/><path d="M18 18v-5a6 6 0 0 1 12 0v5"/></svg><h3>Пока здесь пусто</h3><p>Добавьте что-нибудь вкусное из меню.</p><button type="button" id="emptyCartGo">Выбрать блюда</button></div>`;
 } else $('#cartItems').innerHTML=entries.map(p=>{const q=cart[p.id];total+=q*p.price;return `<div class="cart-row"><img class="cart-thumb" src="${p.img}" alt="" width="68" height="68"/><div class="cart-main"><h3 class="cart-name">${escapeHTML(p.name)}</h3><p class="cart-sub">${priceLabel(p)}${unitLabel(p)}${p.unit==='kg'?' · вес ориентировочный':''}</p><div class="cart-row-footer"><div class="cart-controls"><button type="button" data-cart-id="${p.id}" data-cart-change="-1" aria-label="Уменьшить количество">−</button><span>${buttonQtyLabel(p,q)}</span><button type="button" data-cart-id="${p.id}" data-cart-change="1" aria-label="Увеличить количество">+</button></div><strong>${fmt.format(q*p.price)} ₽</strong></div></div></div>`}).join('');
 $('#cartTotal').textContent=fmt.format(total)+' ₽';
 for(const id of ['sendTelegram','copyOrder'])$('#'+id).disabled=!entries.length;
 const disabled=!entries.length;['sendTelegram','copyOrder'].forEach(id=>{$('#'+id).style.opacity=disabled?'.48':'1';});
}
function orderText(){
 const entries=PRODUCTS.filter(p=>cart[p.id]>0);if(!entries.length)return '';
 const lines=['Здравствуйте! Хочу заказать в ТАРЕЛЬЕ · Домашняя:',''];let total=0;
 entries.forEach((p,i)=>{const quantity=cart[p.id],sum=quantity*p.price;total+=sum;const unit=p.unit==='kg'?'кг':p.unit==='pack6'?'набор(ов) по 6 шт.':'порц./поз.';lines.push(`${i+1}. ${p.name} — ${fmt.format(quantity)} ${unit} × ${fmt.format(p.price)} ₽ = ${fmt.format(sum)} ₽`);});
 lines.push('',`Предварительная стоимость: ${fmt.format(total)} ₽`);
 const name=$('#customerName').value.trim(),comment=$('#customerComment').value.trim();
 if(name)lines.push(`Имя: ${name}`);if(comment)lines.push(`Пожелания: ${comment}`);
 lines.push('','Пожалуйста, подтвердите наличие, фасовку, итоговую стоимость и условия получения.');return lines.join('\n');
}
async function copyText(txt){
 try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(txt);return true;}}
 catch(e){}
 try{const box=document.createElement('textarea');box.value=txt;box.style.position='fixed';box.style.left='-1000px';document.body.append(box);box.select();const ok=document.execCommand('copy');box.remove();return ok;}catch(e){return false;}
}
function openCart(){const backdrop=$('#drawerBackdrop'),drawer=$('#cartDrawer');backdrop.hidden=false;drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');drawer.focus();}
function closeCart(){const backdrop=$('#drawerBackdrop'),drawer=$('#cartDrawer');drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.classList.remove('drawer-open');}
function init(){renderCatalog();renderCounters();renderCart();$('#year').textContent=new Date().getFullYear();
 document.querySelectorAll('[data-telegram-link]').forEach(a=>{a.href=telegramLink();});
 for(const id of ['headerCartButton','footerCartButton','floatingCart'])$('#'+id).addEventListener('click',openCart);
 $('#closeCart').addEventListener('click',closeCart);$('#drawerBackdrop').addEventListener('click',closeCart);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart();if(e.key==='Tab'&&$('#cartDrawer').classList.contains('open')){const focusables=Array.from($('#cartDrawer').querySelectorAll('a[href],button:not([disabled]),input,textarea'));const i=focusables.indexOf(document.activeElement);if(e.shiftKey&&i===0){focusables.at(-1).focus();e.preventDefault()}else if(!e.shiftKey&&i===focusables.length-1){focusables[0].focus();e.preventDefault()}}});
 $('#cartItems').addEventListener('click',e=>{if(e.target.id==='emptyCartGo'){closeCart();$('#menu').scrollIntoView({behavior:'smooth'});return;}const b=e.target.closest('[data-cart-change]');if(b)changeQty(b.dataset.cartId,Number(b.dataset.cartChange));});
 $('#sendTelegram').addEventListener('click',async()=>{
 const msg=orderText();
 if(!msg){alertToast('Корзина пуста');return;}
 const link=telegramLink(msg);
 const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth<=900);
 if(!isMobile){
   window.open(link,'_blank','noopener,noreferrer');
   $('#checkoutGuidance').textContent='Проверьте подготовленный текст и нажмите «Отправить» в Telegram.';
   return;
 }
 // Mobile Telegram may ignore ?text= when the application is already running.
 const sendButton=$('#sendTelegram');
 sendButton.disabled=true;
 let copied=false;
 try { copied=await copyText(msg); }
 finally { sendButton.disabled=false; }
 $('#checkoutGuidance').textContent=copied
  ? 'Заказ скопирован. Если Telegram уже открыт и поле сообщения пустое, удерживайте поле ввода и нажмите «Вставить».'
  : 'Если Telegram откроется без текста, вернитесь в корзину и нажмите «Скопировать текст заказа».';
 window.location.assign(link);
});
  $('#copyOrder').addEventListener('click',async()=>{const msg=orderText();if(!msg){alertToast('Корзина пуста');return;}const copied=await copyText(msg);alertToast(copied?'Состав заказа скопирован.':'Скопировать автоматически не удалось. Попробуйте открыть сайт через HTTPS.');});
}
document.addEventListener('DOMContentLoaded',init);
