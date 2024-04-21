# FIXME

##  Vis Network: Basic Graph

### Controls
- Nodes: click for drag-and-drop
- Canvas: mouse drag for pan, mouse wheel for zoom
```visnetwork-js
// Enable Obsidian DevTools debugging
// debugger;

const nodes = [
  { id: 0, label: "0", group: 0 },
  { id: 1, label: "1", group: 0 },
  { id: 2, label: "2", group: 0 },
  { id: 3, label: "3", group: 1 },
  { id: 4, label: "4", group: 1 },
  { id: 5, label: "5", group: 1 },
  { id: 6, label: "6", group: 2 },
  { id: 7, label: "7", group: 2 },
  { id: 8, label: "8", group: 2 },
  { id: 9, label: "9", group: 3 },
  { id: 10, label: "10", group: 3 },
  { id: 11, label: "11", group: 3 },
  { id: 12, label: "12", group: 4 },
  { id: 13, label: "13", group: 4 },
  { id: 14, label: "14", group: 4 },
  { id: 15, label: "15", group: 5 },
  { id: 16, label: "16", group: 5 },
  { id: 17, label: "17", group: 5 },
  { id: 18, label: "18", group: 6 },
  { id: 19, label: "19", group: 6 },
  { id: 20, label: "20", group: 6 },
  { id: 21, label: "21", group: 7 },
  { id: 22, label: "22", group: 7 },
  { id: 23, label: "23", group: 7 },
  { id: 24, label: "24", group: 8 },
  { id: 25, label: "25", group: 8 },
  { id: 26, label: "26", group: 8 },
  { id: 27, label: "27", group: 9 },
  { id: 28, label: "28", group: 9 },
  { id: 29, label: "29", group: 9 },
];
const edges = [
  { from: 1, to: 0 },
  { from: 2, to: 0 },
  { from: 4, to: 3 },
  { from: 5, to: 4 },
  { from: 4, to: 0 },
  { from: 7, to: 6 },
  { from: 8, to: 7 },
  { from: 7, to: 0 },
  { from: 10, to: 9 },
  { from: 11, to: 10 },
  { from: 10, to: 4 },
  { from: 13, to: 12 },
  { from: 14, to: 13 },
  { from: 13, to: 0 },
  { from: 16, to: 15 },
  { from: 17, to: 15 },
  { from: 15, to: 10 },
  { from: 19, to: 18 },
  { from: 20, to: 19 },
  { from: 19, to: 4 },
  { from: 22, to: 21 },
  { from: 23, to: 22 },
  { from: 22, to: 13 },
  { from: 25, to: 24 },
  { from: 26, to: 25 },
  { from: 25, to: 7 },
  { from: 28, to: 27, shadow: { color: "rgb(0,255,0)" } },
  { from: 29, to: 28 },
  { from: 28, to: 0 },
];

// create a network
const container = graphContainer;
const data = {
  nodes: nodes,
  edges: edges,
};
const options = {
  nodes: {
    shape: "dot",
    size: 30,
    font: {
      size: 32,
    },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    shadow: true,
  },
};
const network = new vis.Network(container, data, options);
```

## Live Update Table Data

### Controls
- Nodes: click for drag-and-drop
- Canvas: click for pan, mouse wheel for zoom
```visnetwork-js
// Enable Obsidian DevTools debugging
// debugger;

const LENGTH_MAIN = 350,
  LENGTH_SERVER = 150,
  LENGTH_SUB = 50,
  WIDTH_SCALE = 2,
  GREEN = "green",
  RED = "#C5000B",
  ORANGE = "orange",
  //GRAY = '#666666',
  GRAY = "gray",
  BLACK = "#2B1B17";

const options = {
  nodes: {
    scaling: {
      min: 16,
      max: 32,
    },
  },
  edges: {
    color: GRAY,
    smooth: false,
  },
  physics: {
    barnesHut: {
      gravitationalConstant: -30000,
    },
    stabilization: {
      iterations: 2500,
    },
  },
  groups: {
    Himself: {
      shape: "square",
      color: "#00FF00", // green
    },
    Friend: {
      shape: "triangle",
      color: "#FF9900", // orange
    },
    Knows: {
      shape: "dot",
      color: "#2B7CE9", // blue
    },
    "Works With": {
      shape: "dot",
      color: "#5A1E5C", // purple
    },
  },
};

let network;
let prevData;

async function updateGraph() {
  const table = await utils.tableData("#mikes-relationships");

  const nodes = (tbl) =>
    tbl.map((tr, idx) => ({
      id: idx + 1,
      label: tr.Name,
      group: tr.Relationship,
      value: 1,
    }));

  const edges = (tbl) =>
    tbl.map((tr, idx) => ({
      id: "0->" + (idx + 1),
      from: 0,
      to: idx + 1,
      arrows: "to",
      length: LENGTH_MAIN,
      width: WIDTH_SCALE,
      label: tr.Relationship,
    }));

  const MikeNode = {
    id: 0,
    label: "Mike",
    group: "Himself",
    value: 1,
  };

  const data = {
    nodes: nodes(table).concat(MikeNode),
    edges: edges(table),
  };

  if (!network) {
    network = new vis.Network(graphContainer, data, options);
    prevData = data;
  } else if (!_.isEqual(data, prevData)) {
    network.setData(data);
    prevData = data;
  }
}

// First graph
updateGraph();

// Check and update if table data changed
setInterval(updateGraph, 5000);
```


| #mikes-relationships | Name  | Relationship |
| -------------------- | ----- | ------------ |
|                      | Alice | Friend       |
|                      | Bob   | Friend       |
|                      | Cathy | Knows        |
|                      | Dan   | Knows        |
|                      | Ellen | Works With   |
|                      | Frank | Works With   |
|                      | Irene | Friend       |
