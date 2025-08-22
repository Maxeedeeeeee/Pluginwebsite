document.addEventListener('DOMContentLoaded', () => {
    // Canvas Black Hole Animation
    const canvas = document.getElementById('blackHoleCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 200;

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2,
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * (Math.min(width, height) / 2) + 20,
            speed: Math.random() * 0.005 + 0.002,
            color: 'rgba(255, 255, 255, ' + (Math.random() * 0.5 + 0.1) + ')',
            originalDistance: 0
        };
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // Draw the central accretion disk
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
        gradient.addColorStop(0, 'rgba(106, 5, 149, 1)');
        gradient.addColorStop(0.5, 'rgba(157, 51, 209, 0.8)');
        gradient.addColorStop(1, 'rgba(106, 5, 149, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p => {
            p.angle += p.speed;
            p.distance -= 0.05;

            if (p.distance < 5) {
                p.distance = Math.random() * (Math.min(width, height) / 2) + 20;
                p.angle = Math.random() * Math.PI * 2;
            }

            const x = centerX + Math.cos(p.angle) * p.distance * 0.8;
            const y = centerY + Math.sin(p.angle) * p.distance;

            ctx.beginPath();
            ctx.arc(x, y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }

    // Adjust canvas size on resize
    function onResize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', onResize);
    onResize();
    draw();

    // Filter Button Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categories = document.querySelectorAll('.category');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and categories
            filterButtons.forEach(btn => btn.classList.remove('active'));
            categories.forEach(cat => cat.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            // Show the corresponding category
            const filter = button.dataset.filter;
            document.querySelector(`.category.${filter}`).classList.add('active');
        });
    });
});
