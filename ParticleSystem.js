// ParticleSystem.js

export class ParticleSystem {
    constructor(numParticles) {
        this.numParticles = numParticles;
        this.x = new Float32Array(numParticles);
        this.y = new Float32Array(numParticles);
        this.vx = new Float32Array(numParticles);
        this.vy = new Float32Array(numParticles);
        
        this.targetX = new Float32Array(numParticles);
        this.targetY = new Float32Array(numParticles);
        
        this.baseTX = new Float32Array(numParticles);
        this.baseTY = new Float32Array(numParticles);
        
        this.currentShape = "";
        this.targetColor = [255, 255, 255];
        this.currentColor = [255, 255, 255];
        
        this.centerX = 0;
        this.centerY = 0;
        
        // Initialize randomly
        for (let i = 0; i < numParticles; i++) {
            this.x[i] = Math.random() * window.innerWidth;
            this.y[i] = Math.random() * window.innerHeight;
            this.vx[i] = 0;
            this.vy[i] = 0;
        }
        
        this.changeShape("random");
    }

    updateCenter(cx, cy) {
        this.centerX = cx;
        this.centerY = cy;
    }

    changeShape(shapeName) {
        if (this.currentShape === shapeName) return;
        this.currentShape = shapeName;
        
        if (shapeName === "random") {
            this.targetColor = [255, 255, 255];
            for (let i = 0; i < this.numParticles; i++) {
                this.baseTX[i] = (Math.random() - 0.5) * window.innerWidth;
                this.baseTY[i] = (Math.random() - 0.5) * window.innerHeight;
            }
        } else if (shapeName === "iloveyou") {
            this.targetColor = [255, 0, 50]; // Red Heart
            for (let i = 0; i < this.numParticles; i++) {
                let t = Math.random() * Math.PI * 2;
                let scale = 10;
                let px = 16 * Math.pow(Math.sin(t), 3);
                let py = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                this.baseTX[i] = px * scale;
                this.baseTY[i] = py * scale;
            }
        } else if (shapeName === "butterfly") {
            this.targetColor = [255, 105, 180]; // Pink
            for (let i = 0; i < this.numParticles; i++) {
                let t = Math.random() * 12 * Math.PI;
                let scale = 50;
                let r = Math.exp(Math.cos(t)) - 2 * Math.cos(4*t) - Math.pow(Math.sin(t/12), 5);
                this.baseTX[i] = scale * r * Math.sin(t);
                this.baseTY[i] = -scale * r * Math.cos(t);
            }
        } else if (shapeName === "hexagon") {
            this.targetColor = [0, 255, 127]; // Green
            const angles = Array.from({length: 7}, (_, i) => i * Math.PI / 3);
            const points = angles.map(a => [150 * Math.cos(a), 150 * Math.sin(a)]);
            for (let i = 0; i < this.numParticles; i++) {
                let edge = i % 6;
                let p1 = points[edge];
                let p2 = points[edge + 1];
                let t = Math.random();
                this.baseTX[i] = p1[0] + t * (p2[0] - p1[0]);
                this.baseTY[i] = p1[1] + t * (p2[1] - p1[1]);
            }
        } else if (shapeName === "triangle") {
            this.targetColor = [0, 255, 0];
            const points = [[0, -150], [130, 75], [-130, 75]];
            for (let i = 0; i < this.numParticles; i++) {
                let edge = i % 3;
                let p1 = points[edge];
                let p2 = points[(edge + 1) % 3];
                let t = Math.random();
                this.baseTX[i] = p1[0] + t * (p2[0] - p1[0]);
                this.baseTY[i] = p1[1] + t * (p2[1] - p1[1]);
            }
        } else {
            // Default random if unknown
            this.targetColor = [255, 255, 255];
            for (let i = 0; i < this.numParticles; i++) {
                this.baseTX[i] = (Math.random() - 0.5) * 400;
                this.baseTY[i] = (Math.random() - 0.5) * 400;
            }
        }
    }

    updateAndDraw(ctx, isBlackhole) {
        // Interpolar cor
        this.currentColor[0] += (this.targetColor[0] - this.currentColor[0]) * 0.1;
        this.currentColor[1] += (this.targetColor[1] - this.currentColor[1]) * 0.1;
        this.currentColor[2] += (this.targetColor[2] - this.currentColor[2]) * 0.1;

        ctx.fillStyle = `rgb(${Math.floor(this.currentColor[0])}, ${Math.floor(this.currentColor[1])}, ${Math.floor(this.currentColor[2])})`;
        
        let k = 0.05;
        let damp = 0.85;

        for (let i = 0; i < this.numParticles; i++) {
            if (isBlackhole) {
                this.targetX[i] = this.centerX;
                this.targetY[i] = this.centerY;
            } else {
                this.targetX[i] = this.centerX + this.baseTX[i];
                this.targetY[i] = this.centerY + this.baseTY[i];
            }

            // Física de mola
            let ax = (this.targetX[i] - this.x[i]) * k;
            let ay = (this.targetY[i] - this.y[i]) * k;

            // Ruído / Turbulência
            ax += (Math.random() - 0.5) * 2;
            ay += (Math.random() - 0.5) * 2;

            this.vx[i] = (this.vx[i] + ax) * damp;
            this.vy[i] = (this.vy[i] + ay) * damp;

            this.x[i] += this.vx[i];
            this.y[i] += this.vy[i];

            // Desenhar
            ctx.beginPath();
            ctx.arc(this.x[i], this.y[i], 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
