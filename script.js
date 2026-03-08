// Данные приложения
let books = [
    {
        id: 1,
        title: "Мастер и Маргарита",
        description: "Роман Михаила Булгакова",
        cover: "https://via.placeholder.com/300x400/1e1e1e/ffffff?text=Мастер+и+Маргарита",
        chapters: [
            {
                id: 1,
                title: "Глава 1: Никогда не разговаривайте с незнакомцами",
                text: "Однажды весною, в час небывало жаркого заката, в Москве, на Патриарших прудах, появились два гражданина...",
                images: []
            }
        ]
    }
];

let currentUser = null;
let currentBook = null;

// Элементы DOM
const loginScreen = document.getElementById('loginScreen');
const passwordScreen = document.getElementById('passwordScreen');
const libraryScreen = document.getElementById('libraryScreen');
const booksList = document.getElementById('booksList');
const chaptersList = document.getElementById('chaptersList');
const chapterContent = document.getElementById('chapterContent');
const userRole = document.getElementById('userRole');

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Кнопки входа
    document.getElementById('readerBtn').addEventListener('click', () => loginAsReader());
    document.getElementById('adminBtn').addEventListener('click', () => showPasswordScreen());
    document.getElementById('submitPassword').addEventListener('click', validatePassword);
    document.getElementById('backToLogin').addEventListener('click', () => goToLogin());
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Навигация
    document.getElementById('backToBooks').addEventListener('click', showBooksList);
    document.getElementById('backToChapters').addEventListener('click', showChaptersList);

    // Административные функции
    document.getElementById('addBookBtn').addEventListener('click', () => showAddBookModal());
    document.getElementById('addChapterBtn').addEventListener('click', () => showAddChapterModal());

    // Модальные окна
    document.querySelector('.close').addEventListener('click', closeAllModals);
    window.addEventListener('click', clickOutsideModal);

    // Формы
    document.getElementById('addBookForm').addEventListener('submit', addBook);
    document.getElementById('addChapterForm').addEventListener('submit', addChapter);

    renderBooks();
});

// Функции аутентификации
function loginAsReader() {
    currentUser = 'reader';
    userRole.textContent = 'Читатель';
    showLibrary();
}

function showPasswordScreen() {
    loginScreen.classList.add('hidden');
    passwordScreen.classList.remove('hidden');
}

function validatePassword() {
    const password = document.getElementById('passwordInput').value;
    if (password === 'PIRET') {
        currentUser = 'admin';
        userRole.textContent = 'Администратор';
        showLibrary();
        document.getElementById('addBookBtn').classList.remove('hidden');
    } else {
        alert('Неверный пароль!');
    }
}

function logout() {
    currentUser = null;
    currentBook = null;
    goToLogin();
}

// Навигация по интерфейсу
function showLibrary() {
    loginScreen.classList.add('hidden');
    passwordScreen.classList.add('hidden');
    libraryScreen.classList.remove('hidden');
}

function goToLogin() {
    passwordScreen.classList.add('hidden');
    libraryScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
}

function renderBooks() {
    booksList.innerHTML = '';
    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
            </div>
        `;
        bookElement.addEventListener('click', () => openBook(book));
        booksList.appendChild(bookElement);
    });

    // Кнопка добавления книги для администратора
    if (currentUser === 'admin') {
        const addBookBtn = document.createElement('button');
        addBookBtn.id = 'addBookBtn';
        addBookBtn.className = 'btn btn-admin';
        addBookBtn.textContent = 'Добавить книгу';
        addBookBtn.addEventListener('click', () => showAddBookModal());
        booksList.appendChild(addBookBtn);
    }
}

function openBook(book) {
    currentBook = book;
    document.getElementById('currentBookTitle').textContent = book.title;
    renderChapters();
    showChaptersList();
}

function renderChapters() {
    const chaptersContainer = document.getElementById('chaptersContainer');
    chaptersContainer.innerHTML = '';
    currentBook.chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-item';
        chapterElement.textContent = chapter.title;
        chapterElement.addEventListener('click', () => openChapter(chapter));

        // Если пользователь — администратор, добавляем кнопки управления
        if (currentUser === 'admin') {
            const adminControls = document.createElement('div');
            adminControls.style.display = 'flex';
            adminControls.style.gap = '10px';
            adminControls.style.marginTop = '10px';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'btn btn-admin btn-small';
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                editChapter(chapter);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'btn btn-danger btn-small';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteChapter(chapter.id);
            });

            adminControls.appendChild(editBtn);
            adminControls.appendChild(deleteBtn);
            chapterElement.appendChild(adminControls);
        }

        chaptersContainer.appendChild(chapterElement);
    });

    // Кнопка добавления главы для администратора
    if (currentUser === 'admin') {
        document.getElementById('addChapterBtn').classList.remove('hidden');
    } else {
        document.getElementById('addChapterBtn').classList.add('hidden');
    }
}

function openChapter(chapter) {
    document.getElementById('chapterTitle').textContent = chapter.title;
    document.getElementById('contentText').textContent = chapter.text;

    const contentImages = document.getElementById('contentImages');
    contentImages.innerHTML = '';

    chapter.images.forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = 'Иллюстрация к главе';
        img.className = 'content-image';
        contentImages.appendChild(img);
    });

    // Показываем/скрываем кнопки администратора
    if (currentUser === 'admin') {
        document.getElementById('editChapterBtn').classList.remove('hidden');
        document.getElementById('deleteChapterBtn').classList.remove('hidden');

        // Настраиваем обработчики для кнопок главы
        document.getElementById('editChapterBtn').onclick = () => editChapter(chapter);
        document.getElementById('deleteChapterBtn').onclick = () => deleteChapter(chapter.id);
    } else {
        document.getElementById('editChapterBtn').classList.add('hidden');
        document.getElementById('deleteChapterBtn').classList.add('hidden');
    }

    showChapterContent();
}

// Функции для администратора
function showAddBookModal() {
    document.getElementById('addBookModal').classList.remove('hidden');
}

function showAddChapterModal() {
    document.getElementById('addChapterModal').classList.remove('hidden');
}

function addBook(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const description = document.getElementById('bookDescription').value;
    const coverInput = document.getElementById('bookCover');

    let coverUrl = 'https://via.placeholder.com/300x400/1e1e1e/ffffff?text=' + encodeURIComponent(title);

    if (coverInput.files && coverInput.files[0]) {
        // В реальном приложении здесь была бы загрузка файла
        coverUrl = URL.createObjectURL(coverInput.files[0]);
    }

    const newBook = {
        id: Date.now(),
        title: title,
        description: description,
        cover: coverUrl,
        chapters: []
    };

    books.push(newBook);
    closeAllModals();
    renderBooks();
}

function addChapter(e) {
    e.preventDefault();
    const title = document.getElementById('chapterTitle').value;
    const text = document.getElementById('chapterText').value;
    const imagesInput = document.getElementById('chapterImages');

    const images = [];
    if (imagesInput.files) {
        for (let file of imagesInput.files) {
            images.push(URL.createObjectURL(file));
        }
    }

    const newChapter = {
        id: Date.now(),
        title: title,
        text: text,
        images: images
    };

    currentBook.chapters.push(newChapter);
    closeAllModals();
    renderChapters();
}

function editChapter(chapter) {
    // В реальном приложении здесь был бы модальный диалог редактирования
    const newText = prompt('Введите новый текст главы:', chapter.text);
    if (newText !== null) {
        chapter.text = newText;
        openChapter(chapter); // Обновляем отображение
    }
}

function deleteChapter(chapterId) {
    if (confirm('Вы уверены, что хотите удалить эту главу?')) {
        currentBook.chapters = currentBook.chapters.filter(ch => ch.id !== chapterId);
        renderChapters();
    }
}

// Вспомогательные функции навигации
function showBooksList() {
    chaptersList.classList.add('hidden');
    chapterContent.classList.add('hidden');
    booksList.parentElement.classList.remove('hidden');
}

function showChaptersList() {
    booksList.parentElement.classList.add('hidden');
    chapterContent.classList.add('hidden');
    chaptersList.classList.remove('hidden');
}

function showChapterContent() {
    chaptersList.classList.add('hidden');
    booksList.parentElement.classList.add('hidden');
    chapterContent.classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    // Очищаем формы
    document.getElementById('addBookForm').reset();
    document.getElementById('addChapterForm').reset();
}

function clickOutsideModal(e) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (e.target === modal) {
            closeAllModals();
        }
    });
}
