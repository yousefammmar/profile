const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let nodes = [];
const nodeCount = 60;
const connectionDistance = 150;

// Configuration for Rama's "Cyber Network" Theme
const colors = {
    node: 'rgba(14, 165, 233, 0.8)',      // Sky Blue 500
    line: 'rgba(14, 165, 233, 0.2)',      // Subtle connectivity
    pulse: 'rgba(232, 121, 249, 1)',      // Fuchsia/Lavender pulse
    bg: '#020617'                         // Slate 950
};

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

class Node {
    constructor() {
        this.reset();
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    reset() {
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.pulse = 0;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen for seamless network
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.pulse += this.pulseSpeed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.node;
        ctx.fill();

        // Suble glow based on pulse
        const glow = Math.sin(this.pulse) * 0.5 + 0.5;
        if (glow > 0.8) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(14, 165, 233, ${glow * 0.2})`;
            ctx.fill();
        }
    }
}

function init() {
    resize();
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }
}

function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
                const opacity = 1 - (distance / connectionDistance);
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = `rgba(14, 165, 233, ${opacity * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Occasional "data pulse" along the connection
                if (Math.random() > 0.999 && opacity > 0.5) {
                    ctx.beginPath();
                    ctx.arc(nodes[i].x, nodes[i].y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = colors.pulse;
                    ctx.fill();
                }
            }
        }
    }
}

function animate() {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    drawConnections();

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();
animate();
