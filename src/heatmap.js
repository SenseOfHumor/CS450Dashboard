import * as d3 from 'd3';
import React, { Component } from "react";

class Heatmap extends Component {
  constructor(props) {
    super(props);
    this.state = { data: props.data };
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    if (!this.state.data) {
      this.fetchData();
    }
  }

  fetchData = async () => {
    const response = await fetch("Global_AI_Content_Impact_Dataset.csv");
    const rawText = await response.text();
    const parser = d3.dsvFormat(",");
    const parsedData = parser.parse(rawText);
    this.setState({ data: parsedData });
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data });
    }
    
    if (this.state.data && (
      prevState.data !== this.state.data || 
      prevProps !== this.props
    )) {
      this.drawChart();
    }
  }

  drawChart() {
    if (!this.state.data || this.state.data.length === 0) return;

    // Clear previous chart
    d3.select(this.chartRef.current).selectAll("*").remove();

    const data = this.state.data;
    const margin = { top: 120, right: 80, bottom: 0, left: 140 },
          width = 400,
          height = 400;

    const tools = [...new Set(data.map(d => d["Top AI Tools Used"]))].filter(Boolean);
    const industries = [...new Set(data.map(d => d.Industry))].filter(Boolean);

    if (tools.length === 0 || industries.length === 0) return;

    const padding = 4;
    const numCols = industries.length;
    const numRows = tools.length;
    const cellSize = Math.min(width / numCols, height / numRows);
    const adjustedWidth = numCols * (cellSize + padding);
    const adjustedHeight = numRows * (cellSize + padding);

    const xScale = d3.scaleBand()
      .domain(industries)
      .range([0, adjustedWidth])
      .padding(0.1);
    const yScale = d3.scaleBand()
      .domain(tools)
      .range([0, adjustedHeight])
      .padding(0.1);

    const svg = d3.select(this.chartRef.current)
      .append("svg")
      .attr("width", adjustedWidth + margin.left + margin.right)
      .attr("height", adjustedHeight + margin.top + margin.bottom + 100)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(data, d => +d["AI-Generated Content Volume (TBs per year)"])])
      .interpolator(d3.interpolateOranges);

    const cellMap = new Map();
    data.forEach(d => {
      if (!d["Top AI Tools Used"] || !d.Industry) return;
      
      const key = `${d["Top AI Tools Used"]}_${d.Industry}`;
      const val = parseFloat(d["AI-Generated Content Volume (TBs per year)"]);
      if (!isNaN(val)) {
        cellMap.set(key, {
          tool: d["Top AI Tools Used"],
          industry: d.Industry,
          value: val
        });
      }
    });

    const uniqueCells = Array.from(cellMap.values());

    // Draw heatmap squares
    svg.selectAll("rect")
      .data(uniqueCells)
      .join("rect")
      .attr("x", d => industries.indexOf(d.industry) * (cellSize + padding))
      .attr("y", d => tools.indexOf(d.tool) * (cellSize + padding))
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => colorScale(d.value));

    // Add text to cells
    svg.selectAll(".cell-label")
      .data(uniqueCells)
      .join("text")
      .attr("class", "cell-label")
      .attr("x", d => industries.indexOf(d.industry) * (cellSize + padding) + cellSize / 2)
      .attr("y", d => tools.indexOf(d.tool) * (cellSize + padding) + cellSize / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", d => {
        const color = d3.color(colorScale(d.value));
        const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
        return luminance < 140 ? "white" : "black";
      })
      .text(d => d.value.toFixed(1));
      
    // X-axis (Industries)
    svg.append("g")
      .attr("transform", `translate(0, ${adjustedHeight})`)
      .call(d3.axisBottom(xScale).tickSize(6))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-family", "Arial")
      .style("font-size", "11px");

    // X-Axis Title
    svg.append("text")
      .attr("x", adjustedWidth / 2)
      .attr("y", adjustedHeight + 80) 
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "Arial")
      .text("Industries");
  
    // Y-axis (Tools)
    svg.append("g")
      .call(d3.axisLeft(yScale).tickSize(6))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-family", "Arial")
      .style("font-size", "11px");

    // Y-Axis Title
    svg.append("text")
      .attr("x", -adjustedHeight/2)
      .attr("y", -margin.left+20) 
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("font-family", "Arial")
      .text("Top AI Tools Used");

    // === Legend ===
    const legendWidth = 200;
    const legendHeight = 10;
    const legendMax = d3.max(uniqueCells, d => d.value);
  
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient");
  
    linearGradient.selectAll("stop")
      .data(d3.ticks(0, 1, 10))
      .enter()
      .append("stop")
      .attr("offset", d => `${d * 100}%`)
      .attr("stop-color", d => colorScale(d * legendMax));
  
    const legendScale = d3.scaleLinear()
      .domain([0, legendMax])
      .range([0, legendWidth]);
  
    const legendSvg = svg.append("g")
      .attr("transform", `translate(${adjustedWidth - legendWidth}, -60)`);
  
    legendSvg.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");
  
    legendSvg.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(d3.axisBottom(legendScale).ticks(5));
  
    svg.append("text")
      .attr("x", adjustedWidth - legendWidth)
      .attr("y", -70)
      .attr("text-anchor", "start")
      .style("font-weight", "bold")
      .text("Content Volume (TB/yr)");
  }
  
  render() {
    return (
      <div style={{display: "flex"}} ref={this.chartRef}></div>
    );
  }
}

export default Heatmap;