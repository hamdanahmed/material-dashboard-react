// src/layouts/tables/index.js

/**
 =========================================================
 * Fraud Detection System - FDS - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * This page now displays three separate “Transactions” tables:
 *   1. Flagged Transactions
 *   2. Escalated Transactions
 *   3. In-Review Transactions
 *
 * Each table uses the same set of columns, but filters
 * the rows according to each category. We re-use the
 * GET_ALL_CLIENT_TRANSACTIONS query to fetch everything,
 * then split on the client side.
 */

// ─── MUI MATERIAL IMPORTS ─────────────────────────────────────────────────────
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// ─── FRAUD DETECTION SYSTEM COMPONENTS ────────────────────────────────────────
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// ─── FRAUD DETECTION SYSTEM EXAMPLES ──────────────────────────────────────────
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// ─── GRAPHQL IMPORTS ───────────────────────────────────────────────────────────
import { useQuery } from "@apollo/client";
import { GET_ALL_CLIENT_TRANSACTIONS } from "graphql/queries/getTransactionCount";

// ─── ENUM-TO-LABEL MAPS ─────────────────────────────────────────────────────────
// These must match exactly the proto enum names from your backend.
const TYPE_LABELS = {
  TRANSACTION_TYPE_UNSPECIFIED: "—",
  TRANSACTION_TYPE_DEPOSIT:     "Deposit",
  TRANSACTION_TYPE_WITHDRAWAL:  "Withdrawal",
};

const STATUS_LABELS = {
  TRANSACTION_STATUS_UNSPECIFIED: "—",
  TRANSACTION_STATUS_PENDING:     "Pending",
  TRANSACTION_STATUS_COMPLETED:   "Completed",
  TRANSACTION_STATUS_FAILED:      "Failed",
};

const REVIEW_LABELS = {
  REVIEW_STATUS_UNSPECIFIED:  "—",
  REVIEW_STATUS_FLAGGED:      "Flagged",
  REVIEW_STATUS_PENDING:      "Pending Review",
  REVIEW_STATUS_IN_REVIEW:    "In Review",
  REVIEW_STATUS_ESCALATED:    "Escalated",
  REVIEW_STATUS_REJECTED:     "Rejected",
  REVIEW_STATUS_APPROVED:     "Approved",
  REVIEW_STATUS_COMPLETED:    "Completed Review",
};

const ADDITIONAL_INFO_STATUS_LABELS = {
  ADDITIONAL_INFO_STATUS_UNSPECIFIED: "—",
  ADDITIONAL_INFO_STATUS_REQUESTED:   "Requested",
  ADDITIONAL_INFO_STATUS_RECEIVED:    "Received",
  ADDITIONAL_INFO_STATUS_IN_REVIEW:   "In Review",
  ADDITIONAL_INFO_STATUS_COMPLETED:   "Completed",
};

const ADDITIONAL_INFO_TYPE_LABELS = {
  ADDITIONAL_INFO_TYPE_UNSPECIFIED:     "—",
  ADDITIONAL_INFO_TYPE_WAIVER:          "Waiver",
  ADDITIONAL_INFO_TYPE_SOURCE_OF_FUNDS: "Source of Funds",
  ADDITIONAL_INFO_TYPE_OTHER:           "Other",
};

// ─── COLUMN DEFINITIONS ────────────────────────────────────────────────────────
// We use the same columns for all three tables:
const TRANSACTION_COLUMNS = [
  { Header: "Created At",            accessor: "createdAt",            align: "left"   },
  { Header: "Amount (USD)",          accessor: "amount",               align: "left"   },
  { Header: "Type",                  accessor: "transactionType",      align: "center" },
  { Header: "Status",                accessor: "status",               align: "center" },
  { Header: "Flagged Reason",        accessor: "flaggedReason",        align: "center" },
  { Header: "Review Status",         accessor: "reviewStatus",         align: "center" },
  { Header: "Additional Info Status",accessor: "additionalInfoStatus", align: "center" },
  { Header: "Additional Info Type",  accessor: "additionalInfoType",   align: "center" },
];

// Helper: given one node, build a “row” that matches TRANSACTION_COLUMNS
const mapNodeToRow = (node) => {
  // 1) “Created At” and “Amount”
  const createdAtLabel = node.createTime
      ? new Date(node.createTime).toLocaleString()
      : "—";
  const amountLabel = node.amount
      ? `$${parseFloat(node.amount).toFixed(2)}`
      : "—";

  // 2) “Type” text
  const typeKey = node.transactionType || "TRANSACTION_TYPE_UNSPECIFIED";
  const typeLabel = TYPE_LABELS[typeKey] || "Unknown";

  // 3) “Status” text
  const statusKey = node.status || "TRANSACTION_STATUS_UNSPECIFIED";
  const statusLabel = STATUS_LABELS[statusKey] || "Unknown";

  // 4) “Flagged Reason” (or dash)
  const flaggedReasonLabel = node.flaggedReason || "—";

  // 5) “Review Status”
  const reviewKey = node.reviewStatus || "REVIEW_STATUS_UNSPECIFIED";
  const reviewLabel = REVIEW_LABELS[reviewKey] || "Unknown";

  // 6) “Additional Info Status”
  const addInfoStatusKey = node.additionalInfoStatus || "ADDITIONAL_INFO_STATUS_UNSPECIFIED";
  const addInfoStatusLabel = ADDITIONAL_INFO_STATUS_LABELS[addInfoStatusKey] || "Unknown";

  // 7) “Additional Info Type”
  const addInfoTypeKey = node.additionalInfoType || "ADDITIONAL_INFO_TYPE_UNSPECIFIED";
  const addInfoTypeLabel = ADDITIONAL_INFO_TYPE_LABELS[addInfoTypeKey] || "Unknown";

  return {
    createdAt:             createdAtLabel,
    amount:                amountLabel,
    transactionType:       typeLabel,
    status:                statusLabel,
    flaggedReason:         flaggedReasonLabel,
    reviewStatus:          reviewLabel,
    additionalInfoStatus:  addInfoStatusLabel,
    additionalInfoType:    addInfoTypeLabel,
  };
};

// ───────────────────────────────────────────────────────────────────────────────
export default function Tables() {
  // 1) Fetch all transactions via GraphQL
  const { loading, error, data: txData } = useQuery(GET_ALL_CLIENT_TRANSACTIONS);

  // 2) Prepare “Loading…” and “Error…” row sets for each table
  const LOADING_ROW = {
    createdAt:            "Loading…",
    amount:               "",
    transactionType:      "",
    status:               "",
    flaggedReason:        "",
    reviewStatus:         "",
    additionalInfoStatus: "",
    additionalInfoType:   "",
  };
  const ERROR_ROW = {
    createdAt:            "Error loading data",
    amount:               "",
    transactionType:      "",
    status:               "",
    flaggedReason:        "",
    reviewStatus:         "",
    additionalInfoStatus: "",
    additionalInfoType:   "",
  };

  // 3) Once data arrives, split into three categories
  let flaggedRows     = [];
  let escalatedRows   = [];
  let inReviewRows    = [];

  if (!loading && !error && txData?.clientTransactions?.edges) {
    txData.clientTransactions.edges.forEach(({ node }) => {
      // Convert a single node into a “row object”
      const row = mapNodeToRow(node);

      // If it has a flaggedReason → “Flagged” table
      if (node.flaggedReason || node.reviewStatus === "REVIEW_STATUS_FLAGGED") {
        flaggedRows.push(row);
      }

      // If reviewStatus === “REVIEW_STATUS_ESCALATED”
      if (node.reviewStatus === "REVIEW_STATUS_ESCALATED") {
        escalatedRows.push(row);
      }

      // If reviewStatus === “REVIEW_STATUS_IN_REVIEW”
      if (node.reviewStatus === "REVIEW_STATUS_IN_REVIEW") {
        inReviewRows.push(row);
      }
    });
  }

  // 4) Decide final rows array for each table (loading / error / actual)
  const flaggedTableRows = loading
      ? [LOADING_ROW]
      : error
          ? [ERROR_ROW]
          : flaggedRows.length > 0
              ? flaggedRows
              : [
                {
                  ...ERROR_ROW,
                  createdAt: "No flagged transactions",
                },
              ];

  const escalatedTableRows = loading
      ? [LOADING_ROW]
      : error
          ? [ERROR_ROW]
          : escalatedRows.length > 0
              ? escalatedRows
              : [
                {
                  ...ERROR_ROW,
                  createdAt: "No escalated transactions",
                },
              ];

  const inReviewTableRows = loading
      ? [LOADING_ROW]
      : error
          ? [ERROR_ROW]
          : inReviewRows.length > 0
              ? inReviewRows
              : [
                {
                  ...ERROR_ROW,
                  createdAt: "No in-review transactions",
                },
              ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
      <DashboardLayout>
        <DashboardNavbar />

        <MDBox pt={6} pb={3}>
          <Grid container spacing={6}>

            {/* ─── FLAGGED TRANSACTIONS TABLE ───────────────────────────────── */}
            <Grid item xs={12}>
              <Card>
                <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="info"
                    borderRadius="lg"
                    coloredShadow="info"
                >
                  <MDTypography variant="h6" color="white">
                    Flagged Transactions
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                      table={{ columns: TRANSACTION_COLUMNS, rows: flaggedTableRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>

            {/* ─── ESCALATED TRANSACTIONS TABLE ─────────────────────────────── */}
            <Grid item xs={12}>
              <Card>
                <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="success"
                    borderRadius="lg"
                    coloredShadow="success"
                >
                  <MDTypography variant="h6" color="white">
                    Escalated Transactions
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                      table={{ columns: TRANSACTION_COLUMNS, rows: escalatedTableRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>

            {/* ─── IN-REVIEW TRANSACTIONS TABLE ──────────────────────────────── */}
            <Grid item xs={12}>
              <Card>
                <MDBox
                    mx={2}
                    mt={-3}
                    py={3}
                    px={2}
                    variant="gradient"
                    bgColor="dark"
                    borderRadius="lg"
                    coloredShadow="dark"
                >
                  <MDTypography variant="h6" color="white">
                    In-Review Transactions
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                      table={{ columns: TRANSACTION_COLUMNS, rows: inReviewTableRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                  />
                </MDBox>
              </Card>
            </Grid>

          </Grid>
        </MDBox>

        <Footer />
      </DashboardLayout>
  );
}
