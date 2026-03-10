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
});
