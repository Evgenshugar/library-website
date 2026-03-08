let books = [];
let currentBook = null;
let currentChapter = null;
const ADMIN_PASSWORD = 'PIRET';

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    if (window.location.pathname.includes('admin.html')) {
        document.getElementById('admin-login').style.display = 'block';
    }
});

// Загрузка данных из localStorage
function loadData() {
    const savedBooks = localStorage.getItem('libraryBooks');
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    } else {
        // Начальные данные
        books = [
            {
                id: 1,
                title: 'Война и мир',
                description: 'Роман-эпопея Льва Толстого',
                cover: 'https://via.placeholder.com/100',
                chapters: [
                    { id: 1, title: 'Глава 1', content: 'Содержание первой главы...' },
                    { id: 2, title: 'Глава 2', content: 'Содержание второй главы...' }
                ]
            }
        ];
        saveData();
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Вход как читатель
function loginAsReader() {
    document.querySelector('.login-options').style.display = 'none';
    document.getElementById('reader-view').style.display = 'block';
    renderBooksList();
}

// Запрос пароля для админа
function promptAdminLogin() {
    window.location.href = 'admin.html';
}

function checkAdminPassword() {
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        renderBooksListAdmin();
    } else {
        alert('Неверный пароль!');
    }
}

// Отображение списка книг в админ-панели
function renderBooksListAdmin() {
    const booksList = document.getElementById('books-list-admin');
    booksList.innerHTML = '';
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="cover-img">
            <h3>${book.title}</h3>
            <p>${book.description}</p>
            <div class="action-buttons">
                <button onclick="editBook(${book.id})">Редактировать</button>
                <button onclick="deleteBook(${book.id})">Удалить</button>
                <button onclick="manageChapters(${book.id})">Главы</button>
            </div>
        `;
        booksList.appendChild(bookElement);
    });
}

// Показать форму добавления книги
function showAddBookForm() {
    document.getElementById('add-book-form').style.display = 'block';
}

// Скрыть форму добавления книги
function hideAddBookForm() {
    document.getElementById('add-book-form').style.display = 'none';
    document.getElementById('new-book-title').value = '';
    document.getElementById('new-book-description').value = '';
    document.getElementById('new-book-cover').value = '';
}

// Добавление новой книги
function addBook() {
    const title = document.getElementById('new-book-title').value;
    const description = document.getElementById('new-book-description').value;
    const coverInput = document.getElementById('new-book-cover');

    if (!title || !description) {
        alert('Заполните все поля!');
        return;
    }

    const newBook = {
        id: Date.now(),
        title: title,
        description: description,
        cover: coverInput.files.length > 0 ? URL.createObjectURL(coverInput.files[0]) : 'https://via.placeholder.com/100',
        chapters: []
    };

    books.push(newBook);
    saveData();
    hideAddBookForm();
    renderBooksListAdmin();
}

// Удаление книги
function deleteBook(bookId) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        books = books.filter(book => book.id !== bookId);
        saveData();
        renderBooksListAdmin();
    }
}

// Редактирование книги
function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    book.title = prompt('Введите новое название:', book.title) || book.title;
    book.description = prompt('Введите новое описание:', book.description) || book.description;

    // Для смены обложки можно добавить отдельный диалог
    const changeCover = confirm('Хотите сменить обложку?');
    if (changeCover) {
        const coverInput = document.createElement('input');
        coverInput.type = 'file';
        coverInput.accept = 'image/*';
        coverInput.onchange = function() {
            if (this.files.length > 0) {
                book.cover = URL.createObjectURL(this.files[0]);
                saveData();
                renderBooksListAdmin();
            }
        };
        coverInput.click();
    } else {
        saveData();
        renderBooksListAdmin();
    }
}

// Управление главами книги
function manageChapters(bookId) {
    currentBook = books.find(b => b.id === bookId);
    document.getElementById('books-management').style.display = 'none';
    document.getElementById('chapters-management').style.display = 'block';
    renderChaptersListAdmin();
}

// Отображение списка глав в админ-панели
function renderChaptersListAdmin() {
    const chaptersList = document.getElementById('chapters-list-admin');
    chaptersList.innerHTML = '';

    if (!currentBook || !currentBook.chapters) return;

    currentBook.chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.innerHTML = `
            <h4>${chapter.title}</h4>
            <div>${chapter.content}</div>
            <div class="action-buttons">
                <button onclick="editChapter(${chapter.id})">Редактировать</button>
                <button onclick="deleteChapter(${chapter.id})">Удалить</button>
            </div>
        `;
        chaptersList.appendChild(chapterElement);
    });
}

// Показать форму добавления главы
function showAddChapterForm() {
    document.getElementById('add-chapter-form').style.display = 'block';
}

// Скрыть форму добавления главы
function hideAddChapterForm() {
    document.getElementById('add-chapter-form').style.display = 'none';
    document.getElementById('new-chapter-title').value = '';
    document.getElementById('new-chapter-content').value = '';
}

// Добавление новой главы
function addChapter() {
    const title = document.getElementById('new-chapter-title').value;
    const content = document.getElementById('new-chapter-content').value;

    if (!title || !content) {
        alert('Заполните все поля!');
        return;
    }

    const newChapter = {
        id: Date.now(),
        title: title,
        content: content
    };

    if (!currentBook.chapters) currentBook.chapters = [];
    currentBook.chapters.push(newChapter);
    saveData();
    hideAddChapterForm();
    renderChaptersListAdmin();
}

// Удаление главы
function deleteChapter(chapterId) {
    if (confirm('Вы уверены, что хотите удалить эту главу?')) {
        currentBook.chapters = currentBook.chapters.filter(c => c.id !== chapterId);
        saveData();
        renderChaptersListAdmin();
    }
}

// Редактирование главы
function editChapter(chapterId) {
    const chapter = currentBook.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    chapter.title = prompt('Введите новое название главы:', chapter.title) || chapter.title;
    chapter.content = prompt('Введите новое содержимое главы:', chapter.content) || chapter.content;
    saveData();
    renderChaptersListAdmin();
}

// Возврат к списку книг из управления главами
function backToBooksList() {
    document.getElementById('chapters-management').style.display = 'none';
    document.getElementById('books-management').style.display = 'block';
    currentBook = null;
}

// Функции для читательского режима
function renderBooksList() {
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = '';
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="cover-img">
            <h3>${book.title}</h3>
            <p>${book.description}</p>
        `;
        bookElement.onclick = () => selectBook(book);
        booksList.appendChild(bookElement);
    });
}

function selectBook(book) {
    currentBook = book;
    document.getElementById('books-list').style.display = 'none';
    document.getElementById('book-content').style.display = 'block';
    renderChaptersList();
}

function renderChaptersList() {
    const chaptersList = document.getElementById('chapters-list');
    chaptersList.innerHTML = '<h2>Главы:</h2>';
    currentBook.chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.textContent = chapter.title;
        chapterElement.onclick = () => selectChapter(chapter);
        chaptersList.appendChild(chapterElement);
    });
}

// Выбор главы для отображения содержимого
function selectChapter(chapter) {
    currentChapter = chapter;
    document.getElementById('chapter-content').innerHTML = `
        <h2>${chapter.title}</h2>
        <div>${chapter.content}</div>
        <button onclick="backToChaptersList()">Назад к списку глав</button>
    `;
}

// Возврат к списку глав из просмотра содержимого главы
function backToChaptersList() {
    document.getElementById('chapter-content').innerHTML = '';
    document.getElementById('chapters-list').style.display = 'block';
}

// Возврат к списку книг из просмотра глав
function backToBooksListReader() {
    currentBook = null;
    currentChapter = null;
    document.getElementById('book-content').style.display = 'none';
    document.getElementById('books-list').style.display = 'block';
    renderBooksList();
}

// Кнопка «Назад к списку книг» в читательском режиме
function addBackToBooksButton() {
    const chapterContent = document.getElementById('chapter-content');
    const backButton = document.createElement('button');
    backButton.textContent = 'Назад к списку книг';
    backButton.onclick = backToBooksListReader;
    chapterContent.appendChild(backButton);
}

// Обработка навигации в читательском режиме — добавляем кнопку «Назад» после отображения главы
function selectChapter(chapter) {
    currentChapter = chapter;
    const chapterContentDiv = document.getElementById('chapter-content');

    chapterContentDiv.innerHTML = `
        <h2>${chapter.title}</h2>
        <div>${chapter.content}</div>
    `;

    // Добавляем кнопки навигации
    const navigationButtons = document.createElement('div');
    navigationButtons.className = 'action-buttons';
    navigationButtons.innerHTML = `
        <button onclick="backToChaptersList()">Назад к списку глав</button>
        <button onclick="backToBooksListReader()">Назад к списку книг</button>
    `;
    chapterContentDiv.appendChild(navigationButtons);
}
