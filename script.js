/*
Får jag tillbaka carId så jag kan visa bara den bilen och inte listan
avbryt eller gå tillbaka om man klickat på bil
om man är inloggad som user och klickar på tillbaka till listan efter att ha uppdaterat sin profil så får man se listan, det ska man INTE!
 */
const urlLogin = 'http://localhost:8080/api/v1/auth/login';
const urlCars = 'http://localhost:8080/api/v1/cars';
const urlUsers = 'http://localhost:8080/api/v1/users';
const urlBookings = 'http://localhost:8080/api/v1/bookings';
/* ==========================================================================
   CONFIG & MENU DEFINITIONS
   ========================================================================== */

const menuItems = [
    { name: 'Bilar', view: 'view-cars', roles: ['USER', 'ADMIN', 'GUEST'] },
    { name: 'Ny bil', view: 'view-car-new', roles: ['ADMIN'] },
    { name: 'Användare', view: 'view-users', roles: ['ADMIN'] },
    { name: 'Ny användare', view: 'view-user-new', roles: ['ADMIN'] },
    { name: 'Logga in', view: 'view-login', roles: ['GUEST'] },
    { name: 'Ny användare', view: 'view-user-new', roles: ['GUEST'] },
    { name: 'Min profil', view: 'view-profile', roles: ['USER', 'ADMIN'] },
    { name: 'Logga ut', view: 'view-logout', roles: ['USER', 'ADMIN'] }
];

/* ==========================================================================
   1. API / FETCH FUNCTIONS (Enbart kommunikation med din Spring Boot backend)
   ========================================================================== */

async function apiGetCars() {
    console.log('!!!!!! apiGetCars !!!!!!');
    try {
        const response = await fetch(`${urlCars}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
    }
}

async function apiGetCarById(carId) {
    console.log(`!!!!!! apiGetCarById(${carId}) !!!!!!`);
    try {
        const response = await fetch(`${urlCars}/${carId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Bil med id ${carId} hittades inte.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
    }
}

async function apiGetBookingsByUserId(userId) {
    console.log(`!!!!!! apiGetBookingsByUserId(${userId}) !!!!!!`);
    try {
        const response = await fetch(`${urlBookings}/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Bokningar för användare med id ${userId} hittades inte.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
    }
}

async function apiGetUsers() {
    console.log('!!!!!! apiGetUsers !!!!!!');
    try {
        const response = await fetch(`${urlUsers}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
    }
}

async function apiGetUserById(userId) {
    console.log(`!!!!!! apiGetUserById(${userId}) !!!!!!`);
    try {
        const response = await fetch(`${urlUsers}/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
    }
}

async function apiLogin(username, password) {
    console.log('!!!!!! apiLogin !!!!!!');
    try {
        const response = await fetch(`${urlLogin}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        console.log(response);
        const basicAuthString = 'Basic ' + btoa(username + ':' + password);
        sessionStorage.setItem('basicAuth', basicAuthString);
        return response;
    } catch (error) {
        console.error("Nätverksfel vid inloggning:", error);
        return null;
    }
}
async function apiCreateUser(userData) {
    console.log('!!!!!! apiCreateUser !!!!!!');
    try {
        const response = await fetch(`${urlUsers}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiCreateUser:", error);
        return null;
    }
}
async function apiUpdateUser(userId, userData) {
    console.log(`!!!!!! apiUpdateUser(${userId}) !!!!!!`);
    try {
        const response = await fetch(`${urlUsers}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            },
            body: JSON.stringify(userData)
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiUpdateUser:", error);
        return null;
    }
}

async function apiUpdateCar(carId, carData) {
    console.log(`!!!!!! apiUpdateCar(${carId}) !!!!!!`);
    try {
        const response = await fetch(`${urlCars}/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            },
            body: JSON.stringify(carData)
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiUpdateCar:", error);
        return null;
    }
}
async function apiDeleteUser(userId) {
    try {
        const response = await fetch(`${urlUsers}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            },

        });
        return response;
    } catch (error) {
        console.error("Nätverksfel:", error);
    }
}

async function apiCreateCar(formData) {
    console.log('!!!!!! apiCreateCar !!!!!!');
    try {
        const response = await fetch(`${urlCars}`, {
            method: 'POST',
            headers: { 'Authorization': sessionStorage.getItem('basicAuth') },
            body: formData
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel i apiCreateCar:", error);
        return null;
    }
}

async function apiDeleteCar(carId) {
    try {
        const response = await fetch(`${urlCars}/${carId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel:", error);
    }
}

async function apiReturnCar(carId) {
    /*try {
        const response = await fetch(`${urlCars}/${carId}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth') }
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel:", error);
    }*/
}

async function apiCreateBooking(startDate, endDate, carId, userId) {
    console.log('!!!!!! apiCreateBooking !!!!!!');
    const bookingData = {
        fromDate: startDate,
        toDate: endDate,
        userId: parseInt(userId),
        carId: parseInt(carId)
    };

    try {
        const response = await fetch(`${urlBookings}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            },
            body: JSON.stringify(bookingData)
        });
        console.log(response);
        if (response.status === 403) {
            // Vi läser ut texten ur 403-felet för att se om Spring Security förklarar sig!
            const errorText = await response.text();
            console.error("--- 403 FORBIDDEN DETALJER ---");
            console.error(errorText);
            alert("Hoppsan! Backend nekar oss tillträde (403 Forbidden).");
        }
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiCreateBooking:", error);
        return null;
    }
}
/* ==========================================================================
   2. UTILITIES
   ========================================================================== */

async function updateUserSession(userId) {
    console.log('!!!!!! updateUserSession !!!!!!');
    const user = await apiGetUserById(userId);
    if (user) {
        sessionStorage.setItem('firstName', user.firstName);
        sessionStorage.setItem('lastName', user.lastName);
        sessionStorage.setItem('phone', user.phone);
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('noOfOrders', user.noOfOrders);
    }
}
function customAlert(message, type = 'positive') {
    console.log(`!!!!!! customAlert modal: ${message} (${type}) !!!!!!`);

    // 1. Skapa overlay (mörka/suddiga bakgrunden)
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show'; // Vi ger den 'show' direkt så den tonar in

    // Bestäm färg på OK-knappen baserat på om det är ett fel (negative) eller framgång (positive)
    const btnClass = type === 'negative' ? 'btn-negative' : 'btn-positive';

    // 2. Bygg strukturen för modalen inuti overlayen
    overlay.innerHTML = `
        <div class="modal-content text-alert">
            <div class="alert-icon-wrapper ${type}">
                ${type === 'positive' ? '✓' : '✕'}
            </div>
            <p class="modal-message">${message}</p>
            <div class="modal-buttons">
                <button class="btn ${btnClass}" id="custom-alert-ok-btn">OK</button>
            </div>
        </div>
    `;

    // 3. Tryck ut den på skärmen (längst ner i body)
    document.body.appendChild(overlay);

    // 4. Gör så att OK-knappen stänger och raderar modalen helt ur DOM:en
    document.getElementById('custom-alert-ok-btn').onclick = function () {
        overlay.classList.remove('show'); // Starta uttoningsanimationen
        setTimeout(() => overlay.remove(), 300); // Ta bort från HTML när animationen är klar
    };
}
// ÄNDRAT HÄR: Vi tar emot 'onConfirm' som ett argument
function customConfirm(message, onConfirm) {
    console.log(`!!!!!! customConfirm modal: ${message} !!!!!!`);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';

    overlay.innerHTML = `
        <div class="modal-content text-alert">
            <div class="alert-icon-wrapper warning">⚠️</div>
            <p class="modal-message">${message}</p>
            <div class="modal-buttons" style="gap: 15px;">
                <button class="btn btn-standard" id="custom-confirm-cancel-btn">Avbryt</button>
                <button class="btn btn-negative" id="custom-confirm-ok-btn">Ja, ta bort</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Om användaren klickar på "Ja, ta bort"
    document.getElementById('custom-confirm-ok-btn').onclick = function () {
        overlay.classList.remove('show');
        overlay.remove();

        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    };

    // Om användaren klickar på Avbryt
    document.getElementById('custom-confirm-cancel-btn').onclick = function () {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
}

/**
 * Generell funktion för att sortera en array av objekt baserat på en kolumn.
 */
function sortData(array, column, isAscending) {
    // Vi returnerar en sorterad KOPIA av arrayen för att inte störa originaldata i onödan
    return [...array].sort((a, b) => {
        let valA = a[column];
        let valB = b[column];
        if (column === 'name') {
            valA = `${a.firstName} ${a.lastName}`;
            valB = `${b.firstName} ${b.lastName}`;
        }
        // Om det är en Java LocalDate-array [2026, 5, 21], gör om till sträng för jämförelse
        if (Array.isArray(valA)) valA = valA.join('-');
        if (Array.isArray(valB)) valB = valB.join('-');

        // 1. Sortering för siffror och booleans (id, active, carId)
        if (typeof valA === 'number' || typeof valA === 'boolean') {
            return isAscending ? valA - valB : valB - valA;
        }

        // 2. Sortering för text/strängar (eller datumsträngar)
        valA = valA ? valA.toString() : '';
        valB = valB ? valB.toString() : '';

        return isAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
}

/* ==========================================================================
   2. RENDER FUNCTIONS (Bygger HTML och ritar ut på skärmen)
   ========================================================================== */

function renderMenu(userRole) {
    console.log('!!!!!! renderMenu !!!!!!');
    const menuContainer = document.getElementById('main-menu');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        if (item.roles.includes(userRole)) {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.textContent = item.name;
            btn.onclick = () => showPage(item.view);
            li.appendChild(btn);
            menuContainer.appendChild(li);
        }
    });
}

function showPage(viewId) {
    console.log(`!!!!!! showPage(${viewId}) !!!!!!`);
    const allButtons = document.querySelectorAll('.sidebar button');
    allButtons.forEach(btn => btn.classList.remove('active'));

    allButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(viewId)) {
            btn.classList.add('active');
        }
    });

    const content = document.getElementById('content-area');

    switch (viewId) {
        case 'view-login':
            renderLoginView();
            return;
        case 'view-cars':
            renderCarList();
            break;
        case 'view-car-new':
            renderNewCarView();
            break;
        case 'view-users':
            content.innerHTML = `<h1>Användarlista</h1>`;
            apiGetUsers().then(users => renderUserTable(users));
            break;
        case 'view-user-new':
            renderNewUserView();
            break;
        case 'view-profile':
            renderUserProfile(sessionStorage.getItem('userId'));
            break;
        case 'view-logout':
            sessionStorage.clear();
            sessionStorage.setItem('userRole', 'GUEST');
            renderMenu('GUEST');
            showPage('view-login');
            break;
        default:
            content.innerHTML = `<h1>Sidan hittades inte</h1>`;
    }
    closeMobileMenu();
}

function renderLoginView() {
    console.log('!!!!!! renderLoginView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="login-container">
            <h2>Logga in</h2>
            <form id="login-form">
                <div class="form-group">
                    <label for="username">Användarnamn:</label>
                    <input type="text" id="username" placeholder="admin eller user" required>
                </div>
                <div class="form-group">
                    <label for="password">Lösenord:</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit" class="btn btn-standard">Logga in</button>
                <p id="login-error" style="color: red; display: none;">Fel användarnamn eller lösenord.</p>
            </form>
        </div>
    `;

    document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault();
        handleLoginSubmit();
    };
}

function renderNewUserView() {
    console.log('!!!!!! renderNewUserView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class="new-user-container">
            <h2>Ny användare</h2>
            <form id="new-user-form">
                <div class="form-group">
                    <label for="firstName">Förnamn:</label>
                    <input type="text" id="firstName" placeholder="Anna" required>
                    <label for="lastName">Efternamn:</label>
                    <input type="text" id="lastName" placeholder="Andersson" required>
                    <label for="phone">Telefonnummer:</label>
                    <input type="text" id="phone" placeholder="070-1234567" required>
                    <label for="email">Email:</label>
                    <input type="email" id="email" placeholder="anna@email.se" required>
                </div>
                <div class="form-group">
                    <label for="password">Lösenord:</label>
                    <input type="password" id="password" minlength='4' required>
                    <label for="password2">Repetera lösenord:</label>
                    <input type="password" id="password2" minlength='4' required>
                </div>
                <button type="button" id='btn-cancel' class="btn btn-standard">Avbryt</button>
                <button type="submit" class="btn btn-standard">Skapa</button>
                <p id="login-error" style="color: red; display: none;">Kunde inte skapa konto.</p>
            </form>
        </div>
    `;

    document.getElementById('new-user-form').onsubmit = function (e) {
        e.preventDefault();
        handleCreateUserSubmit();
    };

    document.getElementById('btn-cancel').addEventListener('click', () => {
        showPage('view-cars');
    });

}
async function renderCarList() {
    console.log('!!!!!! renderCarList !!!!!!');
    const content = document.getElementById('content-area');

    // 1. Hämta bilarna från API
    const cars = await apiGetCars();

    if (!cars || cars.length === 0) {
        content.innerHTML = '<p>Inga bilar hittades.</p>';
        return;
    }

    // 2. Skapa bas-strukturen för sidan med sorterings-dropdownen
    content.innerHTML = `
        <p>Rödmarkerade bilar är redan uthyrda, gröna är lediga för bokning.</p>    
        <div class="filter-bar">
            <label for="car-sort">Sortera bilar efter:</label>
            <select id="car-sort" class="form-control">
                <option value="default">Välj...</option>
                <option value="name">Namn (A-Ö)</option>
                <option value="type">Typ / Kategori</option>
            </select>
            
        </div>
        <ul id="car-list" class="cars-grid"></ul>
    `;

    // 3. Rita ut bilarna för första gången
    renderCarCards(cars);

    // 4. Koppla lyssnare till sorteringen
    document.getElementById('car-sort').addEventListener('change', (e) => {
        const sortBy = e.target.value;

        // Skapa en kopia av arrayen för att inte mutera originalet direkt
        let sortedCars = [...cars];

        if (sortBy === 'name') {
            sortedCars.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'type') {
            sortedCars.sort((a, b) => a.type.localeCompare(b.type));
        }

        // Rendera om korten med den nya, sorterade ordningen!
        renderCarCards(sortedCars);
    });
}

// Hjälpfunktion som bara fokuserar på att rita ut själva korten
function renderCarCards(carsArray) {
    const listElement = document.getElementById('car-list');
    if (!listElement) return;

    // Töm listan innan vi ritar de nya (viktigt vid om-sortering!)
    listElement.innerHTML = '';

    carsArray.forEach(car => {
        const li = document.createElement('li');
        const panel = document.createElement('div');
        panel.classList.add('panel');

        // WCAG AA-tips: Gör panelen tillgänglig via tangentbordet eftersom den är klickbar
        panel.setAttribute('tabindex', '0');
        panel.setAttribute('role', 'button');
        panel.setAttribute('aria-label', `Visa detaljer för ${car.name} ${car.model}`);
        if (car.booked == true) {
            panel.classList.add('panel-negative');
        } else {
            panel.classList.add('panel-positive');
        }
        const imageSrc = car.image ? `data:image/webp;base64,${car.image}` : 'img/default.png';

        // Här bygger vi insidan av panelen med ren HTML-mall
        panel.innerHTML = `
            <div class='panel-img-container'>
                <img src="${imageSrc}" alt="" class="car-image"> 
            </div>
            <div class='panel-text-content'>
                <p><b>${car.name}</b> ${car.model}, Typ: ${car.type || 'Okänd'}, Pris: ${car.price} kr/dag</p>
            </div>
        `;

        // Koppla klickhändelsen till det faktiska DOM-elementet
        panel.addEventListener('click', () => {
            renderCarDetails(car.id);
        });

        // Gör så att det går att trycka på Enter/Space för att öppna (Strikt WCAG-krav för VG!)
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderCarDetails(car.id);
            }
        });

        li.appendChild(panel);
        listElement.appendChild(li);
    });
}

async function renderCarDetails(carId) {
    console.log('!!!!!! renderCarDetails !!!!!!');
    const car = await apiGetCarById(carId);
    if (!car) return;

    const content = document.getElementById('content-area');
    const userRole = sessionStorage.getItem('userRole');
    const imageSrc = car.image ? `data:image/png;base64,${car.image}` : 'img/default.jpg';
    //kolla om booked
    let html = `
        <h2>${car.name} ${car.model}</h2>
        <img src="${imageSrc}" class="detail-image">
        <p><strong>Pris:</strong> ${car.price} kr</p>
        <p><strong>Typ:</strong> ${car.type}</p>
        <p>${car.feature1 || ''}, ${car.feature2 || ''}, ${car.feature3 || ''}</p>
        <div class="actions-container">
            <button id="btn-cancel" class="btn-standard btn">Tillbaka till listan</button>    
    `;
    //kolla vem som är inloggad för att se vilka knappar som ska finnas
    if (userRole === 'GUEST') {
        html += `
            <p>Logga in eller skapa konto för att kunna boka bil.</p>
        </div>`;
    } else if (userRole === 'USER') {
        if (car.booked) {
            html += `<p>Bilen är redan bokad och kan inte bokas för tillfället.</p>
        `;
        } else {
            html += `
            
            <button id="btn-book-car" class="btn-standard btn">Boka bil</button>
        </div>
        `;
        }
    } else if (userRole === 'ADMIN') {
        html += `
            <button id="btn-update-car" class="btn-standard btn">Uppdatera info</button>
            `
        if (car.booked) {
            html += `
            <button id="btn-return-car" class="btn-negative btn">Lämna tillbaka bil</button>
            `
        }
        html += `
            <button id="btn-delete-car" class="btn-negative btn">Ta bort bil</button>
        </div>
        `;
    }

    content.innerHTML = html;
    document.getElementById('btn-cancel').addEventListener('click', () => showPage('view-cars'));
    // Kolla vem som är inloggad för att se vilka lyssnare som ska finnas
    if (userRole === 'USER' && !car.booked) {
        document.getElementById('btn-book-car').addEventListener('click', () => handleBookCarSubmit(carId));
    }
    if (userRole === 'ADMIN') {
        document.getElementById('btn-update-car').addEventListener('click', () => renderUpdateCarForm(carId));
        document.getElementById('btn-delete-car').addEventListener('click', () => renderDeleteCarConfirm(carId));
        if (car.booked) {
            document.getElementById('btn-return-car').addEventListener('click', () => renderReturnCarConfirm(carId));
        }
    }
}// Håller reda på nuvarande sorteringstatus utanför funktionen
let currentUserSortColumn = '';
let isUserSortAscending = true;

function renderUserTable(users) {
    console.log('!!!!!! renderUserTable !!!!!!');
    const content = document.getElementById('content-area');

    if (!users) {
        content.innerHTML = "<p>Kunde inte ladda användare.</p>";
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table-rows');

    // 1. Skapa thead och lägg till interaktiva rubriker
    const thead = document.createElement('thead');

    // Vi skapar en hjälpfunktion för att rita pilarna (▲ / ▼ / ↕)
    const getIcon = (col) => {
        if (currentUserSortColumn !== col) return '↕';
        return isUserSortAscending ? '▲' : '▼';
    };

    thead.innerHTML = `
        <tr>
            <th class="sortable-th" data-column="id" role="columnheader" tabindex="0" aria-sort="${currentUserSortColumn === 'id' ? (isUserSortAscending ? 'ascending' : 'descending') : 'none'}">
                Id <span class="sort-icon">${getIcon('id')}</span>
            </th>
            <th class="sortable-th" data-column="name" role="columnheader" tabindex="0" aria-sort="${currentUserSortColumn === 'name' ? (isUserSortAscending ? 'ascending' : 'descending') : 'none'}">
                Namn <span class="sort-icon">${getIcon('name')}</span>
            </th>
            <th class="sortable-th" data-column="username" role="columnheader" tabindex="0" aria-sort="${currentUserSortColumn === 'username' ? (isUserSortAscending ? 'ascending' : 'descending') : 'none'}">
                Username <span class="sort-icon">${getIcon('username')}</span>
            </th>
        </tr>
    `;
    table.appendChild(thead);

    // 2. Skapa tbody och fyll med data (Glöm inte data-label för mobilen!)
    const tbody = document.createElement('tbody');
    content.innerHTML = '';

    table.appendChild(tbody);

    // 3. Töm och tryck ut tabellen i DOM:en
    content.appendChild(table);
    drawUsersTable(tbody, users);
    // 4. KOPPLA SORTERINGSLYSSNARE (Nu när bitarna ligger i DOM:en)
    const headers = thead.querySelectorAll('.sortable-th');
    headers.forEach(th => {

        // Funktion som kör själva sorteringen
        const handleSort = () => {
            const column = th.getAttribute('data-column');

            if (currentUserSortColumn === column) {
                isUserSortAscending = !isUserSortAscending; // Vänd ordning om vi klickar igen
            } else {
                currentUserSortColumn = column;
                isUserSortAscending = true; // Ny kolumn börjar alltid som ASC
            }
            users = sortData(users, column, isUserSortAscending);
            tbody.innerHTML = '';
            drawUsersTable(tbody, users);
            updateHeaderIcons(thead);
            th.focus;

        };

        // Klicklyssnare för musen
        th.addEventListener('click', handleSort);

        // Keydown-lyssnare för tangentbordet
        th.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort();
            }
        });
    });
}

function drawUsersTable(tbody, users) {
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');

        // Vi lägger till data-label så att din mobil-CSS fungerar klockrent här med!
        tr.innerHTML = `
            <td data-label="Id:">${user.id}</td>
            <td data-label="Namn:">${user.firstName} ${user.lastName}</td>
            <td data-label="Username:">${user.username}</td>
        `;

        tr.addEventListener('click', () => renderUserProfile(user.id));
        tbody.appendChild(tr);
    });


    table.appendChild(tbody);

}
async function renderUserProfile(userId) {
    console.log('!!!!!! renderUserProfile !!!!!!');
    const content = document.getElementById('content-area');
    const user = await apiGetUserById(userId);
    if (!user) return;

    let html = `
        <div class="user-card">
            <h2>Användarprofil: ${user.username}</h2>
            <div class="user-info-grid">
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Namn:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>E-post:</strong> ${user.email}</p>
                <p><strong>Telefon:</strong> ${user.phone}</p>
                <p><strong>Antal bokningar:</strong> ${user.noOfOrders}</p>
            </div>
            
    `;

    // Villkor för knappar (Om det inte är ens eget konto)
    if (sessionStorage.getItem('userId') != userId) {
        html += `
            <div>
                <button class="btn-standard" onclick="showPage('view-users')">Tillbaka</button>        
                <button class="btn-standard" onclick="renderUsersBookingTable(${user.id})">Användarens bokningar</button>
                <button class="btn-standard" onclick="renderUpdateUserForm(${user.id})">Uppdatera användare</button>
                <button class="btn-standard" onclick="renderDeleteUserConfirm(${user.id})">Ta bort användare</button>
            </div>
        `;
    } else {
        html += `
            <div>
                <button class="btn-standard" onclick="showPage('view-cars')">Tillbaka</button>        
                <button class="btn-standard" onclick="renderUpdateUserForm(${user.id})">Uppdatera användare</button>
            </div>
        `;
    }
    content.innerHTML = html;
}
let currentBookingSortColumn = '';
let isBookingSortAscending = true;

async function renderUsersBookingTable(userId) {
    console.log("----- renderUsersBookingTable ------");
    const content = document.getElementById('content-area');

    const table = document.createElement('table');
    table.classList.add('table-rows');
    console.log("----- 1 ------");
    // 1. Skapa thead och lägg till interaktiva rubriker
    const thead = document.createElement('thead');

    // Vi skapar en hjälpfunktion för att rita pilarna (▲ / ▼ / ↕)
    const getIcon = (col) => {
        if (currentBookingSortColumn !== col) return '↕';
        return isBookingSortAscending ? '▲' : '▼';
    };
    console.log("----- 2 ------");
    thead.innerHTML = `
        <tr>
            <th class="sortable-th" data-column="id" role="columnheader" tabindex="0" aria-sort="${currentBookingSortColumn === 'id' ? (isBookingSortAscending ? 'ascending' : 'descending') : 'none'}">
                Id <span class="sort-icon">${getIcon('id')}</span>
            </th>
            <th class="sortable-th" data-column="active" role="columnheader" tabindex="0" aria-sort="${currentBookingSortColumn === 'active' ? (isBookingSortAscending ? 'ascending' : 'descending') : 'none'}">
                Aktiv <span class="sort-icon">${getIcon('active')}</span>
            </th>
            <th class="sortable-th" data-column="carId" role="columnheader" tabindex="0" aria-sort="${currentBookingSortColumn === 'carId' ? (isBookingSortAscending ? 'ascending' : 'descending') : 'none'}">
                Bil <span class="sort-icon">${getIcon('carId')}</span>
            </th>
            <th class="sortable-th" data-column="fromDate" role="columnheader" tabindex="0" aria-sort="${currentBookingSortColumn === 'fromDate' ? (isBookingSortAscending ? 'ascending' : 'descending') : 'none'}">
                Startdatum <span class="sort-icon">${getIcon('fromDate')}</span>
            </th>
            <th class="sortable-th" data-column="toDate" role="columnheader" tabindex="0" aria-sort="${currentBookingSortColumn === 'toDate' ? (isBookingSortAscending ? 'ascending' : 'descending') : 'none'}">
                Återlämningsdatum <span class="sort-icon">${getIcon('toDate')}</span>
            </th>
        </tr>
    `;
    
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let bookings = await apiGetBookingsByUserId(userId);
    
    console.log("längd: " + bookings.length);
    content.innerHTML = '';
    content.appendChild(table);
    
    drawBookingsTable(tbody, bookings);

    const headers = thead.querySelectorAll('.sortable-th');
    headers.forEach(th => {
        const handleSort = () => {
            const column = th.getAttribute('data-column');

            if (currentBookingSortColumn === column) {
                isBookingSortAscending = !isBookingSortAscending;
            } else {
                currentBookingSortColumn = column;
                isBookingSortAscending = true;
            }

            bookings = sortData(bookings, column, isBookingSortAscending);

            // FIX: Tömmer gamla raderna innan vi ritar de nya, sorterade raderna
            tbody.innerHTML = '';
            drawBookingsTable(tbody, bookings);
            updateHeaderIcons(thead);
            th.focus();
        };
        th.addEventListener('click', handleSort);

        th.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort();
            }
        });

    });
}

function updateHeaderIcons(thead) {
    const headers = thead.querySelectorAll('.sortable-th');
    headers.forEach(th => {
        const column = th.getAttribute('data-column');
        const iconSpan = th.querySelector('.sort-icon');
        if (iconSpan) {
            if (currentBookingSortColumn !== column) {
                iconSpan.textContent = '↕';
            } else {
                iconSpan.textContent = isBookingSortAscending ? '▲' : '▼';
            }
        }
    });

    th.addEventListener('click', () => {
        const column = th.getAttribute('data-column');

        // Vänd ordning om vi klickar på samma igen
        if (currentBookingSortColumn === column) {
            isBookingSortAscending = !isBookingSortAscending;
        } else {
            currentBookingSortColumn = column;
            isBookingSortAscending = true;
        }

        bookings = sortData(bookings, column, isBookingSortAscending);

        drawBookingsTable(tbody, bookings);
        updateHeaderIcons(thead);
    });
}
function drawBookingsTable(tbody, bookings) {
    bookings.forEach(booking => {
        console.log("booking: " + booking.id);
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');

        tr.innerHTML = `
            <td data-label="Id">${booking.id}</td>
            <td>${booking.active ? '🟢 Aktiv' : '🔴 Avslutad'}</td>
            <td data-label="Bil id">${booking.carId}</td>
            <td data-label="Startdatum">${booking.fromDate}</td>
            <td data-label="Slutdatum">${booking.toDate}</td>
        `;

        tr.addEventListener('click', () => renderBooking(booking.id));
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

}
async function renderBooking() {
    console.log('!!!!!! renderBooking !!!!!!');
}
async function renderUpdateUserForm(userId) {
    console.log('!!!!!! renderUpdateUserForm !!!!!!');
    const content = document.getElementById('content-area');

    try {
        const user = await apiGetUserById(userId);
        if (!user) return;

        content.innerHTML = `
            <div class="update-user-container">
                <h2>Uppdatera användare: ${user.username}</h2>
                <form id="update-user-form">
                    <input type="hidden" id="update-id" value="${user.id}">

                    <div class="form-group">
                        <label for="firstName">Förnamn:</label>
                        <input type="text" id="firstName" value="${user.firstName || ''}" required>
                        
                        <label for="lastName">Efternamn:</label>
                        <input type="text" id="lastName" value="${user.lastName || ''}" required>
                        
                        <label for="phone">Telefonnummer:</label>
                        <input type="text" id="phone" value="${user.phone || ''}" required>
                        
                        <label for="email">Email:</label>
                        <input type="email" id="email" value="${user.email || ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="password">Nytt lösenord:</label>
                        <input type="password" id="password" minlength='4'>
                        
                        <label for="password2">Repetera lösenord:</label>
                        <input type="password" id="password2" minlength='4'>
                    </div>
                    <button type="button" id='btn-cancel' class="btn btn-standard">Avbryt</button>
                    <button type="submit" class="btn btn-standard">Spara ändringar</button>
                    <p id="update-error" style="color: red; display: none;"></p>
                </form>
            </div>
        `;

        // 2. Koppla lyssnaren DIREKT när vi vet att elementet finns i DOM:en
        document.getElementById('update-user-form').addEventListener('submit', (e) => {
            e.preventDefault(); // Hindra sidan från att laddas om
            handleUpdateUserSubmit();
        });
        document.getElementById('btn-cancel').addEventListener('click', () => {
            // Om en admin uppdaterar någon annan vill vi kanske gå till listan, 
            // men om man uppdaterar sig själv går vi till profilvyn.
            if (sessionStorage.getItem('userId') == userId) {
                showPage('view-profile');
            } else {
                showPage('view-users');
            }
        });

    } catch (error) {
        console.error("Kunde inte ladda användareformulär:", error);
    }
}
function renderDeleteUserConfirm(userId) {
    console.log(`!!!!!! renderDeleteUserConfirm för id ${userId} !!!!!!`);

    // Vi öppnar popupen, och OM användaren klickar på "Ja", 
    // så körs funktionen inuti pilen () => { ... }
    customConfirm(
        `Är du helt säker på att du vill ta bort användaren med ID ${userId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteUserSubmit(userId);
        }
    );
}
function renderDeleteCarConfirm(carId) {
    console.log(`!!!!!! renderDeleteCarConfirm för bil: ${carId} !!!!!!`);
    customConfirm(
        `Är du helt säker på att du vill ta bort bil med ID ${carId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteCarSubmit(carId);
        }
    );
}
function renderReturnCarConfirm(carId) {
    console.log(`!!!!!! renderReturnCarConfirm för bil: ${carId} !!!!!!`);
    customConfirm(
        `Är du helt säker på att du vill lämna tillbaka bil med ID ${carId}?`,
        () => {
            handleReturnCarSubmit(carId);
        }
    );
}

async function renderUpdateCarForm(carId) {
    console.log(`!!!!!! renderUpdateCarForm för bil: ${carId} !!!!!!`);
    const content = document.getElementById('content-area');

    try {
        const car = await apiGetCarById(carId);
        if (!car) return;

        // 1. Rita ut formuläret på skärmen
        content.innerHTML = `
            <div class="update-car-container">
                <h2>Uppdatera bil med id: ${carId}</h2>
                <form id="update-car-form">
                    <input type="hidden" id="update-id" value="${carId}">

                    <div class="form-group">
                        <label for="name">Namn:</label>
                        <input type="text" id="name" value="${car.name || ''}" required>
                        <label for="model">Modell:</label>
                        <input type="text" id="model" value="${car.model || ''}" required>
                        <label for="price">Pris:</label>
                        <input type="text" id="price" value="${car.price || ''}" required>
                        <label for="type">Typ:</label>
                        <input type="text" id="type" value="${car.type || ''}" required>
                        <label for="feature1">Tillbehör 1:</label>
                        <input type="text" id="feature1" value="${car.feature1 || ''}">
                        <label for="feature2">Tillbehör 2:</label>
                        <input type="text" id="feature2" value="${car.feature2 || ''}">
                        <label for="feature3">Tillbehör 3:</label>
                        <input type="text" id="feature3" value="${car.feature3 || ''}">
                        
                    </div>
                    <button type="button" id='btn-cancel' class="btn btn-standard">Avbryt</button>
                    <button type="submit" class="btn btn-standard">Uppdatera</button>
                    <p id="update-error" style="color: red; display: none;"></p>
                </form>
            </div>
        `;

        // 2. Koppla lyssnaren DIREKT när vi vet att elementet finns i DOM:en
        document.getElementById('update-car-form').addEventListener('submit', (e) => {
            e.preventDefault(); // Hindra sidan från att laddas om
            handleUpdateCarSubmit(carId);
        });
        document.getElementById('btn-cancel').addEventListener('click', () => {
            showPage('view-cars');
        });

    } catch (error) {
        console.error("Kunde inte ladda användareformulär:", error);
    }
}
function renderNewCarView() {
    console.log('!!!!!! renderNewCarView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `
            <div class="new-car-container">
                <h2>Ny bil</h2>
                <form id="new-car-form">
                    <div class="form-group">
                        <label for="name">Namn:</label>
                        <input type="text" id="name" placeholder="Volvo" required>
                        <label for="model">Modell:</label>
                        <input type="text" id="model" placeholder="V70" required>
                        <label for="price">Pris:</label>
                        <input type="text" id="price" placeholder="2500" required>
                        <label for="type">Typ:</label>
                        <input type="text" id="type" placeholder="Kombi" required>
                        <label for="feature1">Tillbehör 1:</label>
                        <input type="text" id="feature1" placeholder="AC">
                        <label for="feature2">Tillbehör 2:</label>
                        <input type="text" id="feature2" placeholder="AC">
                        <label for="feature3">Tillbehör 3:</label>
                        <input type="text" id="feature3" placeholder="AC">
                        <label for="car-image-input">Bilbild:</label>
                        <input type="file" id="car-image-input" accept="image/*">
                    </div>
                    <button type="button" id='btn-cancel' class="btn btn-standard">Avbryt</button>
                    <button type="submit" class="btn btn-standard">Skapa</button>
                    <p id="car-error" style="color: red; display: none;">Kunde inte skapa bil.</p>
                </form>
            </div>
        `;

    document.getElementById('new-car-form').onsubmit = function (e) {
        e.preventDefault();
        handleCreateCarSubmit();
    };

    document.getElementById('btn-cancel').addEventListener('click', () => {
        showPage('view-cars');
    });

}
/* ==========================================================================
   3. HANDLERS / EVENTS (Hanterar klick och formulärskick)
   ========================================================================== */
// SEKTION 3: HANDLERS
async function handleLoginSubmit() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    const response = await apiLogin(username, password);

    if (response && response.ok) {
        const userData = await response.json();
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userId', userData.userId);
        const role = userData.isAdmin ? 'ADMIN' : 'USER';
        sessionStorage.setItem('userRole', role);

        await updateUserSession(userData.userId);
        if (role === 'ADMIN') {
            customAlert(`Välkommen ${sessionStorage.firstName}, du är inloggad som administratör!`)
        } else {
            customAlert(`Välkommen ${sessionStorage.firstName}, du är nu inloggad och kan hyra bilar!`)
        }
        renderMenu(role);
        showPage('view-cars');
    } else {
        errorMsg.style.display = 'block';
    }
}
// SEKTION 3: HANDLERS
async function handleCreateUserSubmit() {
    console.log('!!!!!! handleCreateUserSubmit !!!!!!');
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const errorMsg = document.getElementById('login-error');

    if (password !== password2) {
        errorMsg.textContent = "Lösenorden matchar inte!";
        errorMsg.style.display = 'block';
        return;
    }

    const userData = { firstName, lastName, username, phone, email, password };
    const response = await apiCreateUser(userData);

    if (response && response.ok) {
        const savedUser = await response.json();

        if (sessionStorage.getItem('userRole') === 'GUEST' || !sessionStorage.getItem('userRole')) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'USER');
            sessionStorage.setItem('userId', savedUser.id);
            sessionStorage.setItem('firstName', savedUser.firstName);

            renderMenu('USER');
            showPage('view-cars');
        } else if (sessionStorage.getItem('userRole') === 'ADMIN') {
            customAlert("Ny användare skapad av admin!", 'positive');
            showPage('view-users');
        }
    } else {
        errorMsg.textContent = 'Kunde inte skapa konto, email kan vara upptaget.';
        errorMsg.style.display = 'block';
    }
}
// SEKTION 3: HANDLERS
async function handleUpdateUserSubmit() {
    console.log('!!!!!! handleUpdateUserSubmit !!!!!!');
    const userId = document.getElementById('update-id').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const errorMsg = document.getElementById('update-error');

    errorMsg.style.display = 'none';

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        errorMsg.textContent = "Alla fält måste fyllas i!";
        errorMsg.style.display = 'block';
        return;
    }
    if (password !== password2 || password === "") {
        errorMsg.textContent = "Lösenorden matchar inte eller är tomma!";
        errorMsg.style.display = 'block';
        return;
    }

    const userData = {
        firstName, lastName, username, phone, email, password,
        "noOfOrders": sessionStorage.getItem('noOfOrders'),
        "role": sessionStorage.getItem('userRole')
    };

    const response = await apiUpdateUser(userId, userData);

    if (response && response.ok) {
        if (sessionStorage.getItem('userRole') === 'ADMIN') {
            customAlert('Användare uppdaterad framgångsrikt!', 'positive');
            showPage('view-users');
        } else if (sessionStorage.getItem('userId') == userId) {
            if (sessionStorage.getItem('email') === email) {
                await updateUserSession(userId);
                showPage('view-cars');
            } else {
                customAlert('Eftersom du bytt email behöver du logga in på nytt.', 'negative');
                sessionStorage.clear();
                renderMenu('GUEST');
                showPage('view-login');
            }
        }
    } else {
        errorMsg.textContent = 'Kunde inte uppdatera konto.';
        errorMsg.style.display = 'block';
    }
}
async function handleDeleteUserSubmit(userId) {
    console.log('!!!!!! handleDeleteUserSubmit !!!!!!');

    // Säkerhetskoll: Ta inte bort sig själv
    if (userId == sessionStorage.getItem('userId')) {
        customAlert("Du kan inte ta bort ditt eget konto!", 'negative');
        return;
    }

    // Ropa på API-funktionen och VÄNTA (await) på svaret
    const response = await apiDeleteUser(userId);

    // Hantera resultatet på skärmen
    if (response && response.ok) {
        customAlert(`Användare med id ${userId} borttagen ur databasen.`, 'positive');
        showPage('view-users');
    } else {
        customAlert("Kunde inte ta bort användaren.", 'negative');
    }
}/******************************************************* */
async function handleBookCarSubmit(carId) {
    console.log(`!!!!!! handleBookCarSubmit för bil: ${carId} !!!!!!`);
    const car = await apiGetCarById(carId);
    if (!car) return;

    const modalOverlay = document.createElement('div');
    // Matchar din CSS: .modal-overlay
    modalOverlay.className = 'modal-overlay';

    const today = new Date().toLocaleDateString('sv-SE');

    // Matchar din CSS: .modal-content.text-alert, .modal-message, .modal-buttons
    modalOverlay.innerHTML = `
        <div class="modal-content text-alert">
            <h3>Boka ${car.name} ${car.model}</h3>
            <div class="modal-message">
                <p><strong>Startdatum:</strong> ${today}</p>
                <div style="margin-top: 15px;">
                    <label for="booking-days"><b>Antal dagar:</b></label>
                    <select id="booking-days" class="form-control" style="margin-top: 5px; padding: 5px;">
                        <option value="1">1 dag</option>
                        <option value="2" selected>2 dagar</option>
                        <option value="3">3 dagar</option>
                        <option value="4">4 dagar</option>
                        <option value="5">5 dagar</option>
                        <option value="6">6 dagar</option>
                        <option value="7">7 dagar</option>
                    </select>
                </div>
            </div>
            <div class="modal-buttons">
                <button type="button" id="btn-modal-cancel" class="btn btn-standard">Avbryt</button>
                <button type="button" id="btn-modal-book" class="btn btn-standard">Boka</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    // CRITICAL: Eftersom din CSS startar på opacity: 0, måste vi lägga till .show 
    // med en mikroskopisk fördröjning för att animationen ska kicka igång!
    setTimeout(() => {
        modalOverlay.classList.add('show');
    }, 10);

    modalOverlay.querySelector('#btn-modal-cancel').addEventListener('click', () => {
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    });
    modalOverlay.querySelector('#btn-modal-book').addEventListener('click', async () => {
        let endDate = new Date();
        const days = parseInt(modalOverlay.querySelector('#booking-days').value);
        endDate.setDate(endDate.getDate() + days);
        endDate = endDate.toLocaleDateString('sv-SE');
        console.log("endDate: " + endDate);
        console.log("days: " + days);
        console.log("today: " + today);
        apiCreateBooking(today, endDate, carId, sessionStorage.getItem('userId'));
        modalOverlay.classList.remove('show');
        setTimeout(() => {
            modalOverlay.remove();
        }, 300);
    });

}
async function handleUpdateCarSubmit(carId) {
    console.log(`!!!!!! handleUpdateCarSubmit för bil: ${carId} !!!!!!`);
    const name = document.getElementById('name').value;
    const model = document.getElementById('model').value;
    const type = document.getElementById('type').value;
    const price = document.getElementById('price').value;
    const feature1 = document.getElementById('feature1').value;
    const feature2 = document.getElementById('feature2').value;
    const feature3 = document.getElementById('feature3').value;
    const errorMsg = document.getElementById('update-error');

    errorMsg.style.display = 'none';

    if (!name.trim() || !model.trim() || !price.trim() || !type.trim()) {
        errorMsg.textContent = "Alla fält utom egenskaper måste fyllas i!";
        errorMsg.style.display = 'block';
        return;
    }

    const carData = {
        name, model, feature1, feature2, feature3, type, price
    };

    const response = await apiUpdateCar(carId, carData);

    if (response && response.ok) {

        customAlert('Bil uppdaterad framgångsrikt!', 'positive');
        showPage('view-cars');

    } else {
        errorMsg.textContent = 'Kunde inte uppdatera bil.';
        errorMsg.style.display = 'block';
    }
}

async function handleDeleteCarSubmit(carId) {
    console.log('!!!!!! handleDeleteCarSubmit !!!!!!');

    // Ropa på API-funktionen och VÄNTA (await) på svaret
    const response = await apiDeleteCar(carId);

    // Hantera resultatet på skärmen
    if (response && response.status === 204) {
        customAlert(`Bil med id ${carId} borttagen ur databasen.`, 'positive');
        showPage('view-cars');
    } else {
        customAlert("Kunde inte ta bort bilen.", 'negative');
    }
}

async function handleReturnCarSubmit(carId) {
    console.log('!!!!!! handleReturnCarSubmit !!!!!!');

    // Ropa på API-funktionen och VÄNTA (await) på svaret
    const response = await apiReturnCar(carId);

    // Hantera resultatet på skärmen
    if (response && response.status === 204) {
        customAlert(`Bil med id ${carId} borttagen ur databasen.`, 'positive');
        showPage('view-cars');
    } else {
        customAlert("Kunde inte ta bort bilen.", 'negative');
    }
}

async function handleCreateCarSubmit() {
    console.log('!!!!!! handleCreateCarSubmit !!!!!!');

    const errorMsg = document.getElementById('car-error');
    errorMsg.style.display = 'none';

    // 1. Samla in all data från skärmen
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('model', document.getElementById('model').value);
    formData.append('feature1', document.getElementById('feature1').value);
    formData.append('feature2', document.getElementById('feature2').value);
    formData.append('feature3', document.getElementById('feature3').value);
    formData.append('type', document.getElementById('type').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('booked', false);

    const imageInput = document.getElementById('car-image-input');
    if (imageInput.files && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    // 2. Skicka datan till API-funktionen och vänta på svar
    const response = await apiCreateCar(formData);

    // 3. Hantera resultatet på skärmen baserat på hur det gick
    if (response && response.ok) {
        const car = await response.json();
        customAlert("Bilen är sparad!", 'positive');
        renderCarDetails(car.id);
    } else {
        errorMsg.style.display = 'block';
    }
}

/* ==========================================================================
   APP INITIALIZATION & SIDEBAR EVENTS
   ========================================================================== */

document.getElementById('menu-toggle').onclick = function () {
    document.querySelector('.sidebar').classList.toggle('mobile-open');
};

function closeMobileMenu() {
    document.querySelector('.sidebar').classList.remove('mobile-open');
}

function initApp() {
    console.log('!!!!!! initApp !!!!!!');
    const savedRole = sessionStorage.getItem('userRole');
    if (!savedRole) {
        sessionStorage.setItem('userRole', 'GUEST');
        renderMenu('GUEST');
        showPage('view-login');
    } else {
        renderMenu(savedRole);
        showPage('view-cars');
    }
}

// Starta applikationen
initApp();