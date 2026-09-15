export function getFingersUp(landmarks) {
    const tips = [4, 8, 12, 16, 20];
    const pips = [2, 6, 10, 14, 18];
    let up = [];
    
    // Polegar: distância da ponta (4) até a base do mindinho (17) 
    // Adicionado um pequeno fator de tolerância (1.15) para evitar instabilidade
    let dx4 = landmarks[4].x - landmarks[17].x;
    let dy4 = landmarks[4].y - landmarks[17].y;
    let dist_4_17 = Math.hypot(dx4, dy4);
    
    let dx2 = landmarks[2].x - landmarks[17].x;
    let dy2 = landmarks[2].y - landmarks[17].y;
    let dist_2_17 = Math.hypot(dx2, dy2);
    
    up.push((dist_4_17 > dist_2_17 * 1.15) ? 1 : 0);
        
    for (let i = 1; i < 5; i++) {
        // Compara a ponta do dedo com a junta MCP (base do dedo) em vez da junta do meio
        let mcp_joint = pips[i] - 1; 
        if (landmarks[tips[i]].y < landmarks[mcp_joint].y) {
            up.push(1);
        } else {
            up.push(0);
        }
    }
    return up;
}

export function classifyGesture(fingers) {
    const fStr = fingers.join('');
    
    if (fStr === "00000") return "fist";
    if (fStr === "01000") return "one";
    if (fStr === "01100") return "two";
    if (fStr === "01110") return "three";
    if (fStr === "01111") return "four";
    if (fStr === "11001" || fStr === "01001") return "horns";
    if (fStr === "10000") return "thumb";
    if (fStr === "11111") return "open";
    if (fStr === "00001") return "pinky";
    if (fStr === "11000") return "L_shape";
    if (fStr === "10001") return "shaka";
    if (fStr === "01010" || fStr === "01011") return "spider";
    if (fStr === "11100") return "gun";
    if (fStr === "00100") return "middle";
    if (fStr === "00011") return "promise";
    if (fStr === "00111") return "ok";
    
    return "unknown";
}
