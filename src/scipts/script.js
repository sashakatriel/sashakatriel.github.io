const sheetUrls = [
  // 1-й слайд: таблица
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhq-889EBsydKAEcxMboIcb6El7oH7zgiGo_fY5Lnbt5LVEz5QW-khte-QDGwdYf7Fo73-fpvPrrRA/pub?gid=0&single=true&output=csv',
  // 2-й слайд: лидер дня
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSWJKcDJUnoogu-SSswBH12M78x97eNgrMN7kJGHh9HVgY3yjbMbkUOI36uuTaGSLLwfj3ht-59ZKgt/pub?gid=0&single=true&output=csv'
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
      // второй слайд = карточка лидера дня
      content = renderLeaderCard(data);
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

function renderLeaderCard(data) {
  // предполагаем, что заголовки в первой строке
  const headers = data[0];
  const rows = data.slice(1);

  // ищем колонку "Рекорд"
  const scoreIndex = headers.findIndex(h => /Рекорд|Очки|score/i.test(h));
  if (scoreIndex === -1) {
    return document.createTextNode("Не найдена колонка 'Рекорд'");
  }

  // находим лидера
  let leader = rows[0];
  let maxScore = parseFloat(rows[0][scoreIndex]) || 0;

  for (let r of rows) {
    const score = parseFloat(r[scoreIndex]) || 0;
    if (score > maxScore) {
      maxScore = score;
      leader = r;
    }
  }

  // создаём карточку
  const card = document.createElement('div');
  card.classList.add('leader-card');

  // ищем колонку с ником
  const nicknameIndex = headers.findIndex(h => /Лидер дня|ник|nickname/i.test(h));
  const nickname = nicknameIndex !== -1 ? leader[nicknameIndex] : 'Неизвестный';

  // ищем колонку с именем
  const nameIndex = headers.findIndex(h => /ФИО|имя|name/i.test(h));
  const name = nameIndex !== -1 ? leader[nameIndex] : 'Неизвестный';

  //
  const title = document.createElement('h2');
  title.textContent = 'Лидер дня';

  const playerNickname = document.createElement('p');
  playerNickname.textContent = `Игрок: ${nickname}`;

  const playerName = document.createElement('p');
  playerName.textContent = `ФИО: ${name}`;

  const scoreElement = document.createElement('p');
  scoreElement.classList.add('score');
  scoreElement.textContent = `Рекорд: ${maxScore}`;

  card.appendChild(title);
  card.appendChild(playerNickname);
  card.appendChild(playerName);
  card.appendChild(scoreElement);

  return card;
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

/*setInterval(() => {
  if (slides.length > 0) {
    showSlide((currentIndex + 1) % slides.length);
  }
}, 10000);*/

loadAllSheets();
