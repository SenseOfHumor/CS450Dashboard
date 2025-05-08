import React, { Component } from "react";
import WorldMap from "./WorldMap";
// import Sunburst from "./Sunburst";
// import ForceGraph from "./ForceGraph";
import * as d3 from "d3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedIndustry: "Finance", // def industry
    };
  }

  componentDidMount() {
    d3.csv("/Global_AI_Content_Impact_Dataset.csv").then(data => {
      this.setState({ data });
    });
  }

  handleIndustryChange = (event) => {
    this.setState({ selectedIndustry: event.target.value });
  };

  render() {
    const { data, selectedIndustry } = this.state;
    const industries = [...new Set(data.map(d => d.Industry))]; // unique industries

    return (
      <div>
        <h1>Brr Brr Patabim</h1>

        {/* industry Selector */}
        <select onChange={this.handleIndustryChange} value={selectedIndustry}>
          {industries.map((industry, idx) => (
            <option key={idx} value={industry}>
              {industry}
            </option>
          ))}
        </select>

        <WorldMap data={data} selectedIndustry={selectedIndustry} />
        {/* <Sunburst data={data} selectedIndustry={selectedIndustry} /> */}
        {/* <ForceGraph data={data} selectedIndustry={selectedIndustry} /> */}
      </div>
    );
  }
}

export default App;
