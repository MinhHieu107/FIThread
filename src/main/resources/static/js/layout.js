function renderNav() {
    const token = localStorage.getItem("fithread_token");
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    nav.innerHTML = `
        <a href="/index.html"><strong>FIThread</strong></a>
        <a href="/courses.html">Môn học</a>
        <a href="/alumni.html">Alumni</a>
        <a href="/timeline.html">Dòng thời gian</a>
        <span style="flex:1"></span>
        ${token
            ? `<a href="#" id="logout-link">Đăng xuất</a>`
            : `<a href="/login.html">Đăng nhập</a>`}
    `;

    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("fithread_token");
            location.href = "/index.html";
        });
    }
}

document.addEventListener("DOMContentLoaded", renderNav);