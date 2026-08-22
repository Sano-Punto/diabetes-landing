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
        checkoutUrl: "https://pay.hotmart.com/O107226641S?checkoutMode=10&bid=1787101078743",

        // Configuración del video VSL:
        // Tipo: 'mp4' | 'youtube' | 'vimeo' | 'wistia'
        videoType: 'wistia',
        
        // URL o ID del video:
        // - Si es 'mp4': "https://tu-servidor.com/video-vsl.mp4" o ruta local
        // - Si es 'youtube': "ID_DEL_VIDEO" (ej: "dQw4w9WgXcQ")
        // - Si es 'vimeo': "ID_DEL_VIDEO" (ej: "76979871")
        // - Si es 'wistia': "ID_DEL_VIDEO" (ej: "a1b2c3d4e5")
        videoSource: "tn87tguaoq", 

        // Poster / Portada personalizada (opcional):
        videoPoster: ""
    };

    // Actualizar todos los botones CTA con el enlace de pago configurado
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-sticky');
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

    // Cargar video de Wistia muteado en segundo plano en la carga inicial (para que se vea el movimiento detrás del banner)
    // Diferido por 1.5 segundos para optimizar el Speed Index y no bloquear la carga inicial en móviles
    let wistiaVideoInstance = null;
    let wistiaLoaded = false;

    if (CONFIG.videoType === 'wistia' && CONFIG.videoSource) {
        const safetyTimeout = setTimeout(() => {
            if (vslFacade && vslFacade.style.display !== 'none') {
                console.log("VSL: Fallback de seguridad activado por retraso de carga.");
                vslFacade.style.opacity = '0';
                setTimeout(() => {
                    vslFacade.style.display = 'none';
                }, 600);
            }
        }, 5000);

        // Inicializar Wistia JS API con opciones para reproducir silenciado automáticamente
        window._wq = window._wq || [];
        window._wq.push({ 
            id: CONFIG.videoSource, 
            options: {
                playerColor: "2c422c"
            },
            onReady: function(video) {
                wistiaVideoInstance = video;
                wistiaLoaded = true;

                // Cuando el video comience a reproducirse en el fondo (silenciado), desvanecer la fachada completa
                video.bind('play', function() {
                    clearTimeout(safetyTimeout); // Limpiar timeout de seguridad
                    if (vslFacade && vslFacade.style.display !== 'none') {
                        vslFacade.style.opacity = '0';
                        setTimeout(() => {
                            vslFacade.style.display = 'none';
                        }, 600);
                    }
                });

                // Solución para Android: Forzar el volumen al 100% (1.0) en cuanto el usuario desmutee
                video.bind('volumechange', function() {
                    const currentVol = video.volume();
                    if (currentVol > 0 && currentVol < 1.0) {
                        video.volume(1.0);
                    }
                });
            }
        });

        setTimeout(() => {
            if (vslPlayerContainer) {
                vslPlayerContainer.style.display = 'block';
                // Usar embed nativo (div) de Wistia para tener acceso directo sin restricciones cross-origin de iframes
                vslPlayerContainer.innerHTML = `
                    <div class="wistia_embed wistia_async_${CONFIG.videoSource}" style="width:100%;height:100%;position:relative;"></div>
                `;

                // Cargar motor clásico E-v1.js de Wistia solo después de inyectar el div para resguardar PageSpeed
                if (!document.querySelector('script[src*="wistia.com/assets/external/E-v1.js"]')) {
                    const script = document.createElement('script');
                    script.src = "https://fast.wistia.com/assets/external/E-v1.js";
                    script.async = true;
                    document.head.appendChild(script);
                }
            }
        }, 3000);
    }

    // El manejador de clic solo actúa en reproductores que no sean Wistia (Youtube, Vimeo, HTML5)
    // Para Wistia, el banner se desvanece 100% de forma automática cuando el video inicia la reproducción
    if (vslFacade && CONFIG.videoType !== 'wistia') {
        vslFacade.addEventListener('click', () => {
            // Ocultar fachada y mostrar reproductor inmediatamente
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
       4. DASHBOARD DE RESULTADOS: ANIMACIÓN DE CONTEO AL ENTRAR EN VISTA
       ========================================================================== */
    const statValues = document.querySelectorAll('.stat-value[data-count]');
    if (statValues.length && 'IntersectionObserver' in window) {
        const animateCount = (el) => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1200;
            const startTime = performance.now();

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = `${Math.round(target * eased)}${suffix}`;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const statObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        statValues.forEach((el) => statObserver.observe(el));
    }

    /* ==========================================================================
       5. BARRA CTA FIJA MÓVIL: VISIBLE SOLO DESPUÉS DEL CTA PRINCIPAL
       ========================================================================== */
    const stickyCta = document.getElementById('sticky-mobile-cta');
    const mainCtaBtn = document.getElementById('main-cta-btn');
    if (stickyCta && mainCtaBtn && 'IntersectionObserver' in window) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                stickyCta.classList.toggle('visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
            });
        }, { threshold: 0 });
        ctaObserver.observe(mainCtaBtn);
    }

});
