
## Test
- Verify:
	- Modules correctly loaded
	- Utility methods working properly
	
```echarts-js
// debugger
console.log("code block context: echarts", echarts, "graphContainer", graphContainer, "utils", utils);


console.log("code block: moment", moment);
console.log("usage: moment()", moment().startOf("month").startOf("week").isoWeekday(1))
console.log('code block: voca', v);
console.log('code block: echarts', echarts);
console.log('code block: underscore', _)
console.log('code block: uuidv4', uuidv4)

const tableData = await utils.tableData("#sales-table", true);
console.log('code block: tableData call result', tableData);

const fileData = await utils.fileData("demo/data/echarts-package-size.json").json();
console.log('code block: fileData call result', fileData);

const fetchData = await fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&past_days=10&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m", {
  "headers": {
    "accept": "application/json; charset=utf8;",
  },
  cache: "no-cache"
});

console.log(await fetchData.json())

// console.log('Opening blockId: ^test-block-id');
//utils.openBlockId('test-block-id');


const assetUrl = await utils.assetUrl('demo/data-gl/asset/world.topo.bathy.200401.jpg')

console.log(assetUrl)
```

