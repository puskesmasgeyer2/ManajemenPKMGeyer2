let currentPageTable = 1;
const rowsPerPage = 15;

let currentPageRekap = 1;
const rowsPerPageRekap = 10;

let allData = [];

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
  const res = await fetch(API_URL);

  allData = await res.json();

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

function renderTable(data){

  const tbody =
    document.querySelector('#tableData tbody');

  let html = '';

  const start =
    (currentPageTable - 1) * rowsPerPage;

  const end =
    start + rowsPerPage;

  const paginated =
    data.slice(start, end);

  paginated.forEach(r=>{

    html += `
      <tr>
        <td>${r.Nama || ''}</td>
        <td>${r.NIK || ''}</td>
        <td>${r['Kelompok Umur'] || ''}</td>
        <td>${r['Status Gizi BB/TB'] || ''}</td>
        <td>${r['Status Stunting (TB/U)'] || ''}</td>
        <td>${r['Status TB'] || ''}</td>
        <td>${r['Status Gula Darah'] || ''}</td>
        <td>${r['Status Tensi'] || ''}</td>
      </tr>
    `;

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

  // DASHBOARD SEMUA DATA
  if(currentPage.includes('DASHBOARD')){
    renderDashboard(allData);
    document.getElementById('loading').style.display = 'none';
    return;
  }

  // FILTER PER SIKLUS
  const filtered = allData.filter(item =>
    item.Siklus &&
    item.Siklus.toUpperCase() === currentPage
  );

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
.addEventListener('change', applyFilters);

document
.getElementById('filterDesa')
.addEventListener('change', applyFilters);

document
.getElementById('filterPosyandu')
.addEventListener('change', applyFilters);

document
.getElementById('searchNama')
.addEventListener('input', applyFilters);


// =====================================
// APPLY FILTER
// =====================================

function applyFilters(){
  
  currentPageTable = 1;

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
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('DEWASA');

  });

}

if(currentPage === 'LANSIA'){

  data = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
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

  currentPageTable++;

  applyFilters();

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
        .toUpperCase()
        .includes('NORMAL')
      ).length;

    const tbPendek =
      d.filter(x =>
        String(x['Status Stunting (TB/U)'] || '')
        .toUpperCase()
        .includes('PENDEK')
      ).length;

    const tbTinggi =
      d.filter(x =>
        String(x['Status Stunting (TB/U)'] || '')
        .toUpperCase()
        .includes('TINGGI')
      ).length;
    
     // =========================
    // Checklist Perkembangan
    // =========================
    const naik =
      d.filter(x =>
        String(x['ChecklistPerkemBB'] || '')
        .trim()
        .toUpperCase() === 'NAIK'
      ).length;
    
    const tidakNaik =
      d.filter(x => {
      const val = String(x['ChecklistPerkemBB'] || '')
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

      <td>${bbBaik}</td>
      <td>${bbKurang}</td>
      <td>${bbRisiko}</td>
      <td>${bbLebih}</td>
      <td>${bbObesitas}</td>

      <td>${tbNormal}</td>
      <td>${tbPendek}</td>
      <td>${tbTinggi}</td>

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
