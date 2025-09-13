// определение активной страницы
document.addEventListener('DOMContentLoaded', function() {
    setActiveNavLink();
});

function setActiveNavLink() {
    // Получаем текущий URL страницы
    const currentPage = window.location.pathname.split('/').pop();
    
    // Находим все навигационные ссылки
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Убираем активный класс у всех ссылок
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Добавляем активный класс к соответствующей ссылке
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        
        // Проверяем совпадение страниц
        if (linkPage === currentPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === 'index.html' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}