# FIXME
- Export to PDF not working properly, plots are missing from the PDF
- Zooming in on the page with "Ctrl +" affects plot renderings and animations.
- Weather data 
## Basic Plot
### Tips
- Rendering is set to "canvas" by default, change by setting the "renderer" option to "svg" to save on computing resources.
- Setting width and height is also mandatory
- Example:
 ```javascript
 
 const myChart = echarts.init(graphContainer, null, {
	renderer: "canvas", // or "svg"
	width: "700px",
	height: "700px",
});
```


```echarts-js
// debugger
const myChart = echarts.init(graphContainer, null, {
	renderer: "svg",
	width: "700px",
	height: "700px",
});

const option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line'
    }
  ]
};

myChart.setOption(option);
```


## JSON Data + Animation


```echarts-js
// debugger
const myChart = echarts.init(graphContainer, null, {
	renderer: "svg",
	width: "700px",
	height: "700px",
});

const data = await utils.fileData("demo/data/echarts-package-size.json").json();

const treemapOption = {
     series: [
        {
          type: 'treemap',
          id: 'echarts-package-size',
          animationDurationUpdate: 1000,
          roam: false,
          nodeClick: undefined,
          data: data.children,
          universalTransition: true,
          label: {
            show: true
          },
          breadcrumb: {
            show: false
          }
        }
      ]
    };
    
    const sunburstOption = {
      series: [
        {
          type: 'sunburst',
          id: 'echarts-package-size',
          radius: ['20%', '90%'],
          animationDurationUpdate: 1000,
          nodeClick: undefined,
          data: data.children,
          universalTransition: true,
          itemStyle: {
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,.5)'
          },
          label: {
            show: false
          }
        }
      ]
    };
    
    let currentOption = treemapOption;
    
    myChart.setOption(currentOption);

	function switchOption() { 
      currentOption = (currentOption === treemapOption) 
	      ? sunburstOption 
	      : treemapOption;
	      
	    myChart.setOption(currentOption);
    }

    setInterval(switchOption, 3000);

```

## Table Data + Live Update

### Tips
- Change #sales-table data and the plot will update automatically
```echarts-js
const myChart = echarts.init(graphContainer);

async function updateChart() {
  const salesData = await utils.tableData("#sales-table", true);

  const companyCol = salesData.map((tr) => tr["Company"]);
  const salesCol = salesData.map((tr) => tr["Sales"]);
  const nopsCol = salesData.map((tr) => tr["Number of Products"]);
  const msCol = salesData.map((tr) => tr["Percentage of Market Share"]);

  const data = companyCol.map((c, idx) => ({
    name: c,
    value: [salesCol[idx], nopsCol[idx], msCol[idx]],
  }));

  const option = {
    title: {
      text: "Sales",
    },
    legend: {
      data: companyCol,
    },
    radar: {
      // shape: 'circle',
      axisTick: {
        show: true,
      },
      axisLabel: {
        show: true,
        showMaxLabel: true,
      },
      indicator: [
        { name: "Sales", max: Math.max(...salesCol) },
        { name: "Number of Products", max: Math.max(...nopsCol) },
        { name: "Percentage of Market Share", max: Math.max(...msCol) },
      ],
    },
    series: [
      {
        name: "Sales Table",
        type: "radar",
        data: data,
      },
    ],
  };

  myChart.setOption(option);
}

// First table data plot
updateChart();

// Check every 5 secs if table data changed
setInterval(updateChart, 5000);
```


| #sales-table | Company      | Number of Products | Sales | Percentage of Market Share |
| ------------ | ------------ | ------------------ | ----- | -------------------------- |
|              | Foo Inc.     | 5                  | 5500  | 3                          |
|              | Bar Ltd.     | 14                 | 12200 | 12                         |
|              | Baz & Co.    | 20                 | 60000 | 33                         |
|              | Qux Holdings | 18                 | 24400 | 10                         |
|              | Grok & Sons  | 22                 | 32000 | 42                         |


## Public Data + REST Endpoint + Live Update
### Tips
- Press on "Analyze with AI" button and after a few seconds, an AI-generated plot analysis text will appear under the plot. 
- You will need an OpenAI account with access to gpt-4-turbo and configure an API key in Grafika Settings for this to work!

```echarts-js
// debugger
const place = "London"
const wttrUrl = `https://wttr.in/${place}?2&format=j1`;

const colors = ["#add8e6", "#91CC75", "#EE6666"];

const myChart = echarts.init(graphContainer, null, {
  renderer: "canvas",
  width: "700px",
  height: "700px",
});

const baseOption = {
  color: colors,
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  },
  grid: {
    right: "20%",
  },
  toolbox: {
    left: "left",
    feature: {
      dataView: { show: true, readOnly: true },
      restore: { show: true },
      saveAsImage: { show: true },
    },
  },
  legend: {
    data: ["Temperature", "Relative Humidity"],
  },
  xAxis: {
    type: "time",
    data: [],
  },

  yAxis: [
    {
      type: "value",
      name: "Temperature",
      position: "left",
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[2],
        },
      },
      axisLabel: {
        formatter: "{value} °C",
      },
    },
    {
      type: "value",
      name: "Relative Humidity",
      max: 100,
      min: 0,
      position: "right",
      alignTicks: true,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors[0],
        },
      },
      axisLabel: {
        formatter: (value) => Math.floor(value) + " %",
      },
    },
  ],
  series: [
    {
      name: "Temperature",
      data: [],
      type: "line",
      lineStyle: {
        color: colors[2],
      },
      itemStyle: {
        color: colors[2],
      },
    },
    {
      name: "Relative Humidity",
      data: [],
      type: "bar",
      itemStyle: {
        color: colors[0],
      },
      yAxisIndex: 1,
    },
  ],
};

myChart.setOption(baseOption);

async function updateData() {
  const fetchData = await fetch(wttrUrl, {
    headers: {
      accept: "application/json; charset=utf8;",
    },
    cache: "no-cache",
  });

  const data = await fetchData.json();

  const weatherData = data.weather
    .flatMap(({ date, hourly }) =>
      hourly.map(({ time, tempC, humidity }) => ({
        date,
        time,
        tempC,
        humidity,
      }))
    )
    .map(({ date, time, tempC, humidity }) => {
      const hhmm = v.chain(time).padLeft(4, "0").insert(":", 2).value();
      const dateTime = `${date}T${hhmm}`;
      console.log(dateTime);
      const temperature = parseFloat(tempC);
      const rel_humidity = parseFloat(humidity);

      return { dateTime, temperature, rel_humidity };
    });

  const dateTimes = weatherData.map(({ dateTime }) => dateTime);
  const temperatures = weatherData.map(({ dateTime, temperature }) => [dateTime, temperature]);
  const humidities = weatherData.map(({ dateTime, rel_humidity }) => [dateTime, rel_humidity]);

  const option = {
    xAxis: {
      data: dateTimes,
    },
    series: [
      {
        name: "Temperature",
        data: temperatures,
      },
      {
        name: "Relative Humidity",
        data: humidities,
      },
    ],
  };

  myChart.setOption(option);
}

// First render
updateData();

// Periodic renders, set to 1 min to avoid overloading open-meteo
setInterval(updateData, 60000);

```


## Globe 3D
### Tips
- These are the near real-time temperatures for the 500 most populated places in the world.
- If there is no data, e. g. Open Meteo returns a "Too Many Requests" (HTTP 429 error), the temperature bars will be missing until Open Meteo starts returning data again.

```echarts-js
const openMeteoUrlTempl =
  "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&hourly=temperature_2m&start_hour=%s&end_hour=%s";

const units = "°C"

const baseHeighTexture = await utils.assetUrl(
  "demo/data-gl/asset/world.topo.bathy.200401.jpg"
);

const environment = await utils.assetUrl("demo/data-gl/asset/starfield.jpg");

const bluesPalette = [
  "rgb(51,51,204)",
  "rgb(102,102,153)",
  "rgb(153,153,102)",
  "rgb(204,204,51)",
  "rgb(255,255,0)",
];

const redsPalette = [
  "rgb(255,204,0)",
  "rgb(255,153,0)",
  "rgb(255,102,0)",
  "rgb(255,51,0)",
  "rgb(255,0,0)",
];

const rangesPalette = bluesPalette.concat(redsPalette);

const pieces = [
  { min: -100, max: -20, color: rangesPalette[0] },
  { min: -20, max: -15, color: rangesPalette[1] },
  { min: -15, max: -10, color: rangesPalette[2] },
  { min: -10, max: 0, color: rangesPalette[3] },
  { value: 0, color: rangesPalette[4], label: "0" },
  { min: 0, max: 5, color: rangesPalette[5] },
  { min: 5, max: 10, color: rangesPalette[6] },
  { min: 10, max: 20, color: rangesPalette[7] },
  { min: 20, max: 30, color: rangesPalette[8] },
  { min: 30, color: rangesPalette[9] },
];

const baseOption = {
  backgroundColor: "#000",
  globe: {
    baseTexture: baseHeighTexture,
    heightTexture: baseHeighTexture,
    shading: "lambert",
    environment: environment,
    light: {
      main: {
        intensity: 2,
      },
    },
    viewControl: {
      autoRotate: true,
    },
  },
  visualMap: {
    type: "piecewise",
    splitNumber: 1,
    pieces: pieces,
    inRange: {
      color: rangesPalette,
    },
    textStyle: {
      color: "#fff",
    },
    controller: {
      inRange: {
        color: rangesPalette,
      },
    },
    outOfRange: {
      colorAlpha: 0,
    },
  },
  series: [
    {
      name: "Temperature",
      type: "bar3D",
      coordinateSystem: "globe",
      data: [],
      label: {
        show: true,
        formatter: function (d) {
          return `${d.data[2]} ${units}`;
        },
      },
      barSize: 0.25,
      minHeight: 5,
      maxHeight: 10,
      silent: true,
    },
  ],
};

const populationData = await utils.fileData("demo/data/population.json").json();

const mostPopulated = _.chain(populationData)
  .sortBy((d) => -d[2])
  .take(500)
  .values();

const coords = mostPopulated.map((pd) => [pd[0], pd[1]]);

const longitudes = coords.map((c) => c[0] + "").join(",");
const latitudes = coords.map((c) => c[1] + "").join(",");

async function updatePlot() {
  const now = moment().utc().format("YYYY-MM-DDThh:mm");

  const openMeteoUrl = v.sprintf(
    openMeteoUrlTempl,
    latitudes,
    longitudes,
    now,
    now
  );

  const fetchData = await fetch(openMeteoUrl, {
    headers: {
      accept: "application/json; charset=utf8;",
    },
    cache: "no-cache",
  });

  const weatherData = await fetchData.json();
  const units = weatherData[0].hourly_units.temperature_2m;

  const data = weatherData.map((w) => [
    w.longitude,
    w.latitude,
    w.hourly.temperature_2m[0],
  ]);

  // Added as a workaround, to avoid the minimum temperature
  // to have a 3D bar with height = 0
  data.push([0.01, 0.01, -70]);

  const option = {
    series: [
      {
        name: "Temperature",
        data: data,
      },
    ],
  };

  myChart.setOption(option);
}
// debugger
const myChart = echarts.init(graphContainer);

myChart.setOption(baseOption);

updatePlot();

```


