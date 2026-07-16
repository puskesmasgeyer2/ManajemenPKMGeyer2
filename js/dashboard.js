let currentPageTable = 1;
const rowsPerPage = 15;

let currentPageRekap = 1;
const rowsPerPageRekap = 10;

let allData = [];

  // =====================================
  // HITUNG IMT
  // =====================================

  function hitungIMT(bb, tb){

    const berat = parseFloat(bb);
    const tinggi = parseFloat(tb);

    if(!berat || !tinggi) return '';

    const imt =
    berat / Math.pow(tinggi / 100, 2);

    if(imt < 18.5) return 'Kurus';

    if(imt < 25) return 'Normal';

    if(imt < 30) return 'Gemuk';

    return 'Obesitas';

  }

// =====================================
// HITUNG SKOR PUMA
// =====================================

function hitungSkorPUMA(r){

  let skor = 0;

  // =========================
  // UMUR
  // =========================

  const umurBulan =
  parseFloat(r['Umur (Bulan)']) || 0;

  const umurTahun =
  umurBulan / 12;

  if(umurTahun >= 50 && umurTahun <= 59){
  skor += 1;
  }

  else if(umurTahun >= 60){
  skor += 2;
  }

  // =========================
  // MEROKOK
  // =========================

  const rokok =
    String(r['Dewasa_Merokok'] || '')
    .trim();

  if(rokok.includes('20–30')){
    skor += 1;
  }

  else if(
    rokok.includes('> 30')
  ){
    skor += 2;
  }

  // =========================
  // NAPAS PENDEK
  // =========================

  if(
    String(r['Dewasa_Napas'] || '')
    .trim()
    .toUpperCase() === 'YA'
  ){
    skor += 1;
  }

  // =========================
  // DAHAK
  // =========================

  if(
    String(r['Dewasa_Dahak'] || '')
    .trim()
    .toUpperCase() === 'YA'
  ){
    skor += 1;
  }

  // =========================
  // BATUK
  // =========================

  if(
    String(r['Dewasa_Batuk'] || '')
    .trim()
    .toUpperCase() === 'YA'
  ){
    skor += 1;
  }

  // =========================
  // TES TIUP
  // =========================

  if(
    String(r['Dewasa_TesTiup'] || '')
    .trim()
    .toUpperCase() === 'YA'
  ){
    skor += 1;
  }

  return skor;

}

// =====================================
// STATUS PUMA
// =====================================

function statusPUMA(r){

  const skor = hitungSkorPUMA(r);

  if(skor >= 6){
    return 'Tinggi';
  }

  return 'Normal';

}

async function loadData(){

  // CEK CACHE
  const cache =
    localStorage.getItem('posyandu_data');

  if(cache){

    allData = JSON.parse(cache);

    fillFilters(allData);

    return;

  }
  
  // FETCH API
  const token =
    localStorage.getItem('token');

  const res = await fetch(
    `${API_URL}&token=${token}`
  );

  allData = await res.json();
  // TOKEN INVALID
  if(allData.success === false){

  localStorage.clear();

  window.location.href =
  'login.html';

  return;

  }

  // SIMPAN CACHE
  localStorage.setItem(
    'posyandu_data',
    JSON.stringify(allData)
  );

  fillFilters(allData);

}

function renderDashboard(data){

  // ======================
  // HITUNG CARD
  // ======================

  const bayi = data.filter(x => {

    const umur = String(
      x['Kelompok Umur'] ||
      x['Siklus'] ||
      ''
    ).toUpperCase();

    return umur.includes('BAYI');

  }).length;

  const balita = data.filter(x => {

    const umur = String(
      x['Kelompok Umur'] ||
      x['Siklus'] ||
      ''
    ).toUpperCase();

    return umur.includes('BALITA');

  }).length;

  const remaja = data.filter(x => {

    const umur = String(
      x['Kelompok Umur'] ||
      x['Siklus'] ||
      ''
    ).toUpperCase();

    return umur.includes('REMAJA');

  }).length;

  const dewasa = data.filter(x => {

    const umur = String(
      x['Kelompok Umur'] ||
      x['Siklus'] ||
      ''
    ).toUpperCase();

    return umur.includes('DEWASA');

  }).length;

  const lansia = data.filter(x => {

    const umur = String(
      x['Kelompok Umur'] ||
      x['Siklus'] ||
      ''
    ).toUpperCase();

    return umur.includes('LANSIA');

  }).length;

 if(document.getElementById('totalBayi')){
  document.getElementById('totalBayi').innerText = bayi;
}

if(document.getElementById('totalBalita')){
  document.getElementById('totalBalita').innerText = balita;
}

if(document.getElementById('totalRemaja')){
  document.getElementById('totalRemaja').innerText = remaja;
}

if(document.getElementById('totalDewasa')){
  document.getElementById('totalDewasa').innerText = dewasa;
}

if(document.getElementById('totalLansia')){
  document.getElementById('totalLansia').innerText = lansia;
}
  // ======================
  // TABLE
  // ======================

  renderTable(data);

  if(currentPage === 'BALITA'){

  renderRekapBalita(data);
  
  }

  if(
  currentPage === 'DEWASA'
  ||
  currentPage === 'LANSIA'
  ){
    renderRekapDewasa(data);
}
  
  destroyCharts();

  if(currentPage.includes('DASHBOARD')){

    renderChartKehadiran(data);

    renderChartBBU(data);

    renderChartTBU(data);

    renderChartBBTB(data);

    renderChartHB(data);

    renderChartTensi(data);

    renderChartGula(data);

    renderChartAsamUrat(data);

    renderChartTB(data);

  }

}

function getPreviousBB(currentRow){

  const nik =
    String(currentRow.NIK || '').trim();

  if(!nik) return '';

  const bulanUrut = {
    'JANUARI':1,
    'FEBRUARI':2,
    'MARET':3,
    'APRIL':4,
    'MEI':5,
    'JUNI':6,
    'JULI':7,
    'AGUSTUS':8,
    'SEPTEMBER':9,
    'OKTOBER':10,
    'NOVEMBER':11,
    'DESEMBER':12
  };

  const riwayat = allData
    .filter(x =>
      String(x.NIK || '').trim() === nik
    )
    .sort((a,b)=>{

      const tahunA =
        parseInt(a.Tahun || 0);

      const tahunB =
        parseInt(b.Tahun || 0);

      const bulanA =
        bulanUrut[
          String(a.Bulan || '')
          .toUpperCase()
        ] || 0;

      const bulanB =
        bulanUrut[
          String(b.Bulan || '')
          .toUpperCase()
        ] || 0;

      return (
        (tahunA * 100 + bulanA)
        -
        (tahunB * 100 + bulanB)
      );

    });

  const idx =
    riwayat.findIndex(x =>

      String(x.Bulan).trim()
      ===
      String(currentRow.Bulan).trim()

      &&

      String(x.Tahun).trim()
      ===
      String(currentRow.Tahun).trim()

    );

  if(idx <= 0) return '';

  return riwayat[idx - 1].BB || '';

}

// =====================================
// HITUNG DELTA BB
// =====================================

function getDeltaBB(currentRow){

  const bbNow =
    parseFloat(currentRow['BB']) || 0;

  const bbPrev =
    parseFloat(
      getPreviousBB(currentRow)
    ) || 0;

  if(!bbPrev) return '-';

  const delta =
    (bbNow - bbPrev).toFixed(1);

  // =========================
  // NAIK
  // =========================

  if(delta > 0){

    return `
      <span style="
        color:green;
        font-weight:bold;
      ">
        ▲ +${delta}
      </span>
    `;

  }

  // =========================
  // TURUN
  // =========================

  if(delta < 0){

    return `
      <span style="
        color:red;
        font-weight:bold;
      ">
        ▼ ${delta}
      </span>
    `;

  }

  // =========================
  // TETAP
  // =========================

  return `
    <span style="
      color:gray;
      font-weight:bold;
    ">
      0
    </span>
  `;

}

function renderTable(data){

  const tbody =
    document.querySelector('#tableData tbody');

  window.currentTableData = data;

  let html = '';

  const start =
    (currentPageTable - 1) * rowsPerPage;

  const end =
    start + rowsPerPage;

  const paginated =
    data.slice(start, end);

  paginated.forEach(r=>{

  // =========================
// TABEL DEWASA
// =========================

if(
  currentPage === 'DEWASA'
  ||
  currentPage === 'LANSIA'
){

  html += `

  <tr>

    <td>${r.Nama || ''}</td>

    <td>${r.NIK || ''}</td>

    <td>${hitungIMT(r['BB'], r['TB'])}</td>

    <td>${r['LingkarPerut'] || ''}</td>

    <td>${r['Status Tensi'] || ''}</td>

    <td>${r['Status Gula Darah'] || ''}</td>

    <td>${r['Status Asam Urat'] || ''}</td>

    <td>${r['Status Kolesterol'] || ''}</td>

    <td>${hitungSkorPUMA(r)}</td>

    <td>${statusPUMA(r)}</td>

    <td>${r['Status TB'] || ''}</td>

    <td>${r['Edukasi'] || ''}</td>

    <td>${r['Rujuk'] || ''}</td>

  </tr>

  `;

}

// =========================
// TABEL DASHBOARD
// =========================

else if(currentPage.includes('DASHBOARD')){

  html += `

  <tr>

    <td>${r.Nama || ''}</td>

    <td>${r.NIK || ''}</td>

    <td>
    ${
    String(r['Kelompok Umur'] || '')
    .toUpperCase()
    .includes('BAYI')

    ?

    `<span class="badge badge-bayi">
      BAYI
    </span>`

    :

    `<span class="badge badge-balita">
      BALITA
    </span>`
    }
    </td>

    <td>${r['Status Gizi BB/TB'] || ''}</td>

    <td>${r['Status Stunting (TB/U)'] || ''}</td>

    <td>${r['Status TB'] || ''}</td>

    <td>${r['Status Gula Darah'] || ''}</td>

    <td>${r['Status Tensi'] || ''}</td>

  </tr>

  `;

}

// =========================
// TABEL BALITA / REMAJA / LANSIA
// =========================

else{

  html += `

  <tr>

    <td>${r.Nama || ''}</td>

    <td>${r.NoKK || ''}</td>

    <td>${r.NIK || ''}</td>

    <td>${r['Kelompok Umur'] || ''}</td>

    <td>${r['ChecklistPerkembangan'] || ''}</td>

    <td>${getPreviousBB(r) || '-'}</td>
    <td>${r['BB'] || ''}</td>
    <td>${getDeltaBB(r)}</td>
    <td>${r['Status Gizi BB/U'] || ''}</td>

    <td>${r['TB'] || ''} cm</td>
    <td>${r['Status Stunting (TB/U)'] || ''}</td>

    <td>${r['LingkarKepala'] || ''} cm</td>
    <td>${r['Status Lingkar Kepala'] || ''}</td>

    <td>${r['LILA'] || ''} cm</td>
    <td>${r['Status LILA'] || ''}</td>

    <td>${r['Status TB'] || ''}</td>

    <td>${r['ASI'] || ''}</td>

    <td>${r['MPASI'] || ''}</td>

    <td>${r['Imunisasi'] || ''}</td>

    <td>${r['VitaminA'] || ''}</td>

    <td>${r['ObatCacing'] || ''}</td>

    <td>${r['MTPangan'] || ''}</td>

    <td>${r['Edukasi'] || ''}</td>

    <td>${r['GejalaSakit'] || ''}</td>

    <td>${r['Rujuk'] || ''}</td>

  </tr>

  `;

}
});
  tbody.innerHTML = html;

  renderPagination(data.length);

}

function fillFilters(data){

  fillSelect('filterBulan','Bulan',data);
  fillSelect('filterDesa','Desa',data);
  fillSelect('filterPosyandu','Posyandu',data);

}

function fillSelect(id,key,data){

  const select = document.getElementById(id);

  const values = [...new Set(
    data.map(x=>x[key]).filter(Boolean)
  )];

  values.forEach(v=>{

    select.innerHTML += `
      <option value="${v}">${v}</option>
    `;

  });

}

// ===============================
// DETEKSI HALAMAN
// ===============================

const currentPage =
window.location.pathname
.split('/')
.pop()
.replace('.html','')
.toUpperCase();


// ===============================
// MENU AKTIF
// ===============================

document.querySelectorAll('.menu a')
.forEach(link=>{

  const href = link.getAttribute('href')
    .replace('.html','')
    .toUpperCase();

  if(href === currentPage){
    link.classList.add('active-menu');
  }

});


// ===============================
// START DASHBOARD
// ===============================

async function startDashboard(){

  await loadData();

  // =========================
  // DASHBOARD SEMUA DATA
  // =========================

  if(currentPage.includes('DASHBOARD')){

    renderDashboard(allData);

    document.getElementById('loading').style.display = 'none';

    return;

  }

  // =========================
  // FILTER HALAMAN
  // =========================

  let filtered = [...allData];

  if(currentPage === 'BALITA'){

    filtered = allData.filter(item => {

      const umur = String(
        item['Kelompok Umur'] || ''
      ).toUpperCase();

      return umur.includes('BAYI')
      || umur.includes('BALITA');

    });

  }

  else if(currentPage === 'REMAJA'){

    filtered = allData.filter(item => {

      const umur = String(
        item['Kelompok Umur'] || ''
      ).toUpperCase();

      return umur.includes('REMAJA');

    });

  }

  else if(currentPage === 'DEWASA'){

    filtered = allData.filter(item => {

      const umur = String(
        item['Kelompok Umur'] || ''
      ).toUpperCase();

      return umur.includes('DEWASA');

    });

  }

  else if(currentPage === 'LANSIA'){

    filtered = allData.filter(item => {

      const umur = String(
        item['Kelompok Umur'] || ''
      ).toUpperCase();

      return umur.includes('LANSIA');

    });

  }

  renderDashboard(filtered);

  document.getElementById('loading').style.display = 'none';

}

startDashboard();

// AUTO REFRESH CACHE 5 MENIT
setInterval(()=>{

  localStorage.removeItem('posyandu_data');

}, 300000);

// =====================================
// FILTER INTERAKTIF
// =====================================

document
.getElementById('filterBulan')
.addEventListener('change', ()=>applyFilters(true));

document
.getElementById('filterDesa')
.addEventListener('change', ()=>applyFilters(true));

document
.getElementById('filterPosyandu')
.addEventListener('change', ()=>applyFilters(true));

document
.getElementById('searchNama')
.addEventListener('change', ()=>applyFilters(true));


// =====================================
// APPLY FILTER
// =====================================

function applyFilters(resetPage = false){

  if(resetPage){
    currentPageTable = 1;
    currentPageRekap = 1;
  }

  let data = [...allData];

  // ======================
// FILTER HALAMAN
// ======================

if(currentPage === 'BALITA'){

  data = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('BAYI')
    || umur.includes('BALITA');

  });

}

if(currentPage === 'REMAJA'){

  data = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('REMAJA');

  });

}

if(currentPage === 'DEWASA'){

  data = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||''
      ).toUpperCase();

    return umur.includes('DEWASA');

  });

}

if(currentPage === 'LANSIA'){

  data = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||''
      ).toUpperCase();

    return umur.includes('LANSIA');

  });

}

  // FILTER BULAN
  const bulan =
    document.getElementById('filterBulan').value;

  if(bulan){

    data = data.filter(x =>
      String(x.Bulan || '')
      .trim() === bulan
    );

  }

  // FILTER DESA
  const desa =
    document.getElementById('filterDesa').value;

  if(desa){

    data = data.filter(x =>
      String(x.Desa || '')
      .trim() === desa
    );

  }

  // FILTER POSYANDU
  const posyandu =
    document.getElementById('filterPosyandu').value;

  if(posyandu){

    data = data.filter(x =>
      String(x.Posyandu || '')
      .trim() === posyandu
    );

  }

  // SEARCH NAMA
  const search =
    document.getElementById('searchNama')
    .value
    .toLowerCase();

  if(search){

    data = data.filter(x =>
      String(x.Nama || '')
      .toLowerCase()
      .includes(search)
    );

  }

  renderDashboard(data);
  

}

function renderPagination(totalRows){

  const totalPages =
    Math.ceil(totalRows / rowsPerPage);

  document.getElementById('pageInfo')
    .innerText =
    `Halaman ${currentPageTable} dari ${totalPages}`;

  document.getElementById('prevPage')
    .disabled = currentPageTable === 1;

  document.getElementById('nextPage')
    .disabled = currentPageTable === totalPages;

}

document
.getElementById('prevPage')
.addEventListener('click', ()=>{

  if(currentPageTable > 1){

    currentPageTable--;

    applyFilters();

  }

});

document
.getElementById('nextPage')
.addEventListener('click', ()=>{

  const totalPages =
  Math.ceil(allData.length / rowsPerPage);

  if(currentPageTable < totalPages){

  currentPageTable++;

  applyFilters();

}
});

function hideElement(id){

  const el =
  document.getElementById(id);

  if(el){

    el.parentElement.style.display =
    'none';

  }

}

function showElement(id){

  const el =
  document.getElementById(id);

  if(el){

    el.parentElement.style.display =
    'block';

  }

}

let allCharts = [];

function destroyCharts(){

  allCharts.forEach(c => c.destroy());

  allCharts = [];

}

function createChart(id, config){

  const ctx =
    document.getElementById(id);

  if(!ctx) return;

  const chart =
    new Chart(ctx, config);

  allCharts.push(chart);

}

function renderChartKehadiran(data){

  const labels = [
    'Bayi',
    'Balita',
    'Remaja',
    'Dewasa',
    'Lansia'
  ];

  const values = [
    data.filter(x => String(x['Kelompok Umur'] || x['Siklus'] || '').toUpperCase().includes('BAYI')).length,

    data.filter(x => String(x['Kelompok Umur'] || x['Siklus'] || '').toUpperCase().includes('BALITA')).length,

    data.filter(x => String(x['Kelompok Umur'] || x['Siklus'] || '').toUpperCase().includes('REMAJA')).length,

    data.filter(x => String(x['Kelompok Umur'] || x['Siklus'] || '').toUpperCase().includes('DEWASA')).length,

    data.filter(x => String(x['Kelompok Umur'] || x['Siklus'] || '').toUpperCase().includes('LANSIA')).length
  ];

  createChart('chartKehadiran', {
    type:'bar',
    data:{
      labels:labels,
      datasets:[{
        label:'Jumlah',
        data:values
      }]
    }
  });

}

function renderChartBBU(data){

  const balita =
    data.filter(x =>
      String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('BALITA')
    );

  const labels = [
    'Gizi Baik',
    'Gizi Buruk',
    'Gizi Kurang',
    'Resiko Gizi Lebih'
  ];

  const values = labels.map(label =>
    balita.filter(x =>
      String(x['Status Gizi BB/U'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartBBU',{
    type:'pie',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderChartTBU(data){

  const balita =
    data.filter(x =>
      String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('BALITA')
    );

  const labels = [
    'Sangat Pendek',
    'Pendek/Stunting',
    'Normal'
  ];

  const values = labels.map(label =>
    balita.filter(x =>
      String(x['Status Stunting (TB/U)'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartTBU',{
    type:'doughnut',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderChartBBTB(data){

  const balita =
    data.filter(x =>
      String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('BALITA')
    );

  const labels = [
    'Gizi Baik',
    'Gizi Buruk',
    'Gizi Kurang',
    'Resiko Gizi Lebih'
  ];

  const values = labels.map(label =>
    balita.filter(x =>
      String(x['Status Gizi BB/TB'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartBBTB',{
    type:'bar',
    data:{
      labels:labels,
      datasets:[{
        label:'Jumlah',
        data:values
      }]
    }
  });

}

function renderChartHB(data){

  const labels = [
    'Normal',
    'Anemia'
  ];

  const values = labels.map(label =>
    data.filter(x =>
      String(x['Status Hemoglobin'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartHB',{
    type:'pie',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderChartTensi(data){

  const labels = [
    'Normal',
    'Pra Hipertensi',
    'Hipertensi'
  ];

  const values = labels.map(label =>
    data.filter(x =>
      String(x['Status Tensi'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartTensi',{
    type:'doughnut',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderChartGula(data){

  const labels = [
    'Normal',
    'Prediabetes',
    'Diabetes'
  ];

  const values = labels.map(label =>
    data.filter(x =>
      String(x['Status Gula Darah'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartGula',{
    type:'pie',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderChartAsamUrat(data){

  const labels = [
    'Normal',
    'Tinggi'
  ];

  const values = labels.map(label =>
    data.filter(x =>
      String(x['Status Asam Urat'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartAsamUrat',{
    type:'bar',
    data:{
      labels:labels,
      datasets:[{
        label:'Jumlah',
        data:values
      }]
    }
  });

}

function renderChartTB(data){

  const labels = [
    'Suspek TB',
    'Tidak Suspek'
  ];

  const values = labels.map(label =>
    data.filter(x =>
      String(x['Status TB'] || '')
      .trim()
      .toUpperCase() === label.toUpperCase()
    ).length
  );

  createChart('chartTB',{
    type:'doughnut',
    data:{
      labels:labels,
      datasets:[{
        data:values
      }]
    }
  });

}

function renderRekapBalita(data){

  const tbody =
    document.getElementById('rekapBalitaBody');

  if(!tbody) return;

  // =========================
  // GROUP POSYANDU
  // =========================

  const grup = {};

  data.forEach(x => {

    const pos =
      x.Posyandu || 'Tanpa Posyandu';

    if(!grup[pos]){
      grup[pos] = [];
    }

    grup[pos].push(x);

  });

  // =========================
  // PAGINATION
  // =========================

  const keys = Object.keys(grup);

  const start =
    (currentPageRekap - 1)
    * rowsPerPageRekap;

  const end =
    start + rowsPerPageRekap;

  const paginatedKeys =
    keys.slice(start, end);

  let html = '';

  paginatedKeys.forEach(pos => {

    const d = grup[pos];

    // =========================
    // KEHADIRAN
    // =========================

    const bayi =
      d.filter(x =>
        String(x['Kelompok Umur'] || '')
        .toUpperCase()
        .includes('BAYI')
      ).length;

    const balita =
      d.filter(x =>
        String(x['Kelompok Umur'] || '')
        .toUpperCase()
        .includes('BALITA')
      ).length;

    // =========================
    // BB/U
    // =========================

    const bbBaik =
      d.filter(x =>
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('BAIK')
      ).length;

    const bbKurang =
      d.filter(x =>
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('KURANG')
        ||
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('BURUK')
      ).length;

    const bbRisiko =
      d.filter(x =>
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('RISIKO')
      ).length;

    const bbLebih =
      d.filter(x =>
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('LEBIH')
      ).length;

    const bbObesitas =
      d.filter(x =>
        String(x['Status Gizi BB/U'] || '')
        .toUpperCase()
        .includes('OBESITAS')
      ).length;

    // =========================
    // TB/U
    // =========================

    const tbNormal =
      d.filter(x =>
        String(x['Status Stunting (TB/U)'] || '')
        .trim()
        .toUpperCase() === 'NORMAL'
      ).length;

    const tbPendek =
      d.filter(x =>
        String(x['Status Stunting (TB/U)'] || '')
        .trim()
        .toUpperCase() === 'PENDEK (STUNTING)'
      ).length;

    const tbSangatPendek =
      d.filter(x =>
        String(x['Status Stunting (TB/U)'] || '')
        .trim()
        .toUpperCase() === 'SANGAT PENDEK'
      ).length;
    
     // =========================
    // Checklist Perkembangan
    // =========================
    const naik =
      d.filter(x =>
        String(x['ChecklistPerkembangan'] || '')
        .trim()
        .toUpperCase() === 'NAIK'
      ).length;
    
    const tidakNaik =
      d.filter(x => {
      const val = String(x['ChecklistPerkembangan'] || '')
        .trim()
        .toUpperCase();

        return (
        val === 'TIDAK NAIK' ||
        val === 'BAWAH GARIS MERAH' ||
        val === 'BAWAH GARIS ORANYE'
        );
      }).length;

    const totalPerkembangan =
      naik + tidakNaik;

    // =========================
    // LINGKAR KEPALA
    // =========================
    const lkNormal =
      d.filter(x =>
        String(x['Status Lingkar Kepala'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const lkMicro =
      d.filter(x =>
        String(x['Status Lingkar Kepala'] || '')
        .toUpperCase()
        .includes('MIKRO')
      ).length;

    const lkMacro =
      d.filter(x =>
        String(x['Status Lingkar Kepala'] || '')
        .toUpperCase()
        .includes('MAKRO')
      ).length;

    // =========================
    // LILA
    // =========================
    const lilaNormal =
      d.filter(x =>
        String(x['Status LILA'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const lilaSAM =
      d.filter(x =>
        String(x['Status LILA'] || '')
        .toUpperCase()
        .includes('SAM')
      ).length;

    const lilaMAM =
      d.filter(x =>
        String(x['Status LILA'] || '')
        .toUpperCase()
        .includes('MAM')
       ).length;

    // =========================
    // PROGRAM BALITA
    // =========================
    const asi =
      d.filter(x =>
        String(x['ASI'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const mpasi =
      d.filter(x =>
        String(x['MPASI'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const imunisasi =
      d.filter(x =>
        String(x['Imunisasi'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const vitamin =
      d.filter(x =>
        String(x['VitaminA'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const obatCacing =
      d.filter(x =>
        String(x['ObatCacing'] || '')
        .toUpperCase() === 'YA'
      ).length;
    
    const mtLokal =
      d.filter(x =>
        String(x['MTPangan'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const edukasi =
      d.filter(x =>
        String(x['Edukasi'] || '')
        .toUpperCase() === 'YA'
      ).length;

    // =========================
    // SUSPEK TB
    // =========================
    const tbSuspek =
       d.filter(x =>
        String(x['Status TB'] || '')
        .trim()
        .toUpperCase() === 'SUSPEK TB'
      ).length;

    // =========================
    // SAKIT DAN RUJUK
    // =========================
    const sakit =
      d.filter(x =>
        String(x['GejalaSakit'] || '')
        .toUpperCase() === 'YA'
      ).length;

    const rujuk =
      d.filter(x =>
        String(x['Rujuk'] || '')
        .toUpperCase() === 'PUSKESMAS'
      ).length;

    html += `
    <tr>

      <td>${pos}</td>

      <td>${bayi}</td>
      <td>${balita}</td>

      <td>${naik}</td>
      <td>${tidakNaik}</td>
      <td>${totalPerkembangan}</td>

      <td>${bbBaik}</td>
      <td>${bbKurang}</td>
      <td>${bbRisiko}</td>
      <td>${bbLebih}</td>
      <td>${bbObesitas}</td>

      <td>${tbNormal}</td>
      <td>${tbPendek}</td>
      <td>${tbSangatPendek}</td>

      <td>${lkNormal}</td>
      <td>${lkMicro}</td>
      <td>${lkMacro}</td>

      <td>${lilaNormal}</td>
      <td>${lilaSAM}</td>
      <td>${lilaMAM}</td>

      <td>${tbSuspek}</td>

      <td>${asi}</td>
      <td>${mpasi}</td>
      <td>${imunisasi}</td>
      <td>${vitamin}</td>
      <td>${obatCacing}</td>
      <td>${mtLokal}</td>
      <td>${edukasi}</td>

      <td>${sakit}</td>
      <td>${rujuk}</td>

    </tr>
    `;

  });

  tbody.innerHTML = html;
  if(html === ''){

  tbody.innerHTML = `
    <tr>
      <td colspan="30" style="text-align:center;">
        Tidak ada data
      </td>
    </tr>
  `;

  }

  renderPaginationRekap(keys.length);

}

function renderRekapDewasa(data){

  const tbody =
    document.getElementById('rekapDewasaBody');

  if(!tbody) return;

  const grup = {};

  data.forEach(x=>{

    const pos =
      x.Posyandu || 'Tanpa Posyandu';

    if(!grup[pos]){
      grup[pos] = [];
    }

    grup[pos].push(x);

  });

  let html = '';

  Object.keys(grup).forEach(pos=>{

    const d = grup[pos];

    // ======================
    // IMT
    // ======================

    const kurus =
    d.filter(x =>
    hitungIMT(x['BB'], x['TB'])
    === 'Kurus'
    ).length;

    const normal =
    d.filter(x =>
    hitungIMT(x['BB'], x['TB'])
    === 'Normal'
    ).length;

    const gemuk =
    d.filter(x =>
    hitungIMT(x['BB'], x['TB'])
    === 'Gemuk'
    ).length;

    const obesitas =
    d.filter(x =>
    hitungIMT(x['BB'], x['TB'])
    === 'Obesitas'
    ).length;

    // ======================
    // LINGKAR PERUT
    // ======================

    const lpLaki =
      d.filter(x => {

        const lp =
          parseFloat(x['LingkarPerut']) || 0;

        return (
          String(x['JenisKelamin'])
          .includes('Laki')
          && lp > 90
        );

      }).length;

    const lpPerempuan =
      d.filter(x => {

        const lp =
          parseFloat(x['LingkarPerut']) || 0;

        return (
          String(x['JenisKelamin'])
          .includes('Perempuan')
          && lp > 80
        );

      }).length;

    // ======================
    // TENSI
    // ======================

    const tensiNormal =
      d.filter(x =>
        String(x['Status Tensi'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const praHT =
      d.filter(x =>
        String(x['Status Tensi'] || '')
        .includes('Pra')
      ).length;

    const ht1 =
      d.filter(x =>
        String(x['Status Tensi'] || '')
        .includes('Hipertensi 1')
      ).length;

    const ht2 =
      d.filter(x =>
        String(x['Status Tensi'] || '')
        .includes('Hipertensi 2')
      ).length;

    // ======================
    // GULA
    // ======================

    const gulaNormal =
      d.filter(x =>
        String(x['Status Gula Darah'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const prediabetes =
      d.filter(x =>
        String(x['Status Gula Darah'] || '')
        .includes('Prediabetes')
      ).length;

    const diabetes =
      d.filter(x =>
        String(x['Status Gula Darah'] || '')
        .includes('Diabetes')
      ).length;

    // ======================
    // ASAM URAT
    // ======================

    const asamNormal =
      d.filter(x =>
        String(x['Status Asam Urat'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const asamTinggi =
      d.filter(x =>
        String(x['Status Asam Urat'] || '')
        .includes('Tinggi')
      ).length;

    // ======================
    // KOLESTEROL
    // ======================

    const kolNormal =
      d.filter(x =>
        String(x['Status Kolesterol'] || '')
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const kolTinggi =
      d.filter(x =>
        String(x['Status Kolesterol'] || '')
        .includes('Tinggi')
      ).length;

    // ======================
    // PUMA
    // ======================

    const pumaNormal =
    d.filter(x =>
    statusPUMA(x) === 'Normal'
    ).length;

    const pumaTinggi =
    d.filter(x =>
    statusPUMA(x) === 'Tinggi'
    ).length;

    // ======================
    // STATUS TB
    // ======================

    const tbSuspek =
      d.filter(x =>
        String(x['Status TB'] || '')
        .trim()
        .toUpperCase() === 'SUSPEK TB'
      ).length;

    const tbTidak =
      d.filter(x =>
        String(x['Status TB'] || '')
        .trim()
        .toUpperCase() === 'TIDAK SUSPEK'
      ).length;

    // ======================
    // EDUKASI
    // ======================

    const edukasi =
      d.filter(x =>
        String(x['Edukasi'] || '')
        === 'Ya'
      ).length;

    // ======================
    // RUJUK
    // ======================

    const rujuk =
      d.filter(x =>
        String(x['Rujuk'] || '')
        .includes('Puskesmas')
      ).length;

    html += `

    <tr>

    <td>${pos}</td>

    <td>${kurus}</td>
    <td>${normal}</td>
    <td>${gemuk}</td>
    <td>${obesitas}</td>

    <td>${lpLaki}</td>
    <td>${lpPerempuan}</td>

    <td>${tensiNormal}</td>
    <td>${praHT}</td>
    <td>${ht1}</td>
    <td>${ht2}</td>

    <td>${gulaNormal}</td>
    <td>${prediabetes}</td>
    <td>${diabetes}</td>

    <td>${asamNormal}</td>
    <td>${asamTinggi}</td>

    <td>${kolNormal}</td>
    <td>${kolTinggi}</td>

    <td>${pumaNormal}</td>
    <td>${pumaTinggi}</td>

    <td>${tbSuspek}</td>
    <td>${tbTidak}</td>

    <td>${edukasi}</td>

    <td>${rujuk}</td>

    </tr>

    `;

  });

  tbody.innerHTML = html;

}

function renderPaginationRekap(totalRows){

  const totalPages =
    Math.ceil(
      totalRows / rowsPerPageRekap
    );

  const info =
    document.getElementById('pageInfoRekap');

  if(info){

    info.innerText =
      `Halaman ${currentPageRekap} dari ${totalPages}`;

  }

}

const prevRekap =
document.getElementById('prevPageRekap');

if(prevRekap){

  prevRekap.addEventListener('click', ()=>{

    if(currentPageRekap > 1){

      currentPageRekap--;

      applyFilters();

    }

  });

}

const nextRekap =
document.getElementById('nextPageRekap');

if(nextRekap){

  nextRekap.addEventListener('click', ()=>{

    currentPageRekap++;

    applyFilters();

  });

}

function exportBalitaExcel(){

    const data = window.currentTableData || [];

    let html = `
    <table border="1">

    <tr>
        <th>Nama</th>
        <th>No KK</th>
        <th>NIK</th>
        <th>Kelompok</th>
        <th>Checklist</th>
        <th>BB Sebelumnya</th>
        <th>BB Sekarang</th>
        <th>Delta BB</th>
        <th>Status BB/U</th>
        <th>TB (cm)</th>
        <th>Status TB/U</th>
        <th>LK (cm)</th>
        <th>Status LK</th>
        <th>LILA</th>
        <th>Status LILA</th>
        <th>Status TB</th>
        <th>ASI</th>
        <th>MPASI</th>
        <th>Imunisasi</th>
        <th>Vitamin A</th>
        <th>Obat Cacing</th>
        <th>MT Lokal</th>
        <th>Edukasi</th>
        <th>Gejala Sakit</th>
        <th>Rujuk</th>
    </tr>
    `;

    data.forEach(r=>{

        const bbSebelumnya = getPreviousBB(r) || '-';

        const bbSekarang = r['BB'] || '';

        const delta =
            (parseFloat(bbSekarang||0)-parseFloat(bbSebelumnya||0));

        html += `
        <tr>

        <td>${r.Nama||''}</td>

        <td>${r.NoKK||''}</td>

        <td>${r.NIK||''}</td>

        <td>${r['Kelompok Umur']||''}</td>

        <td>${r['ChecklistPerkembangan']||''}</td>

        <td>${bbSebelumnya}</td>

        <td>${bbSekarang}</td>

        <td>${isNaN(delta)?'-':delta.toFixed(1)}</td>

        <td>${r['Status Gizi BB/U']||''}</td>

        <td>${r['TB']||''}</td>

        <td>${r['Status Stunting (TB/U)']||''}</td>

        <td>${r['LingkarKepala']||''}</td>

        <td>${r['Status Lingkar Kepala']||''}</td>

        <td>${r['LILA']||''}</td>

        <td>${r['Status LILA']||''}</td>

        <td>${r['Status TB']||''}</td>

        <td>${r['ASI']||''}</td>

        <td>${r['MPASI']||''}</td>

        <td>${r['Imunisasi']||''}</td>

        <td>${r['VitaminA']||''}</td>

        <td>${r['ObatCacing']||''}</td>

        <td>${r['MTPangan']||''}</td>

        <td>${r['Edukasi']||''}</td>

        <td>${r['GejalaSakit']||''}</td>

        <td>${r['Rujuk']||''}</td>

        </tr>
        `;

    });

    html += "</table>";

    const blob = new Blob(
        [html],
        {
            type:'application/vnd.ms-excel'
        }
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement('a');

    const bulan =
    document.getElementById('filterBulan').value || 'Semua';

    const desa =
    document.getElementById('filterDesa').value || 'Semua';

    const pos =
    document.getElementById('filterPosyandu').value || 'Semua';

    a.href = url;

    a.download =
    `Balita_${bulan}_${desa}_${pos}.xls`;

    a.click();

    URL.revokeObjectURL(url);

}

const btnExport =
document.getElementById('btnExportExcel');

if(btnExport){

    btnExport.addEventListener(
        'click',
        exportBalitaExcel
    );

}
