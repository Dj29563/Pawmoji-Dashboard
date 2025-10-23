const SHEET_ID = "1EgoSPO4IgeqGEt1bOYMdjswDr99cZpOCF-ocKUQk6yQ";
const SHEET_NAME = "Database";
const QUERY_URL = "https://docs.google.com/spreadsheets/d/1EgoSPO4IgeqGEt1bOYMdjswDr99cZpOCF-ocKUQk6yQ/gviz/tq?sheet=Database";

var chart = null;
var radarDataOriginal = [0, 0, 0, 0, 0, 0, 0, 0];
var counts = Array.from({length:4}, () => Array(8).fill(0));
var tot = Array(4).fill(0);
var tem = 3;
var dataall = Array.from({ length: 4 }, () =>
  Array.from({ length: 8 }, () =>
    Array(24).fill(0)
  )
);
function formatDateCompactInt(date) {
  const pad = (num, size) => String(num).padStart(size, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1, 2);
  const day = pad(date.getDate(), 2);
  const hour = pad(date.getHours(), 2);
  const minute = pad(date.getMinutes(), 2);
  const second = pad(date.getSeconds(), 2);
  const ms = pad(date.getMilliseconds(), 3);

  return BigInt(`${year}${month}${day}${hour}${minute}${second}${ms}`);
}

const now = new Date();
var compactInt;
function start(userId, userName, userPic) {
  compactInt = formatDateCompactInt(now);
  getUserIdData(userId);
  console.log(compactInt);
  document.getElementById("user-name").textContent = userName;
  document.getElementById("user-picture").src = userPic;
}
function getUserIdData(userId) {
  fetch(QUERY_URL)
    .then(res => res.text())
    .then(data => {
      const jsonText = data.substring(47, data.length - 2);
      const json = JSON.parse(jsonText);
      const rows = json.table.rows;

      const userRows = rows.filter(row => row.c[0]?.v === userId);
      console.log("Rows for user:", userId, userRows);

      userRows.forEach(row => {
        const value = row.c[3]?.v; 
        const timecol = row.c[4]?.v;
        var timecolInt = BigInt(timecol);
        var timenow = compactInt - timecolInt;
        var hourdata = Number((timecolInt / 10000000n) % 100n);
        console.log(timenow);
        if (timenow < 7000000000 && tem==3)
        {
          tem=2;
        }
        if(timenow < 3000000000 && tem==2)
        {
          tem=1;
        }
        if(timenow < 1000000000 && tem==1)
        {
          tem=0;
        }
        if (value >= 1 && value <= 8) {
          counts[tem][value-1]++;
          tot[tem]++;
          dataall[tem][value-1][hourdata]++;
        }
      });

      for(let i=1;i<=3;i++)
      {
        for(let j=0;j<=7;j++)
        {
          counts[i][j]=counts[i][j]+counts[i-1][j];
          dataall[i][j][j]=dataall[i][j][j]+dataall[i-1][j][j];
        }
        tot[i]=tot[i]+tot[i-1];
      }

      console.log("Counts for user:", counts);
      for(let i = 1; i<= 8; i++) {
        radarDataOriginal[i-1] = counts[3][i-1];
      }
      createRadarChart();
      createCharts2();
      fetchResponse();
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
                  max: tot[3],
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

//chart finish

const labels2 = Array.from({length: 24}, (_, i) => i + ":00");

const colors2 = [
  'rgba(255,254,64,0.6)',
  'rgba(83,254,92,0.6)',
  'rgba(0,128,0,0.6)',
  'rgba(92,179,255,0.6)',
  'rgba(65,102,245,0.6)',
  'rgba(251,95,252,0.6)',
  'rgba(255,0,0,0.6)',
  'rgba(255,167,86,0.6)'
];

const charts2 = [];
const chartOpacity2 = Array(8).fill(true);

function createCharts2() {
  for(let i=0;i<8;i++){
    const ctx2 = document.getElementById('chart'+i).getContext('2d');
    charts2[i] = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: labels2,
        datasets: [
          {
            type: 'bar',
            label: 'Category ' + (i+1),
            data: dataall[3][i],
            backgroundColor: colors2[i],
            barPercentage: 1.0,
            categoryPercentage: 1.0
          },
          {
            type: 'line',
            label: 'Momentum ' + (i+1),
            data: dataall[3][i],
            borderColor: colors2[i].replace('0.6','1'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { stacked: false, ticks: { display: false } },
          y: { beginAtZero: true, max: tot[3], grid: { color: 'rgba(0,0,0,0.1)' } }
        }
      }
    });
  }
}


function toggleChart(index){
  chartOpacity2[index] = !chartOpacity2[index];
  const datasetBar2 = charts2[index].data.datasets[0];
  const datasetLine2 = charts2[index].data.datasets[1];

  if(chartOpacity2[index]){
    datasetBar2.backgroundColor = colors2[index];
    datasetLine2.borderColor = colors2[index].replace('0.6','1');
    document.querySelectorAll('#buttons button')[index].textContent = 'Hide Category ' + (index+1);
  }else{
    datasetBar2.backgroundColor = colors2[index].replace('0.6','0.1');
    datasetLine2.borderColor = colors2[index].replace('0.6','0.1');
    document.querySelectorAll('#buttons button')[index].textContent = 'Show Category ' + (index+1);
  }
  charts2[index].update();
}

//page3

const chatDiv = document.getElementById("chat");

async function fetchResponse() {
  chatDiv.innerHTML += `<div class="message gpt">Fetching response...</div>`;
  chatDiv.scrollTop = chatDiv.scrollHeight;

  try {
    const response = await fetch("/api/chat");
    const data = await response.json();

    if (data.reply) {
      chatDiv.innerHTML += `<div class="message gpt">GPT: ${data.reply}</div>`;
    } else {
      chatDiv.innerHTML += `<div class="message gpt">Error: ${data.error}</div>`;
    }
    chatDiv.scrollTop = chatDiv.scrollHeight;
  } catch (err) {
    chatDiv.innerHTML += `<div class="message gpt">Error: ${err.message}</div>`;
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }
}

function resizeCharts2() {
  const wrapper = document.getElementById('chartWrapper2');
  const canvases = document.querySelectorAll('.chartCanvas2');

  canvases.forEach((canvas, i) => {
    canvas.width = wrapper.clientWidth * 0.6;
    canvas.height = wrapper.clientHeight * 0.6;
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    
    if (charts2[i]) charts2[i].resize();
  });
}

window.addEventListener('load', resizeCharts2);
window.addEventListener('resize', resizeCharts2);