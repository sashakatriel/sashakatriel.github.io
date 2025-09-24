const sheetUrls = [
  // 1-й слайд: таблица
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhq-889EBsydKAEcxMboIcb6El7oH7zgiGo_fY5Lnbt5LVEz5QW-khte-QDGwdYf7Fo73-fpvPrrRA/pub?gid=0&single=true&output=csv',
  // 2-й слайд: лидер дня
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT8asEYeKLeLx3zGb7-hRzq1bQ-mZIRmpDQl46hovTYvnHgkxXjyFyvl1c1fCincIltqXAWsCP9Ta5-/pub?gid=0&single=true&output=csv'
];

let currentIndex = 0;
let slides = [];

async function loadAllSheets() {
  const container = document.getElementById('slider-content');
  container.innerHTML = '';
  slides = [];

  for (let i = 0; i < sheetUrls.length; i++) {
    const data = await loadCSV(sheetUrls[i]);
    let content;

    if (i === 0) {
      // первый слайд = таблица
      content = renderTable(data);
    } else {
      // второй слайд = карточка товара
      content = renderProductCard(data);
    }

    const slide = document.createElement('div');
    slide.classList.add('slide');
    slide.appendChild(content);

    container.appendChild(slide);
    slides.push(slide);
  }

  if (slides.length > 0) {
    showSlide(0);
  }
}

async function loadCSV(url) {
  try {
    const res = await fetch(url + '&t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const rows = text.trim().split(/\r?\n/);
    return rows.map(r => r.split(/,|;|\t/));
  } catch (e) {
    console.error(e);
    return [['Ошибка загрузки']];
  }
}

function renderTable(data) {
  const tbl = document.createElement('table');
  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const el = document.createElement(i === 0 ? 'th' : 'td');
      el.textContent = cell;
      tr.appendChild(el);
    });
    tbl.appendChild(tr);
  });
  return tbl;
}

function renderProductCard(data) {
  const headers = data[0];
  const rows = data.slice(1);
  let productCard = rows[0];

  const cardElement = document.createElement('div');
  cardElement.classList.add('product-card');

  const titleIndex = headers.findIndex(h => /Название|title/i.test(h));
  const titleValue = titleIndex !== -1 ? productCard[titleIndex] : 'Неизвестно';

  const titleText = document.createElement('h2');
  titleText.textContent = titleValue;

  const imageIndex = headers.findIndex(h => /Изображение|image/i.test(h));
  const imageSrc = imageIndex !== -1 ? productCard[imageIndex] : '';

  const image = document.createElement('img');
  image.alt = 'Изображение товара';
  image.src = imageSrc;
  image.width = 350;

  const descriptionIndex = headers.findIndex(h => /Описание|description/i.test(h));
  const descriptionValue = descriptionIndex !== -1 ? productCard[descriptionIndex] : 'Неизвестно';

  const descriptionContainer = document.createElement('div');
  const descriptionTitle = document.createElement('strong');
  descriptionTitle.textContent = 'Описание: ';
  descriptionContainer.appendChild(descriptionTitle);
  const descriptionText = document.createElement('span');
  descriptionText.textContent = descriptionValue;
  descriptionContainer.appendChild(descriptionText);

  const categoryIndex = headers.findIndex(h => /Категория|category/i.test(h));
  const categoryValue = categoryIndex !== -1 ? productCard[categoryIndex] : 'Неизвестно';

  const categoryContainer = document.createElement('div');
  const categoryTitle = document.createElement('strong');
  categoryTitle.textContent = 'Категория: ';
  categoryContainer.appendChild(categoryTitle);
  const categoryText = document.createElement('span');
  categoryText.textContent = categoryValue;
  categoryContainer.appendChild(categoryText);


  const sizeIndex = headers.findIndex(h => /Размер|size/i.test(h));
  const sizeValue = sizeIndex !== -1 ? productCard[sizeIndex] : 'Неизвестно';

  const sizeContainer = document.createElement('div');
  const sizeTitle = document.createElement('strong');
  sizeTitle.textContent = 'Размер: ';
  sizeContainer.appendChild(sizeTitle);
  const sizeText = document.createElement('span');
  sizeText.textContent = sizeValue;
  sizeContainer.appendChild(sizeText);

  const priceIndex = headers.findIndex(h => /Цена|price/i.test(h));
  const priceValue = priceIndex !== -1 ? productCard[priceIndex] : 'Неизвестно';

  const priceContainer = document.createElement('div');
  const priceTitle = document.createElement('strong');
  priceTitle.textContent = 'Цена: ';
  priceContainer.appendChild(priceTitle);
  const priceText = document.createElement('span');
  priceText.textContent = priceValue + '₽';
  priceContainer.appendChild(priceText);


  cardElement.appendChild(titleText);
  cardElement.appendChild(image);
  cardElement.appendChild(descriptionContainer);
  cardElement.appendChild(categoryContainer);
  cardElement.appendChild(sizeContainer);
  cardElement.appendChild(priceContainer);
  return cardElement;
}

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === index) {
      slide.classList.add('active');
    }
  });
  currentIndex = index;
}

document.querySelector('.prev').addEventListener('click', () => {
  if (slides.length > 0) {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
  }
});

document.querySelector('.next').addEventListener('click', () => {
  if (slides.length > 0) {
    showSlide((currentIndex + 1) % slides.length);
  }
});

loadAllSheets();
