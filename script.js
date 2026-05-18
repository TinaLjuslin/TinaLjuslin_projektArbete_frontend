/*
om man är inloggad som admin kan man ta bort sig själv i listan
om man skapar ny användare blir man inte längre inloggad direkt
om en användare ändrar sin email, ändra username, logga ut och be om inlogg igen
*/

const menuItems = [
    { name: 'Hem', view: 'view-introduction', roles: ['USER', 'ADMIN'] },
    { name: 'Bokning', view: 'view-booking', roles: ['USER', 'ADMIN'] },
    { name: 'Bilar', view: 'view-car', roles: ['USER', 'ADMIN', 'GUEST'] },
    { name: 'Visa användare', view: 'view-user-get-all', roles: ['ADMIN'] },
    { name: 'Ny användare', view: 'view-user-new', roles: ['ADMIN'] },
    { name: 'Logga in', view: 'view-login', roles: ['GUEST'] },
    { name: 'Ny användare', view: 'view-user-new', roles: ['GUEST'] },
    { name: 'Min profil', view: 'view-profile', roles: ['USER', 'ADMIN'] },
    { name: 'Logga ut', view: 'view-logout', roles: ['USER', 'ADMIN'] }

];

/**
 * Shows the main page and calls to show the menu for the correct user, or log in if no one is logged in.
 * @param {*} viewId viewId the id of the page to show
 * @returns -
 */
async function showPage(viewId) {
    console.log('!!!!!! showPage !!!!!!');
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
            content.innerHTML = `<h1>Hej ${sessionStorage.getItem('firstName')} användare med id: ${sessionStorage.getItem('userId')}</h1>`;
            break;
        case 'view-booking':
            content.innerHTML = `<h1>view-booking</h1>`;
            break;
        case 'view-car':
            displayCars();
            break;
        case 'view-user-get-all':
            content.innerHTML = `<h1>view-user-get-all</h1>`;
            const users = await getAllUsers();
            showAllUsers(users);
            break;
        case 'view-user-get-by-id':
            content.innerHTML = `<h1>view-user-get-by-id</h1>`;
            break;
        case 'view-user-update':
            content.innerHTML = `<h1>view-user-update</h1>`;
            break;
        case 'view-user-new':
            showNewUserView();
            break;
        case 'view-profile':
            showProfile();
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
/**
 * Draws the menu for the user who is logged in (admin or user) if no one is logged in only 'Logga in' 
 * is shown in the menu
 * @param {*} userRole the role of the user who is logged in, or 'GUEST' if no one is logged in  
 */
function renderMenu(userRole) {
    console.log('!!!!!! renderMenu !!!!!!');
    const menuContainer = document.getElementById('main-menu');
    menuContainer.innerHTML = '';

    menuItems.forEach(item => {
        if (item.roles.includes(userRole)) {
            const li = document.createElement('li');

            const btn = document.createElement('button');
            btn.textContent = item.name;

            // KOLLA HÄR: Om det finns undermeny
            /*          if (item.subItems) {
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
          */                // Vanlig knapp utan undermeny
            btn.onclick = () => showPage(item.view);
            li.appendChild(btn);
            //        }

            menuContainer.appendChild(li);
        }
    });
}

// Växla menyn på mobil
document.getElementById('menu-toggle').onclick = function () {
    document.querySelector('.sidebar').classList.toggle('mobile-open');
};

function closeMobileMenu() {
    console.log('!!!!!! closeMobileMenu !!!!!!');
    document.querySelector('.sidebar').classList.remove('mobile-open');
}
/**
 * Shows log in view
 */
function showLoginView() {
    console.log('!!!!!! showLoginView !!!!!!');
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

    // Koppla ett event när man skickar formuläret
    document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault(); // Förhindra att sidan laddas om
        handleLogin();
    };
}
/**
 * Sends username and password to backend and saves data to sessionStorage if it is a correct login
 */
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const userData = await response.json();

            // 1. Spara bas-data direkt
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userId', userData.userId);
            const role = userData.isAdmin ? 'ADMIN' : 'USER';
            sessionStorage.setItem('userRole', role);

            // 2. Hämta resten av profilen (namn osv) innan vi går vidare
            await setUserData(userData.userId);

            // 3. Uppdatera UI
            renderMenu(role);
            showPage('view-introduction');

        } else {
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Inloggningsfel:", error);
        alert("Kunde inte ansluta till servern.");
    }
}/**
 * Creates a table with all users for main content
 * @param {*} users an array of all users
 */
function showAllUsers(users) {
    console.log('!!!!!! showAllUsers !!!!!!');
    const content = document.getElementById('content-area');
    if (users === null) {

    }
    let tableHTML = `
        <table class='table-rows'>
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Namn</th>
                    <th>Username</th>
                </tr>
            </thead>
            <tbody>
    `;
    users.forEach(user => {
        tableHTML += `
        <tr onclick="handleGetUserById(${user.id})" class="clickable-row">
            <td>${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.username}</td>
        </tr>
        `
    });
    tableHTML += `</tbody></table>`
    content.innerHTML = tableHTML;
}

function showProfile() {
    handleGetUserById(sessionStorage.getItem('userId'));
}

async function handleGetUserById(userId) {
    console.log('!!!!!! handleGetUserById !!!!!!');
    const content = document.getElementById('content-area');

    // Hämta specifika användaren
    const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }, credentials: 'include'
    });
    const user = await response.json();
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
    //om det inte är samma som inloggad, visa tabort-knapp
    if (sessionStorage.getItem('userId') != userId) {
        html += `
                <button class="btn-standard" onclick="showPage('view-user-get-all')">Tillbaka till listan</button>    
                <button class="btn-standard" onclick="updateUserView(${user.id})">Uppdatera användare</button>
                <button class="btn-standard" onclick="removeUserView(${user.id})">Ta bort användare</button>
            </div>
        `;
    } else {
        html += `
                <button class="btn-standard" onclick="updateUserView(${user.id})">Uppdatera användare</button>
            </div>
            `;
    }
    content.innerHTML = html;
}

async function updateUserView(userId) {
    console.log('!!!!!! updateUserView !!!!!!');
    const content = document.getElementById('content-area');

    try {
        // 1. Hämta datan och vänta tills den är klar
        const user = await getUserData(userId);

        // Dubbelkolla i konsolen att objektet ser ut som du tror
        console.log("User data mottagen:", user);

        // 2. Skapa formuläret med value i alla fält
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

                    <button type="button" onclick="handleUpdateUser()" class="btn btn-standard">Spara ändringar</button>
                    
                    <p id="update-error" style="color: red; display: none;">Bla bla bla</p>
                </form>
            </div>
        `;
    } catch (error) {
        console.error("Kunde inte ladda användare:", error);
        content.innerHTML = "<p>Kunde inte hämta användardata.</p>";
    }

    // Koppla ett event när man skickar formuläret
    document.getElementById('update-user-form').onsubmit = function (e) {
        e.preventDefault(); // Förhindra att sidan laddas om
        handleUpdateUser();
    };
}

async function handleUpdateUser() {
    console.log('!!!!!! handleUpdateUser !!!!!!');
    const userId = document.getElementById('update-id').value;
    const firstName = document.getElementById('firstName').value;

    console.log('!!!!!! handleUpdateUser 2 !!!!!!');
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;
    const errorMsg = document.getElementById('update-error');
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
    console.log('!!!!!! handleUpdateUser 3 !!!!!!');
    /*if (password === "" && password2 === "") {
        //hämta gamla lösenordet och spara
    }*/
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
        errorMsg.textContent = "Alla fält (Namn, Efternamn, E-post och Telefon) måste fyllas i!";
        errorMsg.style.display = 'block';
        return; // Avbryt funktionen här
    }
    if (password !== password2 || password === "" || password === null) {
        errorMsg.textContent = "Lösenorden matchar inte!";
        errorMsg.style.display = 'block';
        return;
    }
    try {
        console.log('!!!!!! handleUpdateUser 4 !!!!!!');
        const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "firstName": firstName,
                "lastName": lastName,
                "username": username,
                "phone": phone,
                "email": email,
                'password': password,
                "noOfOrders": sessionStorage.getItem('noOfOrders'),
                "role": sessionStorage.getItem('userRole'),
            }), credentials: 'include'
        });
        if (response.ok) {
            //1 admin
            //2 användare uppdaterar sig själv men inte email
            //3 användare uppdaterar sitt email, ska bli utloggad
            const userData = await response.json();

            if (sessionStorage.getItem('userRole') === 'ADMIN') {
                console.log('!!!!!! handleUpdateUser 6 !!!!!!');
                alert('AnvÄndare uppdaterad');
                renderMenu(sessionStorage.getItem('userRole'));
                showPage('view-user-get-all');
            } else if (sessionStorage.getItem('userId') == userId) {
                console.log('!!!!!! handleUpdateUser 7 !!!!!!');
                if (sessionStorage.getItem('email') === email) {
                    renderMenu(sessionStorage.getItem('userRole'));
                    await setUserData(userId);
                    showPage('view-introduction');
                } else {
                    alert('Användare uppdaterad, eftersom du bytt email behöver du logga in med ditt nya email som användarnamn');
                    sessionStorage.clear();
                    renderMenu('GUEST');
                    showPage('view-login')

                }
            }
        } else {
            errorMsg.textContent = 'Kunde inte uppdatera konto, email kan vara upptaget.';
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}
function showNewUserView() {
    console.log('!!!!!! showNewUserView !!!!!!');
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
                <button type="submit" class="btn btn-standard">Skapa</button>
                <p id="login-error" style="color: red; display: none;">Fel användarnamn eller lösenord.</p>
            </form>
        </div>
    `;

    // Koppla ett event när man skickar formuläret
    document.getElementById('new-user-form').onsubmit = function (e) {
        e.preventDefault(); // Förhindra att sidan laddas om
        handleNewUser();
    };
}
async function getAllUsers() {
    console.log('!!!!!! getallUsers !!!!!!');
    try {
        const response = await fetch('http://localhost:8080/api/v1/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        if (response.ok) {
            console.log('response ok, get all');
            const userData = await response.json();
            return userData;
        } else {
            return;
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}
async function handleNewUser() {
    console.log('!!!!!! handleNewUser !!!!!!');
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
    try {

        const response = await fetch('http://localhost:8080/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "firstName": firstName,
                "lastName": lastName,
                "username": username,
                "phone": phone,
                "email": email,
                "password": password,
            })
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('userData: ' + userData);
            if (sessionStorage.getItem('userRole') === 'GUEST') {
                console.log('2');
                sessionStorage.setItem('isLoggedIn', 'true');

                console.log("Ny användare skapad och inloggad!", userData);
                sessionStorage.setItem('userRole', 'USER');
                sessionStorage.setItem('userId', userData.id);

                const roleToUse = 'USER';
                renderMenu(roleToUse);
                const name = userData.firstName;
                sessionStorage.setItem('firstName', name);
                // 2. Visa välkomstsidan
                showPage('view-introduction');
            } else if (sessionStorage.getItem('userRole') === 'ADMIN') {
                console.log('3');
                const content = document.getElementById('content-area');
                content.innerHTML = `
                    <div class="user-card">
                        <h2>Användarprofil: ${userData.username}</h2>
                        <div class="user-info-grid">
                            <p><strong>ID:</strong> ${userData.id}</p>
                            <p><strong>Namn:</strong> ${userData.firstName} ${userData.lastName}</p>
                            <p><strong>E-post:</strong> ${userData.email}</p>
                            <p><strong>Telefon:</strong> ${userData.phone}</p>
                            <p><strong>Antal bokningar:</strong> ${userData.noOfOrders}</p>
                        </div>
                        <button class="btn-standard" onclick="showPage('view-user-get-all')">Tillbaka till listan</button>
                             
                    </div>
                `;

            }

        } else {
            errorMsg.textContent = 'Kunde inte skapa konto, email kan vara upptaget.';
            errorMsg.style.display = 'block';
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}


function removeUserView(userId) {
    console.log('!!!!!! removeUserView !!!!!!');
    const content = document.getElementById('content-area');
    content.innerHTML = `<h2>Ta bort användare, är du säker på att du vill ta bort användare med id ${userId}?</h2>
    <button class='btn btn-standard' id='btn-remove-user' onclick='removeUser(${userId})'>Ta bort</button>`
}
async function removeUser(userId) {
    console.log('!!!!!! removeUser !!!!!!');
    if (userId == sessionStorage.getItem('userId')) {
        alert("Du kan inte ta bort ditt eget konto!");
        return;
    }
    try {
        const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            console.log("Användaren raderad (Status 204)");

            const content = document.getElementById('content-area');
            content.innerHTML = `
                <div class="alert-success">
                    <h2>Användare med id ${userId} borttagen</h2>
                    <button class="btn-standard" onclick="showPage('view-user-get-all')">Tillbaka till listan</button>
                </div>`;
        } else {
            // Om status t.ex. är 403 eller 500
            alert("Kunde inte ta bort användaren. Kontrollera behörighet.");
        }
    } catch (error) {
        console.error("Nätverksfel:", error);
    }
}
// Uppdatera din showPage-funktion så den anropar closeMobileMenu()
function initApp() {
    console.log('!!!!!! initApp !!!!!!');
    const savedRole = sessionStorage.getItem('userRole');
    if (!savedRole) {
        sessionStorage.setItem('userRole', 'GUEST');
        renderMenu('GUEST');
        showPage('view-login');
    } else {
        renderMenu(savedRole);
        showPage('view-introduction');
    }
}
async function getUserData(userId) {
    console.log('!!!!!! getUserData !!!!!!');
    try {
        const response = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}
async function getCars() {
    console.log('!!!!!! getCars !!!!!!');
    try {
        const response = await fetch(`http://localhost:8080/api/v1/cars`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const cars = await response.json();
            return cars;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Kunde inte nå API:et", error);
        alert("Serverfel. Kontrollera att din backend är igång!");
    }
}


async function setUserData(userId) {
    const user = await getUserData(userId);
    console.log('!!!!!! setUserData !!!!!!');
    sessionStorage.setItem('firstName', user.firstName);
    sessionStorage.setItem('lastName', user.lastName);
    sessionStorage.setItem('phone', user.phone);
    sessionStorage.setItem('email', user.email);
    sessionStorage.setItem('noOfOrders', user.noOfOrders);
}


//ritar bilar
async function displayCars() { // 1. Gör funktionen async
    const content = document.getElementById('content-area');

    // 2. Vänta på att bilarna faktiskt hämtas
    const cars = await getCars();

    if (cars && cars.length > 0) {
        content.innerHTML = '<ul id="car-list"></ul>'; // Skapa en behållare
        const listElement = document.getElementById('car-list');

        cars.forEach((car, index) => {
            const li = document.createElement('li');
            const panel = document.createElement('div');
            panel.classList.add('panel');
            let imageSrc = 'img/default.jpg'; 

        // 2. Om bilden finns, använd den direkt (Ingen konvertering behövs!)
        if (car.image) { 
            imageSrc = `data:image/webp;base64,${car.image}`;
        }
    let btnClass = 'btn-standard';

            panel.innerHTML = `
                <div class='panel-img-container'>
                    <img src="${imageSrc}" alt="${car.name} ${car.model}" class="car-image">
                </div>
                <div class='panel-text-content'>

                    <h4>${car.name} ${car.model}</h4>
                    <p>Pris: ${car.price}</p>
                    <p>${car.feature1} ${car.feature2} ${car.feature3}</p>
                </div>
                <button id='btn-${car.id}' class='${btnClass}'>
                    Boka nu
                </button>
            `;
            li.appendChild(panel);
            listElement.appendChild(li);
        });
    } else {
        content.innerHTML = '<p>Inga bilar hittades.</p>';
    }
}
initApp();
