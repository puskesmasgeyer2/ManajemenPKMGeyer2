let currentPageTable = 1;
const rowsPerPage = 15;
let allData = [];
let chartInstance = null;

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

  const bayi = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('BAYI');

  }).length;

  const balita = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('BALITA');

  }).length;

  const remaja = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('REMAJA');

  }).length;

  const dewasa = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('DEWASA');

  }).length;

  const lansia = data.filter(x => {

    const umur =
      String(
        x['Kelompok Umur'] ||
        x['Siklus'] ||
        ''
      ).toUpperCase();

    return umur.includes('LANSIA');

  }).length;

  document.getElementById('totalBayi').innerText = bayi;
  document.getElementById('totalBalita').innerText = balita;
  document.getElementById('totalRemaja').innerText = remaja;
  document.getElementById('totalDewasa').innerText = dewasa;
  document.getElementById('totalLansia').innerText = lansia;

  renderTable(data);

  renderChartUmur(data);
  renderChartTB(data);
  renderChartTensi(data);;

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
  if(currentPage === 'DASHBOARD'){
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

  // FILTER SIKLUS
  if(currentPage !== 'DASHBOARD'){

    data = data.filter(item => {

      const siklus =
        String(item.Siklus || '')
        .trim()
        .toUpperCase();

      return siklus === currentPage;

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

function renderChartUmur(data){

  const bayi = data.filter(x =>
    String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('BAYI')
  ).length;

  const balita = data.filter(x =>
    String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('BALITA')
  ).length;

  const remaja = data.filter(x =>
    String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('REMAJA')
  ).length;

  const dewasa = data.filter(x =>
    String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('DEWASA')
  ).length;

  const lansia = data.filter(x =>
    String(x['Kelompok Umur'] || '')
      .toUpperCase()
      .includes('LANSIA')
  ).length;

  new Chart(document.getElementById('chartUmur'),{
    type:'bar',
    data:{
      labels:[
        'Bayi',
        'Balita',
        'Remaja',
        'Dewasa',
        'Lansia'
      ],
      datasets:[{
        label:'Jumlah',
        data:[
          bayi,
          balita,
          remaja,
          dewasa,
          lansia
        ]
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{
          display:false
        }
      }
    }
  });

}

function renderChartTB(data){

  const suspek = data.filter(x =>
    String(x['Status TB'] || '')
      .toUpperCase()
      .includes('SUSPEK')
  ).length;

  const tidak = data.filter(x =>
    String(x['Status TB'] || '')
      .toUpperCase()
      .includes('TIDAK')
  ).length;

  new Chart(document.getElementById('chartTB'),{
    type:'doughnut',
    data:{
      labels:[
        'Suspek',
        'Tidak Suspek'
      ],
      datasets:[{
        data:[
          suspek,
          tidak
        ]
      }]
    }
  });

}

function renderChartTensi(data){

  const normal = data.filter(x =>
    String(x['Status Tensi'] || '')
      .toUpperCase()
      .includes('NORMAL')
  ).length;

  const pra = data.filter(x =>
    String(x['Status Tensi'] || '')
      .toUpperCase()
      .includes('PRA')
  ).length;

  const hiper = data.filter(x =>
    String(x['Status Tensi'] || '')
      .toUpperCase()
      .includes('HIPERTENSI')
  ).length;

  new Chart(document.getElementById('chartTensi'),{
    type:'pie',
    data:{
      labels:[
        'Normal',
        'Pra Hipertensi',
        'Hipertensi'
      ],
      datasets:[{
        data:[
          normal,
          pra,
          hiper
        ]
      }]
    }
  });

}
