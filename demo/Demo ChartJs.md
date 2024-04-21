# FIXME
- Export to PDF not working properly, plots in the PDF are too big and don't fit page width.
- Zooming in on the page with "Ctrl +" affects plot renderings and animations.
- "Analyze with AI" not working yet.

## ChartJs: Basic Plot
### Tips
- Hover for data information tooltip

```chart-js

const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};


const config = {
  type: 'pie',
  data: data,
};

new Chart(graphContainer, config);

```


## Live Update Table Data
### Tips
- Edit the table tagged as #sales and the plot will update automatically
- Hover for data information tooltip
```chart-js

const title = "Number of Products vs Sales";

const salesTable = await utils.tableData("#sales", true);

const sales = salesTable.map((tr) => ({
    x: tr["Number of Products"],
    y: tr["Sales"],
    r: tr["Percentage of Market Share"],
}));

  const data = {
    datasets: [
      {
        label: "Percentage of Market Share",
        data: sales,
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const config = {
    type: "bubble",
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Number of Products" },
        },
        y: {
          title: { display: true, text: "Sales (USD)" },
        },
      },
    },
  };

const chart =  new Chart(graphContainer, config);

async function updateChart () {
	const tableData = await utils.tableData("#sales", true);
	
	const newData = tableData.map((tr) => ({
				x: tr["Number of Products"],
				y: tr["Sales"],
				r: tr["Percentage of Market Share"],
			}));

	chart.data.datasets[0].data = newData;
	chart.update();
}

// Update chart periodically with new table data
setInterval(updateChart, 5000);
```


| #sales | Number of Products | Sales | Percentage of Market Share |
| ------ | ------------------ | ----- | -------------------------- |
|        | 50                 | 5500  | 3                          |
|        | 14                 | 12200 | 12                         |
|        | 20                 | 60000 | 33                         |
|        | 18                 | 24400 | 10                         |
|        | 22                 | 32000 | 42                         |


## ChartJs:  CSV File Data
### Tips
- Hover for data information tooltip

```chart-js
// debugger;
const csvFileData = await utils.fileData("demo/data/seattle-weather.csv").csv();

const title = "Seattle Temperatures";
const labels = csvFileData.map((dr) => dr.date);
const tempMax = csvFileData.map((dr) => dr.temp_max);
const tempMin = csvFileData.map((dr) => dr.temp_min);

const data = {
    labels: labels,
    datasets: [
        {
            label: "Temp. Max.",
            data: tempMax,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
        },
        {
            label: "Temp. Min.",
            data: tempMin,
            fill: false,
            borderColor: "rgb(192, 75, 192)",
            tension: 0.1,
        },
    ],
};

const config = {
    type: "line",
    data: data,
    options: {
        plugins: {
            title: { display: true, text: title },
        },
        scales: {
            x: {
                title: { display: true, text: "Date" },
            },
            y: {
                title: { display: true, text: "Temp (ºC)" },
            },
        },
    },
};


(async () => new Chart(graphContainer, config))();
```

