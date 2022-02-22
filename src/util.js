import React from "react";
import numeral from "numeral";
import { Circle, Popup } from "react-leaflet";

export const casesTypeColors = {
  cases: {
    hex: "#ffa500",
    rgb: "rgb(255, 165, 0)",
    half_op: "rgba(255, 165, 0, 0.5)",
    multiplier: 400,
  },
  recovered: {
    hex: "#0059ff",
    rgb: "rgb(0, 89, 255)",
    half_op: "rgba(0, 89, 255, 0.5)",
    multiplier: 600,
  },
  deaths: {
    hex: "#6e6e6e",
    rgb: "rgb(110, 110, 110)",
    half_op: "rgba(110, 110, 110, 0.5)",
    multiplier: 2000,
  },
};

function util() {
  return <div></div>;
}

export default util;

export const prettyPrintStat = (stat) =>
  stat ? `${numeral(stat).format("0,0")}` : "No Data";

export const sortData = (data, key = "cases") => {
  const sortedData = [...data];

  sortedData.sort((a, b) => {
    if (a[key] > b[key]) {
      return -1;
    } else {
      return 1;
    }
  });

  return sortedData;
};

export const epochToDate = (epoch) => {
  const d = new Date(0);
  d.setUTCMilliseconds(epoch);
  return d;
};

//Draw circles on the map
export const showDataOnMap = (data, casesType = "cases") =>
  data.map((country) => (
    <Circle
      key={country.country}
      center={[country.countryInfo.lat, country.countryInfo.long]}
      fillOpacity={0.4}
      color={casesTypeColors[casesType].hex}
      fillColor={casesTypeColors[casesType].hex}
      radius={
        Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier
      }
    >
      <Popup>
        <div className="info-container">
          <div
            className="info-flag"
            style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
          />
          <div className="info-name">{country.country}</div>
          <div className="info-confirmed">
            Cases: {numeral(country.cases).format("0,0")}
          </div>
          <div className="info-recovered">
            Recovered: {numeral(country.recovered).format("0,0")}
          </div>
          <div className="info-deaths">
            Deaths: {numeral(country.deaths).format("0,0")}
          </div>
          {country.updated &&
            <div className="info-asoftime">
              Data as of:<br/>{epochToDate(country.updated).toLocaleString()}
            </div>
          }
        </div>
      </Popup>
    </Circle>
  ));
