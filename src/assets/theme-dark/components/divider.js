/**
=========================================================
* Fraud Detection System - FDS - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Fraud Detection System - FDS base styles
import colors from "assets/theme-dark/base/colors";

// Fraud Detection System - FDS helper functions
import rgba from "assets/theme-dark/functions/rgba";
import pxToRem from "assets/theme-dark/functions/pxToRem";

const { dark, transparent, white } = colors;

const divider = {
  styleOverrides: {
    root: {
      backgroundColor: transparent.main,
      backgroundImage: `linear-gradient(to right, ${rgba(dark.main, 0)}, ${white.main}, ${rgba(
        dark.main,
        0
      )}) !important`,
      height: pxToRem(1),
      margin: `${pxToRem(16)} 0`,
      borderBottom: "none",
      opacity: 0.25,
    },

    vertical: {
      backgroundColor: transparent.main,
      backgroundImage: `linear-gradient(to bottom, ${rgba(dark.main, 0)}, ${white.main}, ${rgba(
        dark.main,
        0
      )}) !important`,
      width: pxToRem(1),
      height: "100%",
      margin: `0 ${pxToRem(16)}`,
      borderRight: "none",
    },

    light: {
      backgroundColor: transparent.main,
      backgroundImage: `linear-gradient(to right, ${rgba(white.main, 0)}, ${rgba(
        dark.main,
        0.4
      )}, ${rgba(white.main, 0)}) !important`,

      "&.MuiDivider-vertical": {
        backgroundImage: `linear-gradient(to bottom, ${rgba(white.main, 0)}, ${rgba(
          dark.main,
          0.4
        )}, ${rgba(white.main, 0)}) !important`,
      },
    },
  },
};

export default divider;
