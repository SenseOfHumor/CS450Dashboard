import React, { Component } from "react";
import * as d3 from "d3";

class WorldMap extends Component {
  constructor(props) {
    super(props);
    this.mapContainer = React.createRef(); // map container holds the map from d3
  }

  componentDidMount() {
    this.drawMap();
  }

// NOTE: pass in the prop for the selected year here for the slider
// and make sure to include it as a dependency in this compdidupd thingy
componentDidUpdate(prevProps) {
  if (
    prevProps.data !== this.props.data ||
    prevProps.selectedIndustry !== this.props.selectedIndustry
    // || prevProps.selectedYear !== this.props.selectedYear // <-- uncomment this for ease
  ) {
    this.drawMap();
  }
}


drawMap() {
  const width = 800;
  const height = 550;

  d3.select(this.mapContainer.current).selectAll("*").remove(); // clear if old data

  const svg = d3.select(this.mapContainer.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

const adoptionSums = {};
const adoptionCounts = {};

// after passing the prop, we can also use the filter for selected year (pass the value from the slider)
// Example: if (d.Year === this.props.selectedYear) { ... }
// make sure to handle the case where no year is selected
this.props.data.forEach(d => {
  if (d.Industry !== this.props.selectedIndustry) return; // returns only selected idustry, do same for the year
  // if (d.Year !== this.props.selectedYear) return;  // <-- uncomment this for ease for the slider

  const country = d.Country;
  const rate = +d["AI Adoption Rate (%)"];
  if (!isNaN(rate)) {
    if (!adoptionSums[country]) {
      adoptionSums[country] = 0;
      adoptionCounts[country] = 0;
    }
    adoptionSums[country] += rate;
    adoptionCounts[country] += 1;
  }
});

// NOTE: calculate the average adoption rate for each country only if no specific year is selected
// if a year is specified, use the adoption rate from that year directly.
const adoptionRateByCountry = {};
Object.keys(adoptionSums).forEach(country => {
  // upfate the conditional logic: use average only if selectedYear is not passed (ig we will always have years passed)
  adoptionRateByCountry[country] = adoptionSums[country] / adoptionCounts[country];
});


const colorScale = d3.scaleSequential()
  .domain([0, 100])
  .interpolator(d3.interpolateYlOrRd); // very, very color ful times


  d3.json("/world.geojson").then(worldData => {
    svg.selectAll("path")
      .data(worldData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", d => {
        const countryName = d.properties.name;
        const rate = adoptionRateByCountry[countryName];
        return rate !== undefined ? colorScale(rate) : "#eee"; // def gray if no data
      })
      .attr("stroke", "#333")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 1);
      });

      const tooltip = d3.select(this.mapContainer.current)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

svg.selectAll("path")

  // for the tooltip
  .on("mouseover", function (event, d) {
    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

    const countryName = d.properties.name;
    const rate = adoptionRateByCountry[countryName];

    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`
      <strong>${countryName}</strong><br/>
      AI Adoption: ${rate !== undefined ? rate.toFixed(1) + "%" : "No data"}
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
  })
  .on("mouseout", function (event, d) {
    d3.select(this).attr("stroke", "#333").attr("stroke-width", 1);
    tooltip.transition().duration(500).style("opacity", 0);
  });

  });

// color legend
const legendWidth = 300;
const legendHeight = 10;

const legendSvg = svg.append("g")
  .attr("transform", `translate(${width - legendWidth - 0},${height - 10})`);

const defs = svg.append("defs");

const linearGradient = defs.append("linearGradient")
  .attr("id", "linear-gradient");

linearGradient
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "100%")
  .attr("y2", "0%");

linearGradient.selectAll("stop")
  .data([
    { offset: "0%", color: colorScale(0) },
    { offset: "100%", color: colorScale(100) }
  ])
  .enter()
  .append("stop")
  .attr("offset", d => d.offset)
  .attr("stop-color", d => d.color);

legendSvg.append("rect")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("fill", "url(#linear-gradient)");

// labels
legendSvg.append("text")
  .attr("x", 0)
  .attr("y", -5)
  .text("Low Adoption");

legendSvg.append("text")
  .attr("x", legendWidth)
  .attr("y", -5)
  .attr("text-anchor", "end")
  .text("High Adoption");

}




  render() {
    return <div ref={this.mapContainer}></div>; 
  }
}

export default WorldMap;
