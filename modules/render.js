// import {W, H, M, C, G, BG} from './modules/config.js';



function line(ctx, x, y, xx, yy, radius, color) {
    ctx.strokeStyle = color;
    ctx.beginPath(); // Start a new path
    ctx.moveTo(x, y); // Move the pen to (30, 50)
    ctx.lineTo(xx, yy); // Draw a line to (150, 100)
    ctx.lineWidth = radius;
    ctx.stroke(); // Render the path
}


function draw(ctx, length, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, length, length);
}

function rdraw(ctx, length, x, y, color) {
  ctx.beginPath();
  ctx.fillStyle = color;
  /*
  upper - r, r, 0, 0
  lower - 0, 0, r, r
  right - 0, r, r, 0
  left - r, 0, 0, r
  */
  let g = 5;
  ctx.roundRect(x, y, length, length, [g, g, g, g]);
  ctx.fill();
}


function rint(min, max) {
   let num = Math.floor(Math.random() * (max - min)) + min;
   return num;
}

export {draw, rdraw, rint, line};