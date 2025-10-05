const SHEET_ID = "1EgoSPO4IgeqGEt1bOYMdjswDr99cZpOCF-ocKUQk6yQ";
const SHEET_NAME = "Database";
const QUERY_URL = "https://docs.google.com/spreadsheets/d/1EgoSPO4IgeqGEt1bOYMdjswDr99cZpOCF-ocKUQk6yQ/gviz/tq?sheet=Database";

var chart = null;
var counts = {};
var radarDataOriginal = [0, 0, 0, 0, 0, 0, 0, 0];
var tot=0;
function getUserIdData(userId) {
  fetch(QUERY_URL)
    .then(res => res.text())
    .then(data => {
      const jsonText = data.substring(47, data.length - 2);
      const json = JSON.parse(jsonText);
      const rows = json.table.rows;

      const userRows = rows.filter(row => row.c[0]?.v === userId);

      console.log("Rows for user:", userId, userRows);

      for (let i = 1; i <= 8; i++) {
        counts[i] = 0;
      }

      userRows.forEach(row => {
        const value = row.c[3]?.v; 
        if (value >= 1 && value <= 8) {
          counts[value]++;
          tot++;
        }
      });

      console.log("Counts for user:", counts);
      for(let i = 1; i<= 8; i++) {
        radarDataOriginal[i-1] = counts[i];
      }
      createRadarChart();
      return { userRows, counts };
    })
    .catch(err => console.error("Error fetching user data:", err));
}

var ctx = document.getElementById('myChart').getContext('2d');

// Create chart with initial zeros
function createRadarChart() {
  chart = new Chart(ctx, {
      type: 'radar',
      data: {
          labels: [
              'รู้สึกมีความสุข','รู้สึกเชื่อใจ','รู้สึกกลัว','รู้สึกตกใจ',
              'รู้สึกเศร้า','รู้สึกเกลียดชัง','รู้สึกโกรษ','รู้สึกสนใจ'
          ],
          datasets: [{
              label: 'User Data',
              data: radarDataOriginal.map(() => 0), // start from 0
              borderColor: '#a8a8a8ff',
              backgroundColor: 'rgba(204, 204, 204, 0.6)',
              pointBackgroundColor: [
                  '#fffe40','#53fe5c','#008000','#5cb3ff',
                  '#4166f5','#fb5ffc','#ff0000','#ffa756'
              ],
              pointRadius: 4
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1,
          scales: {
              r: {
                  min: 0,
                  max: tot,
                  ticks: { display: false },
                  grid: { circular: true },
                  pointLabels: { font: { size: 14 } }
              }
          },
          plugins: {
              legend: { display: false },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          return 'Value: ' + radarDataOriginal[context.dataIndex];
                      }
                  }
              }
          },
          animation: { duration: 0 } // disable default animation
      }
  });
  animateRadar();
}

// Manual animation from center
var animProgress = 0;
function animateRadar() {
    animProgress += 0.05; // adjust speed here
    if (animProgress > 1) animProgress = 1;

    chart.data.datasets[0].data = radarDataOriginal.map(v => v * animProgress);
    chart.update();

    if (animProgress < 1) requestAnimationFrame(animateRadar);
}



const canvas = document.getElementById('circleCanvas');
const ctx2 = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');
const width = canvas.width;
const height = canvas.height;
const cx = width/2;
const cy = height/2;
const radius = 250; // circle radius


// Example datasets
const datasets = [
  {label:"Axis 1", data:[0,60000000,180000000,220000000], color:"#e41a1c"},
  {label:"Axis 2", data:[30000000,120000000,210000000], color:"#377eb8"}
];


// Convert HHMMSSmmm to angle (radians) 0 = top/midnight
function timeToAngle(timeNum) {
  let h = Math.floor(timeNum / 10000000);
  let m = Math.floor((timeNum % 10000000) / 100000);
  let s = Math.floor((timeNum % 100000) / 1000);
  let ms = timeNum % 1000;
  const totalMs = ((h*3600 + m*60 + s)*1000 + ms);
  return (totalMs / (24*60*60*1000)) * 2 * Math.PI - Math.PI/2;
}


// Convert polar to canvas x/y
function polarToXY(angle, r) {
  return {x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle)};
}


// Store dot positions for hover detection
let dots = [];


// Draw clock ticks and labels
function drawClockFace() {
  ctx2strokeStyle = '#aaa';
  ctx2.lineWidth = 1;
  ctx2.font = "14px Arial";
  ctx2.textAlign = "center";
  ctx2.textBaseline = "middle";


  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * 2 * Math.PI - Math.PI/2;
    const inner = polarToXY(angle, radius - 10);
    const outer = polarToXY(angle, radius);
    ctx2.beginPath();
    ctx2.moveTo(inner.x, inner.y);
    ctx2.lineTo(outer.x, outer.y);
    ctx2.stroke();


    // Label every 3 hours
    if (h % 3 === 0) {
      const labelPos = polarToXY(angle, radius + 20);
      ctx2.fillText(h.toString(), labelPos.x, labelPos.y);
    }
  }
}


// Draw circle and dots
function draw() {
  ctx2.clearRect(0,0,width,height);


  // Draw outer circle
  ctx2.beginPath();
  ctx2.arc(cx,cy,radius,0,2*Math.PI);
  ctx2.strokeStyle = '#ccc';
  ctx2.lineWidth = 2;
  ctx2.stroke();


  // Draw clock face (ticks + labels)
  drawClockFace();


  dots = [];
  // Draw dataset dots
  datasets.forEach(ds => {
    ds.data.forEach(timeNum => {
      const angle = timeToAngle(timeNum);
      const {x,y} = polarToXY(angle, radius);
      ctx2.beginPath();
      ctx2.arc(x, y, 8, 0, 2*Math.PI);
      ctx2.fillStyle = ds.color;
      ctx2.fill();
      dots.push({x,y,r:8, label: ds.label, time: timeNum});
    });
  });
}
draw();


// Handle hover tooltip
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  let found = false;


  for (let dot of dots) {
    const dx = mx - dot.x;
    const dy = my - dot.y;
    if (Math.sqrt(dx*dx + dy*dy) <= dot.r) {
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 10) + 'px';
      tooltip.style.top = (e.clientY + 10) + 'px';


      // Format time as HH:MM:SS.mmm
      let t = dot.time;
      let h = Math.floor(t / 10000000);
      let m = Math.floor((t % 10000000) / 100000);
      let s = Math.floor((t % 100000) / 1000);
      let ms = t % 1000;
      let timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;


      tooltip.innerHTML = `${dot.label}<br>${timeStr}`;
      found = true;
      break;
    }
  }


  if (!found) tooltip.style.display = 'none';
});


canvas.addEventListener('mouseleave', () => {
  tooltip.style.display = 'none';
});

