class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.radius = Math.random() * 3 + 1;
        this.hue = Math.random() * 360;
        this.opacity = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x - this.radius < 0 || this.x + this.radius > this.canvas.width) {
            this.vx *= -1;
            this.x = Math.max(this.radius, Math.min(this.canvas.width - this.radius, this.x));
        }
        if (this.y - this.radius < 0 || this.y + this.radius > this.canvas.height) {
            this.vy *= -1;
            this.y = Math.max(this.radius, Math.min(this.canvas.height - this.radius, this.y));
        }

        // Slowly change hue for color cycling effect
        this.hue = (this.hue + 0.5) % 360;
    }

    draw(ctx) {
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class Screensaver {
    constructor() {
        this.canvas = document.getElementById('screensaver');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.isRunning = true;
        this.frameCount = 0;
        this.lastFrameTime = Date.now();
        this.fps = 0;

        this.resizeCanvas();
        this.initParticles(100); // Start with 100 particles
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        document.getElementById('toggleBtn').addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            document.getElementById('toggleBtn').textContent = this.isRunning ? 'Pause' : 'Resume';
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.initParticles(100);
            document.getElementById('toggleBtn').textContent = 'Pause';
            this.isRunning = true;
        });

        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            this.addParticlesAtMouse(e.clientX, e.clientY, 5);
        });

        // Touch interaction
        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            this.addParticlesAtMouse(touch.clientX, touch.clientY, 5);
            e.preventDefault();
        });
    }

    addParticlesAtMouse(x, y, count) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(this.canvas);
            particle.x = x + (Math.random() - 0.5) * 20;
            particle.y = y + (Math.random() - 0.5) * 20;
            particle.vx = (Math.random() - 0.5) * 6;
            particle.vy = (Math.random() - 0.5) * 6;
            this.particles.push(particle);

            // Remove excess particles
            if (this.particles.length > 500) {
                this.particles.shift();
            }
        }
    }

    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFrameTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = now;
        }
    }

    animate = () => {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isRunning) {
            // Update particles
            this.particles.forEach(particle => {
                particle.update();
                particle.draw(this.ctx);
            });

            // Draw connections between nearby particles
            this.drawConnections();
        }

        // Update UI
        this.updateFPS();
        document.getElementById('particleCount').textContent = `Particles: ${this.particles.length}`;
        document.getElementById('fps').textContent = `FPS: ${this.fps}`;

        requestAnimationFrame(this.animate);
    };

    drawConnections() {
        const maxDistance = 150;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.3;
                    const avgHue = (this.particles[i].hue + this.particles[j].hue) / 2;
                    this.ctx.strokeStyle = `hsla(${avgHue}, 100%, 50%, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Initialize screensaver when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Screensaver();
});