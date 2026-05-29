/*
kolla fokus och tab
user bokar bil så kommer man tillbaka till fel ställe
om user user uppdaterar sin profil så krashar det, hens username uppdateras till mailen

 Säkra upp relationerna dynamiskt och ge specifika texter
    const carName = booking.car 
        ? `${booking.car.name} ${booking.car.model}` 
        : `⚠️ Bil (ID: ${booking.carId || 0}) finns inte i databasen längre`;

    const userName = booking.user 
        ? `${booking.user.firstName} ${booking.user.lastName}` 
        : `⚠️ Kund (ID: ${booking.userId || 0}) finns inte i databasen längre`;

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
const urlLogin = 'http://localhost:8080/api/v1/auth/login';
const urlCars = 'http://localhost:8080/api/v1/cars';
const urlUsers = 'http://localhost:8080/api/v1/users';
const urlBookings = 'http://localhost:8080/api/v1/bookings';

let currentBookingFilter = 'all';
let currentUserSortColumn = 'id';
let isUserSortAscending = true;
let currentBookingSortColumn = '';
let isBookingSortAscending = true;
let lastPageForBackButton = null;
let currentCarSortColumn = 'id';
let isCarSortAscending = true;

/* ==========================================================================
   ==========================================================================
   1. API / FETCH FUNCTIONS (Enbart kommunikation med din Spring Boot backend)
   ==========================================================================
   ========================================================================== */
/*
async function apiFetch(endpoint, method = 'GET', body = null, isMultipart = false) {
    console.log('apiFetch');
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
if (response.status === 404 && method === 'GET') {
            return [];
        }
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
}*/async function apiLogin(username, password) {
    console.log('apiLogin');
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
        customAlert('Serverfel. Kunde inte ansluta till inloggningstjänsten.', 'negative');
        return null;
    }
}

/////////////  CARS  ////////////////////////
async function apiGetCars() {
    console.log('!!!!!! apiGetCars !!!!!!');
    try {
        const response = await fetch(`${urlCars}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Nätverksfel vid apiGetCars", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
    }
}

async function apiGetCarById(carId) {
    console.log(`!!!!!! apiGetCarById(${carId}) !!!!!!`);
    try {
        const response = await fetch(`${urlCars}/${carId}`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': sessionStorage.getItem('basicAuth') 
            }
        });
        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Bil med id ${carId} hittades inte.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetCarById:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
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
        customAlert("Serverfel. Kunde inte spara bilen.", 'negative');
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
        customAlert("Serverfel. Ändringarna kunde inte sparas.", 'negative');
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
        console.error("Nätverksfel vid apiDeleteCar:", error);
        customAlert("Serverfel. Bilen kunde inte raderas.", 'negative');
        return null;
    }
}

///////////////  BOOKINGS  ///////////////
async function apiGetBookings() {
    console.log('!!!!!! apiGetBookings !!!!!!');
    try {
        const response = await fetch(`${urlBookings}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });

        // Smart fix: Om backend ger 404 för att listan är helt tom, returnera en tom array istället för null
        if (response.status === 404) return [];

        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Nätverksfel vid apiGetBookings:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
    }
}

async function apiGetBookingById(bookingId) {
    console.log(`!!!!!! apiGetBookingById() !!!!!!`);
    try {
        const response = await fetch(`${urlBookings}/${bookingId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Bokning med id ${bookingId} hittades inte.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetBookingById:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
    }
}

async function apiGetBookingsForLoggedInUser() {
    console.log(`!!!!!! apiGetBookingsForLoggedInUser() !!!!!!`);
    try {
        const response = await fetch(`${urlBookings}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });
        
        // FIX: Om användaren inte har några bokningar ännu skickar backend 404.
        // Vi returnerar en tom array [] istället för att visa ett felmeddelande!
        if (response.status === 404) {
            return [];
        }

        if (response.ok) {
            return await response.json();
        } else {
            customAlert('Kunde inte hämta dina bokningar.', 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetBookingsorLoggedInUser:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
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

        if (response.status === 404) {
            return []; 
        }

        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Kunde inte hämta bokningar för användare med id ${userId}.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetBookingsByUserId:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
    }
}

async function apiGetActiveBookings() {
    console.log(`!!!!!! apiGetActiveBookings() !!!!!!`);
    try {
        const response = await fetch(`${urlBookings}/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });
        
        if (response.status === 404) {
            return [];
        }

        if (response.ok) {
            return await response.json();
        } else {
            customAlert('Kunde inte hämta aktiva bokningar.', 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetActiveBookings:", error);
        customAlert("Serverfel. Kunde inte hämta aktiva bokingar", 'negative');
        return null;
    }
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
        
        if (response.status === 403) {
            const errorText = await response.text();
            console.error("--- 403 FORBIDDEN DETALJER ---", errorText);
            customAlert("Nekat tillträde. Du har inte behörighet att skapa denna bokning.", 'negative');
        }
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiCreateBooking:", error);
        customAlert("Serverfel. Det gick inte att skapa bokningen.", 'negative');
        return null;
    }
}

async function apiBookingReturnCar(bookingId) {
    console.log(`!!!!!! apiBookingReturnCar(${bookingId}) !!!!!!`);
    try {
        const response = await fetch(`${urlBookings}/return/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });

        if (response.status === 404) {
            customAlert(`Bokning med ID ${bookingId} hittades inte på servern.`, 'negative');
            return null;
        }

        if (!response.ok) {
            customAlert('Kunde inte avsluta bokningen. Ett serverfel uppstod.', 'negative');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Nätverksfel vid apiBookingReturnCar:", error);
        customAlert('Kunde inte ansluta till servern. Kontrollera din anslutning.', 'negative');
        return null;
    }
}
async function apiUpdateBooking(bookingId, bookingData) {
    console.log(`apiUpdateBooking`);
    try {
        const response = await fetch(`${urlBookings}/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            },
            body: JSON.stringify(bookingData)
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiUpdateBooking:", error);
        customAlert("Serverfel. Det gick inte att uppdatera bokningen.", 'negative');
        return null;
    }
}

async function apiDeleteBooking(bookingId) {
    try {
        const response = await fetch(`${urlBookings}/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': sessionStorage.getItem('basicAuth')
            }
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiDeleteBooking:", error);
        customAlert("Serverfel. Bokningen kunde inte raderas.", 'negative');
        return null;
    }
}
////////////////  USER  /////////////////
async function apiGetUsers() {
    console.log('!!!!!! apiGetUsers !!!!!!');
    try {
        const response = await fetch(`${urlUsers}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        return response.ok ? await response.json() : null;
    } catch (error) {
        console.error("Nätverksfel vid apiGetUsers:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
        return null;
    }
}

async function apiGetUserById(userId) {
    console.log(`!!!!!! apiGetUserById(${userId}) !!!!!!`);
    try {
        const response = await fetch(`${urlUsers}/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': sessionStorage.getItem('basicAuth') }
        });
        if (response.ok) {
            return await response.json();
        } else {
            customAlert(`Användare med id ${userId} hittades inte.`, 'negative');
            return null;
        }
    } catch (error) {
        console.error("Nätverksfel vid apiGetUserById:", error);
        customAlert("Serverfel. Kontrollera att din backend är igång!", 'negative');
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
        customAlert("Kunde inte registrera konto. Kontrollera nätverket.", 'negative');
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
        customAlert("Serverfel. Det gick inte att uppdatera profilen.", 'negative');
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
            }
        });
        return response;
    } catch (error) {
        console.error("Nätverksfel vid apiDeleteUser:", error);
        customAlert("Serverfel. Användaren kunde inte raderas.", 'negative');
        return null;
    }
}
/* ==========================================================================
   ==========================================================================
   2. UTILITIES
   ==========================================================================
   ========================================================================== */

async function updateUserSession(userId) {
    console.log('updateUserSession');
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
    console.log('customAlert');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';
    const btnClass = type === 'negative' ? 'btn-negative' : 'btn-positive';

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

    document.body.appendChild(overlay);

    document.getElementById('custom-alert-ok-btn').onclick = function () {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
}

function customConfirm(message, onConfirm) {
    console.log('customConfirm');
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
    console.log('sortData');
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
    console.log('calculateTotalPrice');
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
    console.log('createSortableThead');
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
function handleBackButton() {
    console.log('handleBackButton');
    if (lastPageForBackButton) {
        lastPageForBackButton.page(lastPageForBackButton.id);
    } else {
        showPage('view-cars');
    }
}
/* ==========================================================================
   ==========================================================================
   RENDER FUNCTIONS 
   ==========================================================================
   ========================================================================== */

function renderMenu(userRole) {
    console.log('renderMenu');
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
    console.log('showPage');
    const allButtons = document.querySelectorAll('.sidebar button');
    allButtons.forEach(btn => btn.classList.remove('active'));

    allButtons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(viewId)) {
            btn.classList.add('active');
        }
    });

    const content = document.getElementById('content-area');
    lastPageForBackButton = null;
    switch (viewId) {
        case 'view-login':
            renderLoginView();
            return;
        case 'view-cars':
            renderCarsView();
            break;
        case 'view-car-new':
            renderNewCarView();
            break;
        case 'view-users':
            renderUserTable();
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
    console.log('renderLoginView');
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
}async function renderBookingsView() {
    console.log('renderBookingsView');
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
        <div class='table-container' id='bookings-table-container'></div>
    `;

    const tableContainer = document.getElementById('bookings-table-container');

    if (currentBookingFilter === 'active') {
        bookings = await apiGetActiveBookings();
    } else {
        currentBookingFilter = 'all';
        bookings = await apiGetBookings();
    }

    if (!bookings) return; 

    function updateTableDisplay() {
        tableContainer.innerHTML = ''; // Rensa behållaren först

        if (bookings.length === 0) {
            // Om listan är tom, rita inte ut tabellrubrikerna, visa denna text istället:
            const message = currentBookingFilter === 'active' 
                ? 'Det finns inga aktiva bokningar för tillfället.' 
                : 'Det finns inga bokningar registrerade i systemet.';
            
            tableContainer.innerHTML = `<p class='no-data-msg' style='padding: 20px; font-style: italic; color: #666;'>${message}</p>`;
            return;
        }

        // Om det fanns data, skapa och montera tabellen precis som förut
        const table = document.createElement('table');
        table.classList.add('table-rows');
        const tbody = document.createElement('tbody');

        const columns = [
            { id: 'id', label: 'Id' },
            { id: 'active', label: 'Aktiv' },
            { id: 'carId', label: 'Bil' },
            { id: 'userId', label: 'Kund' },
            { id: 'fromDate', label: 'Startdatum' },
            { id: 'toDate', label: 'Återlämningsdatum' }
        ];

        const thead = createSortableThead(columns, currentBookingSortColumn, isBookingSortAscending, (column) => {
            if (currentBookingSortColumn === column) {
                isBookingSortAscending = !isBookingSortAscending;
            } else {
                currentBookingSortColumn = column;
                isBookingSortAscending = true;
            }
            bookings = sortData(bookings, column, isBookingSortAscending);
            drawBookingsTable(tbody, bookings, true, renderBookingsView);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        tableContainer.appendChild(table);

        drawBookingsTable(tbody, bookings, true, renderBookingsView);
    }

    updateTableDisplay();

    document.getElementById('btn-booking-all').addEventListener('click', async () => {
        currentBookingFilter = 'all';
        document.getElementById('btn-booking-all').classList.add('active');
        document.getElementById('btn-booking-active').classList.remove('active');

        bookings = await apiGetBookings();
        if (!bookings) return;
        updateTableDisplay();
    });

    document.getElementById('btn-booking-active').addEventListener('click', async () => {
        currentBookingFilter = 'active';
        document.getElementById('btn-booking-all').classList.remove('active');
        document.getElementById('btn-booking-active').classList.add('active');

        bookings = await apiGetActiveBookings();
        if (!bookings) return;
        updateTableDisplay();
    });
}
function renderNewUserView() {
    console.log('renderNewUserView');
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
                <p id='create-user-error' style='color: red; display: none;'>Kunde inte skapa konto.</p>
            </form>
        </div>
    `;

    document.getElementById('new-user-form').onsubmit = function (e) {
        e.preventDefault();
        lastPageForBackButton = { page: renderNewUserView, id: null };
        handleCreateUserSubmit();
    };
    content.querySelector('#btn-cancel').addEventListener('click', () => {
        handleBackButton();
    });
}
async function renderCarsView() {
    console.log('renderCarsView');
    const content = document.getElementById('content-area');
    const cars = await apiGetCars();

    if (!cars || cars.length === 0) {
        content.innerHTML = '<p>Inga bilar hittades.</p>';
        return;
    }
    if (sessionStorage.getItem('userRole') !== 'ADMIN') {
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

        renderCarCards(cars);

        document.getElementById('car-sort').addEventListener('change', (e) => {
            const sortBy = e.target.value;
            let sortedCars = [...cars];

            if (sortBy === 'name') {
                sortedCars.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'type') {
                sortedCars.sort((a, b) => a.type.localeCompare(b.type));
            }
            renderCarCards(sortedCars);
        });
    } else {

        content.innerHTML = `
            <h2>Administrera vagnpark</h2>
            <p>Klicka på en rad för att ändra, ta bort eller se detaljer för bilen.</p>
            <div class='filter-bar admin-mobile-sort'>
                <label for='admin-car-sort'>Sortera bilar efter:</label>
                <select id='admin-car-sort' class='form-control'>
                    <option value='id'>Id</option>
                    <option value='name'>Märke</option>
                    <option value='model'>Modell</option>
                    <option value='type'>Typ</option>
                    <option value='price'>Pris/dag</option>
                    <option value='booked'>Status</option>
                </select>
            </div>
            <div class='table-container' id='admin-car-table-container'></div>
        `;

        renderAdminCarsTable(cars);

        const mobileSortSelect = document.getElementById('admin-car-sort');
        if (mobileSortSelect) {
            mobileSortSelect.value = currentCarSortColumn;

            mobileSortSelect.addEventListener('change', (e) => {
                currentCarSortColumn = e.target.value;
                isCarSortAscending = true;

                renderAdminCarsTable(cars);
            });
        }
    }
}

function renderAdminCarsTable(cars) {
    console.log('renderAdminCarsTable');
    const container = document.getElementById('admin-car-table-container');
    container.innerHTML = '';
    if (currentCarSortColumn) {
        cars = sortData(cars, currentCarSortColumn, isCarSortAscending); // Använder din befintliga sortData
    }

    const table = document.createElement('table');
    table.classList.add('table-rows');
    const tbody = document.createElement('tbody');

    // Definiera kolumnerna för bilar
    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'name', label: 'Märke' },
        { id: 'model', label: 'Modell' },
        { id: 'type', label: 'Typ' },
        { id: 'price', label: 'Pris/dag' },
        { id: 'booked', label: 'Status' }
    ];

    const thead = createSortableThead(columns, currentCarSortColumn, isCarSortAscending, (column) => {
        if (currentCarSortColumn === column) {
            isCarSortAscending = !isCarSortAscending;
        } else {
            currentCarSortColumn = column;
            isCarSortAscending = true;
        }
        // Sortera om och rita om raderna vid klick på kolumnrubrik
        cars = sortData(cars, column, isCarSortAscending);
        drawCarsTableRows(tbody, cars);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
    drawCarsTableRows(tbody, cars);
}
function drawCarsTableRows(tbody, cars) {
    console.log('drawCarsTableRows');
    tbody.innerHTML = '';
    cars.forEach(car => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');
        tr.setAttribute('role', 'link');
        tr.setAttribute('tabindex', '0');
        tr.innerHTML = `
            <td data-label= 'Id'>${car.id}</td>
            <td data-label= 'Märke'>${car.name}</td>
            <td data-label= 'Modell'>${car.model}</td>
            <td data-label= 'Typ'>${car.type}</td>
            <td data-label= 'Pris'>${car.price}</td>
            <td data-label= 'Status'>${car.booked ? '🔴 Uthyrd' : '🟢 Ledig'}</td>
        `;
        const navigateToCar = () => {
            lastPageForBackButton = { page: renderCarsView, id: null };
            renderCarDetails(car.id);
        };

        tr.addEventListener('click', navigateToCar);
        tr.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToCar();
            }
        });
        tbody.appendChild(tr);
    });
}
function renderCarCards(carsArray) {
    console.log('renderCarCards');
    const listElement = document.getElementById('car-list');
    if (!listElement) return;
    listElement.innerHTML = '';

    carsArray.forEach(car => {
        const li = document.createElement('li');
        const panel = document.createElement('div');
        panel.classList.add('panel');

        panel.setAttribute('tabindex', '0');
        panel.setAttribute('role', 'button');
        panel.setAttribute('aria-label', `Visa detaljer för ${car.name} ${car.model}`);
        if (car.booked == true) {
            panel.classList.add('panel-negative');
        } else {
            panel.classList.add('panel-positive');
        }
        const imageSrc = car.image ? `data:image/webp;base64,${car.image}` : 'img/default.png';

        panel.innerHTML = `
            <div class='panel-img-container'>
                <img src='${imageSrc}' alt='' class='car-image'> 
            </div>
            <div class='panel-text-content'>
                <p><b>${car.name}</b> ${car.model}, Typ: ${car.type || 'Okänd'}, Pris: ${car.price} kr/dag</p>
            </div>
        `;

        panel.addEventListener('click', () => {
            lastPageForBackButton = { page: renderCarsView, id: null };
            renderCarDetails(car.id);
        });

        // Gör så att det går att trycka på Enter/Space för att öppna (Strikt WCAG-krav för VG!)
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                lastPageForBackButton = { page: renderCarsView, id: null };
                renderCarDetails(car.id);
            }
        });

        li.appendChild(panel);
        listElement.appendChild(li);
    });
}

async function renderCarDetails(carId) {
    console.log('renderCarDetails');
    const car = await apiGetCarById(carId);
    if (!car) return;

    const content = document.getElementById('content-area');
    const userRole = sessionStorage.getItem('userRole');
    const imageSrc = car.image ? `data:image/png;base64,${car.image}` : 'img/default.jpg';

    let html = `
        <h2>${car.name} ${car.model}</h2>
        <img src='${imageSrc}' class='detail-image'>
        <p><strong>Pris:</strong> ${car.price} kr</p>
        <p><strong>Typ:</strong> ${car.type}</p>
        <p>${car.feature1 || ''}, ${car.feature2 || ''}, ${car.feature3 || ''}</p>
        <div class='actions-container'>
            <button id='btn-cancel' class='btn-standard btn'>Avbryt</button>    
    `;
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
            <button id='btn-update-car' class='btn-standard btn'>Uppdatera</button>
            `;
        if (!car.booked) { 
            html += `
            <button id='btn-return-car' class='btn-negative btn'>Lämna tillbaka bil</button>
            `
        } else {
            html += `
            <button id='btn-delete-car' class='btn-negative btn'>Ta bort</button>
            `;
        }

    }
    html += `</div>
        `;

    content.innerHTML = html;

    const cancelBtn = content.querySelector('#btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            handleBackButton();
        });
    }
    const bookCarBtn = content.querySelector('#btn-book-car');
    if (bookCarBtn) {
        bookCarBtn.addEventListener('click', () => {
            lastPageForBackButton = {page: renderCarDetails, id: carId};
            handleBookCarSubmit(carId);
        });
    }
    const updateCarBtn = content.querySelector('#btn-update-car');
    if (updateCarBtn) {
        updateCarBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderCarDetails, id: carId };
            renderUpdateCarForm(carId)
        });
    }

    const deleteCarBtn = content.querySelector('#btn-delete-car');
    if (deleteCarBtn) {
        deleteCarBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderCarDetails, id: carId };
            renderDeleteCarConfirm(carId)
        });
    }

    const returnCarBtn = content.querySelector('#btn-return-car');
    if (returnCarBtn) {
        returnCarBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderCarDetails, id: carId };
            renderEndBookingConfirm(carId);
        });
    }
}
async function renderUserTable() {
    console.log('renderUserTable');
    const content = document.getElementById('content-area');

    let users = await apiGetUsers();
    if (!users) {
        content.innerHTML = '<p>Kunde inte ladda användare.</p>';
        return;
    }

    if (currentUserSortColumn) {
        users = sortData(users, currentUserSortColumn, isUserSortAscending);
    }

    content.innerHTML = `
        <h2>Administrera användare</h2>
        <div class='filter-bar admin-mobile-sort'>
            <label for='user-sort'>Sortera användare efter:</label>
            <select id='user-sort' class='form-control'>
                <option value='id'>Id</option>
                <option value='name'>Namn</option>
                <option value='username'>Username</option>
            </select>
        </div>
        <div id='admin-user-table-container' class='table-container'></div>
    `;

    const table = document.createElement('table');
    table.classList.add('table-rows');
    const tbody = document.createElement('tbody');

    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'name', label: 'Namn' },
        { id: 'username', label: 'Username' }
    ];

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
    table.appendChild(tbody);

    document.getElementById('admin-user-table-container').appendChild(table);

    drawUsersTable(tbody, users);

    // === MOBILSORTERING ===
    const userSortSelect = document.getElementById('user-sort');
    if (userSortSelect) {
        userSortSelect.value = currentUserSortColumn;

        userSortSelect.addEventListener('change', (e) => {
            currentUserSortColumn = e.target.value;
            isUserSortAscending = true;

            users = sortData(users, currentUserSortColumn, isUserSortAscending);
            drawUsersTable(tbody, users);
        });
    }
}
function drawUsersTable(tbody, users) {
    console.log('drawUsersTable');
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');
        tr.setAttribute('role', 'link');
        tr.setAttribute('tabindex', '0');

        tr.innerHTML = `
            <td data-label='Id:'>${user.id}</td>
            <td data-label='Namn:'>${user.firstName} ${user.lastName}</td>
            <td data-label='Username:'>${user.username}</td>
        `;

        tr.addEventListener('click', () => {
            lastPageForBackButton = { page: renderUserTable };
            renderUserProfile(user.id);
        });
        tbody.appendChild(tr);
    });
}
async function renderUserProfile(userId) {
    console.log('renderUserProfil');
    const content = document.getElementById('content-area');
    const user = await apiGetUserById(userId);
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
    html += `
            <button class='btn btn-standard' id='btn-cancel'>Avbryt</button>        
            <button class='btn btn-standard' id='btn-update-user'>Uppdatera</button>
    `;
    if (sessionStorage.getItem('userId') != userId) {
        html += `
            <button class='btn btn-standard' id='btn-bookings'>Bokningar</button>
            <button class='btn btn-standard' id='btn-remove-user'>Ta bort</button>
        `;
    }
    html += `</div>`;
    content.innerHTML = html;
    const cancelBtn = content.querySelector('#btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            handleBackButton();
        });
    }
    const updateBtn = content.querySelector('#btn-update-user');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderUserProfile, id: userId };
            renderUpdateUserForm(user.id);
        });
    }
    const bookingsBtn = content.querySelector('#btn-bookings');
    if (bookingsBtn) {
        bookingsBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderUserProfile, id: userId };
            renderUsersBookingTable(user.id);
        });
    }
    const removeBtn = content.querySelector('#btn-remove-user');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderUserProfile, id: userId };
            renderDeleteUserConfirm(user.id);
        });
    }

}
async function renderUsersBookingTable(userId) {
    console.log('renderUsersBookingTable');
    const content = document.getElementById('content-area');
    const table = document.createElement('table');
    table.classList.add('table-rows');
    let bookings = await apiGetBookingsByUserId(userId);//apiFetch(`/bookings/user/${userId}`);
    if (!bookings) {
        return; 
    }
    if (bookings.length === 0) {
        content.innerHTML = `
            <div class='info-box'>
                <h2>Användarens bokningar</h2>
                <p>Denna användare har inga registrerade bokningar för tillfället.</p>
                <button id='btn-back' class='btn btn-standard' style='margin-top: 15px;'>Tillbaka</button>
            </div>
        `;
        
        content.querySelector('#btn-back').addEventListener('click', () => {
            handleBackButton();
        });
        return;
    }
    const columns = [
        { id: 'id', label: 'Id' },
        { id: 'active', label: 'Aktiv' },
        { id: 'carId', label: 'Bil' },
        { id: 'fromDate', label: 'Startdatum' },
        { id: 'toDate', label: 'Återlämningsdatum' }
    ];

    const thead = createSortableThead(columns, currentBookingSortColumn, isBookingSortAscending, (column) => {
        if (currentBookingSortColumn === column) {
            isBookingSortAscending = !isBookingSortAscending;
        } else {
            currentBookingSortColumn = column;
            isBookingSortAscending = true;
        }
        bookings = sortData(bookings, column, isBookingSortAscending);
        drawBookingsTable(tbody, bookings, false, () => renderUsersBookingTable(userId));
    });

    const tbody = document.createElement('tbody');
    table.appendChild(thead);
    table.appendChild(tbody);

    content.innerHTML = '';
    content.appendChild(table);

    drawBookingsTable(tbody, bookings, false, () => renderUsersBookingTable(userId));
}

function drawBookingsTable(tbody, bookings, showUserId, backPageAction = null) {
    console.log('drawBookingsTable');
    tbody.innerHTML = '';
    bookings.forEach(booking => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');
        tr.setAttribute('role', 'link');    // Berätta att raden fungerar som en länk
        tr.setAttribute('tabindex', '0');
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

        const navigateToBooking = () => {
            if (backPageAction) {
                lastPageForBackButton = { page: backPageAction, id: null };
            } else {
                lastPageForBackButton = { page: renderBookingsView, id: null };
            }
            renderBooking(booking.id);
        };
        tr.addEventListener('click', navigateToBooking);
        tr.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToBooking();
            }
        });
        tbody.appendChild(tr);
    });
}

async function renderBooking(bookingId) {
    console.log('renderBooking');
    const content = document.getElementById('content-area');

    const booking = await apiGetBookingById(bookingId);
    if (!booking) return;

    const [car, user] = await Promise.all([
        apiGetCarById(booking.carId),
        apiGetUserById(booking.userId)
    ]); if (!car || !user) return;

    const status = booking.active ? 'Pågående' : 'Avslutad';
    const price = calculateTotalPrice(booking.fromDate, booking.toDate, car.price);

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
                <button class='btn btn-standard' id='btn-cancel'>Avbryt</button>
    `;

    if (userRole === 'ADMIN') {
        if (booking.active) {
            html += `<button class='btn btn-standard' id='btn-end-booking'>Avsluta</button>`;
        }
        html += `   
            <button class='btn btn-standard' id='btn-update-booking'>Ändra</button>
            <button class='btn btn-standard' id='btn-remove-booking'>Ta bort</button>
        `;
    }
    html += `
            </div>
        </div>
    `;
    content.innerHTML = html;

    const cancelBtn = content.querySelector('#btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            handleBackButton();
        });
    }

    const removeBtn = content.querySelector('#btn-remove-booking');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderBooking, id: bookingId };
            renderDeleteBookingConfirm(bookingId)
        });
    }

    const endBtn = content.querySelector('#btn-end-booking');
    if (endBtn) {
        endBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderBooking, id: bookingId };
            renderEndBookingConfirm(bookingId);
        });
    }

    const updateBtn = content.querySelector('#btn-update-booking');
    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            lastPageForBackButton = { page: renderBooking, id: bookingId };
            renderUpdateBookingForm(bookingId);
        }
        );
    }
}async function renderUpdateBookingForm(bookingId) {
    console.log('renderUpdateBookingForm');
    const content = document.getElementById('content-area');

    try {
        const booking = await apiGetBookingById(bookingId);
        if (!booking) return; // apiGetBookingById visar felmeddelande om bokningen inte finns

        content.innerHTML = `
            <div class='update-booking-container'>
                <h2>Uppdatera bokning: ${booking.id}</h2>
                <form id='update-booking-form'>
                    <input type='hidden' id='update-id' value='${booking.id}'>

                    <div class='form-group'>
                        <label for='startDate'>Från datum:</label>
                        <input type='date' id='startDate' value='${booking.fromDate || ''}' required>
                        
                        <label for='endDate'>Till datum:</label>
                        <input type='date' id='endDate' value='${booking.toDate || ''}' required>
                        
                        <label for='userId'>Kund id:</label>
                        <input type='text' id='userId' value='${booking.userId || ''}' required>
                        
                        <label for='carId'>Bil id:</label>
                        <input type='text' id='carId' value='${booking.carId || ''}' required>
                        <label for='active'>Aktiv bokning:</label>
                            <select id='active' class='form-control' required>
                                <option value='true' ${booking.active === true ? 'selected' : ''}>Ja (Aktiv)</option>
                                <option value='false' ${booking.active === false ? 'selected' : ''}>Nej (Avslutad)</option>
                            </select>
                    </div>
                    <button type='button' id='btn-cancel' class='btn btn-standard'>Avbryt</button>
                    <button type='submit' class='btn btn-standard'>Spara</button>
                    <p id='update-error' style='color: red; display: none;'></p>
                </form>
            </div>
        `;

        document.getElementById('update-booking-form').addEventListener('submit', (e) => {
            e.preventDefault(); 
            handleUpdateBookingSubmit();
        });

        content.querySelector('#btn-cancel').addEventListener('click', () => {
            handleBackButton();
        });
    } catch (error) {
        console.error('Kunde inte ladda bokningsformulär:', error);
    }
}
async function renderUpdateUserForm(userId) {
    console.log('renderUpdateUserForm');
    const content = document.getElementById('content-area');

    try {
        const user = await apiGetUserById(userId);//apiFetch(`/users/${userId}`);
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
                    <button type='submit' class='btn btn-standard'>Spara</button>
                    <p id='update-error' style='color: red; display: none;'></p>
                </form>
            </div>
        `;

        document.getElementById('update-user-form').addEventListener('submit', (e) => {
            e.preventDefault(); // Hindra sidan från att laddas om
            handleUpdateUserSubmit();
        });
        content.querySelector('#btn-cancel').addEventListener('click', () => {
            handleBackButton();
        });
    } catch (error) {
        console.error('Kunde inte ladda användareformulär:', error);
    }
}
function renderDeleteUserConfirm(userId) {
    console.log('renderDeleteUserConfirm');
    customConfirm(
        `Är du helt säker på att du vill ta bort användaren med ID ${userId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteUserSubmit(userId);
        }
    );
}

function renderDeleteCarConfirm(carId) {
    console.log('renderDeleteCarConfirm');
    customConfirm(
        `Är du helt säker på att du vill ta bort bil med ID ${carId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteCarSubmit(carId);
        }
    );
}
function renderEndBookingConfirm(bookingId) {
    console.log('renderEndBookingConfirm');
    customConfirm(
        `Är du helt säker på att du vill avsluta bokning med ID ${bookingId}?`,
        () => {
            handleEndBookingSubmit(bookingId);
        }
    );
}

function renderDeleteBookingConfirm(bookingId) {
console.log('renderDeleteBookingConfirm');
    customConfirm(
        `Är du helt säker på att du vill ta bort bokning med ID ${bookingId}? Denna åtgärd kan inte ångras.`,
        () => {
            handleDeleteBookingSubmit(bookingId);
        }
    );
}
async function renderUpdateCarForm(carId) {
    console.log('renderUpdateCarForm');
    const content = document.getElementById('content-area');

    try {
        const car = await apiGetCarById(carId);//apiFetch(`/cars/${carId}`);
        if (!car) return;

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

        document.getElementById('update-car-form').addEventListener('submit', (e) => {
            e.preventDefault(); 
            //lastPageForBackButton = {page: renderUpdateCarForm, id: carId};
            handleUpdateCarSubmit(carId);
        });
        content.querySelector('#btn-cancel').addEventListener('click', () => {
            handleBackButton();
        });
    } catch (error) {
        console.error('Kunde inte ladda användareformulär:', error);
    }
}
function renderNewCarView() {
    console.log('renderNewCarView');
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
    content.querySelector('#btn-cancel').addEventListener('click', () => {
        handleBackButton();
    });
} async function renderBookingsForUser() {
    console.log('renderBookingsForUser');
    const content = document.getElementById('content-area');

    let bookings = await apiGetBookingsForLoggedInUser();//apiFetch(`/bookings/me`);
    if (!bookings) return;
    if (bookings.length === 0) {
        content.innerHTML = `
            <h2>Mina bokningar</h2>
            <div class='info-box'>
                <p>Du har inga registrerade bokningar för tillfället.</p>
            </div>
        `;
        return; 
    }
    const table = document.createElement('table');
    table.classList.add('table-rows');
    const tbody = document.createElement('tbody');

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
        drawBookingsTable(tbody, bookings, false, renderBookingsForUser);
    });

    // 5. Sätt ihop och tryck ut på skärmen
    table.appendChild(thead);
    table.appendChild(tbody);

    content.innerHTML = '';
    content.appendChild(table);

    // 6. Rita ut raderna första gången sidan laddas
    drawBookingsTable(tbody, bookings, false, renderBookingsForUser);
}
/* ==========================================================================
   ==========================================================================
   HANDLERS / EVENTS 
   ==========================================================================
   ========================================================================== */
async function handleLoginSubmit() {
    console.log('handleLoginSubmit');
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
    console.log('handleCreateUserSubmit');
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const errorMsg = document.getElementById('create-user-error');

    if (password !== password2) {
        errorMsg.textContent = 'Lösenorden matchar inte!';
        errorMsg.style.display = 'block';
        return;
    }

    const userData = { firstName, lastName, username, phone, email, password };
    const savedUser = await apiCreateUser(userData);

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

async function handleUpdateBookingSubmit() {
    console.log('handleUpdateBookingSubmit');
    const bookingId = document.getElementById('update-id').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const userId = document.getElementById('userId').value;
    const carId = document.getElementById('carId').value;
    const active = document.getElementById('active').value === 'true';
    const errorMsg = document.getElementById('update-error');
    errorMsg.style.display = 'none';

    if (!startDate.trim() || !endDate.trim() || !userId.trim() || !carId.trim()) {
        errorMsg.textContent = 'Alla fält måste fyllas i!';
        errorMsg.style.display = 'block';
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        errorMsg.textContent = 'Till-datumet kan inte vara före från-datumet!';
        errorMsg.style.display = 'block';
        return; 
    }

    const bookingData = {
        id: bookingId, 
        fromDate: startDate, 
        toDate: endDate, 
        userId: userId, 
        carId: carId, 
        active: active
    };
    const response = await apiUpdateBooking(bookingId, bookingData);

    if (response) {
            customAlert('Bokning uppdaterad framgångsrikt!', 'positive');
            showPage('view-bookings');
        
    } else {
        errorMsg.textContent = 'Kunde inte uppdatera bokning.';
        errorMsg.style.display = 'block';
    }
}
async function handleUpdateUserSubmit() {
    console.log('handleUpdateUserSubmit');
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

    const response = await apiUpdateUser(userId, userData);

    if (response) {
        if (sessionStorage.getItem('userRole') === 'ADMIN') {
            customAlert('Användare uppdaterad framgångsrikt!', 'positive');
            showPage('view-users');
        } else if (sessionStorage.getItem('userId') == userId) {
            //här,fel
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
console.log('handleDeleteUserSubmit');

    // Säkerhetskoll så man inte tar bort sig själv
    if (userId == sessionStorage.getItem('userId')) {
        customAlert('Du kan inte ta bort ditt eget konto!', 'negative');
        return;
    }

    const response = await apiDeleteUser(userId);

    if (response) {
        customAlert(`Användare med id ${userId} borttagen ur databasen.`, 'positive');
        showPage('view-users');
    } else {
        customAlert('Kunde inte ta bort användaren.', 'negative');
    }
}
async function handleDeleteBookingSubmit(bookingId) {
    console.log('handleDeleteBookingSubmit');
    const response = await apiDeleteBooking(bookingId);

    if (response) {
        lastPageForBackButton = { page: renderBookingsView, id: null };
        customAlert(`Bokning med id ${bookingId} borttagen ur databasen.`, 'positive');
        renderBookingsView();
    } else {
        customAlert('Kunde inte ta bort bokningen.', 'negative');
    }
}
async function handleEndBookingSubmit(bookingId) {
    console.log('handleEndBookingSubmit');
    const response = await apiBookingReturnCar(bookingId);//apiFetch(`/bookings/return/${bookingId}`, 'PUT');

    if (response) {
        customAlert(`Bokning med id ${bookingId} är avslutad.`, 'positive');
        lastPageForBackButton = { page: renderBookingsView, id: null };
        renderBooking(bookingId);
    } else {
        customAlert('Kunde inte avsluta bokningen.', 'negative');
    }
}

async function handleBookCarSubmit(carId) {
    console.log('handleBookCarSubmit(carI');
    const car = await apiGetCarById(carId);//apiFetch(`/cars/${carId}`);
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
        /*const bookingData = {
            fromDate: today,
            toDate: endDate,
            carId: carId,
            userId: sessionStorage.getItem('userId')
        };*/
        const response = await apiCreateBooking(today, endDate, carId, sessionStorage.getItem('userId'));//apiFetch(`/bookings`, 'POST', bookingData);
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
    console.log('handleUpdateCarSubmit(');
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

    const response = await apiUpdateCar(carId, carData);

    if (response) {

        customAlert('Bil uppdaterad framgångsrikt!', 'positive');
        //showPage('view-cars');
        renderCarDetails(carId);

    } else {
        errorMsg.textContent = 'Kunde inte uppdatera bil.';
        errorMsg.style.display = 'block';
    }
}

async function handleDeleteCarSubmit(carId) {
    console.log('handleDeleteCarSubmit(');
    const response = await apiDeleteCar(carId);//apiFetch(`/cars/${carId}`, 'DELETE');

    if (response) {
        customAlert(`Bil med id ${carId} borttagen ur databasen.`, 'positive');
        showPage('view-cars');
    } else {
        customAlert('Kunde inte ta bort bilen.', 'negative');
    }
}

async function handleCreateCarSubmit() {
    console.log('handleCreateCarSubmit() ');
    const errorMsg = document.getElementById('car-error');
    errorMsg.style.display = 'none';

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

    const car = await apiCreateCar(formData);//apiFetch(`/cars`, 'POST', formData, true);

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
    console.log('closeMobileMenu');
    document.querySelector('.sidebar').classList.remove('mobile-open');
}

function initApp() {
    console.log('initApp');
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