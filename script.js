// Адреса API з оголошеннями (JSONPlaceholder, мок-дані)
const API_URL = 'https://jsonplaceholder.typicode.com/posts?userId=3';

// Оголошення, завантажені з API
let apiAds = [];
// Оголошення, додані через форму
const userAds = [];

// Класи бейджів для кожної категорії
const badgeClasses = {
    'Речі': 'badge-items',
    'Послуги': 'badge-services',
    'Тварини': 'badge-animals',
    'З мережі': 'badge-online'
};

const DESCRIPTION_MAX = 200;

// Скорочує текст до n символів
const shorten = (text, n) => text.length > n ? text.slice(0, n) + '...' : text;

const listContainer = document.querySelector('#listings-list');
const countElement = document.querySelector('#listings-count');
const statusElement = document.querySelector('#load-status');
const reloadBtn = document.querySelector('#reload-btn');

const form = document.querySelector('#add-ad-form');
const titleInput = document.querySelector('#ad-title');
const categorySelect = document.querySelector('#ad-category');
const descriptionInput = document.querySelector('#ad-description');
const counterElement = document.querySelector('#description-counter');
const toggleFormBtn = document.querySelector('#toggle-form-btn');

// Прибираємо статичні картки з HTML
const staticCards = document.querySelectorAll('.static-card');
staticCards.forEach(card => card.remove());

// Рендер карток оголошень і підрахунок активних
function renderAds(adsArray) {
    listContainer.innerHTML = '';
    let activeCount = 0;

    for (const ad of adsArray) {
        const card = document.createElement('article');
        card.classList.add('card');

        // Бейдж категорії
        const badge = document.createElement('span');
        badge.classList.add('badge');
        badge.textContent = ad.category;
        if (badgeClasses[ad.category]) {
            badge.classList.add(badgeClasses[ad.category]);
        }

        const title = document.createElement('h3');
        title.textContent = shorten(ad.title, 30);

        // Картинка-заглушка з першим словом назви
        const img = document.createElement('img');
        const imgText = ad.title.split(' ')[0];
        img.src = `https://placehold.co/400x200/EEE/31343C?text=${imgText}`;
        img.alt = ad.title;

        card.append(badge, title, img);

        // Опис показуємо лише якщо він є
        if (ad.description) {
            const text = document.createElement('p');
            text.textContent = ad.description;
            card.append(text);
        }

        // У даних з API дати немає, тому рядок виводимо лише для своїх оголошень
        if (ad.daysAgo !== undefined) {
            const date = document.createElement('p');
            date.textContent = `Опубліковано днів тому: ${ad.daysAgo}`;
            card.append(date);
            card.dataset.daysAgo = ad.daysAgo;
        }

        // Оголошення старші за 14 днів вважаються неактуальними
        if (ad.daysAgo > 14) {
            card.classList.add('outdated');
        } else {
            activeCount++;
        }

        listContainer.append(card);
    }

    countElement.textContent = `Активних оголошень: ${activeCount}`;
}

// Виводить разом оголошення з API і додані через форму
function renderAll() {
    renderAds([...apiAds, ...userAds]);
}

// Показує або ховає стан завантаження
function showLoading(isLoading) {
    reloadBtn.disabled = isLoading;
    if (isLoading) {
        statusElement.classList.remove('error');
        statusElement.textContent = 'Завантаження...';
    }
}

// Виводить повідомлення про помилку для користувача
function showError(message) {
    statusElement.classList.add('error');
    statusElement.textContent = message;
}

// Завантаження оголошень з API JSONPlaceholder
// https://jsonplaceholder.typicode.com/posts?userId=3
async function loadData() {
    showLoading(true);

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Сервер відповів кодом ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        // Переводимо пости з API у формат оголошень: title -> title, body -> description
        apiAds = data.map(post => ({
            title: post.title,
            category: 'З мережі',
            description: post.body
        }));

        statusElement.textContent = '';
        renderAll();
    } catch (error) {
        showError('Оголошення тимчасово недоступні. Спробуйте пізніше.');
        console.error('Помилка завантаження оголошень:', error);
    } finally {
        showLoading(false);
    }
}

// Оновлює лічильник символів, що залишилися в описі
function updateCounter() {
    const left = DESCRIPTION_MAX - descriptionInput.value.length;
    counterElement.textContent = `Залишилось символів: ${left}`;
}

// Кнопка "Оновити" - повторний запит до API без перезавантаження сторінки
reloadBtn.addEventListener('click', loadData);

// Клік на "Додати оголошення" - показує або ховає форму
toggleFormBtn.addEventListener('click', () => {
    form.classList.toggle('visible');

    if (form.classList.contains('visible')) {
        toggleFormBtn.textContent = 'Сховати форму';
        form.scrollIntoView({ behavior: 'smooth' });
        titleInput.focus();
    } else {
        toggleFormBtn.textContent = 'Додати оголошення';
    }
});

// Лічильник символів оновлюється на кожне натискання клавіші
descriptionInput.addEventListener('input', updateCounter);

// Заголовок не може складатися лише з пробілів
titleInput.addEventListener('input', () => {
    if (titleInput.value !== '' && titleInput.value.trim() === '') {
        titleInput.setCustomValidity('Заголовок не може складатися лише з пробілів');
    } else {
        titleInput.setCustomValidity('');
    }
});

// Надсилання форми: додаємо нове оголошення без перезавантаження сторінки
form.addEventListener('submit', event => {
    event.preventDefault();

    const newAd = {
        title: titleInput.value.trim(),
        category: categorySelect.value,
        description: descriptionInput.value.trim(),
        daysAgo: 0
    };

    userAds.push(newAd);
    renderAll();

    form.reset();
    updateCounter();
});

loadData();
