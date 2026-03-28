document.addEventListener('DOMContentLoaded', () => {
    // 1. Accordion Logic
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // 2. Form Submission Handling
    const registrationForm = document.getElementById('registrationForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            // UI Feedback
            submitBtn.innerText = '¡Enviando...!';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            try {
                const response = await fetch(registrationForm.action, {
                    method: 'POST',
                    body: new FormData(registrationForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = Object.fromEntries(new FormData(registrationForm).entries());
                    alert(`¡Gracias, ${data.nombre}! Tu inscripción para el bootcamp de ${data.bootcamp} ha sido recibida.`);
                    registrationForm.reset();
                } else {
                    const errorMsg = await response.json();
                    alert('Hubo un error al enviar el formulario: ' + (errorMsg.error || 'Inténtalo de nuevo.'));
                }
            } catch (error) {
                alert('Ocurrió un error de conexión. Por favor revisa tu internet e inténtalo de nuevo.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
            }
        });
    }

    // 3. Simple Scroll Reveal (Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.card, .benefit-item, .section-title');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });

    // 4. Header Dynamic Background
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.background = 'rgba(0, 0, 0, 0.95)';
            header.style.padding = '0.5rem 0';
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.8)';
            header.style.padding = '1rem 0';
        }
    });

    // 5. Smooth Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. Supabase Logic for Comments and Auth
    const SUPABASE_URL = 'https://tfnkttndirngwndzndbj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_KFrHhQ0wyhX8RZ9UlcMxHA_IQrwOu67';

    // Initialize Supabase client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');
    const authNavItem = document.getElementById('auth-nav-item');
    const commentFormWrapper = document.getElementById('comment-form-wrapper');
    const loginToCommentMsg = document.getElementById('login-to-comment');

    // Global session state
    let currentUser = null;
    let allComments = [];
    let currentPage = 1;
    const commentsPerPage = 4;

    // --- Modal Handlers ---
    window.openAuthModal = () => {
        document.getElementById('authModal').style.display = 'block';
        clearAuthStatus();
    };

    window.closeAuthModal = () => {
        document.getElementById('authModal').style.display = 'none';
        toggleAuthForm('login');
        clearAuthStatus();
    };

    window.toggleAuthForm = (type) => {
        document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
        document.getElementById('signup-form').style.display = type === 'signup' ? 'block' : 'none';
        clearAuthStatus();
    };

    window.togglePasswordVisibility = (id) => {
        const input = document.getElementById(id);
        const btn = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            btn.innerText = '🔒';
        } else {
            input.type = 'password';
            btn.innerText = '👁️';
        }
    };

    function showAuthStatus(msg, isError = false) {
        const statusEl = document.getElementById('auth-status-msg');
        statusEl.innerText = msg;
        statusEl.style.display = 'block';
        statusEl.style.color = isError ? '#ff4d4f' : 'var(--secondary)';
    }

    function clearAuthStatus() {
        const statusEl = document.getElementById('auth-status-msg');
        statusEl.style.display = 'none';
        statusEl.innerText = '';
    }

    // --- Auth Logic ---
    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateUIForAuth();
    });

    function updateUIForAuth() {
        if (currentUser) {
            const displayName = currentUser.user_metadata?.full_name || currentUser.email;
            authNavItem.innerHTML = `<span style="margin-right: 1rem; color: var(--secondary)">Hola, ${displayName.split(' ')[0]}</span><a href="javascript:void(0)" onclick="handleLogout()" class="btn btn-outline">Salir</a>`;
            commentFormWrapper.style.display = 'block';
            loginToCommentMsg.style.display = 'none';
        } else {
            authNavItem.innerHTML = `<a href="javascript:void(0)" onclick="openAuthModal()" class="btn btn-outline">Ingresar</a>`;
            commentFormWrapper.style.display = 'none';
            loginToCommentMsg.style.display = 'block';
        }
    }

    window.handleLogin = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        setAuthLoading(true);
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        setAuthLoading(false);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            closeAuthModal();
        }
    };

    window.handleSignup = async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const fullName = document.getElementById('signup-name').value;

        if (password !== confirmPassword) {
            showAuthStatus('Las contraseñas no coinciden', true);
            return;
        }

        setAuthLoading(true);
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: window.location.origin
            }
        });
        setAuthLoading(false);

        if (error) {
            showAuthStatus('Error: ' + error.message, true);
        } else {
            // No alert as requested, just show status in the form
            showAuthStatus('¡Registro exitoso! Por favor revisa tu correo para validar tu cuenta.');
            // Clear inputs
            e.target.reset();
        }
    };

    window.handleLogout = async () => {
        await supabaseClient.auth.signOut();
    };

    function setAuthLoading(loading) {
        document.getElementById('auth-forms').style.display = loading ? 'none' : 'block';
        document.getElementById('auth-loading').style.display = loading ? 'block' : 'none';
    }

    // --- Comment Logic ---
    async function fetchComments() {
        try {
            const { data, error } = await supabaseClient
                .from('comentarios')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) throw error;
            allComments = data;
            renderComments();
        } catch (error) {
            console.error(error);
            commentsList.innerHTML = '<p class="loading-text">Error al cargar el muro.</p>';
        }
    }

    function renderComments() {
        if (allComments.length === 0) {
            commentsList.innerHTML = '<p class="loading-text">Sé el primero en comentar.</p>';
            document.getElementById('pagination-controls').style.display = 'none';
            return;
        }

        const startIndex = (currentPage - 1) * commentsPerPage;
        const endIndex = startIndex + commentsPerPage;
        const currentSlice = allComments.slice(startIndex, endIndex);

        commentsList.innerHTML = currentSlice.map(c => `
            <div class="comment-card">
                <div class="comment-header">
                    <span class="comment-author">${c.nombre}</span>
                    <span class="comment-date">${new Date(c.fecha).toLocaleDateString()}</span>
                </div>
                <div class="comment-body">
                    ${c.comentario}
                </div>
            </div>
        `).join('');

        // Pagination controls visibility and info
        const totalPages = Math.ceil(allComments.length / commentsPerPage);
        document.getElementById('pagination-controls').style.display = allComments.length > commentsPerPage ? 'flex' : 'none';
        document.getElementById('pageInfo').innerText = `Página ${currentPage} de ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;
    }

    // Pagination Listeners
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderComments();
            document.getElementById('comentarios').scrollIntoView({ behavior: 'smooth' });
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(allComments.length / commentsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderComments();
            document.getElementById('comentarios').scrollIntoView({ behavior: 'smooth' });
        }
    });

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return alert('Debes iniciar sesión.');

            const submitBtn = commentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            const text = document.getElementById('comment-text').value;

            submitBtn.innerText = 'Publicando...';
            submitBtn.disabled = true;

            try {
                const { error } = await supabaseClient
                    .from('comentarios')
                    .insert([
                        {
                            comentario: text,
                            nombre: currentUser.user_metadata?.full_name || currentUser.email
                        }
                    ]);

                if (error) throw error;

                commentForm.reset();
                currentPage = 1; // Return to first page to see new comment
                fetchComments();
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Close modal when clicking outside
    window.onclick = (event) => {
        const modal = document.getElementById('authModal');
        if (event.target == modal) closeAuthModal();
    };

    // Initial load
    fetchComments();
});
