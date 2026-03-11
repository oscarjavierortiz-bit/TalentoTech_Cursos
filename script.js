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

    // 6. Supabase Logic for Comments
    const SUPABASE_URL = 'https://tfnkttndirngwndzndbj.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_KFrHhQ0wyhX8RZ9UlcMxHA_IQrwOu67';
    const commentsList = document.getElementById('commentsList');
    const commentForm = document.getElementById('commentForm');

    async function fetchComments() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/comentarios?select=*&order=fecha.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar comentarios');

            const comments = await response.json();
            renderComments(comments);
        } catch (error) {
            console.error(error);
            commentsList.innerHTML = '<p class="loading-text">Error al cargar el muro.</p>';
        }
    }

    function renderComments(comments) {
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="loading-text">Sé el primero en comentar.</p>';
            return;
        }

        commentsList.innerHTML = comments.map(c => `
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
    }

    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = commentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            const formData = new FormData(commentForm);
            const entry = {
                nombre: formData.get('nombre'),
                comentario: formData.get('comentario')
            };

            submitBtn.innerText = 'Publicando...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/comentarios`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(entry)
                });

                if (response.ok) {
                    commentForm.reset();
                    fetchComments(); // Refresh list
                } else {
                    alert('No se pudo publicar el comentario.');
                }
            } catch (error) {
                alert('Error de conexión.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initial load
    fetchComments();
});
