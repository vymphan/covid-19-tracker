import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";
import "./InfoBox.css";
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from "@material-ui/core/styles";
import InfoPopup from './InfoPopup';

function InfoBox({ title, cases, total, active, isRed, isGreen, isGrey, ...props }) {
  //Styling the pop-up
  const LightTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }))(Tooltip);

  //Default jsx for normal data
  let infoContent = (
    <h2
      className={`infoBox__cases  
          ${isRed && "infoBox--redText"}
          ${isGreen && "infoBox--greenText"}`}
    >
      {cases}
    </h2>
  );

  //Show pop-up when "No Data" is showed
  if (cases === "No Data") {
    const noData = "The data of this country is unavailable at the moment. Please check back later.";

    infoContent = (
      <LightTooltip title={noData} placement="top" arrow>
        {infoContent}
      </LightTooltip>
      );
  }

  //Setting contents for info icon of each case tile:
  let content = "N/A";
  switch (title) {
    case "New Cases":
      content = "The today's count of new active cases and the total count of all confirmed COVID-19 cases.";
      break;
    case "New Recovered":
      content = "The today's count of new recoveries and the total count of all confirmed COVID-19 recoveries.";
      break;
    case "New Deaths":
      content = "The today's count of new death and the total count of all confirmed deaths from the COVID-19 virus.";
      break;
    default:
      break;
  }

  return (
    <Card
      onClick={props.onClick}
      elevation={7}
      className={`infoBox ${active && "infoBox--selected"} 
      ${isRed && "infoBox--red"}
      ${isGreen && "infoBox--green"}
      ${isGrey && "infoBox--grey"}`}
    >
      <CardContent className="infoContent">
        <Typography id="infoBox__title" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        {infoContent}
        <Typography id="infoBox__total" color="textSecondary">
          {total} Total
        </Typography>
        <InfoPopup position="infoBox-icon" content={content} placement="bottom"/>
      </CardContent>
    </Card>
  );
}

export default InfoBox;
