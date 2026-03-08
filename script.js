let currentUser = null;
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [];
let currentBookId = null;
let currentChapterId = null;

function loginAsReader() {
    currentUser = 'reader';
    showBooksScreen();
}

function showAdminLogin() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-login-screen').classList.remove('hidden');
}

function loginAsAdmin() {
    const password = document.getElementById('admin-password').value;
    if (password === 'PIRET') {
        currentUser = 'admin';
        showBooksScreen();
        document.getElementById('add-book-btn').classList.remove('hidden');
    } else {
        alert('Неверный пароль!');
    }
}

function logout() {
    currentUser = null;
    currentBookId = null;
    currentChapterId = null;

    document.getElementById('login-screen').classList.remove('hidden');
    hideAllScreens();
}

function goBackToLogin() {
    document.getElementById('admin-login-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function showBooksScreen() {
    hideAllScreens();
    document.getElementById('books-screen').classList.remove('hidden');
    renderBooks();
}

function renderBooks() {
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = '';

    books.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.onclick = () => showChaptersScreen(index);

        let coverHTML = '<div class="book-cover">Обложка отсутствует</div>';
        if (book.cover) {
            coverHTML = `<img src="${book.cover}" alt="${book.title}" class="book-cover">`;
        }

        bookCard.innerHTML = `
            ${coverHTML}
            <div class="book-title">${book.title}</div>
            ${book.description ? `<div class="book-description">${book.description}</div>` : ''}
        `;

        if (currentUser === 'admin') {
            const editButtons = document.createElement('div');
            editButtons.className = 'edit-buttons';
            editButtons.innerHTML = `
                <button onclick="editBook(${index}, event)">Редактировать</button>
                <button onclick="deleteBook(${index}, event)">Удалить</button>
            `;
            bookCard.appendChild(editButtons);
        }

        booksList.appendChild(bookCard);
    });
}

function showAddBookForm() {
    document.getElementById('add-book-form').classList.remove('hidden');
}

function hideAddBookForm() {
    document.getElementById('add-book-form').classList.add('hidden');
    document.getElementById('book-title').value = '';
    document.getElementById('book-description').value = '';
    document.getElementById('book-cover').value = '';
}

function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const description = document.getElementById('book-description').value.trim();
    const coverInput = document.getElementById('book-cover');

    if (!title) {
        alert('Введите название книги!');
        return;
    }

    let coverURL = '';
    if (coverInput.files && coverInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            coverURL = e.target.result;
            saveBookToStorage(title, description, coverURL);
            hideAddBookForm();
        };
        reader.readAsDataURL(coverInput.files[0]);
    } else {
        saveBookToStorage(title, description, coverURL);
        hideAddBookForm();
    }
}

function saveBookToStorage(title, description, coverURL) {
    const newBook = {
        title: title,
        description: description,
        cover: coverURL,
        chapters: []
    };
    books.push(newBook);
    saveToLocalStorage();
    renderBooks();
}

function editBook(bookIndex, event) {
    event.stopPropagation();
    const book = books[bookIndex];

    const newTitle = prompt('Введите новое название книги:', book.title);
    if (newTitle === null) return;

    const newDescription = prompt('Введите новое описание (оставьте пустым, если не нужно):', book.description || '');

    book.title = newTitle;
    book.description = newDescription;

    saveToLocalStorage();
    renderBooks();
}

function deleteBook(bookIndex, event) {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
        books.splice(bookIndex, 1);
        saveToLocalStorage();
        renderBooks();
    }
}

function showChaptersScreen(bookIndex) {
    currentBookId = bookIndex;
    hideAllScreens();
    document.getElementById('chapters-screen').classList.remove('hidden');

    const book = books[bookIndex];
    document.getElementById('current-book-title').textContent = book.title;

    const chaptersList = document.getElementById('chapters-list');
    chaptersList.innerHTML = '';

    book.chapters.forEach((chapter, index) => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.onclick = () => showChapterScreen(bookIndex, index);
        chapterItem.textContent = chapter.title;

        if (currentUser === 'admin') {
            const editButtons = document.createElement('div');
            editButtons.className = 'edit-buttons';
            editButtons.innerHTML = `
                <button onclick="editChapter(${bookIndex}, ${index}, event)">Редактировать</button>
                <button onclick="deleteChapter(${bookIndex}, ${index}, event)">Удалить</button>
            `;
            chapterItem.appendChild(editButtons);
        }

        chaptersList.appendChild(chapterItem);
    });

    if (currentUser === 'admin') {
        const addChapterBtn = document.createElement('button');
        addChapterBtn.textContent = 'Добавить главу';
        addChapterBtn.onclick = showAddChapterForm;
        chaptersList.appendChild(addChapterBtn);
    }
}

function showAddChapterForm() {
    document.getElementById('add-chapter-form').classList.remove('hidden');
}

function hideAddChapterForm() {
    document.getElementById('add-chapter-form').classList.add('hidden');
    document.getElementById('chapter-name').value = '';
    document.getElementById('chapter-content').value = '';
    document.getElementById('chapter-image').value = '';
}

function addChapter() {
    const title = document.getElementById('chapter-name').value.trim();
    const content = document.getElementById('chapter-content').value.trim();
    const imageInput = document.getElementById('chapter-image');

    if (!title || !content) {
        alert('Заполните название и текст главы!');
        return;
    }

    const chapterImages = [];
    if (imageInput.files) {
        Array.from(imageInput.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                chapterImages.push(e.target.result);
                if (chapterImages.length === imageInput.files.length) {
                    saveChapterToStorage(title, content, chapterImages);
                    hideAddChapterForm();
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        saveChapterToStorage(title, content, chapterImages);
        hideAddChapterForm();
    }
}

function saveChapterToStorage(title, content, images) {
    const newChapter = {
        title: title,
        content: content,
        images: images
    };

    books[currentBookId].chapters.push(newChapter);
    saveToLocalStorage();
    showChaptersScreen(currentBookId);
}

function editChapter(bookIndex, chapterIndex, event) {
    event.stopPropagation();
    const chapter = books[bookIndex].chapters[chapterIndex];

    const newTitle = prompt('Введите новое название главы:', chapter.title);
    if (newTitle === null) return;

    const newContent = prompt('Введите новый текст главы:', chapter.content);
    if (newContent === null) return;

    chapter.title = newTitle;
    chapter.content = newContent;

    saveToLocalStorage();
    showChaptersScreen(bookIndex);
}

function deleteChapter(bookIndex, chapterIndex, event) {
    event.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту главу?')) {
        books[bookIndex].chapters.splice(chapterIndex, 1);
        saveToLocalStorage();
        showChaptersScreen(bookIndex);
    }
}

function showChapterScreen(bookIndex, chapterIndex) {
    currentChapterId = chapterIndex;
    hideAllScreens();
    document.getElementById('chapter-screen').classList.remove('hidden');

    const book = books[bookIndex];
    const chapter = book.chapters[chapterIndex];

    document.getElementById('chapter-title').textContent = chapter.title;
    const contentDiv = document.getElementById('chapter-content');
    contentDiv.innerHTML = '';

    // Добавляем текст главы
    const textElement = document.createElement('div');
    textElement.textContent = chapter.content;
    contentDiv.appendChild(textElement);

    // Добавляем изображения, если есть
    if (chapter.images && chapter.images.length > 0) {
        chapter.images.forEach(imageURL => {
            const imgElement = document.createElement('img');
            imgElement.src = imageURL;
            imgElement.alt = 'Иллюстрация к главе';
            imgElement.className = 'chapter-image';
            contentDiv.appendChild(imgElement);
        });
    }
}

function backToChapters() {
    hideAllScreens();
    showChaptersScreen(currentBookId);
}

function backToBooks() {
    hideAllScreens();
    showBooksScreen();
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
}

function saveToLocalStorage() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Если есть сохранённые книги, загружаем их
    const savedBooks = localStorage.getItem('libraryBooks');
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    }

    // Показываем экран входа
    document.getElementById('login-screen').classList.remove('hidden');
});
