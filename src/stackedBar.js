import React, { Component } from "react";
import * as d3 from "d3";

class StackedBarChart extends Component {
  componentDidMount() {
    this.createStackedBarChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.createStackedBarChart();
    }
  }

  createStackedBarChart = () => {
    const { data } = this.props;
    if (!data || data.length === 0) return;

    const margin = { top: 100, right: 20, bottom: 60, left: 60 };
    const width = 600;
    const height = 520;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(this.container).selectAll("*").remove();

    try {
      const groupedData = d3.rollup(
        data,
        v => {
          const jobLoss = d3.mean(v, d => +d["Job Loss Due to AI (%)"] || 0);
          const revenueIncrease = d3.mean(v, d => +d["Revenue Increase Due to AI (%)"] || 0);
          const marketShare = d3.mean(v, d => +d["Market Share of AI Companies (%)"] || 0);
          return { jobLoss, revenueIncrease, marketShare };
        },
        d => d["Regulation Status"]
      );

      const processedData = Array.from(groupedData, ([key, value]) => ({
        regulation: key,
        ...value
      })).sort((a, b) => {
        const order = { "Strict": 0, "Moderate": 1, "Lenient": 2 };
        return order[a.regulation] - order[b.regulation];
      });

      const stack = d3.stack()
        .keys(["jobLoss", "revenueIncrease", "marketShare"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(processedData);

      const svg = d3.select(this.container)
        .attr("width", width)
        .attr("height", height)
        .style("overflow", "visible");

      const innerChart = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const x = d3.scaleBand()
        .domain(processedData.map(d => d.regulation))
        .range([0, innerWidth])
        .padding(0.3);

      const maxY = d3.max(stackedData[stackedData.length - 1], d => d[1]) || 100;
      const y = d3.scaleLinear()
        .domain([0, maxY * 1.1])
        .range([innerHeight, 0]);

      const color = d3.scaleOrdinal()
        .domain(["jobLoss", "revenueIncrease", "marketShare"])
        .range(["#e41a1c", "#377eb8", "#4daf4a"]);

      const legendItems = [
        { label: "Job Loss (%)", color: "#e41a1c" },
        { label: "Revenue Increase (%)", color: "#377eb8" },
        { label: "Market Share of AI Companies", color: "#4daf4a" }
      ];

      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width/2 - 250}, 30)`);

      const legendItemsGroup = legend.selectAll(".legend-item")
        .data(legendItems)
        .enter().append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 180}, 0)`);

      legendItemsGroup.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => d.color);

      legendItemsGroup.append("text")
        .attr("x", 20)
        .attr("y", 9)
        .attr("dy", "0.35em")
        .text(d => d.label)
        .style("font-size", "12px")
        .style("font-weight", "bold");

      innerChart.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
          .attr("fill", d => color(d.key))
          .selectAll("rect")
          .data(d => d)
          .enter().append("rect")
            .attr("x", d => x(d.data.regulation))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .append("title")
              .text(d => {
                const metricMap = {
                  jobLoss: "Job Loss",
                  revenueIncrease: "Revenue Increase",
                  marketShare: "Market Share"
                };
                const metric = metricMap[d.key] || d.key;
                const value = d.data[d.key] || 0;
                return `${d.data.regulation}: ${metric} = ${value.toFixed(1)}%`;
              });

      const xAxis = innerChart.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x));

      xAxis.selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")

      xAxis.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Regulation Status");

      const yAxis = innerChart.append("g")
        .call(d3.axisLeft(y).ticks(5));

      yAxis.selectAll("text")
        .style("font-size", "12px")

      yAxis.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -innerHeight / 2)
        .attr("fill", "black")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Percentage (%)");

    } catch (error) {
      console.error("Error creating chart:", error);
      d3.select(this.container)
        .append("text")
        .attr("x", width/2)
        .attr("y", height/2)
        .attr("text-anchor", "middle")
        .style("fill", "red")
        .style("font-size", "16px")
        .text("Error creating chart. Check console for details.");
    }
  };

  render() {
    return (
      <svg 
        ref={el => (this.container = el)}
      />
    );
  }
}

export default StackedBarChart;