/**
 * SANO & PUNTO - INTERACCIONES Y LÓGICA DE ALTA VELOCIDAD
 * Protocolo de Control Glucémico (Diabetes)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. CONFIGURACIÓN RÁPIDA (MODIFICA TUS ENLACES Y VIDEO AQUÍ)
       ========================================================================== */
    const CONFIG = {
        // Enlace a tu pasarela de pago o WhatsApp (Hotmart, Stripe, etc.)
        checkoutUrl: "https://pay.hotmart.com/tu-codigo-aqui",

        // Configuración del video VSL:
        // Tipo: 'mp4' | 'youtube' | 'vimeo'
        videoType: 'mp4',
        
        // URL o ID del video:
        // - Si es 'mp4': "https://tu-servidor.com/video-vsl.mp4" o ruta local
        // - Si es 'youtube': "ID_DEL_VIDEO" (ej: "dQw4w9WgXcQ")
        // - Si es 'vimeo': "ID_DEL_VIDEO" (ej: "76979871")
        videoSource: "", 

        // Poster / Portada personalizada (opcional):
        videoPoster: ""
    };

    // Actualizar todos los botones CTA con el enlace de pago configurado
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(btn => {
        if (CONFIG.checkoutUrl && CONFIG.checkoutUrl !== "https://pay.hotmart.com/tu-codigo-aqui") {
            btn.href = CONFIG.checkoutUrl;
        }
    });

    /* ==========================================================================
       2. REPRODUCTOR VSL CON FACHADA DE CARGA INSTANTÁNEA
       ========================================================================== */
    const vslFacade = document.getElementById('vsl-facade');
    const vslPlayerContainer = document.getElementById('vsl-player-container');
    const vslVideo = document.getElementById('vsl-video');
    const vslProgress = document.getElementById('vsl-progress');

    if (vslFacade) {
        vslFacade.addEventListener('click', () => {
            // Ocultar fachada y mostrar reproductor
            vslFacade.style.display = 'none';
            vslPlayerContainer.style.display = 'block';

            if (CONFIG.videoType === 'youtube' && CONFIG.videoSource) {
                vslPlayerContainer.innerHTML = `
                    <iframe 
                        src="https://www.youtube.com/embed/${CONFIG.videoSource}?autoplay=1&rel=0&modestbranding=1&playsinline=1" 
                        title="VSL Sano y Punto" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            } else if (CONFIG.videoType === 'vimeo' && CONFIG.videoSource) {
                vslPlayerContainer.innerHTML = `
                    <iframe 
                        src="https://player.vimeo.com/video/${CONFIG.videoSource}?autoplay=1&title=0&byline=0&portrait=0" 
                        title="VSL Sano y Punto" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
            } else {
                // Modo MP4 / Video HTML5
                if (CONFIG.videoSource) {
                    vslVideo.src = CONFIG.videoSource;
                }
                vslVideo.play().catch(e => console.log('Autoplay bloqueado o video sin fuente cargada:', e));

                // Actualizar barra de progreso con el avance real del video
                vslVideo.addEventListener('timeupdate', () => {
                    if (vslVideo.duration) {
                        const percent = (vslVideo.currentTime / vslVideo.duration) * 100;
                        vslProgress.style.width = `${percent}%`;
                    }
                });
            }
        });
    }

    /* ==========================================================================
       3. SLIDER STORYTELLING INTERACTIVO (TOUCH SWIPE, MOUSE DRAG & STEP SYNC)
       ========================================================================== */
    const track = document.getElementById('cards-track');
    const cards = document.querySelectorAll('.story-card');
    const stepPills = document.querySelectorAll('.step-pill');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    let currentIndex = 0;
    const totalCards = cards.length;

    // Función para desplazarse a una tarjeta específica
    const scrollToCard = (index) => {
        if (index < 0) index = 0;
        if (index >= totalCards) index = totalCards - 1;
        
        currentIndex = index;
        const targetCard = cards[currentIndex];
        
        if (targetCard && track) {
            const cardOffsetLeft = targetCard.offsetLeft;
            const containerPadding = 20;
            track.scrollTo({
                left: cardOffsetLeft - containerPadding,
                behavior: 'smooth'
            });
        }

        updateActiveIndicators(currentIndex);
    };

    // Actualizar botones de pasos y puntos indicadores
    const updateActiveIndicators = (index) => {
        stepPills.forEach((pill, i) => {
            pill.classList.toggle('active', i === index);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    };

    // Eventos de botones de pasos superiores
    stepPills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const stepIndex = parseInt(pill.getAttribute('data-step'), 10);
            scrollToCard(stepIndex);
        });
    });

    // Eventos de puntos inferiores
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            scrollToCard(i);
        });
    });

    // Eventos de flechas anterior / siguiente
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            scrollToCard(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            scrollToCard(currentIndex + 1);
        });
    }

    // Sincronización al deslizar con el dedo o hacer scroll manual
    let scrollTimeout;
    if (track) {
        track.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = track.scrollLeft;
                let closestIndex = 0;
                let minDistance = Infinity;

                cards.forEach((card, i) => {
                    const distance = Math.abs(card.offsetLeft - scrollLeft - 20);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = i;
                    }
                });

                if (closestIndex !== currentIndex) {
                    currentIndex = closestIndex;
                    updateActiveIndicators(currentIndex);
                }
            }, 50);
        }, { passive: true });
    }

    // Soporte para arrastre con el mouse en PC (Mouse Drag)
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;

    if (track) {
        track.addEventListener('mousedown', (e) => {
            isDown = true;
            track.classList.add('grabbing');
            startX = e.pageX - track.offsetLeft;
            scrollStart = track.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (isDown) {
                isDown = false;
                track.classList.remove('grabbing');
            }
        });

        track.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 1.5;
            track.scrollLeft = scrollStart - walk;
        });
    }

    /* ==========================================================================
       4. PRUEBA SOCIAL: CONTADOR DINÁMICO DE ESPECTADORES
       ========================================================================== */
    const viewerCountElem = document.getElementById('viewer-count');
    if (viewerCountElem) {
        let viewers = 24;
        setInterval(() => {
            // Variación natural entre 19 y 32 espectadores
            const change = Math.floor(Math.random() * 5) - 2;
            viewers = Math.max(18, Math.min(38, viewers + change));
            viewerCountElem.textContent = viewers;
        }, 4500);
    }

});
