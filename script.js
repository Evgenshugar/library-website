// Данные библиотеки (в реальном проекте будут загружаться с сервера)
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
    {
        id: 1,
        title: 'Властелин колец',
        description: 'Эпическая сага о приключениях в Средиземье',
        cover: 'https://via.placeholder.com/80x120/2d2d2d/bb86fc?text=ВК',
        chapters: [
            {
                id: 1,
                title: 'Глава 1: Совет Элронда',
                content: 'В Ривенделле собрался совет... <img src="https://via.placeholder.com/400x200/2d2d2d/bb86fc?text=Карта+Средиземья" alt="Карта Средиземья">'
            },
            {
                id: 2,
                title: 'Глава 2: Братство кольца',
                content: 'Отряд отправился в путь...'
            }
        ]
    }
];

const ADMIN_PASSWORD = 'PIRET';

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
});

// Функции входа
function loginAsReader() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('reader-screen').classList.remove('hidden');
}

function showAdminLogin() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-login-screen').classList.remove('hidden');
}

function loginAsAdmin() {
    const password = document.getElementById('admin-password').value;
    if (password === ADMIN_PASSWORD) {
        window.location.href = 'admin.html';
    } else {
        alert('Неверный пароль!');
    }
}

function backToLogin() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// Читательские функции
function loadBooks() {
    const container = document.getElementById('books-container');
    container.innerHTML = '';
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card fade-in';
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
            </div>
        `;
        bookCard.onclick = () => showChapters(book);
        container.appendChild(bookCard);
    });
}

function showChapters(book) {
    document.getElementById('books-container').classList.add('hidden');
    document.getElementById('chapters-screen').classList.remove('hidden');
    document.getElementById('current-book-title').textContent = book.title;
    
    const chaptersContainer = document.getElementById('chapters-container');
    chaptersContainer.innerHTML = '';
    book.chapters.forEach(chapter => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item fade-in';
        chapterItem.textContent = chapter.title;
        chapterItem.onclick = () => showChapterContent(chapter);
        chaptersContainer.appendChild(chapterItem);
    });
}

function showChapterContent(chapter) {
    document.getElementById('chapters-screen').classList.add('hidden');
    document.getElementById('chapter-content').classList.remove('hidden');
    document.getElementById('current-chapter-title').textContent = chapter.title;
    document.getElementById('content-display').innerHTML = chapter.content;
}

function backToBooks() {
    document.getElementById('chapters-screen').classList.add('hidden');
    document.getElementById('books-container').classList.remove('hidden');
}

function backToChapters() {
    document.getElementById('chapter-content').classList.add('hidden');
    document.getElementById('chapters-screen').classList.remove('hidden');
}

// Сохранение данных
function saveBooks() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Админские функции (будут в admin.html)
function loadAdminBooks() {
    const container = document.getElementById('admin-books-container');
    container.innerHTML = '';
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3>${book.title}</h3>
                <p>${book.description}</p>
                <div class="admin-actions">
                    <button class="btn-edit" onclick="editBook(${book.id})">Редактировать</button>
                    <button class="btn-delete" onclick="deleteBook(${book.id})">Удалить</button>
                    <button class="btn" onclick="showAdminChapters(${book.id})">Главы</button>
                </div>
            </div>
        `;
        container.appendChild(bookElement);
    });
}

function addBook() {
    const title = document.getElementById('new-book-title').value;
    const description = document.getElementById('new-book-description').value;
    const coverInput = document.getElementById('new-book-cover');
    
    if (!title || !description) {
        alert('Заполните все поля!');
        return;
    }
    
    // Обработка обложки
    let coverUrl = 'https://via.placeholder.com/80x120/2d2d2d/bb86fc?text=' + encodeURIComponent(title.substring(0, 3));
    
    if (coverInput.files && coverInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverUrl = e.target.result;
            saveNewBook(title, description, coverUrl);
        };
        reader.readAsDataURL(coverInput.files[0]);
    } else {
        saveNewBook(title, description, coverUrl);
    }
}

function saveNewBook(title, description, coverUrl) {
    const newBook = {
        id: Date.now(), // Уникальный ID на основе времени
        title: title,
        description: description,
        cover: coverUrl,
        chapters: []
    };
    
    books.push(newBook);
    saveBooks();
    loadAdminBooks();
    
    // Очистка формы
    document.getElementById('new-book-title').value = '';
    document.getElementById('new-book-description').value = '';
    document.getElementById('new-book-cover').value = '';
}

function deleteBook(bookId) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        books = books.filter(book => book.id !== bookId);
        saveBooks();
        loadAdminBooks();
    }
}

function editBook(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const newTitle = prompt('Введите новое название:', book.title);
    const newDescription = prompt('Введите новое описание:', book.description);
    
    if (newTitle !== null && newDescription !== null) {
        book.title = newTitle;
        book.description = newDescription;
        saveBooks();
        loadAdminBooks();
    }
}

function showAdminChapters(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    document.getElementById('admin-books-container').classList.add('hidden');
    document.getElementById('chapters-management').classList.remove('hidden');
    document.getElementById('admin-current-book').textContent = book.title;
    
    const chaptersContainer = document.getElementById('admin-chapters-container');
    chaptersContainer.innerHTML = '';
    
    book.chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.innerHTML = `
            <h4>${chapter.title}</h4>
            <div class="admin-actions">
                <button class="btn-edit" onclick="editChapter(${bookId}, ${chapter.id})">Редактировать</button>
                <button class="btn-delete" onclick="deleteChapter(${bookId}, ${chapter.id})">Удалить</button>
            </div>
        `;
        chaptersContainer.appendChild(chapterElement);
    });
}

function backToBooksAdmin() {
    document.getElementById('chapters-management').classList.add('hidden');
    document.getElementById('admin-books-container').classList.remove('hidden');
}

function addChapter() {
    const bookId = parseInt(window.location.hash.replace('#book-', ''));
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
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
    
    book.chapters.push(newChapter);
    saveBooks();
    showAdminChapters(bookId);
    
    // Очистка формы
    document.getElementById('new-chapter-title').value = '';
    document.getElementById('new-chapter-content').value = '';
}

function deleteChapter(bookId, chapterId) {
    if (confirm('Вы уверены, что хотите удалить эту главу?')) {
        const book = books.find(b => b.id === bookId);
        if (book) {
            book.chapters = book.chapters.filter(c => c.id !== chapterId);
            saveBooks();
            showAdminChapters(bookId);
        }
    }
}

function editChapter(bookId, chapterId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const chapter = book.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const newTitle = prompt('Введите новое название главы:', chapter.title);
    const newContent = prompt('Введите новый текст главы:', chapter.content);
    
    if (newTitle !== null && newContent !== null) {
        chapter.title = newTitle;
        chapter.content = newContent;
        saveBooks();
        showAdminChapters(bookId);
    }
}

function logout() {
    window.location.href = 'index.html';
}

// Загрузка книг при открытии админ-панели
if (window.location.pathname.endsWith('admin.html')) {
    document.addEventListener('DOMContentLoaded', loadAdminBooks);
}
