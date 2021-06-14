const ctx = document.getElementById('myChart').getContext('2d');

document.getElementById('theimage').style.width = '256px';
document.getElementById('theimage').style.height = '256px';

const myChart = new Chart(ctx, {
  type: 'polarArea',
  data: {
    labels: [
      'Home',
      'Family',
      'Food',
      'Entertainment',
      'Travels',
      'Other',
    ],
    datasets: [{
      label: 'My First Dataset',
      data: [1100, 1600, 700, 300, 1400, 1000],
      backgroundColor: [
        'rgba(255, 99, 132)',
        'rgba(75, 192, 192)',
        'rgba(255, 205, 86)',
        'rgba(201, 203, 207)',
        'rgba(54, 162, 235)',
        'rgba(154, 162, 235)',
      ],
    }],
  },
  options: {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 36,
          },
        },
      },
    },
  },
});

const canvas = document.querySelector('#myChart');
document.getElementById('theimage').src = canvas.toDataURL('image/png');
const canvasJSON = JSON.stringify(document.getElementById('theimage').src);
console.log(canvasJSON)
Canvas2Image.saveAsPNG(canvas);
