import React, { Component } from "react";
import * as d3 from "d3";
import { sliderBottom } from 'd3-simple-slider';
import csv from "./Global_AI_Content_Impact_Dataset.csv";
import Heatmap from "./heatmap";
import StackedBarChart from "./stackedBar.js";
import LineChart from "./linechart.js";
import WorldMap from "./worldmap.js";

class App extends Component {
    constructor(props) {
        super(props);
        this.sliderRef = React.createRef();
        this.dropdown1Ref = React.createRef();
        this.dropdown2Ref = React.createRef();
        this.dropdown3Ref = React.createRef();
        this.state = {
            data: [],
            selectedData: [],
            yearRange: [2020, 2023],
            selectedOption1: "All",
            selectedOption2: "All",
            selectedOption3: "All",
            availableYears: [],
            countries: [],
            industries: [],
            aiTools: []
        };
    }

    componentDidMount() {
        this.loadCSVData();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.data !== this.state.data || 
            prevState.yearRange !== this.state.yearRange || 
            prevState.selectedOption1 !== this.state.selectedOption1 || 
            prevState.selectedOption2 !== this.state.selectedOption2 || 
            prevState.selectedOption3 !== this.state.selectedOption3) {
            this.filterData();
        }
    }

    loadCSVData() {
        d3.csv(csv).then(data => {
            const processedData = data.map(d => ({
                ...d,
                Year: +d.Year
            })).filter(d => !isNaN(d.Year));
            
            const years = [...new Set(processedData.map(d => d.Year))].sort((a, b) => a - b);
            const countries = [...new Set(processedData.map(d => d.Country))].sort();
            const industries = [...new Set(processedData.map(d => d.Industry))].sort();
            const aiTools = [...new Set(processedData.map(d => d['Top AI Tools Used']))].sort();
            
            const initialRange = [years[0], years[years.length - 1]];

            this.setState({
                data: processedData,
                availableYears: years,
                countries: ['All', ...countries],
                industries: ['All', ...industries],
                aiTools: ['All', ...aiTools],
                yearRange: initialRange
            }, () => {
                this.createYearSlider();
                this.createDropdowns();
                this.filterData();
            });
        }).catch(error => {
            console.error("Error loading CSV:", error);
        });
    }

    filterData() {
        const { data, yearRange, selectedOption1, selectedOption2, selectedOption3 } = this.state;
        
        const filteredData = data.filter(d => {
            const yearMatch = d.Year >= yearRange[0] && d.Year <= yearRange[1];
            const countryMatch = selectedOption1 === "All" || d.Country === selectedOption1;
            const industryMatch = selectedOption2 === "All" || d.Industry === selectedOption2;
            const toolMatch = selectedOption3 === "All" || d['Top AI Tools Used'] === selectedOption3;
            
            return yearMatch && countryMatch && industryMatch && toolMatch;
        });

        this.setState({ selectedData: filteredData });
    }

    createYearSlider() {
        const { availableYears, yearRange } = this.state;
        
        if (availableYears.length === 0) return;

<<<<<<< HEAD
        const scale = d3.scaleLinear()
            .domain([availableYears[0], availableYears[availableYears.length - 1]])
            .range([0, 300])
            .clamp(true);
=======
        // const scale = d3.scaleLinear()
        //     .domain([availableYears[0], availableYears[availableYears.length - 1]])
        //     .range([0, 300])
        //     .clamp(true);
>>>>>>> 1b7e9d79c8145874bfac1524a367bf5eca15999a

        const slider = sliderBottom()
            .min(availableYears[0])
            .max(availableYears[availableYears.length - 1])
            .step(1)
            .width(300)
            .tickFormat(d3.format("d"))
            .ticks(availableYears.length)
            .default(yearRange)
            .fill("#4CAF50")
            .on("onchange", val => {
                this.setState({ yearRange: val });
            });

        const svg = d3.select(this.sliderRef.current);
        svg.selectAll("*").remove();

        const g = svg.append("g")
            .attr("transform", "translate(20, 15)");

        g.call(slider);
    }

    createDropdowns() {
        const { countries, industries, aiTools } = this.state;

        d3.select(this.dropdown1Ref.current).selectAll("*").remove();
        d3.select(this.dropdown2Ref.current).selectAll("*").remove();
        d3.select(this.dropdown3Ref.current).selectAll("*").remove();

        const dropdown1 = d3.select(this.dropdown1Ref.current)
            .append("select")
            .on("change", (event) => {
                this.setState({ selectedOption1: event.target.value });
            });

        dropdown1.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d)
            .property("selected", d => d === this.state.selectedOption1);

        const dropdown2 = d3.select(this.dropdown2Ref.current)
            .append("select")
            .on("change", (event) => {
                this.setState({ selectedOption2: event.target.value });
            });

        dropdown2.selectAll("option")
            .data(industries)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d)
            .property("selected", d => d === this.state.selectedOption2);

        const dropdown3 = d3.select(this.dropdown3Ref.current)
            .append("select")
            .on("change", (event) => {
                this.setState({ selectedOption3: event.target.value });
            });

        dropdown3.selectAll("option")
            .data(aiTools)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d)
            .property("selected", d => d === this.state.selectedOption3);
    }

    render() {
        return (

          <>

            <div className="header">
                <div className="fc">
                    <div className="title">Global Impact of AI Content</div>
                    <div className="time-slider">
                        <span className="special-span">Year Range</span>
                        <svg ref={this.sliderRef} width={360} height={50}></svg>
                    </div>
                </div>
                <div className="fr">
                    <div className="fc ng">
                        <span className="special-span">Country</span>
                        <div ref={this.dropdown1Ref} className="d3-dropdown"></div>
                    </div>
                    <div className="fc ng">
                        <span className="special-span">Industry</span>
                        <div ref={this.dropdown2Ref} className="d3-dropdown"></div>
                    </div>
                    <div className="fc ng">
                        <span className="special-span">Top AI Tools Used</span>
                        <div ref={this.dropdown3Ref} className="d3-dropdown"></div>
                    </div>
                </div>
            </div>

            <div className="content">

              <div className="grid">

                <div className="cell-title">
                  <div className="title">AI-Generated Content Volume (TBs)</div>
                  <span className="special-span">Top AI Tools Used, Industry, and Content Volume</span>
                </div>

                <Heatmap data={this.state.selectedData}/>

              </div>

              <div className="grid">

                <div className="cell-title">
                  <div className="title">AI Impact by Regulation</div>
                  <span className="special-span">Job Loss, Revenue Increase, Market Share and Regulation</span>
                </div>

                <StackedBarChart data={this.state.selectedData}/>

              </div>

              <div className="grid">

                <div className="cell-title">
                  <div className="title">AI Collaboration & Consumer Trust</div>
                  <span className="special-span">Human-AI Collaboration Rate, Consumer Trust in AI, and Year</span>
                </div>

                <LineChart data={this.state.selectedData}/>

              </div>

              <div className="grid">

                <div className="cell-title">
                  <div className="title">Adoption Rate by Country</div>
                  <span className="special-span">Job Loss, Revenue Increase, and Market Share(s)</span>
                </div>

                <WorldMap data={this.state.selectedData}/>

              </div>

            </div>

          </>

        );
    }
}

export default App;