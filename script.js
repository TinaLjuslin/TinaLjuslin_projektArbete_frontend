/*
Får jag tillbaka carId så jag kan visa bara den bilen och inte listan
avbryt eller gå tillbaka om man klickat på bil
om man är inloggad som user och klickar på tillbaka till listan efter att ha uppdaterat sin profil så får man se listan, det ska man INTE!
lägg till tillbaka-knapp på allt
kolla fokus och tab
tillbaka-knapp i renderUsersBookingTable
user bokar bil så kommer man tillbaka till fel ställe


**
     * Hämtar alla bokningar för den inloggade användaren.
     * Ingen path-variabel behövs, servern tar userId ur principal.
     * Returnerar 404 om ingen bokning hittas.
     *
    //Testad
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<List<Booking>> getMyBookings(
    */

/* ==========================================================================
   ==========================================================================
   MENU AND CONSTANTS, VARIABLES
   ==========================================================================
   ========================================================================== */

const menuItems = [
    { name: 'Bilar', view: 'view-cars', roles: ['USER', 'ADMIN', 'GUEST'] },
    { name: 'Ny bil', view: 'view-car-new', roles: ['ADMIN'] },
    { name: 'Användare', view: 'view-users', roles: ['ADMIN'] },
    { name: 'Ny användare', view: 'view-user-new', roles: ['ADMIN', 'GUEST'] },
    { name: 'Logga in', view: 'view-login', roles: ['GUEST'] },
    { name: 'Bokningar', view: 'view-bookings', roles: ['ADMIN'] },
    { name: 'Mina bokningar', view: 'view-bookings-for-user', roles: ['USER'] },
    { name: 'Min profil', view: 'view-profile', roles: ['USER', 'ADMIN'] },
    { name: 'Logga ut', view: 'view-logout', roles: ['USER', 'ADMIN'] }
];

let currentBookingFilter = 'all';
let currentUserSortColumn = '';
let isUserSortAscending = true;
let currentBookingSortColumn = '';
let isBookingSortAscending = true;


/* ==========================================================================
   ==========================================================================
   1. API / FETCH FUNCTIONS (Enbart kommunikation med din Spring Boot backend)
   ==========================================================================
   ========================================================================== */

async function apiLogin(username, password) {
    console.log('!!!!!! apiLogin !!!!!!');
    try {
        const response = await fetch(`http://localhost:8080/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            const basicAuthString = 'Basic ' + btoa(username + ':' + password);
            sessionStorage.setItem('basicAuth', basicAuthString);
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Nätverksfel vid inloggning:', error);
        customAlert('Serverfel.', 'negative');
        return null;
    }
}

async function apiFetch(endpoint, method = 'GET', body = null, isMultipart = false) {
    const headers = { 'Authorization': sessionStorage.getItem('basicAuth') };
    if (!isMultipart) headers['Content-Type'] = 'application/json';

    try {
        const options = { method, headers };
        if (body) options.body = isMultipart ? body : JSON.stringify(body);

        const response = await fetch(`http://localhost:8080/api/v1${endpoint}`, options);

        if (response.status === 403) {
            console.error('403 Forbidden - Nekat tillträde.');
            alert('Backend nekar oss tillträde.');
            return null;
        }

        // Om metoden är DELETE eller PUT (retur) kanske vi bara vill ha responsen, annars json
        if (!response.ok) return null;

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return true;
    } catch (error) {
        console.error(`Fel vid anrop till ${endpoint}:`, error);
        customAlert('Serverfel.', 'negative');
        return null;
    }
}
/* ==========================================================================
   ==========================================================================
   2. UTILITIES
   ==========================================================================
   ========================================================================== */

async function updateUserSession(userId) {
    console.log('!!!!!! updateUserSession !!!!!!');
    const user = await apiFetch(`/users/${userId}`);
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
        <div class='modal-content text-alert'>
            <div class='alert-icon-wrapper ${type}'>
                ${type === 'positive' ? '✓' : '✕'}
            </div>
            <p class='modal-message'>${message}</p>
            <div class='modal-buttons'>
                <button class='btn ${btnClass}' id='custom-alert-ok-btn'>OK</button>
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
        <div class='modal-content text-alert'>
            <div class='alert-icon-wrapper warning'>⚠️</div>
            <p class='modal-message'>${message}</p>
            <div class='modal-buttons' style='gap: 15px;'>
                <button class='btn btn-standard' id='custom-confirm-cancel-btn'>Avbryt</button>
                <button class='btn btn-negative' id='custom-confirm-ok-btn'>Ja</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Om användaren klickar på 'Ja, ta bort'
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
function calculateTotalPrice(fromDateStr, toDateStr, pricePerDay) {
    // 1. Gör om datumsträngarna (t.ex. '2026-05-22') till JavaScript Datum-objekt
    const start = new Date(fromDateStr);
    const end = new Date(toDateStr);

    // 2. Räkna ut skillnaden i millisekunder
    const differenceInMs = end - start;

    // 3. Omvandla millisekunder till dagar
    // (1000 ms * 60 sekunder * 60 minuter * 24 timmar = 86 400 000 ms på ett dygn)
    const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

    // 4. Hantera specialfall: 
    // Om man bokar och lämnar tillbaka samma dag blir det 0 dagar. 
    // Vi kan använda Math.max(1, ...) om vi vill att en påbörjad dag alltid kostar minst 1 dagspris.
    const totalDays = Math.max(1, differenceInDays);

    // 5. Räkna ut totalen
    const totalPrice = totalDays * pricePerDay;

    return totalPrice;
}

function createSortableThead(columns, currentSortCol, isAsc, onSortChange) {
    const thead = document.createElement('thead');

    // Generera alla <th> dynamiskt från en array av kolumner
    const thsHTML = columns.map(col => {
        const isCurrent = currentSortCol === col.id;
        const icon = isCurrent ? (isAsc ? '▲' : '▼') : '↕';
        const ariaSort = isCurrent ? (isAsc ? 'ascending' : 'descending') : 'none';
        return `
            <th class='sortable-th' data-column='${col.id}' role='columnheader' tabindex='0' aria-sort='${ariaSort}'>
                ${col.label} <span class='sort-icon'>${icon}</span>
            </th>`;
    }).join('');

    thead.innerHTML = `<tr>${thsHTML}</tr>`;

    // Koppla lyssnarna centralt
    thead.querySelectorAll('.sortable-th').forEach(th => {
        const handleSort = () => {
            const column = th.getAttribute('data-column');
            onSortChange(column);
        };
        th.addEventListener('click', handleSort);
        th.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(); }
        });
    });

    return thead;
}
/* ==========================================================================
   ==========================================================================
   RENDER FUNCTIONS 
   ==========================================================================
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
            apiFetch(`/users`).then(users => renderUserTable(users));
            break;
        case 'view-user-new':
            renderNewUserView();
            break;
        case 'view-bookings':
            renderBookingsView();
            break;
        case 'view-bookings-for-user':
            renderBookingsForUser();
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
        <div class='login-container'>
            <h2>Logga in</h2>
            <form id='login-form'>
                <div class='form-group'>
                    <label for='username'>Användarnamn:</label>
                    <input type='text' id='username' placeholder='admin eller user' required>
                </div>
                <div class='form-group'>
                    <label for='password'>Lösenord:</label>
                    <input type='password' id='password' required>
                </div>
                <button type='submit' class='btn btn-standard'>Logga in</button>
                <p id='login-error' style='color: red; display: none;'>Fel användarnamn eller lösenord.</p>
            </form>
        </div>
    `;

    document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault();
        handleLoginSubmit();
    };
}
async function renderBookingsView() {
    console.log('!!!!!! renderBookingsView !!!!!!');
    const content = document.getElementById('content-area');
    let bookings = [];

    content.innerHTML = `
        <div class='bookingheader'>
            <h2>Hantera bokningar</h2>
            <div>
                <button id='btn-booking-all' class='btn-filter ${currentBookingFilter === 'all' ? 'active' : ''}'>Visa alla</button>
                <button id='btn-booking-active' class='btn-filter ${currentBookingFilter === 'active' ? 'active' : ''}'>Enbart aktiva</button>
            </div>
        </div>
        <div id='bookings-table-container'></div>
    `;

    const tableContainer = document.getElementById('bookings-table-container');
    const table = document.createElement('table');
    table.classList.add('table-rows');

    // Vi måste skapa vårat tbody-element så drawBookingsTable har något att rita i
    const tbody = document.createElement('tbody');

    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'active', label: 'Aktiv' },
        { id: 'carId', label: 'Bil' },
        { id: 'fromDate', label: 'Startdatum' },
        { id: 'toDate', label: 'Återlämningsdatum' }
    ];

    // 1. Skapa thead med den nya återanvändbara funktionen.
    // Callback-funktionen körs automatiskt inifrån createSortableThead när någon klickar/trycker på en rubrik!
    const thead = createSortableThead(columns, currentBookingSortColumn, isBookingSortAscending, (column) => {
        if (currentBookingSortColumn === column) {
            isBookingSortAscending = !isBookingSortAscending;
        } else {
            currentBookingSortColumn = column;
            isBookingSortAscending = true;
        }
        bookings = sortData(bookings, column, isBookingSortAscending);
        drawBookingsTable(tbody, bookings, true);
    });

    // 2. Montera ihop tabellen och lägg till den i containern
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // 3. Hämta startdata baserat på det filter som var aktivt (eller simulera ett klick på förvalt filter)
    if (currentBookingFilter === 'active') {
        bookings = await apiFetch(`/bookings/active`);//apiGetActiveBookings();
    } else {
        currentBookingFilter = 'all';
        bookings = await apiFetch(`/bookings`);//apiGetBookings();
    }

    if (!bookings) return;
    drawBookingsTable(tbody, bookings, true);

    // === FILTER-KNAPPARNAS EVENT LISTENERS ===
    document.getElementById('btn-booking-all').addEventListener('click', async () => {
        currentBookingFilter = 'all';
        document.getElementById('btn-booking-all').classList.add('active');
        document.getElementById('btn-booking-active').classList.remove('active');

        bookings = await apiFetch(`/bookings`);//apiGetBookings();
        if (!bookings) return;
        drawBookingsTable(tbody, bookings, true);
    });

    document.getElementById('btn-booking-active').addEventListener('click', async () => {
        currentBookingFilter = 'active';
        document.getElementById('btn-booking-all').classList.remove('active');
        document.getElementById('btn-booking-active').classList.add('active');

        bookings = await apiFetch(`/bookings/active`);//apiGetActiveBookings();
        if (!bookings) return;
        drawBookingsTable(tbody, bookings, true);
    });
}
function renderNewUserView() {
    console.log('!!!!!! renderNewUserView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `
        <div class='new-user-container'>
            <h2>Ny användare</h2>
            <form id='new-user-form'>
                <div class='form-group'>
                    <label for='firstName'>Förnamn:</label>
                    <input type='text' id='firstName' placeholder='Anna' required>
                    <label for='lastName'>Efternamn:</label>
                    <input type='text' id='lastName' placeholder='Andersson' required>
                    <label for='phone'>Telefonnummer:</label>
                    <input type='text' id='phone' placeholder='070-1234567' required>
                    <label for='email'>Email:</label>
                    <input type='email' id='email' placeholder='anna@email.se' required>
                </div>
                <div class='form-group'>
                    <label for='password'>Lösenord:</label>
                    <input type='password' id='password' minlength='4' required>
                    <label for='password2'>Repetera lösenord:</label>
                    <input type='password' id='password2' minlength='4' required>
                </div>
                <button type='button' id='btn-cancel' class='btn btn-standard'>Avbryt</button>
                <button type='submit' class='btn btn-standard'>Skapa</button>
                <p id='login-error' style='color: red; display: none;'>Kunde inte skapa konto.</p>
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
    const cars = await apiFetch(`/cars`);//apiGetCars();

    if (!cars || cars.length === 0) {
        content.innerHTML = '<p>Inga bilar hittades.</p>';
        return;
    }

    // 2. Skapa bas-strukturen för sidan med sorterings-dropdownen
    content.innerHTML = `
        <p>Rödmarkerade bilar är redan uthyrda, gröna är lediga för bokning.</p>    
        <div class='filter-bar'>
            <label for='car-sort'>Sortera bilar efter:</label>
            <select id='car-sort' class='form-control'>
                <option value='default'>Välj...</option>
                <option value='name'>Namn (A-Ö)</option>
                <option value='type'>Typ / Kategori</option>
            </select>
            
        </div>
        <ul id='car-list' class='cars-grid'></ul>
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
                <img src='${imageSrc}' alt='' class='car-image'> 
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
    const car = await apiFetch(`/cars/${carId}`);//apiGetCarById(carId);
    if (!car) return;

    const content = document.getElementById('content-area');
    const userRole = sessionStorage.getItem('userRole');
    const imageSrc = car.image ? `data:image/png;base64,${car.image}` : 'img/default.jpg';
    //kolla om booked
    let html = `
        <h2>${car.name} ${car.model}</h2>
        <img src='${imageSrc}' class='detail-image'>
        <p><strong>Pris:</strong> ${car.price} kr</p>
        <p><strong>Typ:</strong> ${car.type}</p>
        <p>${car.feature1 || ''}, ${car.feature2 || ''}, ${car.feature3 || ''}</p>
        <div class='actions-container'>
            <button id='btn-cancel' class='btn-standard btn'>Tillbaka till listan</button>    
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
            
            <button id='btn-book-car' class='btn-standard btn'>Boka bil</button>
        </div>
        `;
        }
    } else if (userRole === 'ADMIN') {
        html += `
            <button id='btn-update-car' class='btn-standard btn'>Uppdatera info</button>
            `
        /*if (car.booked) {
            html += `
            <button id='btn-return-car' class='btn-negative btn'>Lämna tillbaka bil</button>
            `
        }*/
        html += `
            <button id='btn-delete-car' class='btn-negative btn'>Ta bort bil</button>
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
        /*if (car.booked) {
            document.getElementById('btn-return-car').addEventListener('click', () => renderReturnCarConfirm(carId));
        }*/
    }
}
function renderUserTable(users) {
    console.log('!!!!!! renderUserTable !!!!!!');
    const content = document.getElementById('content-area');

    if (!users) {
        content.innerHTML = '<p>Kunde inte ladda användare.</p>';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('table-rows');

    // === DEFINIERA KOLUMNER ===
    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'name', label: 'Namn' },
        { id: 'username', label: 'Username' }
    ];

    // === ANVÄND DEN NYA FUNKTIONEN ===
    const thead = createSortableThead(columns, currentUserSortColumn, isUserSortAscending, (column) => {
        if (currentUserSortColumn === column) {
            isUserSortAscending = !isUserSortAscending;
        } else {
            currentUserSortColumn = column;
            isUserSortAscending = true;
        }
        users = sortData(users, column, isUserSortAscending);
        drawUsersTable(tbody, users);
    });

    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    content.innerHTML = '';
    table.appendChild(tbody);
    content.appendChild(table);

    drawUsersTable(tbody, users);
    // ALLA manuella event listeners (headers.forEach) är nu borttagna härifrån!
}

function drawUsersTable(tbody, users) {
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');

        // Vi lägger till data-label så att din mobil-CSS fungerar klockrent här med!
        tr.innerHTML = `
            <td data-label='Id:'>${user.id}</td>
            <td data-label='Namn:'>${user.firstName} ${user.lastName}</td>
            <td data-label='Username:'>${user.username}</td>
        `;

        tr.addEventListener('click', () => renderUserProfile(user.id));
        tbody.appendChild(tr);
    });
}
async function renderUserProfile(userId) {
    console.log('!!!!!! renderUserProfile !!!!!!');
    const content = document.getElementById('content-area');
    const user = await apiFetch(`/users/${userId}`);//apiGetUserById(userId);
    if (!user) return;

    let html = `
        <div class='user-card'>
            <h2>Användarprofil: ${user.username}</h2>
            <div class='user-info-grid'>
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
                <button class='btn-standard' onclick='showPage("view-users")'>Tillbaka</button>        
                <button class='btn-standard' onclick='renderUpdateUserForm(${user.id})'>Uppdatera användare</button>
                <button class='btn-standard' onclick='renderDeleteUserConfirm(${user.id})'>Ta bort användare</button>
            </div>
        `;//<button class='btn-standard' onclick='renderUsersBookingTable(${user.id})'>Användarens bokningar</button>
    } else {
        html += `
            <div>
                <button class='btn-standard' onclick='showPage("view-cars")'>Tillbaka</button>        
                <button class='btn-standard' onclick='renderUpdateUserForm(${user.id})'>Uppdatera användare</button>
            </div>
        `;
    }
    content.innerHTML = html;
}
async function renderUsersBookingTable(userId) {
    console.log('----- renderUsersBookingTable ------');
    const content = document.getElementById('content-area');
    const table = document.createElement('table');
    table.classList.add('table-rows');

    // === DEFINIERA KOLUMNER ===
    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'active', label: 'Aktiv' },
        { id: 'carId', label: 'Bil' },
        { id: 'fromDate', label: 'Startdatum' },
        { id: 'toDate', label: 'Återlämningsdatum' }
    ];

    // === ANVÄND DEN NYA FUNKTIONEN ===
    const thead = createSortableThead(columns, currentBookingSortColumn, isBookingSortAscending, (column) => {
        if (currentBookingSortColumn === column) {
            isBookingSortAscending = !isBookingSortAscending;
        } else {
            currentBookingSortColumn = column;
            isBookingSortAscending = true;
        }
        bookings = sortData(bookings, column, isBookingSortAscending);
        drawBookingsTable(tbody, bookings, false); // false = visa inte användar-id
    });

    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    let bookings = await apiFetch(`/bookings/user/${userId}`);//apiGetBookingsByUserId(userId);
    content.innerHTML = '';
    content.appendChild(table);

    drawBookingsTable(tbody, bookings, false);
    // ALLA manuella event listeners är borttagna härifrån också!
}

function drawBookingsTable(tbody, bookings, showUserId) {
    tbody.innerHTML = '';
    bookings.forEach(booking => {
        console.log('booking: ' + booking.id);
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');
        let html = `
            <td data-label='Id'>${booking.id}</td>
            <td>${booking.active ? '🟢 Aktiv' : '🔴 Avslutad'}</td>
            <td data-label='Bil id'>${booking.carId}</td>
        `;
        if (showUserId) {
            html += `
                <td data-label='Anvöndar id'>${booking.userId}</td>
            `;
        }
        html += `
            <td data-label='Startdatum'>${booking.fromDate}</td>
            <td data-label='Slutdatum'>${booking.toDate}</td>
        `;
        tr.innerHTML = html;
        tr.addEventListener('click', () => renderBooking(booking.id));
        tbody.appendChild(tr);
    });
} async function renderBooking(bookingId) {
    console.log('!!!!!! renderBooking !!!!!!');
    const content = document.getElementById('content-area');

    const booking = await apiFetch(`/bookings/${bookingId}`);//apiGetBookingsById(bookingId);
    if (!booking) return;

    const [car, user] = await Promise.all([
        apiFetch(`/cars/${booking.carId}`),
        apiFetch(`/users/${booking.userId}`)
    ]); if (!car || !user) return;

    const status = booking.active ? 'Pågående' : 'Avslutad';
    const price = calculateTotalPrice(booking.fromDate, booking.toDate, car.price);

    // Hämta roll och ID en gång så blir koden lättare att läsa
    const userRole = sessionStorage.getItem('userRole');
    const loggedInUserId = sessionStorage.getItem('userId');

    let html = `
        <div class='booking-card'>
            <h2>Bokning: ${booking.id}</h2>
            <div class='booking-info-grid'>
                <p><strong>${status} bokning</strong></p>
                <p><strong>Bil:</strong> ${car.name} ${car.model}</p>
                <p><strong>Datum:</strong> ${booking.fromDate}  -  ${booking.toDate}</p>
                <p><strong>Totalt pris:</strong> ${price}kr</p>
                <p><strong>Namn:</strong> ${user.firstName} ${user.lastName}</p>
                <p><strong>Telefon:</strong> ${user.phone}</p>
                <p><strong>Email:</strong> ${user.email}</p>
            </div>       
            <div class='booking-actions'>     
                <button class='btn btn-standard' id='btn-back-booking'>Tillbaka</button>
    `;

    // RENDERINGS-KONTROLLER (Här fixade vi parenteserna)
    if (userRole === 'ADMIN') {
        html += `<button class='btn btn-standard' id='btn-remove-booking'>Ta bort</button>`;
    }

    if (booking.active) {
        html += `<button class='btn btn-standard' id='btn-end-booking'>Avsluta</button>`;

        if (userRole === 'ADMIN') {
            html += `<button class='btn btn-standard' id='btn-update-booking'>Ändra</button>`;
        }
    }

    html += `
            </div>
        </div>
    `;
    content.innerHTML = html;

    // === HÄNDELSELYSSNARE ===

    // 1. TILLBAKA-KNAPPEN (Smart styrning baserat på vem som är inloggad)
    const backBtn = document.getElementById('btn-back-booking');
    if (userRole === 'ADMIN') {
        // Admin ska ALLTID tillbaka till den stora adminvyn
        backBtn.addEventListener('click', () => renderBookingsView());
    } else {
        // Vanliga användare ska tillbaka till sina egna bokningar
        backBtn.addEventListener('click', () => renderBookingsForUser());
    }

    // 2. TA BORT (Kolla om knappen finns, lägg till lyssnare om den gör det)
    const removeBtn = document.getElementById('btn-remove-booking');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => renderDeleteBookingConfirm(bookingId));
    }

    // 3. AVSLUTA
    const endBtn = document.getElementById('btn-end-booking');
    if (endBtn) {
        endBtn.addEventListener('click', () => renderEndBookingConfirm(bookingId));
    }

    // 4. ÄNDRA
    const updateBtn = document.getElementById('btn-update-booking');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => renderUpdateBookingForm(bookingId));
    }
}
async function renderUpdateUserForm(userId) {
    console.log('!!!!!! renderUpdateUserForm !!!!!!');
    const content = document.getElementById('content-area');

    try {
        const user = await apiFetch(`/users/${userId}`);//apiGetUserById(userId);
        if (!user) return;

        content.innerHTML = `
            <div class='update-user-container'>
                <h2>Uppdatera användare: ${user.username}</h2>
                <form id='update-user-form'>
                    <input type='hidden' id='update-id' value='${user.id}'>

                    <div class='form-group'>
                        <label for='firstName'>Förnamn:</label>
                        <input type='text' id='firstName' value='${user.firstName || ''}' required>
                        
                        <label for='lastName'>Efternamn:</label>
                        <input type='text' id='lastName' value='${user.lastName || ''}' required>
                        
                        <label for='phone'>Telefonnummer:</label>
                        <input type='text' id='phone' value='${user.phone || ''}' required>
                        
                        <label for='email'>Email:</label>
                        <input type='email' id='email' value='${user.email || ''}' required>
                    </div>

                    <div class='form-group'>
                        <label for='password'>Nytt lösenord:</label>
                        <input type='password' id='password' minlength='4'>
                        
                        <label for='password2'>Repetera lösenord:</label>
                        <input type='password' id='password2' minlength='4'>
                    </div>
                    <button type='button' id='btn-cancel' class='btn btn-standard'>Avbryt</button>
                    <button type='submit' class='btn btn-standard'>Spara ändringar</button>
                    <p id='update-error' style='color: red; display: none;'></p>
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
        console.error('Kunde inte ladda användareformulär:', error);
    }
}
function renderDeleteUserConfirm(userId) {
    console.log(`!!!!!! renderDeleteUserConfirm för id ${userId} !!!!!!`);
    customConfirm(
        `Är du helt säker på att du vill ta bort användaren med ID ${userId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteUserSubmit(userId);
        }
    );
}

function renderEndBookingConfirm(bookingId) {
    console.log(`!!!!!! renderEndBookingConfirm för id ${bookingId} !!!!!!`);

    customConfirm(
        `Är du helt säker på att du vill avsluta bokning med ID ${bookingId}?`,
        () => {
            handleEndBookingSubmit(bookingId);
        }
    );
}
function renderDeleteBookingConfirm(bookingId) {
    console.log(`!!!!!! renderDeleteBookingConfirm för bokning: ${bookingId} !!!!!!`);
    customConfirm(
        `Är du helt säker på att du vill ta bort bokning med ID ${bookingId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteBookingSubmit(bookingId);
        }
    );
}
/*
function renderReturnCarConfirm(carId) {
    console.log(`!!!!!! renderReturnCarConfirm för bil: ${carId} !!!!!!`);
    customConfirm(
        `Är du helt säker på att du vill lämna tillbaka bil med ID ${carId}?`,
        () => {
            handleReturnCarSubmit(carId);
        }
    );
}
*/
async function renderUpdateCarForm(carId) {
    console.log(`!!!!!! renderUpdateCarForm för bil: ${carId} !!!!!!`);
    const content = document.getElementById('content-area');

    try {
        const car = await apiFetch(`/cars/${carId}`);//apiGetCarById(carId);
        if (!car) return;

        // 1. Rita ut formuläret på skärmen
        content.innerHTML = `
            <div class='update-car-container'>
                <h2>Uppdatera bil med id: ${carId}</h2>
                <form id='update-car-form'>
                    <input type='hidden' id='update-id' value='${carId}'>

                    <div class='form-group'>
                        <label for='name'>Namn:</label>
                        <input type='text' id='name' value='${car.name || ''}' required>
                        <label for='model'>Modell:</label>
                        <input type='text' id='model' value='${car.model || ''}' required>
                        <label for='price'>Pris:</label>
                        <input type='text' id='price' value='${car.price || ''}' required>
                        <label for='type'>Typ:</label>
                        <input type='text' id='type' value='${car.type || ''}' required>
                        <label for='feature1'>Tillbehör 1:</label>
                        <input type='text' id='feature1' value='${car.feature1 || ''}'>
                        <label for='feature2'>Tillbehör 2:</label>
                        <input type='text' id='feature2' value='${car.feature2 || ''}'>
                        <label for='feature3'>Tillbehör 3:</label>
                        <input type='text' id='feature3' value='${car.feature3 || ''}'>
                        
                    </div>
                    <button type='button' id='btn-cancel' class='btn btn-standard'>Avbryt</button>
                    <button type='submit' class='btn btn-standard'>Uppdatera</button>
                    <p id='update-error' style='color: red; display: none;'></p>
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
        console.error('Kunde inte ladda användareformulär:', error);
    }
}
function renderNewCarView() {
    console.log('!!!!!! renderNewCarView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `
            <div class='new-car-container'>
                <h2>Ny bil</h2>
                <form id='new-car-form'>
                    <div class='form-group'>
                        <label for='name'>Namn:</label>
                        <input type='text' id='name' placeholder='Volvo' required>
                        <label for='model'>Modell:</label>
                        <input type='text' id='model' placeholder='V70' required>
                        <label for='price'>Pris:</label>
                        <input type='text' id='price' placeholder='2500' required>
                        <label for='type'>Typ:</label>
                        <input type='text' id='type' placeholder='Kombi' required>
                        <label for='feature1'>Tillbehör 1:</label>
                        <input type='text' id='feature1' placeholder='AC'>
                        <label for='feature2'>Tillbehör 2:</label>
                        <input type='text' id='feature2' placeholder='AC'>
                        <label for='feature3'>Tillbehör 3:</label>
                        <input type='text' id='feature3' placeholder='AC'>
                        <label for='car-image-input'>Bilbild:</label>
                        <input type='file' id='car-image-input' accept='image/*'>
                    </div>
                    <button type='button' id='btn-cancel' class='btn btn-standard'>Avbryt</button>
                    <button type='submit' class='btn btn-standard'>Skapa</button>
                    <p id='car-error' style='color: red; display: none;'>Kunde inte skapa bil.</p>
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
}async function renderBookingsForUser() {
    console.log('!!!!!! renderBookingsForUser !!!!!!');
    const content = document.getElementById('content-area');

    // 1. Hämta datan först av allt så vi har något att visa och sortera!
    let bookings = await apiFetch(`/bookings/me`);
    if (!bookings) return; // Om något gick fel i apiFetch, avbryt

    // 2. Skapa tabellen och tbody
    const table = document.createElement('table');
    table.classList.add('table-rows');
    const tbody = document.createElement('tbody');

    // 3. Definiera vilka kolumner vi vill ha i tabellen
    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'active', label: 'Aktiv' },
        { id: 'carId', label: 'Bil' },
        { id: 'fromDate', label: 'Startdatum' },
        { id: 'toDate', label: 'Återlämningsdatum' }
    ];

    // 4. Använd din smarta, färdiga hjälpfunktion (Den skapar allt och fixar klick-lyssnare!)
    const thead = createSortableThead(columns, currentBookingSortColumn, isBookingSortAscending, (column) => {
        if (currentBookingSortColumn === column) {
            isBookingSortAscending = !isBookingSortAscending;
        } else {
            currentBookingSortColumn = column;
            isBookingSortAscending = true;
        }
        
        // Sortera datan och rita om tabellens rader
        bookings = sortData(bookings, column, isBookingSortAscending);
        drawBookingsTable(tbody, bookings, false);
    });

    // 5. Sätt ihop och tryck ut på skärmen
    table.appendChild(thead);
    table.appendChild(tbody);

    content.innerHTML = '';
    content.appendChild(table);

    // 6. Rita ut raderna första gången sidan laddas
    drawBookingsTable(tbody, bookings, false);
}
/* ==========================================================================
   ==========================================================================
   HANDLERS / EVENTS 
   ==========================================================================
   ========================================================================== */
async function handleLoginSubmit() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    //const response = await apiLogin(username, password);
    const userData = await apiLogin(username, password);
    //if (response && response.ok) {
    if (userData) {
        //const userData = await response.json();
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
        errorMsg.textContent = 'Lösenorden matchar inte!';
        errorMsg.style.display = 'block';
        return;
    }

    const userData = { firstName, lastName, username, phone, email, password };
    const savedUser = await apiFetch('/users', 'POST', userData);//apiCreateUser(userData);

    if (savedUser) {

        if (sessionStorage.getItem('userRole') === 'GUEST' || !sessionStorage.getItem('userRole')) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userRole', 'USER');
            sessionStorage.setItem('userId', savedUser.id);
            sessionStorage.setItem('firstName', savedUser.firstName);

            renderMenu('USER');
            showPage('view-cars');
        } else if (sessionStorage.getItem('userRole') === 'ADMIN') {
            customAlert('Ny användare skapad av admin!', 'positive');
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
        errorMsg.textContent = 'Alla fält måste fyllas i!';
        errorMsg.style.display = 'block';
        return;
    }
    if (password !== password2 || password === '') {
        errorMsg.textContent = 'Lösenorden matchar inte eller är tomma!';
        errorMsg.style.display = 'block';
        return;
    }

    const userData = {
        firstName, lastName, username, phone, email, password,
        'noOfOrders': sessionStorage.getItem('noOfOrders'),
        'role': sessionStorage.getItem('userRole')
    };

    const response = await apiFetch(`/users/${userId}`, 'PUT', userData);

    if (response) {
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
        customAlert('Du kan inte ta bort ditt eget konto!', 'negative');
        return;
    }

    // Ropa på API-funktionen och VÄNTA (await) på svaret
    const response = await apiFetch(`/users/${userId}`, 'DELETE');//apiDeleteUser(userId);

    // Hantera resultatet på skärmen
    if (response) {
        customAlert(`Användare med id ${userId} borttagen ur databasen.`, 'positive');
        showPage('view-users');
    } else {
        customAlert('Kunde inte ta bort användaren.', 'negative');
    }
}
async function handleDeleteBookingSubmit(bookingId) {
    console.log('!!!!!! handleDeleteBookingSubmit !!!!!!');

    const response = await apiFetch(`/bookings/${bookingId}`, 'DELETE');//apiDeleteBooking(bookingId);

    if (response) {
        customAlert(`Bokning med id ${bookingId} borttagen ur databasen.`, 'positive');
        renderBookingsView();
    } else {
        customAlert('Kunde inte ta bort bokningen.', 'negative');
    }
}
async function handleEndBookingSubmit(bookingId) {
    console.log('!!!!!! handleEndBookingSubmit !!!!!!');

    const response = await apiFetch(`/bookings/${bookingId}`, 'PUT');//apiEndBooking(bookingId);

    if (response) {
        customAlert(`Bokning med id ${bookingId} är avslutad.`, 'positive');
        renderBooking(bookingId);
    } else {
        customAlert('Kunde inte avsluta bokningen.', 'negative');
    }
}

async function handleBookCarSubmit(carId) {
    console.log(`!!!!!! handleBookCarSubmit för bil: ${carId} !!!!!!`);
    const car = await apiFetch(`/cars/${carId}`);//apiGetCarById(carId);
    if (!car) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const today = new Date().toLocaleDateString('sv-SE');

    modalOverlay.innerHTML = `
        <div class='modal-content text-alert'>
            <h3>Boka ${car.name} ${car.model}</h3>
            <div class='modal-message'>
                <p><strong>Startdatum:</strong> ${today}</p>
                <div style='margin-top: 15px;'>
                    <label for='booking-days'><b>Antal dagar:</b></label>
                    <select id='booking-days' class='form-control' style='margin-top: 5px; padding: 5px;'>
                        <option value='1'>1 dag</option>
                        <option value='2' selected>2 dagar</option>
                        <option value='3'>3 dagar</option>
                        <option value='4'>4 dagar</option>
                        <option value='5'>5 dagar</option>
                        <option value='6'>6 dagar</option>
                        <option value='7'>7 dagar</option>
                    </select>
                </div>
            </div>
            <div class='modal-buttons'>
                <button type='button' id='btn-modal-cancel' class='btn btn-standard'>Avbryt</button>
                <button type='button' id='btn-modal-book' class='btn btn-standard'>Boka</button>
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
        const bookingData = {
            fromDate: today,
            toDate: endDate,
            carId: carId,
            userId: sessionStorage.getItem('userId')
        };
        const response = await apiFetch(`/bookings`, 'POST', bookingData);
        if (response) {
            customAlert('Bilen har bokats!', 'positive');
            renderBookingsForUser(); // Skicka användaren till sina bokningar
        }
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
        errorMsg.textContent = 'Alla fält utom egenskaper måste fyllas i!';
        errorMsg.style.display = 'block';
        return;
    }

    const carData = {
        name, model, feature1, feature2, feature3, type, price
    };

    const response = await apiFetch(`/cars/${carId}`, 'PUT', carData);//apiUpdateCar(carId, carData);

    if (response) {

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
    const response = await apiFetch(`/cars/${carId}`, 'DELETE');//apiDeleteCar(carId);

    // Hantera resultatet på skärmen
    if (response) {
        customAlert(`Bil med id ${carId} borttagen ur databasen.`, 'positive');
        showPage('view-cars');
    } else {
        customAlert('Kunde inte ta bort bilen.', 'negative');
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
    const car = await apiFetch(`/cars`, 'POST', formData, true);//apiCreateCar(formData);

    // 3. Hantera resultatet på skärmen baserat på hur det gick
    if (car) {
        customAlert('Bilen är sparad!', 'positive');
        renderCarDetails(car.id);
    } else {
        errorMsg.style.display = 'block';
    }
}

/* ==========================================================================
   ==========================================================================
   APP INITIALIZATION & SIDEBAR EVENTS
   ==========================================================================
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
        sessionStorage.clear();
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