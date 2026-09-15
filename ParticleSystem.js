export class ParticleSystem {
    constructor(numParticles) {
        this.numParticles = numParticles;
        this.x = new Float32Array(numParticles);
        this.y = new Float32Array(numParticles);
        this.vx = new Float32Array(numParticles);
        this.vy = new Float32Array(numParticles);
        
        this.baseTx = new Float32Array(numParticles);
        this.baseTy = new Float32Array(numParticles);
        
        this.baseX3d = new Float32Array(numParticles);
        this.baseY3d = new Float32Array(numParticles);
        this.baseZ3d = new Float32Array(numParticles);

        this.tx = new Float32Array(numParticles);
        this.ty = new Float32Array(numParticles);
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        for(let i=0; i<numParticles; i++) {
            this.x[i] = Math.random() * this.width;
            this.y[i] = Math.random() * this.height;
            this.tx[i] = this.x[i];
            this.ty[i] = this.y[i];
        }
        
        this.targetColor = [255, 200, 0];
        this.currentShape = "random";
        this.setShapeRandom();
    }

    updateCenter(cx, cy) {
        this.centerX = cx;
        this.centerY = cy;
    }

    setShapeRandom() {
        for(let i=0; i<this.numParticles; i++){
            this.baseTx[i] = (Math.random() - 0.5) * this.width;
            this.baseTy[i] = (Math.random() - 0.5) * this.height;
        }
    }

    setShapeSphere() {
        for(let i=0; i<this.numParticles; i++){
            let angle = Math.random() * 2 * Math.PI;
            let radius = Math.sqrt(Math.random()) * 180;
            this.baseTx[i] = Math.cos(angle) * radius;
            this.baseTy[i] = Math.sin(angle) * radius;
        }
    }

    setShapeHeart() {
        for(let i=0; i<this.numParticles; i++){
            let t = (i / this.numParticles) * 2 * Math.PI;
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
            let scale = 9;
            this.baseTx[i] = x * scale;
            this.baseTy[i] = y * scale;
        }
    }

    setShapeDiamond() {
        let perSide = Math.floor(this.numParticles / 4);
        let scale = 150;
        let idx = 0;
        for (let side=0; side<4; side++) {
            for (let i=0; i<perSide; i++) {
                let t = Math.random();
                let bx = 0, by = 0;
                if(side === 0) { bx = t; by = t-1; }
                else if(side === 1) { bx = 1-t; by = t; }
                else if(side === 2) { bx = -t; by = 1-t; }
                else if(side === 3) { bx = t-1; by = -t; }
                if (idx < this.numParticles) {
                    this.baseTx[idx] = bx * scale;
                    this.baseTy[idx] = by * scale;
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseTx[idx] = 0;
            this.baseTy[idx] = 0;
        }
    }

    setShapeStar() {
        let points = [];
        for (let i = 0; i < 10; i++) {
            let angle = i * Math.PI / 5 - Math.PI / 2;
            let r = (i % 2 === 0) ? 200 : 80;
            points.push([r * Math.cos(angle), r * Math.sin(angle)]);
        }
        let perEdge = Math.floor(this.numParticles / 10);
        let idx = 0;
        for (let i = 0; i < 10; i++) {
            let p1 = points[i];
            let p2 = points[(i+1)%10];
            for(let j=0; j<perEdge; j++) {
                let t = Math.random();
                if(idx < this.numParticles) {
                    this.baseTx[idx] = p1[0] + t * (p2[0] - p1[0]);
                    this.baseTy[idx] = p1[1] + t * (p2[1] - p1[1]);
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseTx[idx] = 0;
            this.baseTy[idx] = 0;
        }
    }

    setShapeGalaxy() {
        for(let i=0; i<this.numParticles; i++){
            let angle = Math.random() * 2 * Math.PI;
            // Exponential distribution approximation
            let radius = -Math.log(1.0 - Math.random()) * 60; 
            this.baseTx[i] = Math.cos(angle) * radius;
            this.baseTy[i] = Math.sin(angle) * radius;
        }
    }

    setShapeTriangle() {
        let points = [[0, -200], [173, 100], [-173, 100]];
        let perEdge = Math.floor(this.numParticles / 3);
        let idx = 0;
        for (let i = 0; i < 3; i++) {
            let p1 = points[i];
            let p2 = points[(i+1)%3];
            for(let j=0; j<perEdge; j++) {
                let t = Math.random();
                if(idx < this.numParticles) {
                    this.baseTx[idx] = p1[0] + t * (p2[0] - p1[0]);
                    this.baseTy[idx] = p1[1] + t * (p2[1] - p1[1]);
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseTx[idx] = 0;
            this.baseTy[idx] = 0;
        }
    }

    setShapeInfinity() {
        let scale = 200;
        for(let i=0; i<this.numParticles; i++) {
            let t = (i / this.numParticles) * 2 * Math.PI;
            let denominator = Math.pow(Math.sin(t), 2) + 1;
            this.baseTx[i] = (scale * Math.SQRT2 * Math.cos(t)) / denominator;
            this.baseTy[i] = (scale * Math.SQRT2 * Math.cos(t) * Math.sin(t)) / denominator;
        }
    }

    setShapeDna() {
        let half = Math.floor(this.numParticles / 2);
        for(let i=0; i<this.numParticles; i++) {
            let idx = i % half;
            let y = -300 + (600 * (idx / half));
            this.baseTy[i] = y;
            // X is animated in update()
        }
    }

    setShapeRings() {
        let ringRadii = [80, 140, 200];
        for(let i=0; i<this.numParticles; i++) {
            let angle = Math.random() * 2 * Math.PI;
            let rBase = ringRadii[Math.floor(Math.random() * ringRadii.length)];
            let r = rBase + (Math.random() + Math.random() + Math.random() - 1.5) * 4; // pseudo normal
            this.baseTx[i] = Math.cos(angle) * r;
            this.baseTy[i] = Math.sin(angle) * r;
        }
    }

    setShapeSpiral() {
        let a = 15;
        for(let i=0; i<this.numParticles; i++) {
            let t = Math.random() * 8 * Math.PI;
            this.baseTx[i] = a * t * Math.cos(t);
            this.baseTy[i] = a * t * Math.sin(t);
        }
    }

    setShapeLightning() {
        let points = [[0, -300], [50, -100], [-30, -100], [40, 100], [-40, 100], [0, 300]];
        let perSeg = Math.floor(this.numParticles / (points.length - 1));
        let idx = 0;
        for (let i = 0; i < points.length-1; i++) {
            let p1 = points[i];
            let p2 = points[i+1];
            for(let j=0; j<perSeg; j++) {
                let t = Math.random();
                if(idx < this.numParticles) {
                    this.baseTx[idx] = p1[0] + t * (p2[0] - p1[0]);
                    this.baseTy[idx] = p1[1] + t * (p2[1] - p1[1]);
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseTx[idx] = 0;
            this.baseTy[idx] = 0;
        }
    }

    setShapeCube() {
        let verts = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        let edges = [[0,1], [1,2], [2,3], [3,0], [4,5], [5,6], [6,7], [7,4], [0,4], [1,5], [2,6], [3,7]];
        let perEdge = Math.floor(this.numParticles / 12);
        let idx = 0;
        for(let edge of edges) {
            let p1 = verts[edge[0]];
            let p2 = verts[edge[1]];
            for(let j=0; j<perEdge; j++) {
                let t = Math.random();
                if(idx < this.numParticles) {
                    this.baseX3d[idx] = p1[0] + t * (p2[0] - p1[0]);
                    this.baseY3d[idx] = p1[1] + t * (p2[1] - p1[1]);
                    this.baseZ3d[idx] = p1[2] + t * (p2[2] - p1[2]);
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseX3d[idx] = 0; this.baseY3d[idx] = 0; this.baseZ3d[idx] = 0;
        }
        for(let i=0; i<this.numParticles; i++) {
            this.baseTx[i] = 0; this.baseTy[i] = 0;
        }
    }

    setShapeCross() {
        let half = Math.floor(this.numParticles / 2);
        for(let i=0; i<this.numParticles; i++) {
            let t = -300 + (600 * ((i % half) / half));
            if(i < half) {
                this.baseTx[i] = t;
                this.baseTy[i] = t;
            } else {
                this.baseTx[i] = t;
                this.baseTy[i] = -t;
            }
        }
    }

    setShapeWave() {
        for(let i=0; i<this.numParticles; i++) {
            let x = -600 + (1200 * (i / this.numParticles));
            this.baseTx[i] = x;
            this.baseTy[i] = 0;
        }
    }

    setShapeButterfly() {
        let scale = 60;
        for(let i=0; i<this.numParticles; i++) {
            let t = (i / this.numParticles) * 12 * Math.PI;
            let r = Math.exp(Math.cos(t)) - 2*Math.cos(4*t) - Math.pow(Math.sin(t/12), 5);
            this.baseTx[i] = scale * r * Math.sin(t);
            this.baseTy[i] = -scale * r * Math.cos(t);
        }
    }

    setShapeHexagon() {
        let points = [];
        for (let a=0; a<=6; a++) {
            let angle = (a/6) * 2 * Math.PI;
            points.push([150 * Math.cos(angle), 150 * Math.sin(angle)]);
        }
        let perSeg = Math.floor(this.numParticles / 6);
        let idx = 0;
        for (let i = 0; i < 6; i++) {
            let p1 = points[i];
            let p2 = points[i+1];
            for(let j=0; j<perSeg; j++) {
                let t = Math.random();
                if(idx < this.numParticles) {
                    this.baseTx[idx] = p1[0] + t * (p2[0] - p1[0]);
                    this.baseTy[idx] = p1[1] + t * (p2[1] - p1[1]);
                    idx++;
                }
            }
        }
        for(; idx < this.numParticles; idx++) {
            this.baseTx[idx] = 0; this.baseTy[idx] = 0;
        }
    }

    setShapeTornado() {
        for(let i=0; i<this.numParticles; i++) {
            let norm = i / this.numParticles;
            let y = 300 - 600 * norm;
            let radius = 20 + 180 * norm;
            let angle = 40 * Math.PI * norm;
            
            this.baseX3d[i] = radius * Math.cos(angle);
            this.baseY3d[i] = y;
            this.baseZ3d[i] = radius * Math.sin(angle);
            
            this.baseTx[i] = 0;
            this.baseTy[i] = 0;
        }
    }

    changeShape(shapeName) {
        if (this.currentShape === shapeName) return;
        this.currentShape = shapeName;
        
        // Em python as cores sǜo BGR, aqui sǜo RGB. Ajustado para RGB correto de acordo com os comentǭrios python.
        switch(shapeName) {
            case "random": this.setShapeRandom(); this.targetColor = [255, 255, 255]; break;
            case "sphere": this.setShapeSphere(); this.targetColor = [100, 100, 255]; break; // Azul
            case "iloveyou": this.setShapeHeart(); this.targetColor = [255, 0, 0]; break; // Vermelho
            case "two": this.setShapeCube(); this.targetColor = [0, 255, 255]; break; // Ciano
            case "diamond": this.setShapeDiamond(); this.targetColor = [255, 215, 0]; break; // Dourado
            case "star": this.setShapeStar(); this.targetColor = [255, 255, 0]; break; // Amarelo
            case "galaxy": this.setShapeGalaxy(); this.targetColor = [255, 0, 255]; break; // Rosa/Roxo
            case "triangle": this.setShapeTriangle(); this.targetColor = [0, 255, 0]; break; // Verde
            case "infinity": this.setShapeInfinity(); this.targetColor = [250, 0, 130]; break; // Magenta
            case "dna": this.setShapeDna(); this.targetColor = [255, 165, 0]; break; // Laranja
            case "rings": this.setShapeRings(); this.targetColor = [200, 200, 200]; break; // Branco
            case "horns": this.setShapeLightning(); this.targetColor = [255, 255, 0]; break; // Raio
            case "ok": this.setShapeSpiral(); this.targetColor = [100, 255, 100]; break; // Espiral
            case "gun": this.setShapeCross(); this.targetColor = [255, 0, 0]; break; // Cruz
            case "middle": this.setShapeTornado(); this.targetColor = [255, 255, 255]; break; // Tornado
            case "promise": this.setShapeWave(); this.targetColor = [100, 100, 255]; break; // Onda
            case "butterfly": this.setShapeButterfly(); this.targetColor = [255, 105, 180]; break; // Borboleta
            case "hexagon": this.setShapeHexagon(); this.targetColor = [127, 255, 0]; break; // Hexǭgono
        }
    }

    updateAndDraw(ctx, isBlackhole = false) {
        let tTime = performance.now() / 1000.0;
        
        if (this.currentShape === "random" && !isBlackhole) {
            for(let i=0; i<this.numParticles; i++){
                this.tx[i] = this.centerX + this.baseTx[i];
                this.ty[i] = this.centerY + this.baseTy[i];
            }
        } else if (isBlackhole) {
            for(let i=0; i<this.numParticles; i++){
                this.tx[i] = this.centerX;
                this.ty[i] = this.centerY;
            }
        } else {
            let jAmount = 3;
            
            if (this.currentShape === "galaxy") {
                for(let i=0; i<this.numParticles; i++){
                    let angle = Math.atan2(this.baseTy[i], this.baseTx[i]) + 0.05;
                    let r = Math.hypot(this.baseTx[i], this.baseTy[i]);
                    this.baseTx[i] = Math.cos(angle) * r;
                    this.baseTy[i] = Math.sin(angle) * r;
                }
            } else if (this.currentShape === "dna") {
                let freq = 0.02;
                let amp = 80;
                let tFast = tTime * 4.0;
                let half = Math.floor(this.numParticles / 2);
                for(let i=0; i<this.numParticles; i++) {
                    if (i < half) {
                        this.baseTx[i] = Math.sin(this.baseTy[i] * freq + tFast) * amp;
                    } else {
                        this.baseTx[i] = Math.sin(this.baseTy[i] * freq + tFast + Math.PI) * amp;
                    }
                }
            } else if (this.currentShape === "cube") {
                let tRot = tTime * 2.0;
                let cosY = Math.cos(tRot), sinY = Math.sin(tRot);
                let cosX = Math.cos(tRot*0.7), sinX = Math.sin(tRot*0.7);
                for(let i=0; i<this.numParticles; i++){
                    let x2 = this.baseX3d[i] * cosY - this.baseZ3d[i] * sinY;
                    let z2 = this.baseX3d[i] * sinY + this.baseZ3d[i] * cosY;
                    let y3 = this.baseY3d[i] * cosX - z2 * sinX;
                    let z3 = this.baseY3d[i] * sinX + z2 * cosX;
                    
                    let f = 300 / (z3 + 4.0);
                    this.baseTx[i] = x2 * f * 1.5;
                    this.baseTy[i] = y3 * f * 1.5;
                }
            } else if (this.currentShape === "wave") {
                let freq = 0.01;
                let amp = 100;
                let tFast = tTime * 3.0;
                for(let i=0; i<this.numParticles; i++){
                    this.baseTy[i] = Math.sin(this.baseTx[i] * freq + tFast) * amp;
                }
            } else if (this.currentShape === "tornado") {
                let tRot = tTime * 5.0;
                let cosY = Math.cos(tRot), sinY = Math.sin(tRot);
                let tilt = 0.2;
                let cosX = Math.cos(tilt), sinX = Math.sin(tilt);
                
                for(let i=0; i<this.numParticles; i++){
                    let x2 = this.baseX3d[i] * cosY - this.baseZ3d[i] * sinY;
                    let z2 = this.baseX3d[i] * sinY + this.baseZ3d[i] * cosY;
                    let y3 = this.baseY3d[i] * cosX - z2 * sinX;
                    let z3 = this.baseY3d[i] * sinX + z2 * cosX;
                    
                    let f = 400 / (z3 + 500.0);
                    this.baseTx[i] = x2 * f;
                    this.baseTy[i] = y3 * f;
                }
            } else if (this.currentShape === "lightning") {
                if (Math.random() < 0.15) jAmount = 40;
            }

            for(let i=0; i<this.numParticles; i++){
                let jx = (Math.random() + Math.random() + Math.random() - 1.5) * jAmount;
                let jy = (Math.random() + Math.random() + Math.random() - 1.5) * jAmount;
                this.tx[i] = this.centerX + this.baseTx[i] + jx;
                this.ty[i] = this.centerY + this.baseTy[i] + jy;
            }
        }
        
        // Physics
        let spring = isBlackhole ? 0.15 : 0.05;
        let friction = isBlackhole ? 0.90 : 0.85;
        let maxSpeedSq = 30.0 * 30.0;
        
        let cR = this.targetColor[0];
        let cG = this.targetColor[1];
        let cB = this.targetColor[2];
        
        ctx.fillStyle = `rgb(${cR}, ${cG}, ${cB})`;
        ctx.beginPath();
        
        for(let i=0; i<this.numParticles; i++) {
            let ax = (this.tx[i] - this.x[i]) * spring;
            let ay = (this.ty[i] - this.y[i]) * spring;
            
            this.vx[i] = (this.vx[i] + ax) * friction;
            this.vy[i] = (this.vy[i] + ay) * friction;
            
            let speedSq = this.vx[i]*this.vx[i] + this.vy[i]*this.vy[i];
            if (speedSq > maxSpeedSq) {
                let ratio = 30.0 / Math.sqrt(speedSq);
                this.vx[i] *= ratio;
                this.vy[i] *= ratio;
            }
            
            this.x[i] += this.vx[i];
            this.y[i] += this.vy[i];
            
            let px = Math.floor(this.x[i]);
            let py = Math.floor(this.y[i]);
            
            ctx.rect(px, py, 2, 2);
        }
        ctx.fill();
    }
}
