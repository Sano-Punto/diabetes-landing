# Sano & Punto - Landing Page VSL de Alta Velocidad (Diabetes)

Landing page de alta conversión y carga instantánea diseñada bajo la identidad clínica y visual de **Sano & Punto**, optimizada para video de ventas (VSL) y storytelling interactivo de 5 fases (Dolor ➡️ Método ➡️ Libertad Metabólica).

---

## 🚀 Características Principales

* **Stack Ultraligero:** Cero dependencias (HTML5 puro, CSS3 modular y Vanilla JS). Pesa menos de 45 KB en total para un First Contentful Paint < 300ms.
* **100% Responsive & Mobile-First:** Diseñado a medida para móviles, tablets y computadoras de escritorio.
* **Reproductor VSL con Fachada Rápida:** Carga diferida con soporte directo para videos en formato **MP4**, **YouTube** o **Vimeo**.
* **Storytelling Slider Interactivo:**
  * Deslizamiento táctil (*Touch Swipe*) en móviles.
  * Arrastre suave (*Mouse Drag*) en PC.
  * Botones de navegación Anterior / Siguiente.
  * Selector de pasos y barra de estado de 5 fases.
* **Micro-conversión y Urgencia:**
  * Contador dinámico de espectadores en vivo.
  * Botones CTA con animación de atención (*Pulse Glow*).
  * Sellos de garantía de 30 días y pago seguro.

---

## 📁 Estructura del Repositorio

```text
diabetes/
├── index.html        # Estructura semántica, metadatos SEO y OpenGraph
├── style.css         # Sistema de diseño Light Health (Teal, Mint, Coral)
├── app.js            # Lógica interactiva del slider, VSL y contador
└── README.md         # Documentación de uso y despliegue
```

---

## ⚙️ Cómo Personalizar

Abre el archivo `app.js` y edita el objeto inicial `CONFIG`:

```javascript
const CONFIG = {
    // 1. Pega aquí tu link de pago de Hotmart, Stripe o WhatsApp:
    checkoutUrl: "https://pay.hotmart.com/tu-codigo-aqui",

    // 2. Tipo de video ('mp4', 'youtube' o 'vimeo'):
    videoType: 'youtube',

    // 3. ID o enlace del video:
    videoSource: "TU_ID_DE_YOUTUBE",
};
```

---

## 🌐 Cómo Subir a GitHub y Publicar

Cuando estés listo para subir los cambios a tu repositorio:

```bash
# 1. Añadir archivos al stage
git add .

# 2. Crear commit
git commit -m "feat: landing page vsl ultraligera sano y punto"

# 3. Subir al repositorio remoto
git push origin main
```

Para activar tu web gratis en **GitHub Pages**:
1. Entra a tu repositorio en GitHub: [https://github.com/SanoyPunto2026/diabetes](https://github.com/SanoyPunto2026/diabetes).
2. Ve a **Settings** > **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Guarda y en menos de 1 minuto tu web estará disponible públicamente con certificado SSL gratis.