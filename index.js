// Variabel global untuk menyimpan data
let cachedData = null;
// Variabel untuk menyimpan data yang akan dipakai untuk visualisasi dan filter
let filteredData = null;

const itemsPerPage = 10; // Jumlah item per halaman
let currentPage = 1; // Halaman yang sedang ditampilkan
let totalPages = 0; // Jumlah total halaman
let tableView = null;
// Fungsi untuk mengambil data
async function fetchData() {
  const response = await fetch(
    "https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json"
  );
  return await response.json();
}

// Event listener untuk memuat data saat halaman dimuat
window.onload = async function () {
  move();
  cachedData = await fetchData();

  populateBoroughDropdown(cachedData); // Isi dropdown borough
  populateDateDropdown(cachedData); // Isi dropdown bulan, tahun pada date
  populateYearDropdown(cachedData); // Isi dropdown tahun
  
  filterData(); // Panggil filterData di sini agar filteredData diinisialisasi

  // Tambahkan event listener ke tombol filter
  const filterButton = document.getElementById("filter-button");
  filterButton.addEventListener("click", async function(event) {
    filterData(); // Panggil filterData saat tombol filter diklik

  });
};

// Fungsi untuk mengisi dropdown borough
function populateBoroughDropdown(data) {
  const boroughOrder = [
    "Manhattan",
    "Brooklyn",
    "Queens",
    "Bronx",
    "Staten Island",
  ];
  const uniqueBoroughs = Array.from(
    new Set(data.map((item) => item.BOROUGH_NAME))
  ).sort((a, b) => boroughOrder.indexOf(a) - boroughOrder.indexOf(b));

  const dropdownBorough = document.getElementById("dropdown-borough");
  dropdownBorough.innerHTML = ""; // Kosongkan konten sebelumnya

  uniqueBoroughs.forEach((borough) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "borough"; // Tambahkan name untuk checkbox
    checkbox.value = borough; // Tambahkan value untuk checkbox
    checkbox.id = `borough-${borough}`; // Tambahkan ID unik untuk checkbox
    checkbox.checked = true; // Setel checkbox aktif secara default
    label.htmlFor = `borough-${borough}`; // Hubungkan label dengan checkbox berdasarkan ID
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(borough));
    dropdownBorough.appendChild(label);
  });

  // Tambahkan event listener untuk mencegah menutup dropdown saat mengklik di dalamnya
  dropdownBorough.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}

// Fungsi untuk mengisi dropdown bulan, tahun pada date
function populateDateDropdown() {
  const startDate = new Date("2016-09-01");
  const endDate = new Date("2017-08-31");

  const dropdownDate = document.getElementById("dropdown-date");
  dropdownDate.innerHTML = ""; // Kosongkan konten sebelumnya

  const months = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const month = currentDate.toLocaleString("default", { month: "short" });
    const year = currentDate.getFullYear();
    months.push(`${month} ${year}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  months.forEach((monthYear) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "date"; // Tambahkan name untuk checkbox
    checkbox.value = monthYear; // Tambahkan value untuk checkbox
    checkbox.id = `date-${monthYear}`;
    checkbox.checked = true; // Setel checkbox aktif secara default
    label.htmlFor = `date-${monthYear}`;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(monthYear));
    dropdownDate.appendChild(label);
  });

  // Tambahkan event listener untuk mencegah menutup dropdown saat mengklik di dalamnya
  dropdownDate.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}

// Fungsi untuk mengisi dropdown tahun
function populateYearDropdown(data) {
  const years = new Set();

  data.forEach((item) => {
    const date = new Date(item.SALE_DATE);
    const year = date.getFullYear();
    if (!isNaN(year)) {
      // Periksa apakah tahun adalah valid number
      years.add(year);
    }
  });

  const dropdownYear = document.getElementById("dropdown-year");
  dropdownYear.innerHTML = ""; // Kosongkan konten sebelumnya

  years.forEach((year) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "year"; // Tambahkan name untuk checkbox
    checkbox.value = year; // Tambahkan value untuk checkbox
    checkbox.id = `year-${year}`; // Tambahkan ID unik untuk checkbox
    checkbox.checked = true; // Setel checkbox aktif secara default
    label.htmlFor = `year-${year}`; // Hubungkan label dengan checkbox berdasarkan ID
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(year));
    dropdownYear.appendChild(label);
  });

  // Tambahkan event listener untuk mencegah menutup dropdown saat mengklik di dalamnya
  dropdownYear.addEventListener("click", function (event) {
    event.stopPropagation();
  });
}

// Fungsi untuk memfilter data berdasarkan checkbox borough, date, dan year
function filterData() {
  // Ambil nilai yang dipilih dari checkbox borough
  const selectedBoroughs = Array.from(
    document.querySelectorAll('input[name="borough"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox date
  const selectedDates = Array.from(
    document.querySelectorAll('input[name="date"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox year
  const selectedYears = Array.from(
    document.querySelectorAll('input[name="year"]:checked')
  ).map((cb) => cb.value);

  // Filter data berdasarkan checkbox yang dicentang
  filteredData = cachedData.filter((item) => {
    const dateSplited = item.SALE_DATE.split('/');
    const day = dateSplited[0];
    const month = dateSplited[1];
    const year = dateSplited[2];

    const saleDate = new Date(`${year}-${month}-${day}`);
    const saleMonthYear = saleDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const saleYear = saleDate.getFullYear().toString();
    const filterCondition = (
      (selectedBoroughs.length !== 0 || selectedBoroughs.includes(item.BOROUGH_NAME)) &&
      (selectedDates.length !== 0 || selectedDates.includes(saleMonthYear)) &&
      (selectedYears.length !== 0 || selectedYears.includes(saleYear))
    );
    return filterCondition;
  });

  // Panggil fungsi visualize untuk memperbarui visualisasi
  visualize(filteredData); // Perbaiki pemanggilan dengan mengirimkan filteredData
  // Update table with filtered data
  createTable(filteredData);

}

// Fungsi untuk memperbarui visualisasi berdasarkan data yang difilter
function visualize(data) {
  // Memanggil updateTotals() untuk memperbarui total setelah pemfilteran data
  updateTotals(data); // Perbaiki pemanggilan dengan mengirimkan data
  // Panggil fungsi untuk memperbarui line chart dan bar chart
  fetchLineSalesTrendbyBoroughandSalePrice(data);
  renderYearofTotalResidentialUnitsAndCommercialUnitsbyBorough(data);

  // Persiapkan dan render bar chart kedua
  renderResidentialUnitsandCommercialUnits(data);
  // Panggil fungsi createTable untuk memperbarui tabel
  createTable(data);
}

function createTable(data) {
  if (tableView) {
    // Hapus instance DataTable yang sudah ada sebelum membuat yang baru
    tableView.destroy();
  }

  // Ambil nilai yang dipilih dari checkbox borough
  const selectedBoroughs = Array.from(
    document.querySelectorAll('input[name="borough"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox date
  const selectedDates = Array.from(
    document.querySelectorAll('input[name="date"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox year
  const selectedYears = Array.from(
    document.querySelectorAll('input[name="year"]:checked')
  ).map((cb) => cb.value);

  // Filter data berdasarkan filter yang dipilih
  const filteredData = data.filter((item) => {
    const dateSplited = item.SALE_DATE.split('/');
    const day = dateSplited[0];
    const month = dateSplited[1];
    const year = dateSplited[2];

    const saleDate = new Date(`${year}-${month}-${day}`);
    const saleMonthYear = saleDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const saleYear = saleDate.getFullYear().toString();

    return (
      (selectedBoroughs.length === 0 || selectedBoroughs.includes(item.BOROUGH_NAME)) &&
      (selectedDates.length === 0 || selectedDates.includes(saleMonthYear)) &&
      (selectedYears.length === 0 || selectedYears.includes(saleYear))
    );
  });

  const dataSet = filteredData.map(d => {
    const fields = Object.keys(d);
    return fields.map(field => d[field]);
  });

  tableView = new DataTable('#tableData', {
    columns: [
    { title: 'BOROUGH_NAME' },
    { title: 'NEIGHBORHOOD' },
    { title: 'BUILDING_CLASS_CATEGORY' },
    { title: 'LOT.' },
    { title: 'RESIDENTIAL_UNITS' },
    { title: 'COMMERCIAL_UNITS' },
    { title: 'TOTAL_UNITS.' },
    { title: 'GROSS_SQUARE_FEET' },
    { title: 'YEAR_BUILT' },
    { title: 'SALE_PRICE' },
    { title: 'SALE_DATE' }
    ],
    data: dataSet,
    responsive: true,
    autoWidth: false,
    scrollX: true,
  });
}


// Fungsi untuk memperbarui total
async function updateTotals(data) {
  // Ambil nilai yang dipilih dari checkbox borough
  const selectedBoroughs = Array.from(
    document.querySelectorAll('input[name="borough"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox date
  const selectedDates = Array.from(
    document.querySelectorAll('input[name="date"]:checked')
  ).map((cb) => cb.value);
  // Ambil nilai yang dipilih dari checkbox year
  const selectedYears = Array.from(
    document.querySelectorAll('input[name="year"]:checked')
  ).map((cb) => cb.value);

  // Filter data sesuai dengan filter yang dipilih
  const filteredData = data.filter((item) => {
    const dateSplited = item.SALE_DATE.split('/');
    const day = dateSplited[0];
    const month = dateSplited[1];
    const year = dateSplited[2];

    const saleDate = new Date(`${year}-${month}-${day}`);
    const saleMonthYear = saleDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const saleYear = saleDate.getFullYear().toString();

    return (
      (selectedBoroughs.length === 0 || selectedBoroughs.includes(item.BOROUGH_NAME)) &&
      (selectedDates.length === 0 || selectedDates.includes(saleMonthYear)) &&
      (selectedYears.length === 0 || selectedYears.includes(saleYear))
    );
  });

  // Total keseluruhan untuk kolom TOTAL_UNITS setelah difilter
  const totalUnits = filteredData.reduce(
    (acc, property) => acc + parseFloat(property.TOTAL_UNITS),
    0
  );

  // Buat Set untuk menyimpan nilai unik dari kolom BOROUGH_NAME setelah difilter
  const uniqueBoroughs = new Set(filteredData.map((property) => property.BOROUGH_NAME));

  // Hitung total untuk setiap kolom hanya untuk nilai unik di kolom BOROUGH_NAME setelah difilter
  const totalBorough = uniqueBoroughs.size;

  // Hitung total untuk kolom SALE_PRICE setelah difilter
  const totalSalePrice =
    filteredData.reduce((acc, property) => acc + parseFloat(property.SALE_PRICE), 0) /
    1000000000; // Ubah ke milyar

  // Hitung total untuk kolom LOT setelah difilter
  const totalLot =
    filteredData.reduce((acc, property) => acc + parseFloat(property.LOT), 0) / 1000000; // Ubah ke juta

  // Format total sale price menjadi format yang diinginkan (misal: 89,3M)
  const formattedTotalSalePrice =
    (Math.round(totalSalePrice * 10) / 10)
      .toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
      .replace(".", ",") + "M";

  // Format total lot menjadi format yang diinginkan (misal: 31,8 jt)
  const formattedTotalLot =
    (Math.round(totalLot * 10) / 10)
      .toLocaleString("id-ID", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })
      .replace(".", ",") + " jt";
  // Format total units menjadi format yang diinginkan dengan pemisah ribuan
  const formattedTotalUnits = totalUnits.toLocaleString("id-ID");

  // Perbarui nilai elemen HTML
  document.querySelector(".col-total-borough h1").textContent = totalBorough;
  document.querySelector(".col-total-sale-price h1").textContent = formattedTotalSalePrice;
  document.querySelector(".col-total-lot h1").textContent = formattedTotalLot;
  document.querySelector(".col-total-units h1").textContent = formattedTotalUnits;
}


async function fetchLineSalesTrendbyBoroughandSalePrice(data) {
  try {
    const boroughColors = {
      Manhattan: 'gray',
      Bronx: 'navy',
      Queens: 'powder blue',
      "Staten Island": 'teal',
      Brooklyn: 'purple'
    };

    // Ambil nilai yang dipilih dari checkbox borough
    const selectedBoroughs = Array.from(
      document.querySelectorAll('input[name="borough"]:checked')
    ).map((cb) => cb.value);
    // Ambil nilai yang dipilih dari checkbox date
    const selectedDates = Array.from(
      document.querySelectorAll('input[name="date"]:checked')
    ).map((cb) => cb.value);
    // Ambil nilai yang dipilih dari checkbox year
    const selectedYears = Array.from(
      document.querySelectorAll('input[name="year"]:checked')
    ).map((cb) => cb.value);

    // Filter data sesuai dengan filter yang dipilih
    const filteredData = data.filter((entry) => {
      const saleDate = new Date(entry["SALE_DATE"]);
      const month = saleDate.toLocaleString("default", { month: "short" });
      const year = saleDate.getFullYear().toString();
      const label = `${month} ${year}`;

      return (
        (selectedBoroughs.length === 0 || selectedBoroughs.includes(entry["BOROUGH_NAME"])) &&
        (selectedDates.length === 0 || selectedDates.includes(label)) &&
        (selectedYears.length === 0 || selectedYears.includes(year))
      );
    });

    // Ekstrak bulan, tahun, dan harga penjualan dari data yang sudah difilter
    const salesData = {};
    filteredData.forEach((entry) => {
      const saleDate = new Date(entry["SALE_DATE"]);
      const salePrice = parseFloat(entry["SALE_PRICE"]);
      const borough = entry["BOROUGH_NAME"];

      const month = saleDate.toLocaleString("default", { month: "short" });
      const year = saleDate.getFullYear();
      const label = `${month} ${year}`;

      if (!salesData[borough]) {
        salesData[borough] = {};
      }

      if (!salesData[borough][label]) {
        salesData[borough][label] = 0;
      }

      salesData[borough][label] += salePrice;
    });

    // Menyiapkan data untuk chart
    const labelsSet = new Set();
    const datasets = [];

    Object.keys(salesData).forEach((borough) => {
      Object.keys(salesData[borough]).forEach((label) => {
        labelsSet.add(label);
      });
    });

    const labels = Array.from(labelsSet).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      return (
        new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`)
      );
    });

    Object.keys(salesData).forEach((borough) => {
      const dataLabels = labels.map((label) => salesData[borough][label] || 0);

      datasets.push({
        label: borough,
        data: dataLabels,
        fill: false,
        borderColor: boroughColors[borough],
        tension: 0.1,
        hidden: !selectedBoroughs.includes(borough) // Sembunyikan dataset jika filter borough tidak dipilih
      });
    });

    const dataForChart = {
      labels: labels,
      datasets: datasets,
    };

    const config = {
      type: "line",
      data: dataForChart,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Month, Year",
            },
          },
          y: {
            title: {
              display: true,
              text: "Sale Price",
            },
          },
        },
      },
    };

    // Hapus chart lama jika ada
    const chartContainer = document.getElementById("myChart");
    if (chartContainer.chart) {
      chartContainer.chart.destroy();
    }

    // Buat chart baru
    chartContainer.chart = new Chart(chartContainer, config);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}


//barchart
// Fungsi untuk mengumpulkan dan memproses data untuk grafik batang
function fetchYearofTotalResidentialUnitsAndCommercialUnitsbyBorough(data) {
  try {
    const boroughColors = {
      Manhattan: 'gray',
      Bronx: 'navy',
      Queens: 'powder blue',
      "Staten Island": 'teal',
      Brooklyn: 'purple'
    };

    // Ambil nilai yang dipilih dari checkbox borough
    const selectedBoroughs = Array.from(
      document.querySelectorAll('input[name="borough"]:checked')
    ).map((cb) => cb.value);
    // Ambil nilai yang dipilih dari checkbox date
    const selectedDates = Array.from(
      document.querySelectorAll('input[name="date"]:checked')
    ).map((cb) => cb.value);
    // Ambil nilai yang dipilih dari checkbox year
    const selectedYears = Array.from(
      document.querySelectorAll('input[name="year"]:checked')
    ).map((cb) => cb.value);

    // Filter data sesuai dengan filter yang dipilih
    const filteredData = data.filter((entry) => {
      const year = new Date(entry["SALE_DATE"]).getFullYear().toString();
      const borough = entry["BOROUGH_NAME"] || entry["BOROUGH"];
      const saleDate = new Date(entry["SALE_DATE"]);
      const month = saleDate.toLocaleString("default", { month: "short" });
      const label = `${month} ${year}`;

      return (
        (selectedBoroughs.length === 0 || selectedBoroughs.includes(borough)) &&
        (selectedDates.length === 0 || selectedDates.includes(label)) &&
        (selectedYears.length === 0 || selectedYears.includes(year))
      );
    });

    // Mengelompokkan data berdasarkan tahun dan borough
    const groupedData = {};
    filteredData.forEach((entry) => {
      const year = new Date(entry["SALE_DATE"]).getFullYear().toString();
      const borough = entry["BOROUGH_NAME"] || entry["BOROUGH"];

      if (!groupedData[year]) {
        groupedData[year] = {};
      }

      if (!groupedData[year][borough]) {
        groupedData[year][borough] = {
          totalUnits: 0,
        };
      }

      const residentialUnits = parseFloat(entry["RESIDENTIAL_UNITS"]) || 0;
      const commercialUnits = parseFloat(entry["COMMERCIAL_UNITS"]) || 0;

      if (!isNaN(residentialUnits) && !isNaN(commercialUnits)) {
        groupedData[year][borough].totalUnits +=
          residentialUnits + commercialUnits;
      }
    });

    // Mengumpulkan tahun-tahun yang valid (tanpa NaN)
    const years = Object.keys(groupedData).filter(
      (year) => !isNaN(parseInt(year))
    );

    // Mengumpulkan boroughs yang unik sesuai dengan filter yang dipilih
    const selectedBoroughsSet = new Set(selectedBoroughs);
    const boroughs = new Set();
    years.forEach((year) => {
      Object.keys(groupedData[year]).forEach((borough) => {
        if (selectedBoroughsSet.size === 0 || selectedBoroughsSet.has(borough)) {
          boroughs.add(borough);
        }
      });
    });

    // Mengatur data untuk dataset chart
    const datasets = Array.from(boroughs).map((borough) => {
      const yearData = years.map(
        (year) => groupedData[year][borough]?.totalUnits || 0
      ); // Menggunakan optional chaining untuk menghindari kesalahan jika data tidak ada
      return {
        label: borough,
        data: yearData,
        backgroundColor: boroughColors[borough], // Menggunakan warna sesuai borough
        borderColor: boroughColors[borough],
        borderWidth: 1,
      };
    });

    return {
      labels: years,
      datasets: datasets,
    };
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

// Fungsi untuk merender grafik batang
async function renderYearofTotalResidentialUnitsAndCommercialUnitsbyBorough(data) {
  try {
    const chartData = fetchYearofTotalResidentialUnitsAndCommercialUnitsbyBorough(data);
    const config = {
      type: "bar",
      data: chartData,
      options: {
        indexAxis: "y", // Mengatur orientasi grafik menjadi horizontal
        scales: {
          x: {
            title: {
              display: true,
              text: "Total Units",
            },
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString();
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Year",
            },
          },
        },
      },
    };

    // Hapus chart lama jika ada
    const chartContainer = document.getElementById("barChart");
    if (chartContainer.chart) {
      chartContainer.chart.destroy();
    }

    // Buat chart baru
    chartContainer.chart = new Chart(chartContainer, config);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

//barchart2

function ResidentialUnitsandCommercialUnits (data) {
  const selectedBoroughs = Array.from(
    document.querySelectorAll('input[name="borough"]:checked')
  ).map((cb) => cb.value);
  const selectedDates = Array.from(
    document.querySelectorAll('input[name="date"]:checked')
  ).map((cb) => cb.value);
  const selectedYears = Array.from(
    document.querySelectorAll('input[name="year"]:checked')
  ).map((cb) => cb.value);

  const filteredData = data.filter((entry) => {
    const saleDate = new Date(entry["SALE_DATE"]);
    const month = saleDate.toLocaleString("default", { month: "short" });
    const year = saleDate.getFullYear().toString();
    const label = `${month} ${year}`;
    const borough = entry["BOROUGH_NAME"] || entry["BOROUGH"];

    return (
      (selectedBoroughs.length === 0 || selectedBoroughs.includes(borough)) &&
      (selectedDates.length === 0 || selectedDates.includes(label)) &&
      (selectedYears.length === 0 || selectedYears.includes(year))
    );
  });

  const barLabelsSet = new Set();
  const residentialUnits = {};
  const commercialUnits = {};

  filteredData.forEach((entry) => {
    const saleDate = new Date(entry["SALE_DATE"]);
    const month = saleDate.toLocaleString("default", { month: "short" });
    const year = saleDate.getFullYear().toString();
    const label = `${month} ${year}`;

    barLabelsSet.add(label);

    if (!residentialUnits[label]) {
      residentialUnits[label] = 0;
    }
    if (!commercialUnits[label]) {
      commercialUnits[label] = 0;
    }

    residentialUnits[label] += parseFloat(entry["RESIDENTIAL_UNITS"]) || 0;
    commercialUnits[label] += parseFloat(entry["COMMERCIAL_UNITS"]) || 0;
  });

  const barLabels = Array.from(barLabelsSet).sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
  });

  const residentialData = barLabels.map((label) => residentialUnits[label] || 0);
  const commercialData = barLabels.map((label) => commercialUnits[label] || 0);

  const barDatasets = [
    {
      label: "Total COMMERCIAL_UNITS",
      data: commercialData,
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgb(54, 162, 235)",
      borderWidth: 1,
    },
    {
      label: "Total RESIDENTIAL_UNITS",
      data: residentialData,
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgb(255, 99, 132)",
      borderWidth: 1,
    },
  ];

  return { barLabels, barDatasets };
}

function renderResidentialUnitsandCommercialUnits(data) {
  const { barLabels, barDatasets } = ResidentialUnitsandCommercialUnits(data);
  const barCtx = document.getElementById("barChart2").getContext("2d");
  if (barCtx.chart) {
    barCtx.chart.destroy(); // Hancurkan grafik sebelumnya jika ada
  }
  barCtx.chart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels: barLabels,
      datasets: barDatasets,
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Month, Year",
          },
        },
        y: {
          title: {
            display: true,
            text: "Total Units",
          },
          beginAtZero: true,
        },
      },
    },
  });
}

//animasi progress
let i = 0;
function move() {
  if (i === 0) {
    i = 1;
    const elem = document.getElementById("myBar");
    let width = 0;
    const id = setInterval(frame, 40); // Kecepatan animasi

    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
        showContent();
      } else {
        width++;
        elem.style.width = width + "%";
        elem.innerHTML = width + "%";
        document.querySelector(".loading-percent").innerText = `${width}%`;
      }
    }
  }
}

function showContent() {
  document.querySelector(".loading-container").style.display = "none";
  document.querySelector(".content").style.display = "block";
}


