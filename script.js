/**
 * Man måste ju kunna skapa ny användare istället för att logga in
 * 
 */


const menuItems = [
    { name: 'Hem', view: 'view-introduction', roles: ['USER', 'ADMIN'] },
    { name: 'Bokning', view: 'view-booking', roles: ['USER', 'ADMIN'] },
    { name: 'Bilar', view: 'view-car', roles: ['USER', 'ADMIN'] },
    {
        name: 'Hantera Användare', view: 'view-user', roles: ['ADMIN'],
        subItems: [
            { name: 'Hämta alla', view: 'view-user-get-all', roles: ['ADMIN'] },
            { name: 'Hämta en', view: 'view-user-get-by-id', roles: ['ADMIN'] },
            { name: 'Uppdatera', view: 'view-user-update', roles: ['ADMIN'] },
            { name: 'Ny', view: 'view-user-new', roles: ['ADMIN'] },
            { name: 'ta bort', view: 'view-user-delete', roles: ['ADMIN'] }
        ]
    },
    { name: 'Logga in', view: 'view-login', roles: ['GUEST'] },
    { name: 'Logga ut', view: 'view-logout', roles: ['USER', 'ADMIN'] }
];

/**
 * Shows the main page and calls to show the menu for the correct user, or log in if no one is logged in.
 * @param {*} viewId viewId the id of the page to show
 * @returns -
 */
function showPage(viewId) {
    const allButtons = document.querySelectorAll('.sidebar button');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Hitta knappen som har rätt onclick-funktion och ge den klassen active
    allButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(viewId)) {
            btn.classList.add('active');
        }
    });

    const content = document.getElementById('content-area');

    switch (viewId) {
        case 'view-login':
            showLoginView();
            return;
        case 'view-introduction':
            content.innerHTML = `<h1>Hej användare med id: ${sessionStorage.getItem('userId')}</h1>`;
            break;
        case 'view-booking':
            content.innerHTML = `<h1>view-booking</h1>`;
            break;
        case 'view-car':
            content.innerHTML = `<h1>view-car</h1>`;
            break;
        case 'view-user-get-all':
            content.innerHTML = `<h1>view-user-get-all</h1>`;
            break;
        case 'view-user-get-by-id':
            content.innerHTML = `<h1>view-user-get-by-id</h1>`;
            break;
        case 'view-user-update':
            content.innerHTML = `<h1>view-user-update</h1>`;
            break;
        case 'view-user-new':
            content.innerHTML = `<h1>view-user-new</h1>`;
            break;
        case 'view-user-delete':
            content.innerHTML = `<h1>view-user-delete</h1>`;
            break;
        case 'view-logout':
            sessionStorage.clear();
            renderMenu('GUEST');
            showPage('view-login');
            break;
        default:
            content.innerHTML = `<h1>Sidan hittades inte</h1>`;
    }
    closeMobileMenu();
}
/**
 * Draws the menu for the user who is logged in (admin or user) if no one is logged in only 'Logga in' 
 * is shown in the menu
 * @param {*} userRole the role of the user who is logged in, or 'GUEST' if no one is logged in  
 */
function renderMenu(userRole) {
    const menuContainer = document.getElementById('main-menu');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        if (item.roles.includes(userRole)) {
            const li = document.createElement('li');

            const btn = document.createElement('button');
            btn.textContent = item.name;

            // KOLLA HÄR: Om det finns undermeny
            if (item.subItems) {
                // Istället för att byta sida, öppna/stäng undermenyn
                btn.onclick = (e) => {
                    // Vi växlar klassen 'open' på li-elementet
                    li.classList.toggle('open');
                };

                const subUl = document.createElement('ul');
                subUl.className = 'sub-menu';

                item.subItems.forEach(sub => {
                    const subLi = document.createElement('li');
                    const subBtn = document.createElement('button');
                    subBtn.textContent = sub.name;
                    subBtn.onclick = () => {
                        showPage(sub.view);
                        // Valfritt: stäng mobilmenyn här om du har en sådan
                    };
                    subLi.appendChild(subBtn);
                    subUl.appendChild(subLi);
                });
                li.appendChild(btn);
                li.appendChild(subUl);
            } else {
                // Vanlig knapp utan undermeny
                btn.onclick = () => showPage(item.view);
                li.appendChild(btn);
            }

            menuContainer.appendChild(li);
        }
    });
}

// Växla menyn på mobil
document.getElementById('menu-toggle').onclick = function () {
    document.querySelector('.sidebar').classList.toggle('mobile-open');
};

function closeMobileMenu() {
    document.querySelector('.sidebar').classList.remove('mobile-open');
}
function showLoginView() {
    const content = document.getElementById('content-area');

    content.innerHTML = `
        <div class="login-container">
            <h2>Logga in</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Användarnamn:</label>
                    <input type="text" id="username" required placeholder="admin eller user">
                </div>
                <div class="form-group">
                    <label for="password">Lösenord:</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn-primary">Logga in</button>
                <p id="login-error" style="color: red; display: none;">Fel användarnamn eller lösenord.</p>
            </form>
        </div>
    `;

    // Koppla ett event när man skickar formuläret
    document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault(); // Förhindra att sidan laddas om
        handleLogin();
    };
}
async function handleLogin() {
    const userVal = document.getElementById('username').value;
    const passVal = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        // Ersätt URL med din faktiska endpoint (t.ex. localhost:8080/api/v1/login)
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: userVal,
                password: passVal
            })
        });

        if (response.ok) {
            const userData = await response.json();
            sessionStorage.setItem('isLoggedIn', 'true');

            console.log("Inloggning lyckades!", userData);
            if (userData.isAdmin) {
                console.log("är admin");
                sessionStorage.setItem('userRole', 'ADMIN');
            } else if (!userData.isAdmin) {
                console.log("är inte admin");
                sessionStorage.setItem('userRole', 'USER');
            }
            sessionStorage.setItem('userId', userData.userId);
            console.log("user id: " + userData.userId);
            console.log(userData.username);
            // 1. Uppdatera menyn baserat på rollen vi fick tillbaka
            const roleToUse = userData.isAdmin ? 'ADMIN' : 'USER';
            renderMenu(roleToUse);

            // 2. Visa välkomstsidan
            showPage('view-introduction');

        } else {
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}
// Uppdatera din showPage-funktion så den anropar closeMobileMenu()
function initApp() {
    const savedRole = sessionStorage.getItem('userRole');
    if (!savedRole) {
        renderMenu('GUEST');
        showPage('view-login');
    } else {
        renderMenu(savedRole);
        showPage('view-introduction');
    }
}
initApp();
