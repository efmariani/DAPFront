// ============================================================
// CONFIG
// ============================================================
const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // SESSION CHECK & NAVBAR UPDATE
    // ============================================================
    const token = localStorage.getItem('dap_token');
    const userData = JSON.parse(localStorage.getItem('dap_user') || 'null');

    const loginTriggerEl = document.getElementById('login-trigger');
    const signupTriggerEl = document.getElementById('signup-trigger');
    const navCta = document.querySelector('.nav-cta');

    if (token && userData && navCta) {
        // User is logged in: replace auth buttons with dashboard link + logout
        const nombre = userData.nombre || userData.email || 'Usuario';
        navCta.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary" id="btn-dashboard">
                <i class="fas fa-th-large"></i> Mi Panel
            </a>
            <button class="btn btn-secondary" id="btn-logout-nav" style="cursor:pointer;">
                <i class="fas fa-sign-out-alt"></i> Salir
            </button>`;
        document.getElementById('btn-logout-nav').addEventListener('click', () => {
            localStorage.removeItem('dap_token');
            localStorage.removeItem('dap_user');
            window.location.reload();
        });
    }

    // ============================================================
    // 1. Mobile Menu Toggle
    // ============================================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenu.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // ============================================================
    // 2. Navbar Scroll Effect
    // ============================================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.padding = '8px 0';
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.padding = '15px 0';
                navbar.style.background = 'rgba(255, 255, 255, 0.85)';
            }
        });
    }

    // ============================================================
    // 3. Auth Modal Logic
    // ============================================================
    const authModal = document.getElementById('auth-modal');
    const loginTrigger = document.getElementById('login-trigger');
    const signupTrigger = document.getElementById('signup-trigger');
    const closeModal = document.querySelector('.close-modal');
    const loginContainer = document.getElementById('login-container');
    const signupContainer = document.getElementById('signup-container');
    const goToSignup = document.getElementById('go-to-signup');
    const goToLogin = document.getElementById('go-to-login');

    const openModal = (mode) => {
        if (!authModal) return;
        authModal.style.display = 'block';
        if (mode === 'signup') {
            loginContainer.style.display = 'none';
            signupContainer.style.display = 'block';
        } else {
            loginContainer.style.display = 'block';
            signupContainer.style.display = 'none';
        }
        clearErrors();
        document.body.style.overflow = 'hidden';
    };

    const closeAuthModal = () => {
        if (!authModal) return;
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (loginTrigger) loginTrigger.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
    if (signupTrigger) signupTrigger.addEventListener('click', (e) => { e.preventDefault(); openModal('signup'); });
    if (closeModal) closeModal.addEventListener('click', closeAuthModal);
    if (goToSignup) goToSignup.addEventListener('click', (e) => { e.preventDefault(); openModal('signup'); });
    if (goToLogin) goToLogin.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    // ============================================================
    // HELPERS
    // ============================================================
    function showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerText = message;
            el.style.display = 'block';
        }
    }

    function clearErrors() {
        const loginError = document.getElementById('login-error');
        const signupError = document.getElementById('signup-error');
        if (loginError) loginError.style.display = 'none';
        if (signupError) signupError.style.display = 'none';
    }

    function setButtonState(btn, loading, loadingText, originalText) {
        btn.disabled = loading;
        btn.innerText = loading ? loadingText : originalText;
    }

    // ============================================================
    // 4. Signup Form → Backend Real
    // ============================================================
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const signupError = document.getElementById('signup-error');
            if (signupError) signupError.style.display = 'none';

            const nombre = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const honeypot = document.getElementById('signup-phone').value;

            // Honeypot check
            if (honeypot) { console.warn('Bot detected.'); return; }

            // Password match
            if (password !== confirmPassword) {
                showError('signup-error', 'Las contraseñas no coinciden.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('signup-error', 'Por favor, ingrese un email válido.');
                return;
            }

            const btn = signupForm.querySelector('button[type="submit"]');
            setButtonState(btn, true, 'Creando cuenta...', 'Registrarse');

            try {
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Success: switch to login with a success message
                    openModal('login');
                    signupForm.reset();
                    showError('login-error', ''); // clear
                    const loginError = document.getElementById('login-error');
                    if (loginError) {
                        loginError.style.display = 'block';
                        loginError.style.color = '#2e7d32';
                        loginError.style.background = '#e8f5e9';
                        loginError.style.border = '1px solid #c8e6c9';
                        loginError.style.padding = '10px 14px';
                        loginError.style.borderRadius = '8px';
                        loginError.innerText = '✓ Cuenta creada exitosamente. Ingresá con tus credenciales.';
                    }
                } else {
                    const msg = data.message || 'Error al crear la cuenta.';
                    showError('signup-error', msg === 'Email already in use' ? 'Ese email ya está en uso.' : msg);
                }
            } catch (error) {
                showError('signup-error', 'No se pudo conectar con el servidor. Verificá que el backend esté en línea.');
                console.error('Signup error:', error);
            } finally {
                setButtonState(btn, false, '', 'Registrarse');
            }
        });
    }

    // ============================================================
    // 5. Login Form → Backend Real
    // ============================================================
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loginError = document.getElementById('login-error');
            if (loginError) {
                loginError.style.display = 'none';
                loginError.style.color = '';
                loginError.style.background = '';
                loginError.style.border = '';
                loginError.style.padding = '';
            }

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            const btn = loginForm.querySelector('button[type="submit"]');
            setButtonState(btn, true, 'Ingresando...', 'Ingresar');

            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save token and user data in localStorage
                    localStorage.setItem('dap_token', data.token);
                    localStorage.setItem('dap_user', JSON.stringify(data.user));

                    // Redirect to dashboard
                    closeAuthModal();
                    window.location.href = 'dashboard.html';
                } else {
                    const msg = data.message || 'Credenciales incorrectas.';
                    showError('login-error', msg === 'Invalid credentials' ? 'Email o contraseña incorrectos.' : msg);
                }
            } catch (error) {
                showError('login-error', 'No se pudo conectar con el servidor. Verificá que el backend esté en línea.');
                console.error('Login error:', error);
            } finally {
                setButtonState(btn, false, '', 'Ingresar');
            }
        });
    }

    // ============================================================
    // 6. Contact Form (existing logic - now posts to backend)
    // ============================================================
    const contactForm = document.getElementById('srv-contact-form');

    const prefillForm = () => {
        if (!contactForm) return;
        const urlParams = new URLSearchParams(window.location.search);
        const fields = ['nombre', 'email', 'telefono', 'establecimiento', 'direccion', 'marca', 'modelo', 'n-serie', 'consulta'];
        fields.forEach(field => {
            const value = urlParams.get(field);
            if (value) {
                const input = contactForm.querySelector(`[name="${field}"]`);
                if (input) input.value = value;
            }
        });
    };

    if (contactForm) {
        prefillForm();

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Bot check
            if (data.opinion) { console.warn('Bot blocked (honeypot).'); return; }

            const submitBtn = contactForm.querySelector('button');
            const originalText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';
            submitBtn.style.backgroundColor = '#4caf50';

            try {
                const response = await fetch(`${API_BASE}/tickets/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: data.nombre,
                        email: data.email,
                        telefono: data.telefono,
                        establecimiento: data.establecimiento,
                        direccion: data.direccion,
                        marca: data.marca,
                        modelo: data.modelo,
                        n_serie: data['n-serie'],
                        consulta: data.consulta
                    })
                });

                if (response.ok) {
                    submitBtn.innerText = '¡Solicitud Enviada!';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                        submitBtn.style.backgroundColor = '';
                    }, 3000);
                } else {
                    const errData = await response.json();
                    submitBtn.innerText = 'Error al enviar';
                    submitBtn.style.backgroundColor = '#e53935';
                    console.error('Ticket creation error:', errData);
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerText = originalText;
                        submitBtn.style.backgroundColor = '';
                    }, 3000);
                }
            } catch (error) {
                // If backend is down, show error but don't block the user
                console.error('Contact form error:', error);
                submitBtn.innerText = 'Error de conexión';
                submitBtn.style.backgroundColor = '#e53935';
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalText;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }

    // ============================================================
    // 7. Scroll Animations
    // ============================================================
    const observerOptions = { threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.service-card, .mvv-card, .about-text, .enhanced-values, .value-card, .logo-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        #login-error {
            transition: all 0.3s ease;
        }

        .error-message {
            padding: 10px 14px;
            border-radius: 8px;
            background: #ffebee;
            border: 1px solid #ffcdd2;
            color: #c62828;
            font-size: 0.88rem;
        }
        
        @media (max-width: 768px) {
            .nav-links.active {
                display: flex !important;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                background: white;
                padding: 20px;
                box-shadow: 0 10px 10px rgba(0,0,0,0.1);
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from { transform: translateY(-10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        }
    `;
    document.head.appendChild(style);
});
