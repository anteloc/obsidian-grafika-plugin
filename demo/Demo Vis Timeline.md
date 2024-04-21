# FIXME 
- Exporting to PDF fails in the "Nested Groups" graph, it doesn't show in the PDF
##  Basic Timeline With Arrows
# FIXME 
- Arrows should start at points when data item is of type:"point"

### Controls
- Mouse drag for horizontal scrolling
- Mouse wheel for zoom
- Hover on arrow to show a tooltip

```vistimeline-js
// Enable Obsidian DevTools debugging
//debugger;

var groups = [
  { id: 0, content: "Buy a Car" },
  { id: 1, content: "Trip to Paris" },
  { id: 2, content: "Rent cottage in the country" },
  { id: 3, content: "Stay in the cottage" },
  { id: 4, content: "Buy plane tickets to London" },
  { id: 5, content: "Trip to London" },
  { id: 6, content: "Rent a car at the airport" },
];

// Create a DataSet (allows two way data-binding)
let items = new vis.DataSet([
  {
    id: 0,
    group: 0,
    content: groups[0].content,
    start: "2014-04-10",
    type: "point",
  },
  { id: 1, group: 1, content: groups[1].content, start: "2014-04-14" },
  {
    id: 2,
    group: 2,
    content: groups[2].content,
    start: "2014-04-17",
    type: "point",
  },
  {
    id: 3,
    group: 3,
    content: groups[3].content,
    start: "2014-04-18",
    end: "2014-04-24",
  },
  {
    id: 4,
    group: 4,
    content: groups[4].content,
    start: "2014-04-25",
    type: "point",
  },
  { id: 5, group: 5, content: groups[5].content, start: "2014-04-27" },
  {
    id: 6,
    group: 6,
    content: groups[6].content,
    start: "2014-04-27",
    type: "point",
  },
]);

const dependency = [
  {
    id: 1,
    id_item_1: 0,
    id_item_2: 1,
    title: "need it for...",
  },
  {
    id: 2,
    id_item_1: 2,
    id_item_2: 3,
    title: "in advance to...",
  },
  {
    id: 3,
    id_item_1: 4,
    id_item_2: 5,
    title: "travel to the airport to...",
  },
  {
    id: 4,
    id_item_1: 5,
    id_item_2: 6,
    title: "going back home requires...",
  },
];

// Configuration for the Timeline
let options = {
  selectable: true,
};

// Create a Timeline
let timeline = new vis.Timeline(graphContainer, items, groups, options);

// Adding arrows option followRelationships set to true
const arrowsOptions = {
  followRelationships: true,
};

// Create instance of Arrow for a timeline objetc and its denpedencies
const myArrow = new Arrow(timeline, dependency, arrowsOptions);

```



##  Vis Graph2D: Nested Groups

### Controls
- Mouse drag or mouse wheel for horizontal scrolling
- Ctrl + mouse wheel for zoom

```vistimeline-js
// Enable Obsidian DevTools debugging
// debugger;

let sdt = [
  {
    group3: [
      {
        id: 1243,
        treeLevel: 3,
        content: "Level 3 1243",
      },
      {
        id: 1525,
        treeLevel: 3,
        content: "Level 3 1525",
      },
      {
        id: 1624,
        treeLevel: 3,
        content: "Level 3 1624",
      },
      {
        id: 2076,
        treeLevel: 3,
        content: "Level 3 2076",
      },
      {
        id: 1345,
        treeLevel: 3,
        content: "Level 3 1345",
      },
      {
        id: 2078,
        treeLevel: 3,
        content: "Level 3 2078",
      },
      {
        id: 1826,
        treeLevel: 3,
        content: "Level 3 1826",
      },
      {
        id: 2107,
        treeLevel: 3,
        content: "Level 3 2107",
      },
    ],
    groups: [
      {
        id: 10,
        title: "Group 10",
        content: "Group 10",
        treeLevel: 1,
        nestedGroups: [1, 2, 3, 4, 5, 6],
      },
      {
        id: 1,
        content: "North America",
        treeLevel: 2,
        nestedGroups: [1243, 1525, 1624, 1345, 2078, 1826, 2076, 2107],
      },
      {
        id: 2,
        treeLevel: 2,
        content: "Latin America",
      },
      {
        id: 3,
        treeLevel: 2,
        content: "Europe",
      },
      {
        id: 4,
        treeLevel: 2,
        content: "Asia",
      },
      {
        id: 5,
        treeLevel: 2,
        content: "Oceania",
      },
      {
        id: 6,
        treeLevel: 2,
        content: "Africa",
      },
      {
        id: 100,
        title: "Group 100",
        content: "Group 100",
        treeLevel: 1,
        nestedGroups: [101, 102, 103, 104, 105, 106],
        text: "Totals",
        EditionId: 0,
        groupId: 0,
      },
      {
        id: 101,
        treeLevel: 2,
        content: "North America",
      },
      {
        id: 102,
        treeLevel: 2,
        content: "Latin America",
      },
      {
        id: 103,
        treeLevel: 2,
        content: "Europe",
      },
      {
        id: 104,
        treeLevel: 2,
        content: "Asia",
      },
      {
        id: 105,
        treeLevel: 2,
        content: "Oceania",
      },
      {
        id: 106,
        treeLevel: 2,
        content: "Africa",
      },
    ],
  },
];

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

let startDay = moment().startOf("month").startOf("week").isoWeekday(1);


// Create a DataSet (allows two way data-binding)
let now = moment().minutes(0).seconds(0).milliseconds(0);
let itemCount = 60;

// create a data set with groups
let groups = new vis.DataSet();

groups.add(sdt[0].groups);
groups.add(sdt[0].group3);

// create a dataset with items
let items = new vis.DataSet();
let groupIds = groups.getIds();
let types = ["box", "point", "range", "background"];
for (let i = 0; i < itemCount; i++) {
  let rInt = randomIntFromInterval(1, 30);
  let start = startDay.clone().add(rInt, "days");
  let end = start.clone().add(24, "hours");
  let randomGroupId = groupIds[randomIntFromInterval(1, groupIds.length)];
  let type = types[randomIntFromInterval(0, 3)];

  items.add({
    id: i,
    group: randomGroupId,
    content: "item " + i + " " + rInt,
    start: start,
    end: end,
    type: type,
  });
}

// specify options
let options = {
  start: startDay.toDate(),
  end: new Date(1000 * 60 * 60 * 24 + new Date().valueOf()),
  horizontalScroll: true,
  zoomKey: "ctrlKey",
  orientation: "both",
  zoomMin: 1000 * 60 * 60 * 240,
};

// create a Timeline
let timeline = new vis.Timeline(graphContainer, items, groups, options);
```