import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import { casesTypeColors } from "./util";
import moment from "moment";

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      title: function (tooltipItem, data) {
        const m = moment(tooltipItem[0].xLabel, "MMM D, YYYY");
        const format = "MMM D";
        return m.format(format) + " - " + m.add(7, 'd').format(format);
      },
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
          stepSize: 7,
        },
        ticks: {
          callback: function (value, index, values) {
            const m = moment(new Date(values[index].value));
            const format = "MMM D";
            return m.add(7, 'd').format(format);
          },
        }
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
          beginAtZero: true,
          min: 0,
        },
      },
    ],
  },
};

const buildChartData = (data, casesType) => {
  const chartData = [];
  const caseData = data[casesType];
  let days = 0;
  let weekEndCount;
  let weekEndDate;
  for (const date of Object.keys(caseData).reverse()) {
    if (days === 0) {
      if (weekEndDate) {
        chartData.push({
          x: date + "-" + weekEndDate,
          y: weekEndCount - caseData[date],
        });
      }
      weekEndDate = date;
      weekEndCount = caseData[date];
    }
    days = (days + 1) % 7;
  }
  return chartData;
};

function LineGraph({ casesType="cases", country="worldwide", ...props }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetch("https://disease.sh/v3/covid-19/historical/" + (country === "worldwide" ? "all" : country) + "?lastdays=" + (24 * 7))
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.timeline)
          {
            data = data.timeline;
          }
          let chartData = buildChartData(data, casesType);
          setData(chartData);
          // buildChart(chartData);
        });
    };

    fetchData();
  }, [casesType, country]);

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: casesTypeColors[casesType].half_op,
                borderColor: casesTypeColors[casesType].rgb,
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
      {!data.length && (
        "No data found."
      )}
    </div>
  );
}

export default LineGraph;
