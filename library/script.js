// Глобальные переменные
let currentBook = null;
let currentChapter = null;
let currentPage = 1;
let pages = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', loadBooks);

// Загрузка списка книг
async function loadBooks() {
    try {
        // В реальном проекте здесь будет запрос к API или загрузка файлов
        // Для примера создадим тестовые данные
        const books = [
            { id: 1, filename: 'book1.json' },
            { id: 2, filename: 'book2.json' }
        ];

        const booksContainer = document.getElementById('books-container');
        booksContainer.innerHTML = '';

        for (const book of books) {
            const response = await fetch(`books/${book.filename}`);
            const bookData = await response.json();

            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${bookData.image}" alt="${bookData.title}" class="book-image">
                <div class="book-info">
                    <h3 class="book-title">${bookData.title}</h3>
                    <p>${bookData.description}</p>
                </div>
            `;
            bookCard.onclick = () => showChapters(bookData);
            booksContainer.appendChild(bookCard);
        }
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        document.getElementById('books-container').innerHTML =
            '<p>Ошибка загрузки книг. Проверьте подключение или файлы книг.</p>';
    }
}

// Показать список глав книги
function showChapters(book) {
    currentBook = book;
    document.getElementById('current-book-title').textContent = book.title;

    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';

    book.chapters.forEach((chapter, index) => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.textContent = chapter.title;
        chapterItem.onclick = () => showChapterText(chapter);
        chaptersContainer.appendChild(chapterItem);
    });

    showPage('chapter-list');
}

// Показать текст главы
function showChapterText(chapter) {
    currentChapter = chapter;
    currentPage = 1;

    // Разбиваем текст на страницы по ~350 слов
    pages = splitIntoPages(chapter.text, 350);

    document.getElementById('current-chapter-title').textContent = chapter.title;
    updateTextContent();
    showPage('text-page');
}

// Разбиение текста на страницы
function splitIntoPages(text, wordsPerPage) {
    const words = text.split(/\s+/);
    const pages = [];
    let currentPageWords = [];

    for (let i = 0; i < words.length; i++) {
        currentPageWords.push(words[i]);

        if (currentPageWords.length >= wordsPerPage &&
            (i + 1 === words.length || words[i + 1].match(/^[А-Яа-яА-Za-z]/) === null)) {
            // Добавляем текущую страницу в массив страниц
            pages.push(currentPageWords.join(' '));
            currentPageWords = []; // Очищаем массив для следующей страницы
        }
    }

    // Добавляем оставшиеся слова как последнюю страницу, если они есть
    if (currentPageWords.length > 0) {
        pages.push(currentPageWords.join(' '));
    }

    return pages;
}

// Обновление содержимого текста на текущей странице
function updateTextContent() {
    document.getElementById('text-content').textContent = pages[currentPage - 1];
    document.getElementById('page-info').textContent = `Страница ${currentPage} из ${pages.length}`;

    // Активируем/деактивируем кнопки навигации
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === pages.length;
}

// Переход на следующую страницу
function nextPage() {
    if (currentPage < pages.length) {
        currentPage++;
        updateTextContent();
    }
}

// Переход на предыдущую страницу
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updateTextContent();
    }
}

// Показать определённую страницу приложения
function showPage(pageId) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    // Показываем нужную страницу
    document.getElementById(pageId).classList.remove('hidden');
}

// Показать список книг
function showBookList() {
    showPage('book-list');
    currentBook = null;
    currentChapter = null;
}

// Показать список глав
function showChapterList() {
    showPage('chapter-list');
    currentChapter = null;
}
