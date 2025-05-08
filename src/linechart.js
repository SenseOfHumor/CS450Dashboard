import * as d3 from 'd3';
import React, { Component } from "react";

class LineChart extends Component {
  constructor(props) {
    super(props);
    this.state = { data: props.data, country: props.country };
    this.chartRef = React.createRef();
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.props.data !== prevProps.data || this.props.country !== prevProps.country) {
      this.setState({
        data: this.props.data || this.state.data,
        country: this.props.country
      });
    }
    
    if (this.state.data && (prevState.data !== this.state.data || prevState.country !== this.state.country || prevProps !== this.props)) {
      this.drawChart();
    }
  }

  drawChart() {
    // Clear previous chart
    d3.select(this.chartRef.current).selectAll("*").remove();

    const { country } = this.state;
    // Filter by country if specified, otherwise use all data
    const filtered = country && country !== "All" 
      ? this.state.data.filter(d => d.Country === country)
      : this.state.data;

    // Group and aggregate data by year
    const grouped = d3.groups(filtered, d => +d.Year);

    const data = grouped.map(([year, entries]) => ({
      Year: new Date(+year, 0, 1),
      trust: d3.mean(entries, d => +d["Consumer Trust in AI (%)"]),
      collab: d3.mean(entries, d => +d["Human-AI Collaboration Rate (%)"])
    })).sort((a, b) => a.Year - b.Year);

    if (data.length === 0) return;

    // Calculate combined min/max values for both metrics
    const allValues = [
      ...data.map(d => d.trust),
      ...data.map(d => d.collab)
    ];
    const valueExtent = d3.extent(allValues);
    
    // Apply 5% padding while keeping within 0-100 bounds
    const rangePadding = (valueExtent[1] - valueExtent[0]) * 0.05;
    const combinedRange = [
      Math.max(0, valueExtent[0] - rangePadding),
      Math.min(100, valueExtent[1] + rangePadding)
    ];

    // Set dimensions
    const margin = { top: 40, right: 20, bottom: 50, left: 80 },
          width = 800,
          height = 500,
          innerWidth = width - margin.left - margin.right - 50,
          innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(this.chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);

    // Both y-axes use the same range
    const yScale = d3.scaleLinear()
      .domain(combinedRange)
      .range([innerHeight, 0]);

    const yScale2 = d3.scaleLinear()
      .domain(combinedRange)
      .range([innerHeight, 0]);

    // Line generators - use straight lines if only one data point
    const line = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale(d.trust))
      .curve(data.length === 1 ? d3.curveLinear : d3.curveLinear); // No curve for single point
    
    const line2 = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale2(d.collab))
      .curve(data.length === 1 ? d3.curveLinear : d3.curveLinear); // No curve for single point

    // If only one data point, create a flat line by duplicating the point
    const displayData = data.length === 1 
      ? [data[0], { ...data[0], Year: new Date(data[0].Year.getFullYear() + 1, 0, 1) }] 
      : data;

    // Draw trust line with 25% transparency
    svg.append("path")
      .datum(displayData)
      .attr("class", "line-trust")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 0.75)
      .attr("d", line);

    // Draw collaboration line with 25% transparency
    svg.append("path")
      .datum(displayData)
      .attr("class", "line-collab")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 0.75)
      .attr("d", line2);

    // Add axes
    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(data.length).tickFormat(d3.timeFormat('%Y')));

    // If only one year, force showing at least two ticks
    if (data.length === 1) {
      const singleYear = data[0].Year.getFullYear();
      xAxis.call(
        d3.axisBottom(xScale)
          .tickValues([new Date(singleYear, 0, 1), new Date(singleYear + 1, 0, 1)])
          .tickFormat(d3.timeFormat('%Y'))
      );
    }

    svg.append("g")
      .call(d3.axisLeft(yScale));

    // Add right axis for collaboration rate
    svg.append("g")
      .attr("transform", `translate(${innerWidth},0)`)
      .call(d3.axisRight(yScale2));

    // Axis labels
    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Consumer Trust in AI (%)");

    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("x", innerHeight / 2)
      .attr("y", -innerWidth - 40)
      .attr("text-anchor", "middle")
      .style("font-weight", "bold")
      .text("Human-AI Collaboration Rate (%)");
  }

  render() {
    return (
      <div ref={this.chartRef}></div>
    );
  }
}

LineChart.defaultProps = {
  data: null,
  country: "All"
};

export default LineChart;