// gestures.js

// Índices das pontas dos dedos no MediaPipe
const TIP_IDS = [4, 8, 12, 16, 20];

export function getFingersUp(landmarks) {
    let fingers = [];
    
    if (!landmarks || landmarks.length < 21) {
        return [0, 0, 0, 0, 0];
    }

    // Thumb (Polegar)
    // O polegar compara o X (assumindo mão aberta pra câmera).
    // Nota: A detecção de mão esquerda/direita inverte a lógica do X. 
    // Para simplificar na web (onde a câmera já vem espelhada geralmente), 
    // verificamos se a ponta (4) está mais "pra fora" que a articulação (2).
    // Usaremos a distância Y ou X dependendo da rotação, mas uma aproximação clássica:
    if (landmarks[TIP_IDS[0]].x < landmarks[TIP_IDS[0] - 1].x) {
        fingers.push(1); // Mão direita assumida
    } else {
        fingers.push(0);
    }
    // Pra melhorar, podemos apenas checar a altura do polegar vs articulação (Y) se a mão estiver pra cima
    // mas vamos manter simples por agora, focando nos outros dedos que são mais confiáveis no eixo Y.
    
    // Como a câmera pode ou não estar espelhada, vamos focar nos outros dedos (Y axis)
    // Dedos longos (Indicador, Médio, Anelar, Mindinho)
    for (let id = 1; id < 5; id++) {
        // Se a ponta do dedo estiver acima da articulação inferior (Y cresce pra baixo no Canvas)
        if (landmarks[TIP_IDS[id]].y < landmarks[TIP_IDS[id] - 2].y) {
            fingers.push(1);
        } else {
            fingers.push(0);
        }
    }
    
    return fingers;
}

export function classifyGesture(fingers) {
    const fStr = fingers.join("");
    
    // 00000 -> fist
    // 11111 ou 01111 -> open
    // 01000 -> one
    // 01100 -> two (peace / butterfly)
    // 01110 -> three
    // 01111 -> four
    // 10001 -> shaka (infinity)
    // 11001 -> spider (rings)
    // 11000 -> gun (cross)
    // 10000 -> thumb (star)
    // 00001 -> pinky (galaxy)
    // 11000 -> L_shape (diamond) - Colisões com gun, vamos usar 01001 para chifres
    // 01001 -> horns (hexagon)
    // 00100 -> middle (tornado)
    // 00011 -> promise (wave)
    // 01101 -> ok (portal) -> A bolinha do polegar/indicador é complexa só com Y, mas vamos mapear 00111 ou 10111 como "OK".
    
    if (fStr === "00000") return "fist";
    if (fStr === "11111" || fStr === "01111") return "open";
    if (fStr === "01000" || fStr === "11000") return "one"; // 11000 as gun ou one
    if (fStr === "01100" || fStr === "11100") return "two";
    if (fStr === "01110" || fStr === "11110") return "three";
    if (fStr === "10001" || fStr === "00001") return "shaka"; // ou pinky
    if (fStr === "01001" || fStr === "11001") return "horns";
    if (fStr === "00100") return "middle";
    if (fStr === "00011") return "promise";
    
    // Gesto OK aproximado (Indicador e polegar juntos/abaixados, outros levantados)
    if (fStr === "00111" || fStr === "10111") return "ok";
    
    return "unknown";
}
