// Matter.js module
const Engine = Matter.Engine,
      World = Matter.World,
      Body = Matter.Body,
      Events = Matter.Events,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite;

const canvas = document.createElement('canvas'),
      canvasWidth = (window.innerWidth),
      canvasHeight = (window.innerHeight),
      engine = Engine.create(),
      world = engine.world;

world.gravity.y = 1;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

document.body.appendChild(canvas);

const render = Matter.Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvasWidth,
    height: canvasHeight,
    wireframeBackground: 'transparent',
    wireframe: false,
  }
});

Matter.Render.run(render);

let terrain = [];

function setupTerrain() {
  terrain = [];

  // Create terrain based on SVG path
  const terrainY = canvasHeight * 0.85;

  // Left side
  terrain.push(
    Bodies.polygon(canvasWidth * 0.1, terrainY, 4, 60, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.1,
      label: 'terrain'
    })
  );

  // Middle
  terrain.push(
    Bodies.polygon(canvasWidth * 0.5, terrainY, 4, 80, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.1,
      label: 'terrain'
    })
  );

  // Right side
  terrain.push(
    Bodies.polygon(canvasWidth * 0.9, terrainY, 4, 60, {
      isStatic: true,
      friction: 0.5,
      restitution: 0.1,
      label: 'terrain'
    })
  );

  // Bottom floor
  const floor = Bodies.rectangle(canvasWidth / 2, canvasHeight, canvasWidth, 60, {
    isStatic: true,
    friction: 0.5,
    restitution: 0.1,
    label: 'floor'
  });

  terrain.push(floor);

  terrain.forEach(t => World.add(world, t));
}

setupTerrain();

let hearts = [];

function createHeart(x, y) {
  const heart = Bodies.circle(x, y, 15, {
    friction: 0.5,
    restitution: 0.8,
    density: 0.001,
    label: 'heart',
    collisionFilter: {
      category: 0x0001,
      mask: 0xFFFF
    }
  });

  // Store SVG data on the body for rendering
  heart.svgData = true;

  World.add(world, heart);
  hearts.push(heart);

  // Remove after some time to prevent memory issues
  setTimeout(() => {
    World.remove(world, heart);
    hearts = hearts.filter(h => h !== heart);
  }, 15000);
}

// Custom rendering function
function customRender(render) {
  const bodies = Composite.allBodies(render.engine.world);

  const ctx = render.context;

  // Render hearts with SVG
  hearts.forEach(heart => {
    ctx.save();
    ctx.translate(heart.position.x, heart.position.y);
    ctx.rotate(heart.angle);

    // Draw heart using canvas
    ctx.fillStyle = '#ff1493';
    ctx.shadowColor = 'rgba(255, 20, 147, 0.8)';
    ctx.shadowBlur = 10;

    // Simple heart shape using bezier curves
    const size = 15;
    ctx.beginPath();

    // Left lobe
    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.2,
      -size * 0.8, size * 0.2,
      -size * 0.3, size * 0.7
    );

    // Right lobe
    ctx.bezierCurveTo(
      -size * 0.1, size * 0.5,
      size * 0.1, size * 0.5,
      size * 0.3, size * 0.7
    );

    ctx.bezierCurveTo(
      size * 0.8, size * 0.2,
      size * 0.5, -size * 0.2,
      0, -size * 0.6
    );

    ctx.bezierCurveTo(
      -size * 0.5, -size * 0.2,
      -size * 0.8, size * 0.2,
      -size * 0.3, size * 0.7
    );

    ctx.fill();
    ctx.restore();
  });
}

// Mouse interaction
document.addEventListener('click', (e) => {
  createHeart(e.clientX, e.clientY);
});

document.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  createHeart(touch.clientX, touch.clientY);
});

// Animation loop
function animationLoop() {
  Engine.update(engine);
  
  // Custom rendering
  const ctx = render.context;
  ctx.fillStyle = 'transparent';
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  customRender(render);
  Matter.Render.world(render);

  requestAnimationFrame(animationLoop);
}

animationLoop();

// Auto-create hearts periodically
setInterval(() => {
  const randomX = Math.random() * canvasWidth;
  const randomY = Math.random() * (canvasHeight * 0.3);
  createHeart(randomX, randomY);
}, 500);

// Handle window resize
window.addEventListener('resize', () => {
  // Optional: handle resize
});
