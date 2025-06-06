/**
 =========================================================
 * Fraud Detection System - FDS - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 ==========================================================
 */

/**
 All of the routes for the Fraud Detection System - FDS are added here.
 You can add a new route, customize routes, or delete routes here.

 Once you add a new route in this file it will automatically appear
 in the Sidenav.

 For adding a new route you can follow the existing routes in the routes array:
 1. The `type` key with value `"collapse"` is used for a route.
 2. The `type` key with value `"title"` is used for a section header in the Sidenav.
 3. The `type` key with value `"divider"` is used for a divider in the Sidenav.
 4. The `name` key is used for the display name of the route in the Sidenav.
 5. The `key` key is used as the unique key prop inside a loop.
 6. The `icon` key is used to show an icon next to the name in the Sidenav.
 7. The `route` key is used as the React Router path (e.g. `/dashboard`).
 8. The `component` key is the React element to render at that route.
 */

// Fraud Detection System – FDS layouts
import Dashboard      from "layouts/dashboard";
import Tables         from "layouts/tables";
import Rules          from "layouts/rules";          // ← NEW: import our Rules layout
import Billing        from "layouts/billing";
import RTL            from "layouts/rtl";
import Notifications  from "layouts/notifications";
import Profile        from "layouts/profile";
import SignIn         from "layouts/authentication/sign-in";
import SignUp         from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Transactions",
    key: "transactions",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Rules",                       // ← NEW “Rules” entry
    key: "rules",
    icon: <Icon fontSize="small">gavel</Icon>,
    route: "/rules",
    component: <Rules />,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
  },
  {
    type: "collapse",
    name: "RTL",
    key: "rtl",
    icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
    route: "/rtl",
    component: <RTL />,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
