let allData = [];

async function loadData(){

  const res = await fetch(API_URL);

  allData = await res.json();

  fillFilters(allData);

}

function renderDashboard(data){

  document.getElementById('totalData').innerText = data.length;

  const tb = data.filter(x =>
    x['Status TB'] === 'Suspek TB'
  ).length;

  document.getElementById('totalTB').innerText = tb;

  const stunting = data.filter(x =>
    x['Status Stunting (TB/U)'] === 'Pendek'
  ).length;

  document.getElementById('totalStunting').innerText = stunting;

  const hipertensi = data.filter(x =>
    x['Status Tensi'] === 'Hipertensi'
  ).length;

  document.getElementById('totalHipertensi').innerText = hipertensi;

  renderTable(data);

  renderChart(data);

}

function renderTable(data){

  const tbody = document.querySelector('#tableData tbody');

  tbody.innerHTML = '';

  data.slice(0,15).forEach(r=>{

    tbody.innerHTML += `
      <tr>
        <td>${r.Nama || ''}</td>
        <td>${r.NIK || ''}</td>
        <td>${r.Desa || ''}</td>
        <td>${r.Posyandu || ''}</td>
        <td>${r.Siklus || ''}</td>
        <td>${r['Status TB'] || ''}</td>
        <td>${r['Status Tensi'] || ''}</td>
      </tr>
    `;

  });

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

function renderChart(data){

  const counts = {};

  data.forEach(r=>{

    const s = r.Siklus || 'Lainnya';

    counts[s] = (counts[s] || 0) + 1;

  });

  new Chart(
    document.getElementById('chartSiklus'),
    {
      type:'bar',
      data:{
        labels:Object.keys(counts),
        datasets:[{
          label:'Jumlah',
          data:Object.values(counts)
        }]
      }
    }
  );

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
    return;
  }

  // FILTER PER SIKLUS
  const filtered = allData.filter(item =>
    item.Siklus &&
    item.Siklus.toUpperCase() === currentPage
  );

  renderDashboard(filtered);

}

startDashboard();

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
