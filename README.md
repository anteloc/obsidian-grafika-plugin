# Grafika


> [!warning] Warning
> This plugin is still in a **Proof-of-Concept (POC)** stage.
> Even though this plugin is stable enough to try and use, performance and usability still require more work to make it acceptable for production use.

This is an Obsidian plugin for rendering graphs, charts and plots inside Obsidian markdown notes.

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

## Installation

There are currently two supported methods for installing this plugin:

### Method 1 - BRAT (Recommended)

1. Install **BRAT Plugin** from the **Community Plugins** in Obsidian

2. In **Obsidian's Settings**, add **Grafika's Github repository URL** 
	`https://github.com/anteloc/obsidian-grafika-plugin` 
	to **BRAT's Beta Plugin List**:

![[brat-step-01.png]]

![[brat-step-02.png]]

3. Restart **Obsidian**

### Method 2 - Manual install 

- **Requirements**: 
	- nodejs **v20.x**

1. In **Obsidian**, create a new vault with name: `my-vault` 

![[my-vault-step-01.png]]

![[my-vault-step-02.png]]

2. **If it doesn't exist**, create a new `plugins` folder under your vault's `.obsidian` folder.

![[my-vault-step-03.png]]

3. Open a terminal and `cd` to the plugin's folder for your vault:

**MacOS and Linux**
```shell
cd path/to/Documents/Obsidian/my-vault/.obsidian/plugins
```
**Windows**
```shell
cd path\to\Documents\Obsidian\my-vault\.obsidian\plugins
```

4. Clone and build Grafika's github repo:
```shell
git clone https://github.com/anteloc/obsidian-grafika-plugin.git
cd obsidian-grafika-plugin
npm install
```

5. Open your `my-vault` in **Obsidian** and [Turn on community plugins](https://help.obsidian.md/Extending+Obsidian/Community+plugins#Browse+community+plugins) if required

6. In **Obsidian's Settings**, enable Grafika if required:

![[my-vault-step-04.png]]

7. Restart **Obsidian**

# Demo

### WIP

1. Manually install Grafika on Obsidian - TODO Add instructions
2. Download the `demo` folder and copy it inside your vault
3. Open the Demo XXX.md files
4. Experiment with the charts and plots by editing the JavaScript code fences to see the results

## Support

If you think this plugin saved you **time and effort** worth one (ore more!) coffees, help me by **supporting** my work by buying me one (or more!) coffees!
[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200">](https://www.buymeacoffee.com/anteloc)


