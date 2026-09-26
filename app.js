/**
 * SANO & PUNTO - INTERACCIONES Y LÓGICA DE ALTA VELOCIDAD
 * Protocolo de Control Glucémico (Diabetes)
 */

// Blindaje contra excepciones silenciosas en WebViews de Android (Facebook/Instagram in-app browsers)
window.addEventListener('error', function(event) {
    if (event && event.message) {
        var msg = String(event.message).toLowerCase();
        if (msg.indexOf('postmessage') !== -1 || 
            msg.indexOf('java object') !== -1 || 
            msg.indexOf('script error') !== -1) {
            // Suprimir error para evitar romper la ejecución en WebViews
            return true;
        }
    }
}, true);

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

    // Actualizar todos los botones CTA con el enlace de pago configurado y tracking InitiateCheckout
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-sticky');
    ctaButtons.forEach(btn => {
        if (CONFIG.checkoutUrl && CONFIG.checkoutUrl !== "https://pay.hotmart.com/tu-codigo-aqui") {
            btn.href = CONFIG.checkoutUrl;
        }
        btn.addEventListener('click', () => {
            if (typeof fbq === 'function') {
                try {
                    fbq('track', 'InitiateCheckout', {
                        content_name: 'Metodo Sano y Punto Diabetes España',
                        currency: 'EUR',
                        value: 14.00
                    });
                } catch (e) {}
            }
        });
    });

    /* ==========================================================================
       2. REPRODUCTOR VSL CON FACHADA DE CARGA INSTANTÁNEA
       ========================================================================== */
    const vslFacade = document.getElementById('vsl-facade');
    const vslPlayerContainer = document.getElementById('vsl-player-container');
    const vslVideo = document.getElementById('vsl-video');
    const vslProgress = document.getElementById('vsl-progress');

    // Cargar video de Wistia muteado en segundo plano en la carga inicial (optimizado para 4G)
    let wistiaVideoInstance = null;
    let wistiaLoaded = false;
    let userWantsPlay = false;

    const startWistia = () => {
        if (!vslPlayerContainer) return;
        if (!document.querySelector('.wistia_embed')) {
            vslPlayerContainer.style.display = 'block';
            vslPlayerContainer.innerHTML = `
                <div class="wistia_embed wistia_async_${CONFIG.videoSource}" style="width:100%;height:100%;position:relative;"></div>
            `;
        }

        if (!document.querySelector('script[src*="wistia.com/assets/external/E-v1.js"]')) {
            const script = document.createElement('script');
            script.src = "https://fast.wistia.com/assets/external/E-v1.js";
            script.async = true;
            document.head.appendChild(script);
        }
    };

    if (CONFIG.videoType === 'wistia' && CONFIG.videoSource) {
        // Carga inmediata de Wistia para pre-bufferear en redes 4G sin demoras
        setTimeout(startWistia, 60);

        const safetyTimeout = setTimeout(() => {
            if (vslFacade && vslFacade.style.display !== 'none') {
                vslFacade.style.opacity = '0';
                setTimeout(() => {
                    vslFacade.style.display = 'none';
                }, 400);
            }
        }, 3500);

        // Inicializar Wistia JS API de forma segura
        window._wq = window._wq || [];
        window._wq.push({ 
            id: CONFIG.videoSource, 
            options: {
                playerColor: "2c422c",
                autoPlay: true,
                muted: true
            },
            onReady: function(video) {
                try {
                    wistiaVideoInstance = video;
                    wistiaLoaded = true;

                    // Si el usuario ya tocó la pantalla mientras cargaba en 4G, desmutear y reproducir inmediatamente
                    if (userWantsPlay) {
                        try {
                            video.unmute();
                            video.volume(1.0);
                            video.play();
                        } catch(e) {}
                        if (vslFacade) {
                            vslFacade.style.opacity = '0';
                            setTimeout(() => { vslFacade.style.display = 'none'; }, 300);
                        }
                    }

                    // Cuando el video comience a reproducirse en el fondo (silenciado), desvanecer la fachada
                    video.bind('play', function() {
                        try {
                            clearTimeout(safetyTimeout);
                            if (vslFacade && vslFacade.style.display !== 'none') {
                                vslFacade.style.opacity = '0';
                                setTimeout(() => {
                                    vslFacade.style.display = 'none';
                                }, 300);
                            }
                        } catch (e) {}
                    });

                    // Solución para Android: Forzar el volumen al 100% (1.0) en cuanto el usuario desmutee
                    video.bind('volumechange', function() {
                        try {
                            const currentVol = video.volume();
                            if (currentVol > 0 && currentVol < 1.0) {
                                video.volume(1.0);
                            }
                        } catch (e) {}
                    });
                } catch (err) {
                    console.log("Wistia init handled:", err);
                }
            }
        });

        // Manejador de toque directo para Wistia (Pilar toca la pantalla)
        if (vslFacade) {
            vslFacade.addEventListener('click', () => {
                if (wistiaVideoInstance) {
                    try {
                        wistiaVideoInstance.unmute();
                        wistiaVideoInstance.volume(1.0);
                        wistiaVideoInstance.play();
                    } catch (e) {}
                    vslFacade.style.opacity = '0';
                    setTimeout(() => { vslFacade.style.display = 'none'; }, 300);
                } else {
                    userWantsPlay = true;
                    startWistia();
                    const muteSub = vslFacade.querySelector('.vsl-mute-subtitle');
                    if (muteSub) muteSub.textContent = 'Iniciando sonido y vídeo…';
                }
            });
        }
    }

    // El manejador de clic para reproductores que no sean Wistia (Youtube, Vimeo, HTML5)
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

            // Respetar preferencia de accesibilidad
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                el.textContent = `${target}${suffix}`;
                return;
            }

            // Empezar en un número base elevado para NO mostrar nunca 0% (evita parpadeo en móviles)
            const startVal = Math.max(1, Math.round(target * 0.5));
            const duration = 650; // Snappy y fluido en pantallas y procesadores móviles
            const startTime = performance.now();

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(startVal + (target - startVal) * eased);
                el.textContent = `${current}${suffix}`;
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
        }, { threshold: 0.25 });

        statValues.forEach((el) => statObserver.observe(el));
    }

    /* ==========================================================================
       5. BARRA CTA FIJA MÓVIL: VISIBLE SOLO TRAS EL CTA PRINCIPAL Y
          OCULTA CUANDO CUALQUIER BOTÓN CTA ENTRE EN PANTALLA
       ========================================================================== */
    const stickyCta = document.getElementById('sticky-mobile-cta');
    const mainCtaBtn = document.getElementById('main-cta-btn');
    const inlineCtas = document.querySelectorAll('.btn-primary');

    if (stickyCta && mainCtaBtn && 'IntersectionObserver' in window) {
        let isPastMainCta = false;
        const visibleCtas = new Set();

        const updateStickyVisibility = () => {
            const shouldBeVisible = isPastMainCta && visibleCtas.size === 0;
            stickyCta.classList.toggle('visible', shouldBeVisible);
        };

        window.addEventListener('scroll', () => {
            const rect = mainCtaBtn.getBoundingClientRect();
            isPastMainCta = rect.bottom < 0;
            updateStickyVisibility();
        }, { passive: true });

        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    visibleCtas.add(entry.target);
                } else {
                    visibleCtas.delete(entry.target);
                }
            });
            updateStickyVisibility();
        }, { threshold: 0.05 });

        inlineCtas.forEach((btn) => ctaObserver.observe(btn));
    }

});
