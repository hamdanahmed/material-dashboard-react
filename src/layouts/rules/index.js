// src/layouts/rules/index.js

import React, { useState } from "react";
import { useQuery } from "@apollo/client";

// ─── MUI MATERIAL IMPORTS ─────────────────────────────────────────────────────
import Grid from "@mui/material/Grid";

// ─── MATERIAL DASHBOARD COMPONENTS ───────────────────────────────────────────
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

// ─── GRAPHQL IMPORTS ───────────────────────────────────────────────────────────
import { GET_ALL_RULES } from "graphql/queries/getRules";

// ─── DIALOG COMPONENTS ───────────────────────────────────────────
import RuleDialog from "./RuleDialog";
import RuleParametersDialog from "./RuleParametersDialog"; // NEW

const MATCH_TYPE_LABELS = {
    MATCH_TYPE_UNSPECIFIED: "—",
    MATCH_TYPE_ALL: "ALL",
    MATCH_TYPE_ANY: "ANY",
};

export default function Rules() {
    // ─────────────── DIALOG STATE ─────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentRuleId, setCurrentRuleId] = useState(null);
    const [currentRuleValues, setCurrentRuleValues] = useState(null);

    // ─────────────── VIEW PARAMETERS MODAL STATE ─────────────
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewRule, setViewRule] = useState(null);

    // Open “Edit” dialog, pre‐fill values from a given `node`
    const handleOpenDialog = (node) => {
        setCurrentRuleId(node.id);
        setCurrentRuleValues({
            id: node.id,
            name: node.name,
            description: node.description,
            isActive: node.isActive,
            matchType: node.matchType,
            analystID: node.analystID,
            createTime: node.createTime,
            updateTime: node.updateTime,
            Parameters: node.Parameters || [],
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
        refetch(); // re-run GET_ALL_RULES
        handleCloseDialog(); // hide the modal
    };

    // ─────────────── VIEW PARAMETERS HANDLERS ───────────────
    const handleViewParameters = (node) => {
        setViewRule(node);
        setViewDialogOpen(true);
    };

    const handleCloseViewDialog = () => {
        setViewRule(null);
        setViewDialogOpen(false);
    };

    // ─────────────── FETCH ALL RULES ───────────────────────────
    const { loading, error, data, refetch } = useQuery(GET_ALL_RULES);

    // Prepare `tableData.columns` & `tableData.rows`
    const tableData = {
        columns: [
            { Header: "Name", accessor: "name" },
            { Header: "Description", accessor: "description" },
            { Header: "Active", accessor: "active", align: "center" },
            { Header: "Match Type", accessor: "matchType" },
            { Header: "Analyst ID", accessor: "analystID" },
            { Header: "Created At", accessor: "createdAt" },
            { Header: "Updated At", accessor: "updatedAt" },
            { Header: "Action", accessor: "action", align: "center" },
        ],
        rows: [],
    };

    if (loading) {
        tableData.rows = [
            {
                name: "Loading…",
                description: "",
                active: "",
                matchType: "",
                analystID: "",
                createdAt: "",
                updatedAt: "",
                action: "",
            },
        ];
    } else if (error || !data?.rules?.edges) {
        tableData.rows = [
            {
                name: "Error loading data",
                description: "",
                active: "",
                matchType: "",
                analystID: "",
                createdAt: "",
                updatedAt: "",
                action: "",
            },
        ];
    } else {
        tableData.rows = data.rules.edges.map(({ node }) => {
            const createdAtLabel = node.createTime
                ? new Date(node.createTime).toLocaleString()
                : "—";
            const updatedAtLabel = node.updateTime
                ? new Date(node.updateTime).toLocaleString()
                : "—";
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
            const matchTypeLabel = MATCH_TYPE_LABELS[node.matchType] || "—";
            const actionButton = (
                <MDBox display="flex" gap={1}>
                    <MDBox
                        component="button"
                        variant="contained"
                        color="dark"
                        sx={{
                            border: "none",
                            backgroundColor: ({ palette: { dark } }) => dark.main,
                            color: ({ palette: { white } }) => white.main,
                            px: 2,
                            py: 0.5,
                            borderRadius: "5px",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() => handleOpenDialog(node)}
                    >
                        Edit&nbsp;
                        <MDTypography display="inline" variant="button">
                            <i className="fas fa-pen" />
                        </MDTypography>
                    </MDBox>
                    <MDBox
                        component="button"
                        variant="contained"
                        color="info"
                        sx={{
                            border: "none",
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            px: 2,
                            py: 0.5,
                            borderRadius: "5px",
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                        }}
                        onClick={() => handleViewParameters(node)}
                    >
                        View
                    </MDBox>
                </MDBox>
            );

            return {
                name: node.name || "—",
                description: node.description || "—",
                active: activeCell,
                matchType: matchTypeLabel,
                analystID: node.analystID || "—",
                createdAt: createdAtLabel,
                updatedAt: updatedAtLabel,
                action: actionButton,
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

            {/* ─── VIEW PARAMETERS DIALOG ────────────────────────────────── */}
            <RuleParametersDialog
                open={viewDialogOpen}
                onClose={handleCloseViewDialog}
                rule={viewRule}
            />

            <Footer />
        </DashboardLayout>
    );
}
