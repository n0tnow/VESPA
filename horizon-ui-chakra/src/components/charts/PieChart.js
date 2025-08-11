import React from "react";
import ReactApexChart from "react-apexcharts";

class PieChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chartData: [],
      chartOptions: {},
    };
  }

  componentDidMount() {
    this.setState({
      chartData: this.props.chartData,
      chartOptions: this.props.chartOptions,
    });
  }

  componentDidUpdate(prevProps) {
    const dataChanged = JSON.stringify(prevProps.chartData) !== JSON.stringify(this.props.chartData);
    const optionsChanged = JSON.stringify(prevProps.chartOptions) !== JSON.stringify(this.props.chartOptions);
    if (dataChanged || optionsChanged) {
      this.setState({
        chartData: this.props.chartData,
        chartOptions: this.props.chartOptions,
      });
    }
  }

  render() {
    return (
      <ReactApexChart
        options={this.state.chartOptions}
        series={this.state.chartData}
        type='pie'
        width='100%'
        height='100%'
      />
    );
  }
}

export default PieChart;
