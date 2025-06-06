// src/layouts/rules/index.js

/**
 =========================================================
 * Rules Management Page
 *
 * - Fetches all rules (using your existing GET_ALL_RULES).
 * - Shows them in a table with columns: Name, Description, Active, Match Type,
 *   Analyst ID, Created At, Updated At, and an “Edit” button.
 * - Renders “Active” as a green/red badge.
 * - Provides an “Add New Rule” button to open RuleDialog in “create” mode.
 * - Clicking “Edit” opens RuleDialog in “edit” mode, passing the existing rule.
 =========================================================
 */

import React, { useState } from "react";
import { useQuery } from "@apollo/client";

// ─── MUI MATERIAL IMPORTS ─────────────────────────────────────────────────────
import Grid from "@mui/material/Grid";

// ─── MATERIAL DASHBOARD COMPONENTS ───────────────────────────────────────────
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar  from "examples/Navbars/DashboardNavbar";
import Footer           from "examples/Footer";
import MDBox            from "components/MDBox";
import MDTypography     from "components/MDTypography";
import DataTable        from "examples/Tables/DataTable";

// ─── GRAPHQL IMPORTS ───────────────────────────────────────────────────────────
import { GET_ALL_RULES } from "graphql/queries/getRules";

// ─── DIALOG COMPONENT FOR ADD / EDIT RULE ────────────────────────────────────
// (Assumes you have a RuleDialog at this path)
import RuleDialog from "./RuleDialog";

/**
 * MATCH_TYPE_LABELS
 * Matches exactly your proto’s enum names → display text.
 */
const MATCH_TYPE_LABELS = {
    MATCH_TYPE_UNSPECIFIED: "—",
    MATCH_TYPE_ALL:         "ALL",
    MATCH_TYPE_ANY:         "ANY",
};

/**
 * Rules
 * Renders the “Rules Management” page: table + “Add New Rule” button + RuleDialog.
 */
export default function Rules() {
    // ─────────────── DIALOG STATE ─────────────────────────────
    // `dialogOpen`: whether the modal is visible
    // `currentRuleId`: id of the rule being edited (null = “Add New”)
    // `currentRuleValues`: object containing all fields for existing rule, or null
    const [dialogOpen, setDialogOpen]       = useState(false);
    const [currentRuleId, setCurrentRuleId] = useState(null);
    const [currentRuleValues, setCurrentRuleValues] = useState(null);

    // Open “Edit” dialog, pre‐fill values from a given `node`
    const handleOpenDialog = (node) => {
        setCurrentRuleId(node.id);
        setCurrentRuleValues({
            id:          node.id,
            name:        node.name,
            description: node.description,
            isActive:    node.isActive,
            matchType:   node.matchType,
            analystID:   node.analystID,
            createTime:  node.createTime,
            updateTime:  node.updateTime,
            // Note: your simple GET_ALL_RULES does not fetch “parameters” yet,
            // so we omit them here. If you add them later, pass them on.
            parameters:  [],
        });
        setDialogOpen(true);
    };

    // Open “Add New Rule” dialog (no pre‐fill)
    const handleNewRule = () => {
        setCurrentRuleId(null);
        setCurrentRuleValues(null);
        setDialogOpen(true);
    };

    // Close the dialog & reset local state
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setCurrentRuleId(null);
        setCurrentRuleValues(null);
    };

    // Called after RuleDialog successfully creates/updates a rule
    const handleSaveSuccess = () => {
        refetch();            // re-run GET_ALL_RULES
        handleCloseDialog();  // hide the modal
    };

    // ─────────────── FETCH ALL RULES ───────────────────────────
    const { loading, error, data, refetch } = useQuery(GET_ALL_RULES);

    // Prepare `tableData.columns` & `tableData.rows`
    const tableData = {
        columns: [
            { Header: "Name",        accessor: "name" },
            { Header: "Description", accessor: "description" },
            { Header: "Active",      accessor: "active",      align: "center" },
            { Header: "Match Type",  accessor: "matchType" },
            { Header: "Analyst ID",  accessor: "analystID" },
            { Header: "Created At",  accessor: "createdAt" },
            { Header: "Updated At",  accessor: "updatedAt" },
            { Header: "Action",      accessor: "action",      align: "center" },
        ],
        rows: [],
    };

    if (loading) {
        // While loading, show a single placeholder row
        tableData.rows = [
            {
                name:        "Loading…",
                description: "",
                active:      "",
                matchType:   "",
                analystID:   "",
                createdAt:   "",
                updatedAt:   "",
                action:      "",
            },
        ];
    } else if (error || !data?.rules?.edges) {
        // On error (or missing data), show a single “Error” row
        tableData.rows = [
            {
                name:        "Error loading data",
                description: "",
                active:      "",
                matchType:   "",
                analystID:   "",
                createdAt:   "",
                updatedAt:   "",
                action:      "",
            },
        ];
    } else {
        // Map each rule node → DataTable row
        tableData.rows = data.rules.edges.map(({ node }) => {
            // 1) Format createdAt / updatedAt if present
            const createdAtLabel = node.createTime
                ? new Date(node.createTime).toLocaleString()
                : "—";
            const updatedAtLabel = node.updateTime
                ? new Date(node.updateTime).toLocaleString()
                : "—";

            // 2) “Active” badge: green if true, red if false
            const activeCell = (
                <MDBox
                    px={1.5}
                    py={0.5}
                    variant="gradient"
                    bgColor={node.isActive ? "success" : "error"}
                    borderRadius="md"
                    textAlign="center"
                    sx={{ display: "inline-block" }}
                >
                    {node.isActive ? "Yes" : "No"}
                </MDBox>
            );

            // 3) “Match Type” label (use your map, or show dash if missing)
            const matchTypeLabel = MATCH_TYPE_LABELS[node.matchType] || "—";

            // 4) “Edit” button
            const actionButton = (
                <MDBox
                    component="button"
                    variant="contained"
                    color="dark"
                    sx={{
                        border:          "none",
                        backgroundColor: ({ palette: { dark } }) => dark.main,
                        color:           ({ palette: { white } }) => white.main,
                        px: 2,
                        py: 0.5,
                        borderRadius: "5px",
                        cursor:       "pointer",
                        "&:hover":  { opacity: 0.8 },
                    }}
                    onClick={() => handleOpenDialog(node)}
                >
                    Edit&nbsp;
                    <MDTypography display="inline" variant="button">
                        <i className="fas fa-pen" />
                    </MDTypography>
                </MDBox>
            );

            return {
                name:        node.name || "—",
                description: node.description || "—",
                active:      activeCell,
                matchType:   matchTypeLabel,
                analystID:   node.analystID || "—",
                createdAt:   createdAtLabel,
                updatedAt:   updatedAtLabel,
                action:      actionButton,
            };
        });
    }

    // ─────────────── RENDER PAGE ───────────────────────────────
    return (
        <DashboardLayout>
            <DashboardNavbar />

            {/* ─── HEADER + “Add New Rule” BUTTON ───────────────────────── */}
            <MDBox mt={4} mb={2} mx={2}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <MDTypography variant="h5" fontWeight="medium">
                            Rule Management
                        </MDTypography>
                        <MDTypography variant="caption" color="text">
                            All Rules ({data?.rules?.edges?.length ?? 0})
                        </MDTypography>
                    </Grid>
                    <Grid item>
                        <MDBox
                            component="button"
                            variant="contained"
                            color="info"
                            sx={{
                                border: "none",
                                px: 2,
                                py: 0.5,
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": { opacity: 0.8 },
                            }}
                            onClick={handleNewRule}
                        >
                            +&nbsp;Add New Rule
                        </MDBox>
                    </Grid>
                </Grid>
            </MDBox>

            {/* ─── RULES DATA TABLE ───────────────────────────────────────── */}
            <MDBox mx={2} mb={3}>
                <DataTable
                    table={tableData}
                    isSorted={false}
                    entriesPerPage={true}
                    showTotalEntries={true}
                    noEndBorder
                />
            </MDBox>

            {/* ─── ADD / EDIT DIALOG ─────────────────────────────────────── */}
            <RuleDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                existingRule={currentRuleValues}
                onSaveSuccess={handleSaveSuccess}
            />

            <Footer />
        </DashboardLayout>
    );
}
