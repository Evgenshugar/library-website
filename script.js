// Данные библиотеки (в реальном проекте будут храниться на сервере)
let libraryData = {
    books: [
        {
            id: 1,
            title: "Властелин колец",
            description: "Эпическая сага о путешествии Фродо Бэггинса",
            cover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMDAyMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj48L3RleHQ+PC9zdmc+",
            chapters: [
                {
                    id: 1,
                    title: "Глава 1: Неожиданная вечеринка",
                    content: "<p>Бильбо Бэггинс готовился к своему 111-му дню рождения...</p><img src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzk5OTkiLz48L3N2Zz4=' alt='Иллюстрация' style='width: 200px;'>"
                }
            ]
        }
    ]
};

// Текущий режим (читатель/админ)
let currentMode = 'reader';
let currentBookId = null;
let currentChapterId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('admin.html')) {
        setupAdminPage();
    } else {
        setupReaderPage();
    }
});

// Настройка страницы для читателя
function setupReaderPage() {
    renderBookList();
    
    // Обработчики событий
    document.getElementById('adminLogin').addEventListener('click', showAdminLogin);
    document.getElementById('backToBooks').addEventListener('click', () => {
        showSection('bookList');
        currentBookId = null;
    });
    document.getElementById('backToChapters').addEventListener('click', () => {
        showSection('chapterList');
        currentChapterId = null;
    });
}

// Отрисовка списка книг
function renderBookList() {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';
    
    libraryData.books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p>${book.description}</p>
            </div>
        `;
        bookCard.addEventListener('click', () => showChapters(book.id));
        container.appendChild(bookCard);
    });
}

// Показать главы книги
function showChapters(bookId) {
    currentBookId = bookId;
    const book = libraryData.books.find(b => b.id === bookId);
    
    document.getElementById('currentBookTitle').textContent = book.title;
    document.getElementById('chaptersContainer').innerHTML = '';
    
    book.chapters.forEach(chapter => {
        const chapterItem = document.createElement('li');
        chapterItem.className = 'chapter-item';
        chapterItem.textContent = chapter.title;
        chapterItem.addEventListener('click', () => showChapterContent(chapter.id));
        document.getElementById('chaptersContainer').appendChild(chapterItem);
    });
    
    showSection('chapterList');
}

function showChapterContent(chapterId) {
    currentChapterId = chapterId;
    const book = libraryData.books.find(b => b.id === currentBookId);
    const chapter = book.chapters.find(c => c.id === chapterId);

    document.getElementById('currentChapterTitle').textContent = chapter.title;
    document.getElementById('contentDisplay').innerHTML = chapter.content;

    showSection('chapterContent');
}

// Показать указанный раздел
function showSection(sectionId) {
    // Сначала скрыть все секции
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    // Затем показать нужную
    document.getElementById(sectionId).classList.remove('hidden');
}

// Показ модального окна для входа админа
function showAdminLogin() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.innerHTML = `
        <div class="login-form">
            <h3>Вход для администратора</h3>
            <input type="password" id="adminPassword" class="login-input" placeholder="Введите пароль">
            <div id="loginError" class="login-error">Неверный пароль!</div>
            <button id="loginSubmit" class="btn">Войти</button>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('loginModal').style.display = 'flex';

    document.getElementById('loginSubmit').addEventListener('click', checkAdminPassword);
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkAdminPassword();
    });
}

// Проверка пароля админа
function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');

    if (password === 'PIRET') {
        // Успешный вход — перенаправление на админ-страницу
        window.location.href = 'admin.html';
    } else {
        errorElement.style.display = 'block';
    }
}

// Настройка страницы для администратора
function setupAdminPage() {
    renderAdminBooks();

    // Обработчики событий для админ-панели
    document.getElementById('logout').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    document.getElementById('addBookBtn').addEventListener('click', addBook);
    document.getElementById('backToAdminBooks').addEventListener('click', () => {
        showAdminSection('adminBooks');
        currentBookId = null;
    });
    document.getElementById('addChapterBtn').addEventListener('click', addChapter);
}

// Отрисовка списка книг в админ-панели
function renderAdminBooks() {
    const container = document.getElementById('adminBooksContainer');
    container.innerHTML = '';

    libraryData.books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'admin-book-item';
        bookItem.innerHTML = `
            <div>
                <h3>${book.title}</h3>
                <p>${book.description}</p>
            </div>
            <div class="book-actions">
                <button class="btn btn-edit" onclick="editBook(${book.id})">Редактировать</button>
                <button class="btn btn-delete" onclick="deleteBook(${book.id})">Удалить</button>
                <button class="btn" onclick="showAdminChapters(${book.id})">Главы</button>
            </div>
        `;
        container.appendChild(bookItem);
    });
}

// Показать главы книги в админ-панели
function showAdminChapters(bookId) {
    currentBookId = bookId;
    const book = libraryData.books.find(b => b.id === bookId);

    document.getElementById('adminCurrentBook').textContent = book.title;
    renderAdminChapters();
    showAdminSection('adminChapters');
}

// Отрисовка списка глав в админ-панели
function renderAdminChapters() {
    const container = document.getElementById('adminChaptersContainer');
    const book = libraryData.books.find(b => b.id === currentBookId);
    container.innerHTML = '';

    book.chapters.forEach(chapter => {
        const chapterItem = document.createElement('li');
        chapterItem.className = 'admin-chapter-item';
        chapterItem.innerHTML = `
            <div>
                <strong>${chapter.title}</strong>
            </div>
            <div class="chapter-actions">
                <button class="btn btn-edit" onclick="editChapter(${chapter.id})">Редактировать</button>
                <button class="btn btn-delete" onclick="deleteChapter(${chapter.id})">Удалить</button>
            </div>
        `;
        container.appendChild(chapterItem);
    });
}

// Добавление новой книги
function addBook() {
    const title = document.getElementById('newBookTitle').value;
    const description = document.getElementById('newBookDescription').value;
    const coverInput = document.getElementById('newBookCover');

    if (!title || !description || !coverInput.files.length) {
        alert('Заполните все поля и выберите обложку!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const newBook = {
            id: Date.now(),
            title: title,
            description: description,
            cover: e.target.result,
            chapters: []
        };
        libraryData.books.push(newBook);
        renderAdminBooks();
        // Очистка формы
        document.getElementById('newBookTitle').value = '';
        document.getElementById('newBookDescription').value = '';
        coverInput.value = '';
    };
    reader.readAsDataURL(coverInput.files[0]);
}

// Добавление новой главы
function addChapter() {
    const title = document.getElementById('newChapterTitle').value;
    const content = document.getElementById('newChapterContent').value;

    if (!title || !content) {
        alert('Заполните все поля!');
        return;
    }

    const book = libraryData.books.find(b => b.id === currentBookId);
    book.chapters.push({
        id: Date.now(),
        title: title,
        content: content
    });

    renderAdminChapters();
    // Очистка формы
    document.getElementById('newChapterTitle').value = '';
    document.getElementById('newChapterContent').value = '';
}

// Удаление книги
function deleteBook(bookId) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        libraryData.books = libraryData.books.filter(b => b.id !== bookId);
        renderAdminBooks();
    }
}

// Удаление главы
function deleteChapter(chapterId) {
    if (confirm('Вы уверены, что хотите удалить эту главу?')) {
        const book = libraryData.books.find(b => b.id === currentBookId);
        book.chapters = book.chapters.filter(c => c.id !== chapterId);
        renderAdminChapters();
    }
}

// Показать админ-секцию
function showAdminSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Заглушки для функций редактирования (можно доработать по необходимости)
function editBook(bookId) {
    alert('Функция редактирования книги будет реализована позже');
}

function editChapter(chapterId) {
    alert('Функция редактирования главы будет реализована позже');
}
