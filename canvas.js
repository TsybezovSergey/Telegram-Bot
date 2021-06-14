const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(500, 500);
const ctx = canvas.getContext('2d');

function drawPieSlice(ctx, centerX, centerY, radius, startAngle, endAngle, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();
}
const Piechart = function (options) {
  this.options = options;
  this.canvas = options.canvas;
  this.ctx = this.canvas.getContext('2d');
  this.colors = options.colors;

  this.draw = function () {
    let total_value = 0;
    let color_index = 0;
    for (var categ in this.options.data) {
      var val = this.options.data[categ];
      total_value += val;
    }

    let start_angle = 0;
    for (categ in this.options.data) {
      val = this.options.data[categ];
      const slice_angle = 2 * Math.PI * val / total_value;

      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        Math.min(this.canvas.width / 2, this.canvas.height / 2),
        start_angle,
        start_angle + slice_angle,
        this.colors[color_index % this.colors.length],
      );
      start_angle += slice_angle;
      color_index++;
    }
  };
};

const createMyCanvas = async (id, options) => {
  const check = Object.values(options).filter((el) => el === 0);
  if (check.length !== 6) {
    const myPiechart = new Piechart(
      {
        canvas,
        data: options,
        colors: ['#ff0000', '#ff6a00', '#ffff00', '#00ff11', '#0d0dde', '#e808fc'],
      },
    );
    myPiechart.draw();
    const out = fs.createWriteStream(`${__dirname}/database/${id}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log('The PNG file was created.'));
  } else return null;
};

// createMyCanvas('643560', options);
module.exports = createMyCanvas;
