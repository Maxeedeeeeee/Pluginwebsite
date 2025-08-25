document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('blackHoleCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function getCssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    function resizeCanvas() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const particles = [];
    const particleCount = 300;
    
    function createParticle() {
        return {
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * (Math.min(width, height) / 2) * 0.8 + 10,
            speed: Math.random() * 0.005 + 0.002,
            radius: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.1
        };
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;

        const innerColor = getCssVar('--theme-blackhole-inner');
        const midColor = getCssVar('--theme-blackhole-mid');
        const outerColor = getCssVar('--theme-blackhole-outer');
        const particleBaseColor = getCssVar('--theme-blackhole-particles').replace(/,\s*var\(--particle-opacity,\s*\d\.\d\)/, '');

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.5, midColor);
        gradient.addColorStop(1, outerColor);
        ctx.fillStyle = gradient;
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p => {
            p.angle += p.speed;
            p.distance -= 0.05;

            if (p.distance < 5) {
                p.distance = Math.random() * (Math.min(width, height) / 2) * 0.8 + 10;
                p.angle = Math.random() * Math.PI * 2;
            }

            const x = centerX + Math.cos(p.angle) * p.distance * 1.5;
            const y = centerY + Math.sin(p.angle) * p.distance;

            ctx.beginPath();
            ctx.arc(x, y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${particleBaseColor.replace('rgb(', 'rgba(').replace(')', '')}, ${p.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    
    draw();

    window.addEventListener('themeChanged', () => {
    });
});
