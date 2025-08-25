document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailDisplay = document.getElementById('userEmailDisplay');
    const settingsBtn = document.getElementById('settingsBtn');

    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.settings-modal .close-button');
    const themeOptions = document.querySelector('.theme-options');
    const viewTransactionsBtn = document.getElementById('viewTransactionsBtn');
    const transactionsDisplay = document.getElementById('transactionsDisplay');

    function showMessage(text, type) {
        const messageElement = document.getElementById('message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = 'message ' + type;
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message';
            }, 5000);
        } else {
            console.log(`Message (${type}): ${text}`);
        }
    }

    function generateRandomId(length = 10) {
        return Math.random().toString(36).substring(2, 2 + length);
    }

    function getStoredUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function setStoredUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    function getLoggedInUser() {
        return localStorage.getItem('loggedInUser');
    }

    function setLoggedInUser(email) {
        localStorage.setItem('loggedInUser', email);
        checkLoginStatus();
    }

    function clearLoggedInUser() {
        localStorage.removeItem('loggedInUser');
        checkLoginStatus();
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = signupForm.elements['email'].value;
            const password = signupForm.elements['password'].value;
            const confirmPassword = signupForm.elements['confirmPassword'].value;

            if (password !== confirmPassword) {
                showMessage("Passwords do not match!", 'error');
                return;
            }
            if (password.length < 6) {
                showMessage("Password should be at least 6 characters.", 'error');
                return;
            }

            const users = getStoredUsers();
            if (users.some(user => user.email === email)) {
                showMessage("Email already registered!", 'error');
                return;
            }

            users.push({ id: generateRandomId(), email, password });
            setStoredUsers(users);
            showMessage('Signup successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.elements['email'].value;
            const password = loginForm.elements['password'].value;

            const users = getStoredUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                setLoggedInUser(email);
                showMessage('Login successful! Redirecting to marketplace...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage('Invalid email or password.', 'error');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearLoggedInUser();
            showMessage('Logged out successfully.', 'success');
            if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                 window.location.href = 'index.html';
            }
        });
    }

    function checkLoginStatus() {
        const loggedInUserEmail = getLoggedInUser();

        if (loggedInUserEmail) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (signupBtn) signupBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (settingsBtn) settingsBtn.classList.remove('hidden');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = `Welcome, ${loggedInUserEmail}`;
                userEmailDisplay.classList.remove('hidden');
            }
            applySavedTheme();
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (signupBtn) signupBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (settingsBtn) settingsBtn.classList.add('hidden');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = '';
                userEmailDisplay.classList.add('hidden');
            }
            document.body.className = '';
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'purple' } }));
        }
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    function applyTheme(themeName) {
        document.body.className = '';
        if (themeName && themeName !== 'purple') {
            document.body.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem('selectedTheme', themeName);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
    }

    function applySavedTheme() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'purple';
        if (themeOptions) {
            const radio = themeOptions.querySelector(`input[value="${savedTheme}"]`);
            if (radio) radio.checked = true;
        }
        applyTheme(savedTheme);
    }

    if (themeOptions) {
        themeOptions.addEventListener('change', (e) => {
            if (e.target.name === 'theme') {
                applyTheme(e.target.value);
            }
        });
    }

    function loadTransactions() {
        const loggedInUserEmail = getLoggedInUser();
        if (!loggedInUserEmail) return [];

        let transactions = JSON.parse(localStorage.getItem('transactions')) || {};
        if (!transactions[loggedInUserEmail]) {
            transactions[loggedInUserEmail] = [
                { id: 't001', plugin: 'Super Jump Plugin', date: '2025-07-01', price: '$5.00' },
                { id: 't002', plugin: 'Creative Build Tools', date: '2025-07-15', price: '$12.99' },
                { id: 't003', plugin: 'Fly Command Script', date: '2025-08-01', price: '$2.50' }
            ];
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }
        return transactions[loggedInUserEmail];
    }

    if (viewTransactionsBtn) {
        viewTransactionsBtn.addEventListener('click', () => {
            const tx = loadTransactions();
            if (transactionsDisplay) {
                transactionsDisplay.innerHTML = '';
                if (tx.length > 0) {
                    tx.forEach(transaction => {
                        const p = document.createElement('p');
                        p.textContent = `${transaction.date}: ${transaction.plugin} (${transaction.price})`;
                        transactionsDisplay.appendChild(p);
                    });
                } else {
                    transactionsDisplay.innerHTML = '<p>No transactions found.</p>';
                }
                transactionsDisplay.classList.toggle('hidden');
            }
        });
    }

    checkLoginStatus();
    if (document.body.classList.contains('auth-page') === false) {
        applySavedTheme();
    }
});
