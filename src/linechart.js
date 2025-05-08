import * as d3 from 'd3';
import React, { Component } from "react";

class LineChart extends Component {

  constructor(props) {

    super(props);
    this.state = { data: props.data };
    this.chartRef = React.createRef();

  }

  componentDidUpdate(prevProps) {

    if (this.props.data !== prevProps.data)
        this.setState({data: this.props.data || this.state.data,}, () => this.drawChart());

  }

  drawChart() {
    d3.select(this.chartRef.current).selectAll("*").remove();

    const grouped = d3.groups(this.state.data, d => +d.Year);

    const data = grouped.map(([year, entries]) => ({
      Year: new Date(+year, 0, 1),
      trust: d3.mean(entries, d => +d["Consumer Trust in AI (%)"]),
      collab: d3.mean(entries, d => +d["Human-AI Collaboration Rate (%)"])
    })).sort((a, b) => a.Year - b.Year);

    const allValues = [...data.map(d => d.trust), ...data.map(d => d.collab)];
    const valueExtent = d3.extent(allValues);
    const rangePadding = (valueExtent[1] - valueExtent[0]) * 0.05;
    const combinedRange = [
      Math.max(0, valueExtent[0] - rangePadding),
      Math.min(100, valueExtent[1] + rangePadding)
    ];

    const margin = { top: 40, right: 20, bottom: 50, left: 80 };
    const width = 800;
    const height = 500;
    const innerWidth = width - margin.left - margin.right - 50;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(this.chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // This part was added cause we kept getting an issue of there being no data to display whenever we had a year range of a singular number
    // Like for example, if our date ranges were [2020 - 2020] -> we would not get any data so we resorted to making fake ticks to append
    // the same data to and make a straight line.

    const singlePoint = data.length === 1;
    const displayData = singlePoint ? [data[0], {...data[0], Year: new Date(data[0].Year.getFullYear(), 1, 1)}] : data;

    // ------------------------

    const xScale = d3.scaleTime()
      .domain(d3.extent(displayData, d => d.Year))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(combinedRange)
      .range([innerHeight, 0]);

    const line = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale(d.trust));
    
    const line2 = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale(d.collab));

    svg.append("path")
      .datum(displayData)
      .attr("class", "line-trust")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 0.75)
      .attr("d", line);

    svg.append("path")
      .datum(displayData)
      .attr("class", "line-collab")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 5)
      .attr("stroke-opacity", 0.75)
      .attr("d", line2);

    svg.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .tickValues(displayData.map(d => d.Year))
          .tickFormat(d3.timeFormat('%Y'))
      );

    svg.append("g").call(d3.axisLeft(yScale));

    svg.append("g").attr("transform", `translate(${innerWidth},0)`).call(d3.axisRight(yScale));

    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Year");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Consumer Trust in AI (%)");

    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("x", innerHeight / 2)
      .attr("y", -innerWidth - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .text("Human-AI Collaboration Rate (%)");
  }

  render() {
    return <div ref={this.chartRef}></div>;
  }
}

export default LineChart;