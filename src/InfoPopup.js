import React from 'react';
import Tooltip from "@material-ui/core/Tooltip";
import { withStyles } from "@material-ui/core/styles";
import './InfoPopup.css';

function InfoPopup( props ) {

  const LightTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }))(Tooltip);

  return (
    <LightTooltip title={props.content} placement={props.placement} arrow>
      <div className={props.position}>
        <i class="fa fa-info-circle" aria-hidden="true"></i>
      </div>
    </LightTooltip>
  );
};

export default InfoPopup;
