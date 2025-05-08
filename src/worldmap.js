import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import 'd3-geo-projection';

function WorldMap({ data }) {

    const mapContainer = useRef(null);
    const [averageAdoptionRates, setAverageAdoptionRates] = useState(null);

    // our props data is already filtered based on time range, country, and top AI tools, so I had to refactor
    // some of Swapnil's code

    const calculateAverages = (data) => { // We p much just average out all countries for the years

        const filtered_data = d3.rollup(
            data,
            v => d3.mean(v, d => +d['AI Adoption Rate (%)']),
            d => d.Country == "UK" ? "England" : d.Country // FIXS THE ERROR FOR NOT HAVING "UK" ON THE MAP!!!!!!
        );
    
        return Array.from(filtered_data, ([country, avg]) => ({ country, averageAIAodoptionRate: avg }));

    };

  const drawMap = () => {

    const width = 900;
    const height = 550;
  
    d3.select(mapContainer.current).selectAll("*").remove(); // clear if old data
  
    const svg = d3.select(mapContainer.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
  
    const projection = d3.geoNaturalEarth1()
        .scale(150)
        .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    const adoptionRateMap = {};

    if (averageAdoptionRates) {
        averageAdoptionRates.forEach(item => { adoptionRateMap[item.country] = item.averageAIAodoptionRate;});
    }
  
    const colorScale = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateYlOrRd);
  
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(worldData => {
      svg.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
          const countryName = d.properties.name;
          const rate = adoptionRateMap[countryName];
          return rate !== undefined ? colorScale(rate) : "#eee";
        })
        .attr("stroke", "#00000045")
        .attr("stroke-width", 1);
  
      const tooltip = d3.select(mapContainer.current)
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgb(50, 50, 50)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", "0");
  
      svg.selectAll("path")
        .on("mouseover", function (event, d) {

          d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
          const countryName = d.properties.name;
          const rate = adoptionRateMap[countryName];
  
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip.html(`
            <strong>${countryName}</strong><br/>
            Avg. AI Adoption: ${rate !== undefined ? rate.toFixed(1) + "%" : "N/A"}
          `)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY + 5) + "px");

        })
        .on("mousemove", function (event, d){
            tooltip.style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY + 5) + "px");
        })
        .on("mouseout", function (event, d) {
          d3.select(this).attr("stroke", "#00000045").attr("stroke-width", 1);
          tooltip.transition().duration(200).style("opacity", 0);
        });
  
      // Color legend
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
  
      legendSvg.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#linear-gradient)");
  
      // Labels
      legendSvg.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .text("Low Adoption");
  
      legendSvg.append("text")
        .attr("x", legendWidth)
        .attr("y", -5)
        .attr("text-anchor", "end")
        .text("High Adoption");
    });
  };

  useEffect(() => {
    if (data) {
      const averages = calculateAverages(data);
      setAverageAdoptionRates(averages);
    }
  }, [data]);

  useEffect(() => {

    if (averageAdoptionRates) drawMap();

  }, [averageAdoptionRates]);

  return <div ref={mapContainer}></div>;

}

export default WorldMap;