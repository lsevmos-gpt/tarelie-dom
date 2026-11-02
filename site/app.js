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
 {id:'pelmeni-chicken',category:'dumplings',name:'Пельмени ПП с куриным филе и луком',description:'Нежное цельнозерновое тесто, сочная куриная начинка и аромат лука — любимый вкус по-домашнему.',price:1000,unit:'kg',badge:'Цельнозерновые',img:'assets/pelmeni-pp-approved-20261102b.webp'},
 {id:'pelmeni-beef',category:'dumplings',name:'Пельмени классические с говядиной',description:'Мягкое тонкое тесто, сочная говяжья начинка и тот самый насыщенный вкус настоящих домашних пельменей.',price:850,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/pelmeni-beef-fullplate-20261101.webp'},
 {id:'khinkali',category:'dumplings',name:'Хинкали с говядиной',description:'Нежное тесто, ароматная говядина и горячий мясной сок внутри — удовольствие в каждом кусочке.',price:850,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/khinkali-fullplate-20261101.webp'},
 {id:'borscht',category:'soups',name:'Борщ',description:'Насыщенный, ароматный, с нежными овощами и глубоким домашним вкусом. Настоящий уют в каждой ложке.',price:200,unit:'piece',badge:'Супы',img:'assets/borscht-approved-20261102b.webp'},
 {id:'pea-soup',category:'soups',name:'Гороховый суп',description:'Густой, наваристый, с мягким горохом и богатым ароматом. Сытный обед, который согревает.',price:200,unit:'piece',badge:'Супы',img:'assets/pea-soup-fullplate-20261101.webp'},
 {id:'mushroom-soup',category:'soups',name:'Крем-суп с шампиньонами',description:'Бархатистая текстура, насыщенный вкус шампиньонов и нежный грибной аромат. Лёгкий и уютный.',price:250,unit:'piece',badge:'Супы',img:'assets/mushroom-soup-fullplate-20261101.webp'},
 {id:'vareniki',category:'home',name:'Вареники с картофелем',description:'Тонкое нежное тесто и мягкая картофельная начинка — тот самый знакомый вкус домашней кухни.',price:400,unit:'kg',badge:'Домашние полуфабрикаты',img:'assets/vareniki-fullplate-20261101.webp'},
 {id:'pepper',category:'home',name:'Перец фаршированный',description:'Нежный сладковатый перец, сочная мясная начинка и насыщенный аромат — настоящая домашняя классика.',price:850,unit:'kg',badge:'Домашняя классика',img:'assets/pepper-scale-borscht-20261102.webp'},
 {id:'syrniki',category:'breakfast',name:'Сырники готовые',description:'Румяная золотистая корочка, нежная творожная серединка — идеальное начало вкусного утра.',price:400,unit:'pack6',badge:'6 штук',img:'assets/syrniki-fullplate-20261101.webp'},
 {id:'blini-tvorog',category:'breakfast',name:'Блинчики с творогом',description:'Тонкие, мягкие блинчики с нежной творожной начинкой — уютный домашний вкус в каждом кусочке.',price:450,unit:'pack6',badge:'6 штук',img:'assets/blini-tvorog-fullplate-20261101.webp'},
 {id:'blini-savory',category:'breakfast',name:'Блины с курицей, сыром и шпинатом',description:'Румяные тонкие блинчики с сочной курицей, нежным сыром и шпинатом — сытно и невероятно вкусно.',price:500,unit:'piece',badge:'Новинка',img:'assets/blini-savory-fullplate-20261101.webp'}
]);
// КБЖУ: расчёт 02.11.2026 по 11 ПРИМЕРНЫМ рецептурам и условному выходу продукции.
// USDA FoodData Central (SR Legacy); энергия по ТР ТС 022/2011: 4P+9F+4C+2 пищевые волокна.
// Углеводы без пищевых волокон. Не являются технологическими картами или лабораторными данными.
// Граммовки и исходные профили ингредиентов сохранены в /nutrition/nutrition-estimates-2026-11-02.json.
const NUTRITION_ESTIMATE = Object.freeze({
  'pelmeni-chicken':{kcal:170,protein:15,fat:2.8,carbs:19.7},
  'pelmeni-beef':{kcal:215,protein:12.4,fat:7.5,carbs:24.3},
  'khinkali':{kcal:220,protein:12.8,fat:7.8,carbs:24.4},
  'borscht':{kcal:30,protein:1.6,fat:0.2,carbs:4.4},
  'pea-soup':{kcal:70,protein:4.2,fat:1.2,carbs:8.4},
  'mushroom-soup':{kcal:60,protein:1.7,fat:3.8,carbs:4.4},
  'vareniki':{kcal:165,protein:5.6,fat:1.2,carbs:31.9},
  'pepper':{kcal:128,protein:13.5,fat:4.5,carbs:9.5},
  'syrniki':{kcal:181,protein:16.7,fat:9.3,carbs:10.7},
  'blini-tvorog':{kcal:158,protein:12.95,fat:6.5,carbs:11.5},
  'blini-savory':{kcal:182,protein:14.75,fat:10.65,carbs:13.3},
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
