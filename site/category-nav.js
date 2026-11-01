/* Навигация по разделам ТАРЕЛЬЕ. Использует реальные карточки каталога,
   чтобы названия, изображения и количество блюд не расходились с меню. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var launcher = document.getElementById('categoryLauncher');
    var dialog = document.getElementById('categoryDialog');
    var options = document.getElementById('categoryOptions');
    var closeButton = document.getElementById('categoryClose');
    if (!launcher || !dialog || !options || !closeButton || typeof dialog.showModal !== 'function') return;

    function countText(number) {
      var a = number % 10, b = number % 100;
      return number + ' ' + (a === 1 && b !== 11 ? 'позиция' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'позиции' : 'позиций');
    }
    function makeChoice(id, name, subtext, src) {
      var choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'category-choice';
      choice.dataset.categoryChoice = id;
      choice.setAttribute('aria-pressed', 'false');

      var thumb = document.createElement('span');
      thumb.className = 'category-choice-thumb' + (id === 'all' ? ' category-choice-thumb--all' : '');
      if (id === 'all') {
        thumb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>';
      } else if (src) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.width = 124;
        img.height = 128;
        thumb.appendChild(img);
      }
      var copy = document.createElement('span');
      copy.className = 'category-choice-copy';
      var title = document.createElement('strong');
      title.textContent = name;
      var subtitle = document.createElement('small');
      subtitle.textContent = subtext;
      copy.appendChild(title);
      copy.appendChild(subtitle);
      var arrow = document.createElement('span');
      arrow.className = 'category-choice-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      choice.append(thumb, copy, arrow);
      return choice;
    }

    var groups = Array.from(document.querySelectorAll('#catalogGroups .category-group'));
    var total = groups.reduce(function (sum, group) {
      return sum + group.querySelectorAll('.product-card').length;
    }, 0);
    var choices = [makeChoice('all', 'Всё меню', countText(total), '')];
    groups.forEach(function (group) {
      var name = group.querySelector('.group-head h3');
      var image = group.querySelector('.product-photo img');
      var count = group.querySelectorAll('.product-card').length;
      if (!name || !group.dataset.group) return;
      choices.push(makeChoice(group.dataset.group, name.textContent.trim(), countText(count), image ? image.getAttribute('src') : ''));
    });
    options.replaceChildren.apply(options, choices);

    function activeId() {
      var active = document.querySelector('#categoryTabs .tab.active');
      return active ? active.dataset.filter : 'all';
    }
    function markActive() {
      var selected = activeId();
      options.querySelectorAll('[data-category-choice]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.dataset.categoryChoice === selected));
      });
    }
    function close() {
      if (dialog.open) dialog.close();
    }

    launcher.addEventListener('click', function () {
      if (dialog.open) return;
      markActive();
      dialog.showModal();
      launcher.setAttribute('aria-expanded', 'true');
      document.body.classList.add('category-dialog-open');
      closeButton.focus({preventScroll: true});
    });
    closeButton.addEventListener('click', close);
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) { close(); return; }
      var choice = event.target.closest('[data-category-choice]');
      if (!choice) return;
      var targetId = choice.dataset.categoryChoice;
      close();
      var tab = Array.from(document.querySelectorAll('#categoryTabs [data-filter]')).find(function (item) {
        return item.dataset.filter === targetId;
      });
      if (tab) {
        tab.click();
        // Keep the selected chip visible within the horizontal rail.
        tab.scrollIntoView({block:'nearest', inline:'nearest'});
      }
    });
    dialog.addEventListener('close', function () {
      launcher.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('category-dialog-open');
    });
    var media = window.matchMedia('(min-width:701px)');
    if (typeof media.addEventListener === 'function') media.addEventListener('change', function (e) {
      if (e.matches) close();
    });
  });
}());