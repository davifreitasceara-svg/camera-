import { ParticleSystem } from "./ParticleSystem.js";
import { getFingersUp, classifyGesture } from "./gestures.js";

const videoElement = document.getElementById("videoElement");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const overlayText = document.getElementById("overlay-text");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

const NUM_PARTICLES = 8000;
const particles = new ParticleSystem(NUM_PARTICLES);

let smoothCx = width / 2;
let smoothCy = height / 2;

let lastShape = "random";
let framesHoldingShape = 0;
let modoPortal = false;
let cooldownPortal = 0;
let smoothPortalPts = null;
let gestureTriggered = false;

const filtersList = ["neon", "thermal", "cyberpunk", "glitch"];
let currentFilterIdx = 0;

let opencvLoaded = false;

// We wait for opencv.js to load
const checkOpenCV = setInterval(() => {
    if (typeof cv !== 'undefined' && cv.Mat) {
        clearInterval(checkOpenCV);
        opencvLoaded = true;
        initMediaPipe();
    }
}, 100);

let hands;
let camera;

function initMediaPipe() {
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
        },
        width: 1280,
        height: 720
    });
    camera.start();
}

function applyFilter(ctx_input, filterName, x, y, w, h) {
    if (w <= 0 || h <= 0) return;
    let imageData = ctx_input.getImageData(x, y, w, h);
    let data = imageData.data;
    
    if (filterName === "neon") {
        for(let i=0; i<data.length; i+=4) {
            let gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
            data[i] = Math.min(255, gray * 0.5); // R
            data[i+1] = Math.min(255, gray * 2.0); // G
            data[i+2] = Math.min(255, gray * 2.0); // B
        }
    } else if (filterName === "thermal") {
        for(let i=0; i<data.length; i+=4) {
            let gray = data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114;
            if (gray < 85) { data[i]=0; data[i+1]=0; data[i+2]=255; }
            else if (gray < 170) { data[i]=0; data[i+1]=255; data[i+2]=0; }
            else { data[i]=255; data[i+1]=0; data[i+2]=0; }
        }
    } else if (filterName === "cyberpunk") {
        for(let i=0; i<data.length; i+=4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            data[i] = Math.min(255, r * 1.5 + b * 0.5);
            data[i+1] = g * 0.3;
            data[i+2] = Math.min(255, b * 1.5 + r * 0.5);
        }
    } else if (filterName === "glitch") {
        // very simple glitch: invert some channels
        for(let i=0; i<data.length; i+=4) {
            if (Math.random() < 0.1) {
                data[i] = 255 - data[i];
                data[i+1] = 255 - data[i+1];
            }
        }
    }
    
    ctx_input.putImageData(imageData, x, y);
}

function onResults(results) {
    if (!opencvLoaded) return;
    
    // Draw base camera frame
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(results.image, -width, 0, width, height);
    ctx.restore();

    let isBlackhole = false;
    let totalFingersUp = 0;
    
    if (cooldownPortal > 0) cooldownPortal--;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        let gestures = [];
        for (const landmarks of results.multiHandLandmarks) {
            // Desenhar linhas da mão
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 1});
            drawLandmarks(ctx, landmarks, {color: '#FFFFFF', lineWidth: 1, radius: 1});
            
            let fingers = getFingersUp(landmarks);
            totalFingersUp += fingers.reduce((a, b) => a + b, 0);
            gestures.push(classifyGesture(fingers));
        }

        // Pega apenas a primeira mão para o centro (invertido no X devido ao espelhamento)
        let handLandmarks = results.multiHandLandmarks[0];
        let cxRaw = (1.0 - handLandmarks[9].x) * width; 
        let cyRaw = handLandmarks[9].y * height;
        
        smoothCx = smoothCx * 0.8 + cxRaw * 0.2;
        smoothCy = smoothCy * 0.8 + cyRaw * 0.2;
        particles.updateCenter(smoothCx, smoothCy);

        let gesture = gestures[0];
        if (gestures.includes("ok")) {
            gesture = "ok";
        } else if (totalFingersUp >= 9) {
            gesture = "ten";
        }
        
        if (gesture === lastShape) {
            framesHoldingShape++;
        } else {
            framesHoldingShape = 0;
            lastShape = gesture;
        }

        if (framesHoldingShape >= 7) {
            if (gesture === "ok") {
                if (cooldownPortal === 0) {
                    modoPortal = !modoPortal;
                    cooldownPortal = 30;
                    framesHoldingShape = 0;
                }
            } else if (!modoPortal) {
                if (gesture === "open") particles.changeShape("random");
                else if (gesture === "one") particles.changeShape("iloveyou");
                else if (gesture === "two") particles.changeShape("butterfly");
                else if (gesture === "L_shape") particles.changeShape("diamond");
                else if (gesture === "horns") particles.changeShape("hexagon");
                else if (gesture === "thumb") particles.changeShape("star");
                else if (gesture === "pinky") particles.changeShape("galaxy");
                else if (gesture === "three") particles.changeShape("triangle");
                else if (gesture === "four") particles.changeShape("dna");
                else if (gesture === "shaka") particles.changeShape("infinity");
                else if (gesture === "spider") particles.changeShape("rings");
                else if (gesture === "gun") particles.changeShape("cross");
                else if (gesture === "middle") particles.changeShape("tornado");
                else if (gesture === "promise") particles.changeShape("wave");
                else if (gesture === "fist") isBlackhole = true;
            }
        }
    } else {
        if (!modoPortal) {
            particles.updateCenter(width / 2, height / 2);
            particles.changeShape("random");
        }
    }

    if (modoPortal) {
        let ptsPortal = [];
        let changeFilter = false;
        
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                let thumb = landmarks[4];
                let index = landmarks[8];
                let tx = (1.0 - thumb.x) * width;
                let ty = thumb.y * height;
                let ix = (1.0 - index.x) * width;
                let iy = index.y * height;
                
                if (Math.hypot(tx - ix, ty - iy) < 40) {
                    changeFilter = true;
                }
                
                ptsPortal.push({x: tx, y: ty});
                ptsPortal.push({x: ix, y: iy});
            }
        }
        
        if (changeFilter) {
            if (!gestureTriggered) {
                currentFilterIdx = (currentFilterIdx + 1) % filtersList.length;
                gestureTriggered = true;
            }
        } else {
            gestureTriggered = false;
        }
        
        let filterName = filtersList[currentFilterIdx];
        overlayText.innerText = `MODO PORTAL! Pinca: INDICADOR+POLEGAR. Saida: Gesto OK. | Filtro: ${filterName}`;
        
        if (ptsPortal.length === 4) {
            ptsPortal.sort((a,b) => a.y - b.y);
            let topPts = [ptsPortal[0], ptsPortal[1]].sort((a,b) => a.x - b.x);
            let bottomPts = [ptsPortal[2], ptsPortal[3]].sort((a,b) => a.x - b.x);
            
            let rawPoly = [topPts[0], topPts[1], bottomPts[1], bottomPts[0]];
            
            if (!smoothPortalPts) {
                smoothPortalPts = rawPoly;
            } else {
                for(let i=0; i<4; i++) {
                    smoothPortalPts[i].x = smoothPortalPts[i].x * 0.8 + rawPoly[i].x * 0.2;
                    smoothPortalPts[i].y = smoothPortalPts[i].y * 0.8 + rawPoly[i].y * 0.2;
                }
            }
            
            let minX = Math.min(...smoothPortalPts.map(p=>p.x));
            let maxX = Math.max(...smoothPortalPts.map(p=>p.x));
            let minY = Math.min(...smoothPortalPts.map(p=>p.y));
            let maxY = Math.max(...smoothPortalPts.map(p=>p.y));
            
            minX = Math.max(0, Math.floor(minX));
            minY = Math.max(0, Math.floor(minY));
            maxX = Math.min(width, Math.ceil(maxX));
            maxY = Math.min(height, Math.ceil(maxY));
            
            let w = maxX - minX;
            let h = maxY - minY;
            
            if (w > 0 && h > 0) {
                applyFilter(ctx, filterName, minX, minY, w, h);
                
                // Draw portal borders
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(smoothPortalPts[0].x, smoothPortalPts[0].y);
                ctx.lineTo(smoothPortalPts[1].x, smoothPortalPts[1].y);
                ctx.lineTo(smoothPortalPts[2].x, smoothPortalPts[2].y);
                ctx.lineTo(smoothPortalPts[3].x, smoothPortalPts[3].y);
                ctx.closePath();
                ctx.stroke();
            }
        } else {
            smoothPortalPts = null;
        }
    } else {
        overlayText.innerText = `Dedos: ${totalFingersUp} | Forma: ${particles.currentShape.toUpperCase()}`;
        particles.updateAndDraw(ctx, isBlackhole);
    }
}
