# Grafika Plugin

### WIP
This is an Obsidian plugin for rendering graphs and plots inside Obsidian.

It currently supports the following graphs, charts and plot libraries:

- Apache echarts: https://echarts.apache.org/en/index.html
  - Examples: https://echarts.apache.org/examples/en/index.html
- ChartJs: https://www.chartjs.org/
  - Examples: https://www.chartjs.org/docs/latest/samples/bar/border-radius.html
- visjs: https://visjs.org/
  - Only network and timelines graphs are supported
  - Examples:
    - network: https://visjs.github.io/vis-network/examples/
    - timeline: https://visjs.github.io/vis-timeline/examples/timeline/

It works by writing some JavaScript code fences for creating plots and graphs. 
Depending on the code fence language, the required JavaScript will be for creating a plot with echarts, chartjs or visjs.

I made an effort in order to make easy copying source code from the plot libraries examples directly into a code fence, and create a plot with very few adaptations.

# Demo

### WIP

1. Manually install Grafika on Obsidian - TODO Add instructions
2. Download the `demo` folder and copy it inside your vault
3. Open the Demo XXX.md files
4. Experiment with the charts and plots by editing the JavaScript code fences to see the results

# Pending

- [ ] Create templates with reasonable defaults, in order to avoid writing too much JavaScript code
- [ ] Improve error messages and error message feedback to the users
- [ ] Add 3D demos for charts and plots in order to verify performance
- [ ] Create functions for loading resources or assets from the vault, e. g., images
- [ ] Improve styling for plots, in order to fit width, height, etc.
