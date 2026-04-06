// 变量配置
let particles = [];
const NUM_PARTICLES = 400;   // 组织密度
const CONNECT_DIST = 70;     // 网状结构
let historyLayer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(15, 18, 22); 
  
  historyLayer = createGraphics(windowWidth, windowHeight);
  historyLayer.clear();
  historyLayer.blendMode(ADD); 
  
  for(let i=0; i<NUM_PARTICLES; i++){
    particles.push(new Particle(random(width), random(height)));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  historyLayer = createGraphics(windowWidth, windowHeight);
  historyLayer.clear();
  historyLayer.blendMode(ADD);
}

function draw() {
  background(15, 18, 22, 60); 
  image(historyLayer, 0, 0);

  // 模拟外力入侵
  let mouseVelocity = dist(mouseX, mouseY, pmouseX, pmouseY);
  
  if (mouseVelocity > 5) {
    for(let i = 0; i < particles.length; i++) {
      particles[i].inflictTrauma(mouseX, mouseY, mouseVelocity);
    }
  }

  // 更新与愈合
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.update();
    
    for (let j = i + 1; j < particles.length; j++) {
      let other = particles[j];
      let d = p.pos.dist(other.pos);

      if (d < CONNECT_DIST) {
        let isHealing = (p.trauma > 0 || other.trauma > 0);

        if (isHealing) {
          let glow = max(p.trauma, other.trauma);
          
          // 极细的丙火金线，带着温度的愈合
          stroke(255, 150, 30, glow * 160); 
          strokeWeight(0.4); 
          line(p.pos.x, p.pos.y, other.pos.x, other.pos.y);

          // 不可逆的历史痕迹
          if (glow < 0.8 && glow > 0.1) {
            historyLayer.stroke(255, 180, 50, 4); 
            historyLayer.strokeWeight(0.2); 
            historyLayer.line(p.pos.x, p.pos.y, other.pos.x, other.pos.y);
          }
        } else {
          // 平静的原始网络
          let alpha = map(d, 0, CONNECT_DIST, 30, 0);
          stroke(100, 110, 130, alpha); 
          strokeWeight(0.3); 
          line(p.pos.x, p.pos.y, other.pos.x, other.pos.y);
        }
      }
    }
  }
}

// 细胞节点类
class Particle {
  constructor(x, y) {
    this.basePos = createVector(x, y); 
    this.pos = createVector(x, y);     
    this.vel = createVector(0, 0);     
    this.trauma = 0;                   
  }

  // 绽开
  inflictTrauma(mx, my, force) {
    let d = dist(this.pos.x, this.pos.y, mx, my);
    
    // 伤口极窄 (30像素)
    if (d < 30) {
      // 圆形排斥力
      let push = p5.Vector.sub(this.pos, createVector(mx, my));
      push.normalize();
      push.mult(force * 0.8 * (30 - d) / 30); 
      this.vel.add(push);

      this.trauma = 1.0;
      this.basePos.add(p5.Vector.mult(push, 0.05)); 
    }
  }

  update() {
    this.pos.add(this.vel);
    this.vel.mult(0.85); 

    if (this.trauma > 0) {
      //愈合速度
      this.pos.x = lerp(this.pos.x, this.basePos.x, 0.06);
      this.pos.y = lerp(this.pos.y, this.basePos.y, 0.06);

      let jitter = this.trauma * 2.5;
      this.pos.x += random(-jitter, jitter);
      this.pos.y += random(-jitter, jitter);

      this.trauma -= 0.008; 
      if (this.trauma < 0) this.trauma = 0;
    } else {
      this.basePos.x += random(-0.3, 0.3);
      this.basePos.y += random(-0.3, 0.3);
      this.pos.x = lerp(this.pos.x, this.basePos.x, 0.1);
      this.pos.y = lerp(this.pos.y, this.basePos.y, 0.1);
    }
  }
}
