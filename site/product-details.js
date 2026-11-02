/* ТАРЕЛЬЕ · подробная карточка товара, 02.11.2026.
   На витрине — только фото, описание и цена; КБЖУ и состав — в подробностях.
   Рецептуры не выдумываем. Оформление в Telegram и корзина сохранены. */
(function () {
  'use strict';
  var SAMPLES = Object.freeze({
    'pelmeni-chicken': {
      src: 'assets/pelmeni-raw-approved-exact-20261102.webp',
      name: 'До приготовления',
      alt: 'Настоящие сырые цельнозерновые пельмени с куриным филе и луком на подносе',
      note: 'Настоящая фотография полуфабриката до приготовления.'
    },
    pepper: {
      src: 'assets/pepper-raw-approved-exact-20261102.webp',
      name: 'До приготовления',
      alt: 'Настоящие сырые фаршированные перцы с мясной начинкой до приготовления',
      note: 'Настоящая фотография полуфабриката до приготовления.'
    }
  });
  /* Составы предоставлены изготовителем 02.11.2026.
     Порядок компонентов и формулировки сохраняем без добавления неподтверждённых ингредиентов.
     Вид сахарозаменителя и следовые аллергены ещё требуют уточнения. */
  var PRODUCT_RECIPES = Object.freeze({
    'pelmeni-chicken': [
      {part:'Начинка', text:'Куриное филе, репчатый лук, соль, чёрный молотый перец.'},
      {part:'Тесто', text:'Цельнозерновая мука, куриные яйца.'}
    ],
    'pelmeni-beef': [
      {part:'Начинка', text:'Говяжий фарш, репчатый лук, соль, чёрный молотый перец.'},
      {part:'Тесто', text:'Пшеничная мука, куриные яйца.'}
    ],
    khinkali: [
      {part:'Начинка', text:'Говяжий фарш, репчатый лук, зелень, хмели-сунели, соль, чёрный молотый перец.'},
      {part:'Тесто', text:'Пшеничная мука, куриные яйца.'}
    ],
    borscht: [
      {part:'', text:'Куриный бульон, картофель, свёкла, морковь, репчатый лук, капуста, фасоль, томатная паста, 9% уксус, соль, чёрный молотый перец.'}
    ],
    'pea-soup': [
      {part:'', text:'Бульон из копчёной курицы, картофель, горох, морковь, репчатый лук, соль, чёрный молотый перец.'}
    ],
    'mushroom-soup': [
      {part:'', text:'Шампиньоны, картофель, репчатый лук, сливки 20%, соль, чёрный молотый перец.'}
    ],
    vareniki: [
      {part:'Начинка', text:'Картофель, репчатый лук, соль, чёрный молотый перец.'},
      {part:'Тесто', text:'Пшеничная мука, куриные яйца.'}
    ],
    pepper: [
      {part:'', text:'Говяжий фарш, куриное филе, рис, репчатый лук, сладкий зелёный перец, соль, чёрный молотый перец.'}
    ],
    'blini-savory': [
      {part:'Тесто', text:'Рисовая мука, безлактозное молоко, куриные яйца, масло гхи, сахарозаменитель, соль.'},
      {part:'Начинка', text:'Куриное филе, лёгкий сыр (17% жирности), шпинат, соль, чёрный молотый перец.'}
    ],
    'blini-tvorog': [
      {part:'Тесто', text:'Рисовая мука, безлактозное молоко, куриные яйца, масло гхи, сахарозаменитель, соль.'},
      {part:'Начинка', text:'Творог, греческий йогурт, сахарозаменитель.'}
    ],
    syrniki: [
      {part:'', text:'Творог (5% жирности), рисовая мука, яичные желтки, сахарозаменитель, соль.'}
    ]
  });
  var RICE_FLOUR_BLINI = new Set(['blini-savory', 'blini-tvorog']);
  var SEMIFINISHED = new Set(['pelmeni-chicken', 'pelmeni-beef', 'khinkali', 'vareniki', 'pepper']);
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function qtyText(p, qty) { return new Intl.NumberFormat('ru-RU', {maximumFractionDigits:1}).format(qty) + (p.unit === 'kg' ? ' кг' : p.unit === 'pack6' ? ' наб.' : ' шт.'); }
  function priceText(p) { return new Intl.NumberFormat('ru-RU').format(p.price) + ' ₽'; }
  function priceUnit(p) { return p.unit === 'kg' ? '/ кг' : p.unit === 'pack6' ? '/ 6 шт.' : ''; }
  function purchaseInfo(p) {
    if (p.unit === 'kg') return 'Цена за 1 кг. Нужный вес и итоговую фасовку согласуем при заказе.';
    if (p.unit === 'pack6') return 'Цена за набор из 6 штук.';
    if (p.id === 'blini-savory') return 'Количество блинов в порции уточняется при заказе.';
    if (p.category === 'soups') return 'Объём порции и способ получения уточняются при заказе.';
    return 'Условия получения и количество в порции уточняются при заказе.';
  }
  function nutritionNotes(p) {
    var stage = SEMIFINISHED.has(p.id)
      ? 'на 100 г продаваемого полуфабриката до приготовления'
      : 'на 100 г готового продукта';
    return 'Оценка ' + stage + ' по примерным пропорциям ингредиентов и предполагаемому выходу. Не является фактическим расчётом изготовителя.';
  }
  function nutritionHtml(p) {
    var n = NUTRITION_ESTIMATE[p.id];
    if (!n) return '<p class="pd-pending">КБЖУ будут добавлены после получения данных изготовителя.</p>';
    var entries = [
      ['Ккал', n.kcal, 'ккал'], ['Белки', n.protein, 'г'],
      ['Жиры', n.fat, 'г'], ['Углеводы', n.carbs, 'г']
    ];
    return '<div class="pd-nutrition-grid" aria-label="Ориентировочные КБЖУ на 100 граммов">' + entries.map(function (a) {
      return '<div class="pd-nutrient"><strong>' + esc(a[1]) + '</strong><span>' + esc(a[2]) + '</span><small>' + esc(a[0]) + '</small></div>';
    }).join('') + '</div><p class="pd-muted pd-nutrition-footnote">' + esc(nutritionNotes(p)) + '</p>';
  }
  function productPhotos(p) {
    var ret = [{src:p.img, name:'После приготовления', alt:'Готовое блюдо: ' + p.name, note:'Иллюстративная фотография готового блюда.'}];
    if (SAMPLES[p.id]) ret.push(SAMPLES[p.id]);
    return ret;
  }
  function detailHtml(p) {
    var photos = productPhotos(p);
    var recipe = PRODUCT_RECIPES[p.id] || [];
    var gallery = photos.length > 1
      ? '<div class="pd-gallery-tabs" id="pdGalleryTabs" aria-label="Выбор фотографии товара">' + photos.map(function (f, i) {
          return '<button type="button" class="pd-photo-choice' + (i === 0 ? ' active' : '') + '" data-pd-photo="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '"><img src="' + esc(f.src) + '" alt="" loading="lazy"><span>' + esc(f.name) + '</span></button>';
        }).join('') + '</div>'
      : '';
    var missingPhoto = SEMIFINISHED.has(p.id) && photos.length === 1
      ? '<p class="pd-missing-photo">Фотографию полуфабриката в продаваемом виде добавим после съёмки.</p>'
      : '';
    var ingredients = recipe.length
      ? '<div class="pd-recipe">' + recipe.map(function (group) {
          return '<div class="pd-recipe-part">' +
            (group.part ? '<strong class="pd-recipe-subheading">' + esc(group.part) + '</strong>' : '') +
            '<p class="pd-recipe-ingredients">' + esc(group.text) + '</p></div>';
        }).join('') +
        (RICE_FLOUR_BLINI.has(p.id)
          ? '<p class="pd-recipe-gluten">Тесто на рисовой муке, без пшеничной муки в рецептуре. Возможное наличие следов глютена ещё уточняется.</p>'
          : '') + '</div>'
      : '<p class="pd-pending">Состав пока не предоставлен изготовителем.</p>';
    return '<div class="pd-layout">' +
      '<section class="pd-gallery" aria-label="Фотографии товара">' +
      '<div class="pd-image-frame"><img id="pdActiveImage" src="' + esc(photos[0].src) + '" alt="' + esc(photos[0].alt) + '" width="1120" height="789"><span class="pd-image-label" id="pdImageLabel">' + esc(photos[0].name) + '</span></div>' +
      gallery + '<p class="pd-photo-caption" id="pdPhotoCaption">' + esc(photos[0].note) + '</p>' + missingPhoto + '</section>' +
      '<section class="pd-info">' +
      '<span class="pd-product-label">' + esc(p.badge) + '</span>' +
      '<h2 id="productDetailTitle">' + esc(p.name) + '</h2>' +
      '<p class="pd-lead" id="productDetailLead">' + esc(p.description) + '</p>' +
      '<section class="pd-section" aria-labelledby="pdIngredientsHeading"><h3 id="pdIngredientsHeading">Состав</h3>' + ingredients +
      '<p class="pd-muted pd-recipe-source">Состав по информации изготовителя. Возможные следы аллергенов уточняются.</p></section>' +
      '<section class="pd-section" aria-labelledby="pdNutritionHeading"><div class="pd-heading-row"><h3 id="pdNutritionHeading">КБЖУ на 100 г</h3><span class="pd-estimate">≈ предварительно</span></div>' + nutritionHtml(p) + '</section>' +
      '<section class="pd-section pd-order-note" aria-labelledby="pdFormatHeading"><h3 id="pdFormatHeading">Продажа и фасовка</h3><p>' + esc(purchaseInfo(p)) + '</p>' +
      (SEMIFINISHED.has(p.id) ? '<p class="pd-muted">Способ приготовления уточним после получения рекомендаций изготовителя.</p>' : '') + '</section>' +
      '</section></div>';
  }
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof PRODUCTS === 'undefined' || typeof NUTRITION_ESTIMATE === 'undefined' || typeof add !== 'function') return;
    var catalog = document.getElementById('catalogGroups');
    if (!catalog) return;
    var lookup = Object.fromEntries(PRODUCTS.map(function (p) { return [p.id, p]; }));
    var dialog = document.createElement('dialog');
    dialog.id = 'productDetailDialog';
    dialog.className = 'pd-dialog';
    dialog.setAttribute('aria-labelledby', 'productDetailTitle');
    dialog.setAttribute('aria-describedby', 'productDetailLead');
    dialog.innerHTML = '<div class="pd-shell"><div class="pd-topbar"><span class="pd-topbar-brand">ТАРЕЛЬЕ <span>· Домашняя</span></span><span class="pd-topbar-caption">О ПРОДУКТЕ</span><button type="button" id="pdClose" class="pd-close" aria-label="Закрыть подробности">×</button></div>' +
      '<div class="pd-scroll" id="pdContent"></div>' +
      '<div class="pd-footer"><div class="pd-cost"><strong id="pdPrice"></strong><small id="pdUnit"></small><span id="pdInCart" aria-live="polite"></span></div><button id="pdAdd" type="button" class="pd-add"><span aria-hidden="true">＋</span><span id="pdAddLabel">В корзину</span></button></div></div>';
    document.body.appendChild(dialog);
    var currentProduct = null;
    var currentPhotos = [];
    var currentIndex = 0;
    var previousFocus = null;
    var galleryStart = null;
    function refreshCartNote() {
      if (!currentProduct) return;
      var qty = cart[currentProduct.id] || 0;
      document.getElementById('pdInCart').textContent = qty ? 'В корзине: ' + qtyText(currentProduct, qty) : '';
      document.getElementById('pdAddLabel').textContent = qty ? 'Добавить ещё' : 'В корзину';
    }
    function changePhoto(index) {
      if (!Number.isInteger(index) || index < 0 || index >= currentPhotos.length) return;
      currentIndex = index;
      var selected = currentPhotos[index];
      var im = document.getElementById('pdActiveImage');
      im.src = selected.src;
      im.alt = selected.alt;
      document.getElementById('pdImageLabel').textContent = selected.name;
      document.getElementById('pdPhotoCaption').textContent = selected.note;
      dialog.querySelectorAll('[data-pd-photo]').forEach(function (b) {
        var on = Number(b.dataset.pdPhoto) === index;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    }
    function showProduct(id) {
      var p = lookup[id];
      if (!p) return;
      var menu = document.getElementById('categoryDialog');
      if (menu && menu.open) menu.close();
      previousFocus = document.activeElement;
      currentProduct = p;
      currentPhotos = productPhotos(p);
      currentIndex = 0;
      document.getElementById('pdContent').innerHTML = detailHtml(p);
      document.getElementById('pdPrice').textContent = priceText(p);
      document.getElementById('pdUnit').textContent = priceUnit(p);
      refreshCartNote();
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('pd-open');
      document.getElementById('pdContent').scrollTop = 0;
      document.getElementById('pdClose').focus({preventScroll:true});
    }
    function closeProduct() { if (dialog.open) dialog.close(); }
    catalog.querySelectorAll('.product-card').forEach(function (card) {
      var id = card.id.replace(/^product-/, '');
      var p = lookup[id];
      if (!p) return;
      card.classList.add('pd-ready');
      var mainPhoto = card.querySelector('.product-photo');
      if (mainPhoto) {
        var hit = document.createElement('button');
        hit.type = 'button';
        hit.className = 'pd-photo-hit';
        hit.dataset.openProduct = id;
        hit.setAttribute('aria-label', 'Подробнее о блюде: ' + p.name);
        mainPhoto.appendChild(hit);
      }
      var content = card.querySelector('.product-content');
      var bottom = content && content.querySelector('.product-bottom');
      if (content && bottom) {
        var details = document.createElement('button');
        details.type = 'button';
        details.className = 'pd-detail-link';
        details.dataset.openProduct = id;
        details.innerHTML = '<span>Состав и КБЖУ</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
        content.insertBefore(details, bottom);
      }
    });
    catalog.addEventListener('click', function (event) {
      var button = event.target.closest('[data-open-product]');
      if (button) { event.preventDefault(); showProduct(button.dataset.openProduct); return; }
      var card = event.target.closest('.pd-ready');
      if (!card || event.target.closest('button, a, input, textarea, select')) return;
      showProduct(card.id.slice('product-'.length));
    });
    document.getElementById('pdClose').addEventListener('click', closeProduct);
    dialog.addEventListener('close', function () {
      document.body.classList.remove('pd-open');
      currentProduct = null;
      currentPhotos = [];
      if (previousFocus && typeof previousFocus.focus === 'function' && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
      previousFocus = null;
    });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) closeProduct(); });
    document.getElementById('pdContent').addEventListener('click', function (event) {
      var button = event.target.closest('[data-pd-photo]');
      if (button) changePhoto(Number(button.dataset.pdPhoto));
    });
    document.getElementById('pdAdd').addEventListener('click', function () {
      if (!currentProduct) return;
      add(currentProduct.id);
      refreshCartNote();
    });
    document.getElementById('pdContent').addEventListener('touchstart', function (event) {
      if (!event.touches || event.touches.length !== 1 || !event.target.closest('.pd-image-frame')) return;
      galleryStart = {x:event.touches[0].clientX, y:event.touches[0].clientY};
    }, {passive:true});
    document.getElementById('pdContent').addEventListener('touchend', function (event) {
      if (!galleryStart || currentPhotos.length < 2 || !event.changedTouches.length) {galleryStart = null;return;}
      var deltaX = event.changedTouches[0].clientX - galleryStart.x;
      var deltaY = event.changedTouches[0].clientY - galleryStart.y;
      galleryStart = null;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
        changePhoto((currentIndex + (deltaX < 0 ? 1 : -1) + currentPhotos.length) % currentPhotos.length);
      }
    }, {passive:true});
  });
})();
