"use strict";
function showView(view) {
    const path = window.location.pathname;
    const isInsidePages = path.toLowerCase().includes('/pages/');
    if (view === 'menu') {
        if (isInsidePages) {
            window.location.href = '../../index.html';
        }
        else {
            window.location.href = 'index.html';
        }
    }
    else {
        const targetPath = view === 'Bloomery'
            ? 'bloomery/Bloomery.html'
            : `${view}/${view}.html`;
        if (isInsidePages) {
            window.location.href = '../' + targetPath;
        }
        else {
            window.location.href = 'pages/' + targetPath;
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menu-bloomery')?.addEventListener('click', () => showView('Bloomery'));
    document.getElementById('menu-alloys')?.addEventListener('click', () => showView('alloys'));
    document.getElementById('menu-forge')?.addEventListener('click', () => showView('forge'));
});
//# sourceMappingURL=routing.js.map