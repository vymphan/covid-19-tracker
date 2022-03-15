import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import DataTable from "./DataTable";
import { sortData, prettyPrintStat, epochToDate } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";
import bannerImage from "./img/virus-enhanced.png";
import InfoPopup from './InfoPopup';

const App = () => {
  const worldwideLatLng = { lat: 34.80746, lng: -40.4796 };
  const worldwideZoom = 2.5;

  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState(worldwideLatLng);
  const [mapZoom, setMapZoom] = useState(worldwideZoom);
  const [statesData, setStatesData] = useState([]);
  const [countriesData, setCountriesData] = useState([]);
  const [stateType, setStateType] = useState("Country");
  const [asOfDate, setAsOfDate] = useState(null);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
        setAsOfDate(epochToDate(data.updated));
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedData = sortData(data, casesType);
          setCountries(countries);
          setMapCountries(data);
          setCountriesData(sortedData);
        });
    };

    getCountriesData();
  }, [casesType]);

  useEffect(() => {
    const getStatesData = async () => {
      fetch("https://disease.sh/v3/covid-19/states?allowNull=true")
        .then((response) => response.json())
        .then((data) => {
          let sortedData = sortData(data, casesType);
          setStatesData(sortedData);
        });
    };

    getStatesData();
  }, [casesType]);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const isWorldwide = (countryCode === "worldwide");
    const url =
        isWorldwide
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        if (isWorldwide) {
          setMapCenter(worldwideLatLng)
          setMapZoom(worldwideZoom);
        }
        else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        }
        setAsOfDate(epochToDate(data.updated));

        //this overrides the cached data that is used for the map with the most recent info,
        //so that the tiles and the map popup are in sync with each other
        let overrideMap = mapCountries;
        overrideMap.forEach((currentCountry, index) => {
          if (currentCountry.countryInfo.iso2 === countryCode) {
            // if (overrideMap[index].cases != data.cases
            //   || overrideMap[index].deaths != data.deaths
            //   || overrideMap[index].recovered != data.recovered
            //   || overrideMap[index].todayCases != data.todayCases
            //   || overrideMap[index].todayDeaths != data.todayDeaths
            //   || overrideMap[index].todayRecovered != data.todayRecovered
            // )
            // {
            //   console.log("old:", overrideMap[index]);
            //   console.log("new:", data);
            // }
            overrideMap[index] = data;
            setMapCountries(overrideMap);
            return false;
          }
        });
      });

    if (countryCode === "US")
    {
      setStateType("States and Territories");
    }
    else {
      setStateType("Country");
    }
  };

  const refTop = useRef(null);
  const refMap = useRef(null);
  const refBot = useRef(null);
  const goto = (ref) => ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div id="top" className="app" ref={refTop}>
      <div className="app__header">
        <div className="app__banner">
          <img src={bannerImage} alt="Banner" className="app__bannerImage" />
        </div>
        <div className="app__titleContainer">
          <h2>COVID-19 TRACKER</h2>
          <p>Stay Home . Stay Safe</p>
        </div>
      </div>

      <div className="app__dropdownContainer">
        <FormControl className="app__dropdown">
          <Select variant="outlined" value={country} onChange={onCountryChange}>
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.value} value={country.value}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="app__stats">
        {asOfDate && (
          <div className="app__asOfDate">
            Data as of {asOfDate.toLocaleString()}
          </div>
        )}
        <InfoBox
          onClick={(e) => setCasesType("cases")}
          title="New Cases"
          isRed
          active={casesType === "cases"}
          cases={prettyPrintStat(countryInfo.todayCases)}
          total={numeral(countryInfo.cases).format("0,0")}
        />
        <InfoBox
          onClick={(e) => setCasesType("recovered")}
          title="New Recovered"
          isGreen
          active={casesType === "recovered"}
          cases={prettyPrintStat(countryInfo.todayRecovered)}
          total={numeral(countryInfo.recovered).format("0,0")}
        />
        <InfoBox
          onClick={(e) => setCasesType("deaths")}
          title="New Deaths"
          isGrey
          active={casesType === "deaths"}
          cases={prettyPrintStat(countryInfo.todayDeaths)}
          total={numeral(countryInfo.deaths).format("0,0")}
        />
      </div>

      <div className="app__travelInfo">
        <a
          href="https://www.cdc.gov/coronavirus/2019-ncov/travelers/map-and-travel-notices.html#travel-1"
          rel="noopener noreferrer"
          target="_blank"
        >
          <button class="button button1">
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>{" "}
            Countries on high risk to travel due to COVID-19 by CDC guidelines -
            Check it out !{" "}
          </button>
        </a>
      </div>

      <div id="map" className="app__map" ref={refMap}>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <div className="app__table__graph">
        <Card className="app__tableContainer">
          <CardContent>
            <div className="app__table">
              <h3>Live Cases by {stateType}</h3>
              <DataTable
                stateType={stateType}
                casesType={casesType}
                data={
                  stateType === "States and Territories"
                    ? statesData
                    : countriesData
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="app__table__graph">
        <Card className="app__graphContainer">
          <CardContent>
            <h3>
              {countryInfo.country ?? "Worldwide"} new {casesType}
            </h3>
            <InfoPopup
              position="infoGraph-icon"
              content={"Graph shows Data from last 24 weeks"}
              placement="left"
            />
            <LineGraph
              casesType={casesType}
              country={country}
              className="app__graph"
            />
          </CardContent>
        </Card>
      </div>

      <div id="bottom" className="app__footer" ref={refBot}>
        <h2 className="app__footerTitle">INFORMATION</h2>
        <div className="app__footerInfo">
          <p>
            Data source:{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://disease.sh/"
            >
              Disease.sh API
            </a>
          </p>
          <p>
            For more information about the COVID-19 pandemic, please visits{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.cdc.gov/"
            >
              www.cdc.gov
            </a>
          </p>
          <p>
            Questions?{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:vy.m.phan@gmail.com"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
      <div class="app__sticky">
        <ul>
          <li>
            <a onClick={(e) => goto(refTop)}>
              <i class="fa fa-chevron-up" aria-hidden="true"></i>
            </a>
          </li>
          <li>
            <a onClick={(e) => goto(refMap)}>
              <i class="fa fa-map" aria-hidden="true"></i>
            </a>
          </li>
          <li>
            <a onClick={(e) => goto(refBot)}>
              <i class="fa fa-chevron-down" aria-hidden="true"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default App;
