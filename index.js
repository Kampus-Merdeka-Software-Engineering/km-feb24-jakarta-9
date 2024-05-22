// Variabel global untuk menyimpan data
let cachedData = null;
// Variabel untuk menyimpan data yang akan dipakai untuk visualisasi dan filter
let filteredData = null;

// Fungsi untuk mengambil data
async function fetchDataIfNeeded() {
  if (cachedData === null) {
    const response = await fetch(
      "https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json"
    );
    cachedData = await response.json();
    // Set filteredData sama dengan cachedData saat pertama kali diambil
    filteredData = cachedData;
  }
  return cachedData;
}

// Fungsi untuk memfilter data berdasarkan checkbox borough, date, dan year
async function filterData() {
  // Ambil nilai yang dipilih dari checkbox borough
  const selectedBoroughs = [];
  const boroughCheckboxes = document.querySelectorAll(
    'input[name="borough"]:checked'
  );
  boroughCheckboxes.forEach((checkbox) => {
    selectedBoroughs.push(checkbox.value);
  });

  // Ambil nilai yang dipilih dari checkbox date
  const selectedDates = [];
  const dateCheckboxes = document.querySelectorAll(
    'input[name="date"]:checked'
  );
  dateCheckboxes.forEach((checkbox) => {
    selectedDates.push(checkbox.value);
  });

  // Ambil nilai yang dipilih dari checkbox year
  const selectedYears = [];
  const yearCheckboxes = document.querySelectorAll(
    'input[name="year"]:checked'
  );
  yearCheckboxes.forEach((checkbox) => {
    selectedYears.push(checkbox.value);
  });

  // Lakukan filtering berdasarkan nilai-nilai tersebut
  filteredData = cachedData.filter((item) => {
    const saleDate = new Date(item.SALE_DATE);
    const saleMonthYear = saleDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    return (
      (selectedBoroughs.length === 0 ||
        selectedBoroughs.includes(item.BOROUGH_NAME)) &&
      (selectedDates.length === 0 || selectedDates.includes(saleMonthYear)) &&
      (selectedYears.length === 0 ||
        selectedYears.includes(saleDate.getFullYear().toString()))
    );
  });

  // Panggil fungsi updateTotals setelah filtering
  updateTotals(filteredData);

  // Di sini Anda dapat memanggil fungsi lain untuk menampilkan data yang sudah difilter dalam bentuk visualisasi
  // Misalnya: drawChart();
  fetchLineChartData(filteredData);
  fetchBarChartData(filteredData);

  return filteredData;
}

// Tambahkan event listener pada tombol filter
document.getElementById("filterButton").addEventListener("click", async () => {
  await filterData();
  await renderBarChart(filteredData);
});

async function updateTotals() {
  // Ambil data dari filteredData
  const data = filteredData;

  // Total keseluruhan untuk kolom TOTAL_UNITS
  const totalUnits = data.reduce(
    (acc, property) => acc + parseFloat(property.TOTAL_UNITS),
    0
  );

  // Buat Set untuk menyimpan nilai unik dari kolom BOROUGH_NAME
  const uniqueBoroughs = new Set(data.map((property) => property.BOROUGH_NAME));

  // Hitung total untuk setiap kolom hanya untuk nilai unik di kolom BOROUGH_NAME
  const totalBorough = uniqueBoroughs.size;
  const totalSalePrice =
    Array.from(uniqueBoroughs).reduce((acc, borough) => {
      const total = data
        .filter((property) => property.BOROUGH_NAME === borough)
        .reduce((sum, property) => sum + parseFloat(property.SALE_PRICE), 0);
      return acc + total;
    }, 0) / 1000000000; // Ubah ke juta

  // Hitung total dari seluruh nilai dalam kolom LOT
  const totalLot =
    data.reduce((acc, property) => acc + parseFloat(property.LOT), 0) / 1000000; // Ubah ke juta

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

  // Perbarui nilai elemen HTML
  document.querySelector(".col-total-borough h1").textContent = totalBorough;
  document.querySelector(".col-total-sale-price h1").textContent =
    formattedTotalSalePrice;
  document.querySelector(".col-total-lot h1").textContent = formattedTotalLot;
  document.querySelector(".col-total-units h1").textContent = totalUnits;
}

// Panggil fungsi untuk memperbarui total setelah halaman dimuat
document.addEventListener("DOMContentLoaded", async () => {
  await fetchDataIfNeeded(); // Mengambil data mentah pertama kali
  await updateTotals(); // Memanggilnya tanpa argumen akan menggunakan data mentah
});

// Fungsi untuk mengisi dropdown borough
async function populateBoroughDropdown() {
  const data = await fetchDataIfNeeded();
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
async function populateDateDropdown() {
  const data = await fetchDataIfNeeded();
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
async function populateYearDropdown() {
  const data = await fetchDataIfNeeded();
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

// Panggil fungsi untuk mengisi dropdown setelah halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  populateBoroughDropdown();
  populateDateDropdown();
  populateYearDropdown();
});
//  line chart
// Fungsi untuk mengambil data dan memperbarui chart berdasarkan filter
async function fetchLineChartData(filteredData = null) {
  try {
    // Jika filteredData tidak null, gunakan data yang sudah difilter
    // Jika null, ambil data mentah menggunakan fetchDataIfNeeded()
    const data = filteredData || (await fetchDataIfNeeded());

    // Ekstrak bulan, tahun, dan harga penjualan dari data
    const salesData = {};
    const startDate = new Date("2016-09-01");
    const endDate = new Date("2017-08-31");

    data.forEach((entry) => {
      const saleDate = new Date(entry["SALE_DATE"]);
      const salePrice = parseFloat(entry["SALE_PRICE"]);

      if (!isNaN(salePrice) && saleDate >= startDate && saleDate <= endDate) {
        const month = saleDate.toLocaleString("default", { month: "long" });
        const year = saleDate.getFullYear();
        const borough = entry["BOROUGH_NAME"];

        const label = `${month}, ${year}`;

        if (!salesData[borough]) {
          salesData[borough] = {};
        }

        if (!salesData[borough][label]) {
          salesData[borough][label] = 0;
        }

        salesData[borough][label] += salePrice; // Menambahkan harga penjualan ke label yang sesuai
      }
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
      const [monthA, yearA] = a.split(", ");
      const [monthB, yearB] = b.split(", ");
      return (
        new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`)
      );
    });

    Object.keys(salesData).forEach((borough) => {
      const data = labels.map((label) => salesData[borough][label] || 0);

      datasets.push({
        label: borough,
        data: data,
        fill: false,
        borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)})`,
        tension: 0.1,
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
async function fetchBarChartData(filteredData = null) {
  try {
    // Ambil data yang sudah difilter atau data mentah jika tidak ada filter
    const data = filteredData || (await fetchDataIfNeeded());

    // Mengelompokkan data berdasarkan tahun dari SALE_DATE dan BOROUGH_NAME
    const groupedData = {};
    data.forEach((entry) => {
      const year = new Date(entry["SALE_DATE"]).getFullYear();
      const borough = entry["BOROUGH_NAME"] || entry["BOROUGH"];

      if (!groupedData[year]) {
        groupedData[year] = {};
      }

      if (!groupedData[year][borough]) {
        groupedData[year][borough] = {
          totalUnits: 0,
        };
      }

      // Menambahkan total dari kedua kolom RESIDENTIAL_UNITS dan COMMERCIAL_UNITS
      const residentialUnits = parseFloat(entry["RESIDENTIAL_UNITS"]) || 0;
      const commercialUnits = parseFloat(entry["COMMERCIAL_UNITS"]) || 0;

      // Hanya menambahkan jika nilai tidak NaN
      if (!isNaN(residentialUnits) && !isNaN(commercialUnits)) {
        groupedData[year][borough].totalUnits +=
          residentialUnits + commercialUnits;
      }
    });

    // Mengumpulkan tahun-tahun yang valid (tanpa NaN)
    const years = Object.keys(groupedData).filter(
      (year) => !isNaN(parseInt(year))
    );

    // Mengumpulkan boroughs yang unik
    const boroughs = new Set();
    years.forEach((year) => {
      Object.keys(groupedData[year]).forEach((borough) => {
        boroughs.add(borough);
      });
    });

    // Mengatur data untuk dataset chart
    const datasets = Array.from(boroughs).map((borough) => {
      const data = years.map(
        (year) => groupedData[year][borough]?.totalUnits || 0
      ); // Menggunakan optional chaining untuk menghindari kesalahan jika data tidak ada
      const backgroundColor = `rgba(${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, 0.2)`;
      const borderColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)})`;
      return {
        label: borough,
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
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

async function renderBarChart(filteredData = null) {
  try {
    const barData = await fetchBarChartData(filteredData);

    const config = {
      type: "bar",
      data: barData,
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

// barchart2
async function fetchNYCPropertyData() {
  try {
    const data = await fetchDataIfNeeded(); // Menggunakan fungsi fetchDataIfNeeded() yang sudah ada
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const data = await fetchNYCPropertyData();
  if (data) {
    const barData = prepareBarData(data);
    const lineData = prepareLineData(data);

    renderChart(barData, lineData);
  }
});

function prepareBarData(data) {
  const barLabels = [
    "September 2016",
    "October 2016",
    "November 2016",
    "December 2016",
    "January 2017",
    "February 2017",
    "March 2017",
    "April 2017",
    "May 2017",
    "June 2017",
    "July 2017",
    "August 2017",
  ];
  const residentialUnits = Array(12).fill(0);
  const commercialUnits = Array(12).fill(0);

  data.forEach((entry) => {
    const monthIndex = new Date(entry.SALE_DATE).getMonth();
    residentialUnits[monthIndex] += entry.RESIDENTIAL_UNITS;
    commercialUnits[monthIndex] += entry.COMMERCIAL_UNITS;
  });

  return {
    labels: barLabels,
    datasets: [
      {
        label: "Total COMMERCIAL_UNITS", // Menukar label
        data: commercialUnits, // Menukar data
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
      {
        label: "Total RESIDENTIAL_UNITS", // Menukar label
        data: residentialUnits, // Menukar data
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
    ],
  };
}

function prepareLineData(data) {
  const lineData = [];
  data.forEach((entry) => {
    const saleDate = new Date(entry.SALE_DATE);
    const monthYear = saleDate.toLocaleString("en-us", {
      month: "long",
      year: "numeric",
    });
    lineData.push({
      y: monthYear,
      x: entry.RESIDENTIAL_UNITS + entry.COMMERCIAL_UNITS,
    });
  });
  return lineData;
}

function renderChart(barData, lineData) {
  const ctx = document.getElementById("barChart2").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: barData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const lineCtx = document.getElementById("lineChart").getContext("2d");
  new Chart(lineCtx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Month/Year vs Total Units",
          data: lineData,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Total Units",
          },
        },
        y: {
          type: "category",
          position: "left",
          title: {
            display: true,
            text: "Month/Year",
          },
        },
      },
    },
  });
}
// data tabel
// data tabel
document.addEventListener("DOMContentLoaded", async function () {
  const itemsPerPage = 10; // Jumlah item per halaman
  let currentPage = 1; // Halaman yang sedang ditampilkan
  let totalPages = 0; // Jumlah total halaman
  let data = null; // Variabel untuk menyimpan data tabel

  // Fungsi untuk mengambil data dari URL
  async function fetchTableData() {
    try {
      const jsonData = await fetchDataIfNeeded(); // Menggunakan fungsi fetchDataIfNeeded() yang sudah ada
      console.log("Data from URL:", jsonData); // Tambahkan log untuk memeriksa data
      return jsonData;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  // Fungsi untuk membuat tabel dan menambahkan data
  function createTable(data) {
    const tableContainer = document.getElementById("table-container");
    const dataTable = document.getElementById("data-table");
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length); // Batasi maksimal endIndex agar tidak melebihi panjang data
    const currentData = data.slice(startIndex, endIndex);

    // Kosongkan tabel sebelum menambahkan data baru
    dataTable.innerHTML = "";

    // Membuat header tabel
    const headerRow = document.createElement("tr");
    const headers = ["Borough", "Building Class Category", "Year Built"]; // Kolom yang diinginkan

    headers.forEach(function (headerText) {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    dataTable.appendChild(headerRow);

    // Membuat body tabel
    currentData.forEach(function (item) {
      const row = document.createElement("tr");

      // Kolom yang diambil dari data
      const columns = ["BOROUGH_NAME", "BUILDING_CLASS_CATEGORY", "YEAR_BUILT"];

      columns.forEach(function (columnKey) {
        const cell = document.createElement("td");
        cell.textContent = item[columnKey];
        row.appendChild(cell);
      });

      dataTable.appendChild(row);
    });

    // Menambahkan tabel ke dalam container
    tableContainer.appendChild(dataTable);
  }

  // Menghitung total halaman
  function calculateTotalPages() {
    totalPages = Math.ceil(data.length / itemsPerPage);
  }

  // Memuat data dari URL dan membuat tabel saat halaman dimuat
  data = await fetchTableData();
  if (data) {
    calculateTotalPages();
    createTable(data);
    createPaginationButtons();
  }

  // Event listener untuk tombol halaman sebelumnya
  document.getElementById("prev-page").addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      createTable(data);
      updateActivePageButton();
    }
  });

  // Event listener untuk tombol halaman selanjutnya
  document.getElementById("next-page").addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      createTable(data);
      updateActivePageButton();
    }
  });
  // Membuat tombol halaman
  function createPaginationButtons() {
    const pageNumbers = document.getElementById("page-numbers");
    pageNumbers.innerHTML = ""; // Kosongkan daftar tombol sebelum menambahkan tombol baru

    // Tombol "previous"
    const prevButton = document.createElement("li");
    prevButton.classList.add("page-item");
    const prevLink = document.createElement("a");
    prevLink.classList.add("page-link");
    prevLink.href = "javascript:void(0)";
    prevLink.innerHTML = "&laquo;"; // Tanda panah kiri
    prevButton.appendChild(prevLink);
    pageNumbers.appendChild(prevButton);

    // Tombol angka halaman
    let startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
    let endPage = Math.min(startPage + 9, totalPages);
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.classList.add("page-item");
      const a = document.createElement("a");
      a.classList.add("page-link");
      a.dataset.page = i;
      a.textContent = i;
      a.href = "javascript:void(0)";
      a.addEventListener("click", function () {
        currentPage = i;
        createTable(data);
        updateActivePageButton();
      });
      li.appendChild(a);
      pageNumbers.appendChild(li);
    }

    // Tombol "next"
    const nextButton = document.createElement("li");
    nextButton.classList.add("page-item");
    const nextLink = document.createElement("a");
    nextLink.classList.add("page-link");
    nextLink.href = "javascript:void(0)";
    nextLink.innerHTML = "&raquo;"; // Tanda panah kanan
    nextButton.appendChild(nextLink);
    pageNumbers.appendChild(nextButton);

    // Event listener untuk tombol "previous"
    prevLink.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        if (currentPage % 10 === 0) {
          createPaginationButtons();
        } else {
          createTable(data);
          updateActivePageButton();
        }
      }
    });

    // Event listener untuk tombol "next"
    nextLink.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        if (currentPage > endPage) {
          createPaginationButtons();
        } else {
          createTable(data);
          updateActivePageButton();
        }
      }
    });

    updateActivePageButton();
  }

  // Fungsi untuk memperbarui tombol halaman yang aktif
  function updateActivePageButton() {
    const pageButtons = document.querySelectorAll("#page-numbers .page-item");
    pageButtons.forEach((button) => {
      const pageNumber = parseInt(
        button.querySelector(".page-link").dataset.page,
        10
      );
      if (pageNumber === currentPage) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }
});
