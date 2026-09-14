// main.js
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.js";
import { getFingersUp, classifyGesture } from "./gestures.js";
import { ParticleSystem } from "./ParticleSystem.js";

const video = document.getElementById("videoElement");
const canvas = document.getElementById("outputCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const statusText = document.getElementById("status-text");
const gestureText = document.getElementById("gesture-text");

let handLandmarker;
let webcamRunning = false;
let lastVideoTime = -1;

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Resize listener
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
});

// Particle System
const particles = new ParticleSystem(300);

// State Variables
let lastShape = "random";
let framesHoldingShape = 0;
let modoPortal = false;
let cooldownPortal = 0;
let filterMode = 0;

async function initializeMediaPipe() {
    statusText.innerText = "Baixando modelos da IA...";
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
    
    statusText.innerText = "Ligue a câmera e permita o acesso!";
    startCamera();
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, facingMode: "user" }
        });
        video.srcObject = stream;
        video.addEventListener("loadeddata", () => {
            webcamRunning = true;
            statusText.innerText = "IA Pronta!";
            requestAnimationFrame(predictWebcam);
        });
    } catch (err) {
        statusText.innerText = "Erro ao acessar a câmera: " + err.message;
    }
}

function processPortal(videoFrame) {
    // OpenCV.js Edge Detection logic for "Portal" level
    if (typeof cv === 'undefined' || !cv.Mat) return;
    
    // Create a temporary canvas/mat to hold video
    let src = new cv.Mat(height, width, cv.CV_8UC4);
    ctx.drawImage(video, 0, 0, width, height); // draw video to get pixels
    let imageData = ctx.getImageData(0, 0, width, height);
    src.data.set(imageData.data);

    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    
    let edges = new cv.Mat();
    cv.Canny(gray, edges, 40, 120);

    // Apply color depending on filterMode
    let colorEdges = new cv.Mat();
    cv.cvtColor(edges, colorEdges, cv.COLOR_GRAY2RGBA, 0);

    // Naive tint
    let view = colorEdges.data;
    for (let i = 0; i < view.length; i += 4) {
        if (view[i] > 0) { // If it's an edge
            if (filterMode === 0) { // Green Neon
                view[i] = 0; view[i+1] = 255; view[i+2] = 0;
            } else { // Purple/Pink Neon
                view[i] = 255; view[i+1] = 0; view[i+2] = 255;
            }
        }
    }

    let outImgData = new ImageData(new Uint8ClampedArray(colorEdges.data), width, height);
    ctx.putImageData(outImgData, 0, 0);

    src.delete(); gray.delete(); edges.delete(); colorEdges.delete();
}

function predictWebcam() {
    ctx.save();
    // Espelhar a imagem da câmera
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    
    let isBlackhole = false;

    if (cooldownPortal > 0) cooldownPortal--;

    if (modoPortal) {
        processPortal(); // Applies OpenCV edge detection
    } else {
        // Modo 1 (Metade Câmera, Metade Partículas ou Fundo Preto)
        // Para a web, vamos desenhar um fundo gradiente legal
        ctx.fillStyle = "rgba(10, 10, 15, 1.0)";
        ctx.fillRect(0, 0, width, height);
        
        // Câmera sutil de fundo
        ctx.globalAlpha = 0.2;
        ctx.drawImage(video, 0, 0, width, height);
        ctx.globalAlpha = 1.0;
    }

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        let startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(video, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
            let cx = 0, cy = 0;
            let gesture = "unknown";
            
            // Analyze primary hand
            const hand0 = results.landmarks[0];
            cx = width - (hand0[9].x * width); // mirrored X
            cy = hand0[9].y * height;
            
            particles.updateCenter(cx, cy);

            let fingers = getFingersUp(hand0);
            gesture = classifyGesture(fingers);

            // Debouncing gesture
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
                    else if (gesture === "two") particles.changeShape("butterfly");
                    else if (gesture === "horns") particles.changeShape("hexagon");
                    else if (gesture === "three") particles.changeShape("triangle");
                    else if (gesture === "one") particles.changeShape("iloveyou");
                    else if (gesture === "fist") isBlackhole = true;
                    // Mapeie os outros
                }
            }

            // Draw hand points
            for (let point of hand0) {
                ctx.beginPath();
                ctx.arc(width - (point.x * width), point.y * height, 3, 0, 2*Math.PI);
                ctx.fillStyle = "white";
                ctx.fill();
            }

            gestureText.innerText = `Gesto: ${gesture.toUpperCase()}`;
        } else {
            gestureText.innerText = "Gesto: Nenhuma Mão";
            particles.updateCenter(width/2, height/2);
            if (!modoPortal) particles.changeShape("random");
        }
    }

    if (!modoPortal) {
        // Fix coordinates since canvas is mirrored
        // Particle system expects un-mirrored drawing ctx because we already mirrored cx.
        // Wait, if canvas is mirrored, we should un-mirror for particles so they draw correctly, OR just draw them.
        ctx.restore(); // Remove mirror for particles
        particles.updateAndDraw(ctx, isBlackhole);
    } else {
        ctx.restore();
    }

    requestAnimationFrame(predictWebcam);
}

// Load OpenCV and MediaPipe
initializeMediaPipe();

document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
        filterMode = (filterMode === 0) ? 1 : 0;
    }
});
