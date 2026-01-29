/**
 * ГЛОБАЛЬНЫЙ КОД ДЛЯ ВСЕХ СТРАНИЦ САЙТА
 * Фон, общая функциональность
 */

/* ========== АНИМАЦИЯ ФОНА (CANVAS) ========== */
(function initCanvasBackground() {
    const canvas = document.getElementById('background-canvas');
    if (!canvas) return; // Если канваса нет на странице - выходим

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    /* ========== КЛАСС ЧАСТИЦ ========== */
    class Particle {
        constructor() {
            this.reset();
            this.history = [];
            this.maxHistory = 720;
            this.lifespan = 50000;
            this.fadeStartDelay = 45000;
            this.isFadingOut = false;
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            const minSpeed = 0.7;
            const maxSpeed = 2.7;
            const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            this.size = Math.random() * 1.7 + 0.8;
            this.alpha = 0;
            this.targetAlpha = Math.random() * 0.3 + 0.2;
            this.history = [];
            this.isFadingOut = false;
            this.fadeStartTime = null;
            this.createdAt = Date.now();
            this.fadeAlpha = 1;
        }

        startFadeOut() {
            if (!this.isFadingOut) {
                this.isFadingOut = true;
                this.fadeStartTime = Date.now();
            }
        }

        update() {
            const currentTime = Date.now();
            const age = currentTime - this.createdAt;

            if (age > this.fadeStartDelay && !this.isFadingOut) {
                this.startFadeOut();
            }
            if (age > this.lifespan) {
                this.reset();
                return;
            }
            if (this.isFadingOut) {
                const fadeProgress = (currentTime - this.fadeStartTime) / 5000;
                this.fadeAlpha = Math.max(0, 1 - fadeProgress);
            }

            this.history.push({ x: this.x, y: this.y, baseAlpha: this.targetAlpha });
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.alpha < this.targetAlpha) {
                this.alpha += 0.002;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }

            this.history.forEach((point, index) => {
                const ageInHistory = index / this.history.length;
                point.alpha = point.baseAlpha * ageInHistory * 0.8 * this.fadeAlpha;
            });
        }

        draw() {
            // Отрисовка хвоста
            for (let i = 1; i < this.history.length; i++) {
                const prev = this.history[i-1];
                const current = this.history[i];
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(current.x, current.y);
                ctx.strokeStyle = `rgba(255, 220, 255, ${current.alpha * 1.2})`;
                ctx.lineWidth = this.size * 0.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Отрисовка звезды
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size
            );
            gradient.addColorStop(0, `rgba(255, 230, 255, ${this.alpha * this.fadeAlpha * 1.5})`);
            gradient.addColorStop(0.7, `rgba(230, 180, 255, ${this.alpha * this.fadeAlpha * 0.7})`);
            gradient.addColorStop(1, `rgba(210, 150, 225, ${this.alpha * this.fadeAlpha * 0.2})`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Свечение
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 230, 255, ${this.alpha * this.fadeAlpha * 0.25})`;
            ctx.fill();
        }
    }

    /* ========== СОЗДАНИЕ И УПРАВЛЕНИЕ ЧАСТИЦАМИ ========== */
    const particles = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawGrid() {
        const gridSize = 50;
        ctx.strokeStyle = 'rgba(230, 190, 255, 0.12)';
        ctx.lineWidth = 0.1;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
})();

/* ========== ОТЛОЖЕННАЯ ЗАГРУЗКА ВИДЕО ========== */
document.addEventListener('DOMContentLoaded', () => {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target.querySelector('iframe');
                if (iframe && !iframe.src) {
                    iframe.src = iframe.dataset.src;
                }
                videoObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const videoContainer = document.querySelector('.video-review');
    if (videoContainer) {
        videoObserver.observe(videoContainer);
    }

    // Tooltips for skills (заглушка)
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        item.addEventListener('click', () => {
            const toolName = item.querySelector('span').textContent;
            console.log(`Подробнее о работе с ${toolName}`);
        });
    });
});