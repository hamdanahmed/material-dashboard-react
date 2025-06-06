// src/layouts/dashboard/index.js

/**
 =========================================================
 * Fraud Detection System - FDS - v2.2.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/material-dashboard-react
 * Copyright 2023 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================
 */

// ─── MUI MATERIAL IMPORTS ─────────────────────────────────────────────────────
import React from "react";
import Grid from "@mui/material/Grid";

// ─── MATERIAL DASHBOARD COMPONENTS ───────────────────────────────────────────
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// ─── GRAPHQL IMPORTS ───────────────────────────────────────────────────────────
import { useQuery } from "@apollo/client";
import { GET_ALL_CLIENT_TRANSACTIONS } from "../../graphql/queries/getTransactionCount";

// ─── DASHBOARD SUB-COMPONENTS ─────────────────────────────────────────────────
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
    // ─── 1) RUN THE GRAPHQL QUERY ───────────────────────────────────────────────
    // We assume GET_ALL_CLIENT_TRANSACTIONS now fetches `reviewStatus` along with other fields.
    const { loading: txLoading, error: txError, data: txData } = useQuery(
        GET_ALL_CLIENT_TRANSACTIONS
    );

    // ─── 2) COMPUTE TODAY’S LOCAL “YYYY-MM-DD” ──────────────────────────────────
    // Construct a “2025-06-03”‐style string in local time (so the “today” filter matches user locale).
    const now = new Date();
    const localYear = now.getFullYear();
    const localMonth = String(now.getMonth() + 1).padStart(2, "0"); // zero‐pad month
    const localDay = String(now.getDate()).padStart(2, "0"); // zero‐pad day
    const todayLocalDate = `${localYear}-${localMonth}-${localDay}`;

    // ─── 3) COUNT HOW MANY TRANSACTIONS ARE “TODAY” ─────────────────────────────
    let todayCount = 0;
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        todayCount = txData.clientTransactions.edges.reduce((count, edge) => {
            const ct = edge.node?.createTime;
            if (typeof ct === "string") {
                // ct.slice(0,10) → "YYYY-MM-DD"
                if (ct.slice(0, 10) === todayLocalDate) {
                    return count + 1;
                }
            }
            return count;
        }, 0);
    }

    // ─── 4) TOTAL TRANSACTIONS COUNT ──────────────────────────────────────────
    const totalCount = txData?.clientTransactions?.edges?.length ?? 0;

    // ─── 5) TOTAL VOLUME (SUM OF ALL AMOUNTS) ─────────────────────────────────
    let totalVolume = 0;
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        totalVolume = txData.clientTransactions.edges.reduce((sum, edge) => {
            const amt = parseFloat(edge.node?.amount ?? "0");
            return sum + (isNaN(amt) ? 0 : amt);
        }, 0);
    }
    // Format as USD, e.g. "$150.00"
    const formattedVolume = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(totalVolume);

    // ─── 6) FLAGGED TRANSACTIONS COUNT ────────────────────────────────────────
    // Instead of checking flaggedReason, we now count where reviewStatus === "REVIEW_STATUS_FLAGGED".
    let flaggedCount = 0;
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        flaggedCount = txData.clientTransactions.edges.reduce((count, edge) => {
            return edge.node?.reviewStatus === "REVIEW_STATUS_FLAGGED" ? count + 1 : count;
        }, 0);
    }

    // ─── 7) BUILD CHART DATA FOR “Transactions by Day of Week” ───────────────────
    // Monday → Sunday labels
    const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];
    // rawWeekdayCounts[0] = Sunday count, [1] = Monday, …, [6] = Saturday
    const rawWeekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        txData.clientTransactions.edges.forEach((edge) => {
            const ct = edge.node?.createTime;
            if (typeof ct === "string") {
                const d = new Date(ct);
                const dayIndex = d.getDay(); // 0=Sunday … 6=Saturday
                if (dayIndex >= 0 && dayIndex <= 6) {
                    rawWeekdayCounts[dayIndex] += 1;
                }
            }
        });
    }
    // Reorder so Monday (index 1) is first, then Tuesday (2), … Sunday (0) last
    const weekdayOrder = [1, 2, 3, 4, 5, 6, 0];
    const reorderedWeekdayCounts = weekdayOrder.map((idx) => rawWeekdayCounts[idx]);

    const transactionsByDayChart = {
        labels: weekdayLabels,
        datasets: [
            {
                label: "Transactions",
                data: reorderedWeekdayCounts,
            },
        ],
    };

    // ─── 8) BUILD CHART DATA FOR “Monthly Transaction Counts” ───────────────────
    const monthLabels = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const rawMonthCounts = Array(12).fill(0);
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        txData.clientTransactions.edges.forEach((edge) => {
            const ct = edge.node?.createTime;
            if (typeof ct === "string") {
                const d = new Date(ct);
                const monthIndex = d.getMonth(); // 0=Jan … 11=Dec
                if (monthIndex >= 0 && monthIndex < 12) {
                    rawMonthCounts[monthIndex] += 1;
                }
            }
        });
    }
    const transactionsByMonthChart = {
        labels: monthLabels,
        datasets: [
            {
                label: "Total Transactions",
                data: rawMonthCounts,
            },
        ],
    };

    // ─── 9) BUILD CHART DATA FOR “Flagged Transactions Over Time” ────────────────
    // Now only count those with reviewStatus === "REVIEW_STATUS_FLAGGED"
    const rawFlaggedByMonth = Array(12).fill(0);
    if (
        !txLoading &&
        !txError &&
        txData?.clientTransactions?.edges &&
        Array.isArray(txData.clientTransactions.edges)
    ) {
        txData.clientTransactions.edges.forEach((edge) => {
            const ct = edge.node?.createTime;
            const rv = edge.node?.reviewStatus;
            if (typeof ct === "string" && rv === "REVIEW_STATUS_FLAGGED") {
                const d = new Date(ct);
                const monthIndex = d.getMonth();
                if (monthIndex >= 0 && monthIndex < 12) {
                    rawFlaggedByMonth[monthIndex] += 1;
                }
            }
        });
    }
    const flaggedOverTimeChart = {
        labels: monthLabels,
        datasets: [
            {
                label: "Flagged Transactions",
                data: rawFlaggedByMonth,
            },
        ],
    };

    return (
        <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
                <Grid container spacing={3}>

                    {/* ─── CARD #1: TOTAL TRANSACTIONS ──────────────────────────────────── */}
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            {txLoading ? (
                                <ComplexStatisticsCard
                                    color="dark"
                                    icon="receipt"
                                    title="Total Transactions"
                                    count="…"
                                    percentage={{
                                        color: "info",
                                        amount: "",
                                        label: "Loading…",
                                    }}
                                />
                            ) : txError ? (
                                <ComplexStatisticsCard
                                    color="error"
                                    icon="warning"
                                    title="Total Transactions"
                                    count="N/A"
                                    percentage={{
                                        color: "error",
                                        amount: "",
                                        label: "Error",
                                    }}
                                />
                            ) : (
                                <ComplexStatisticsCard
                                    color="dark"
                                    icon="receipt"
                                    title="Total Transactions"
                                    count={totalCount}
                                    percentage={{ color: "success", amount: "", label: "" }}
                                />
                            )}
                        </MDBox>
                    </Grid>

                    {/* ─── CARD #2: TODAY’S TRANSACTIONS ─────────────────────────────────── */}
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            {txLoading ? (
                                <ComplexStatisticsCard
                                    icon="today"
                                    title="Today's Transactions"
                                    count="…"
                                    percentage={{
                                        color: "info",
                                        amount: "",
                                        label: "Loading…",
                                    }}
                                />
                            ) : txError ? (
                                <ComplexStatisticsCard
                                    icon="error_outline"
                                    color="error"
                                    title="Today's Transactions"
                                    count="N/A"
                                    percentage={{
                                        color: "error",
                                        amount: "",
                                        label: "Error",
                                    }}
                                />
                            ) : (
                                <ComplexStatisticsCard
                                    icon="today"
                                    title="Today's Transactions"
                                    count={todayCount}
                                    percentage={{ color: "success", amount: "", label: "" }}
                                />
                            )}
                        </MDBox>
                    </Grid>

                    {/* ─── CARD #3: TOTAL VOLUME (SUM OF AMOUNTS) ────────────────────────── */}
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            {txLoading ? (
                                <ComplexStatisticsCard
                                    color="success"
                                    icon="attach_money"
                                    title="Total Volume"
                                    count="…"
                                    percentage={{
                                        color: "info",
                                        amount: "",
                                        label: "Loading…",
                                    }}
                                />
                            ) : txError ? (
                                <ComplexStatisticsCard
                                    color="error"
                                    icon="error_outline"
                                    title="Total Volume"
                                    count="N/A"
                                    percentage={{
                                        color: "error",
                                        amount: "",
                                        label: "Error",
                                    }}
                                />
                            ) : (
                                <ComplexStatisticsCard
                                    color="success"
                                    icon="attach_money"
                                    title="Total Volume"
                                    count={formattedVolume}
                                    percentage={{ color: "success", amount: "", label: "" }}
                                />
                            )}
                        </MDBox>
                    </Grid>

                    {/* ─── CARD #4: FLAGGED TRANSACTIONS ───────────────────────────────── */}
                    <Grid item xs={12} md={6} lg={3}>
                        <MDBox mb={1.5}>
                            {txLoading ? (
                                <ComplexStatisticsCard
                                    color="primary"
                                    icon="flag"
                                    title="Flagged Transactions"
                                    count="…"
                                    percentage={{
                                        color: "info",
                                        amount: "",
                                        label: "Loading…",
                                    }}
                                />
                            ) : txError ? (
                                <ComplexStatisticsCard
                                    color="error"
                                    icon="error_outline"
                                    title="Flagged Transactions"
                                    count="N/A"
                                    percentage={{
                                        color: "error",
                                        amount: "",
                                        label: "Error",
                                    }}
                                />
                            ) : (
                                <ComplexStatisticsCard
                                    color="primary"
                                    icon="flag"
                                    title="Flagged Transactions"
                                    count={flaggedCount}
                                    percentage={{ color: "success", amount: "", label: "" }}
                                />
                            )}
                        </MDBox>
                    </Grid>
                </Grid>

                {/* ─────────────────────── CHART ROW ──────────────────────────────────── */}
                <MDBox mt={4.5}>
                    <Grid container spacing={3}>

                        {/* ─── Chart 1: Transactions by Day of Week ─────────────────────────── */}
                        <Grid item xs={12} md={6} lg={4}>
                            <MDBox mb={3}>
                                <ReportsBarChart
                                    color="info"
                                    title="Transactions by Day of Week"
                                    description="Counts of transactions (Mon→Sun)"
                                    date="Last updated just now"
                                    chart={transactionsByDayChart}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 5, // force y-axis 0–5 so small counts are visible
                                            },
                                        },
                                    }}
                                />
                            </MDBox>
                        </Grid>

                        {/* ─── Chart 2: Monthly Transaction Counts ─────────────────────────── */}
                        <Grid item xs={12} md={6} lg={4}>
                            <MDBox mb={3}>
                                <ReportsLineChart
                                    color="success"
                                    title="Monthly Transaction Counts"
                                    description="Transactions per month"
                                    date="Last updated just now"
                                    chart={transactionsByMonthChart}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 5,
                                            },
                                        },
                                        elements: {
                                            point: {
                                                radius: 6,
                                                hoverRadius: 8,
                                            },
                                        },
                                    }}
                                />
                            </MDBox>
                        </Grid>

                        {/* ─── Chart 3: Flagged Transactions Over Time ─────────────────────── */}
                        <Grid item xs={12} md={6} lg={4}>
                            <MDBox mb={3}>
                                <ReportsLineChart
                                    color="dark"
                                    title="Flagged Transactions Over Time"
                                    description="Count of flagged transactions by month"
                                    date="Last updated just now"
                                    chart={flaggedOverTimeChart}
                                    options={{
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 5,
                                            },
                                        },
                                        elements: {
                                            point: {
                                                radius: 6,
                                                hoverRadius: 8,
                                            },
                                        },
                                    }}
                                />
                            </MDBox>
                        </Grid>
                    </Grid>
                </MDBox>

                {/* ──────────────────── TRANSACTIONS TABLE & ACTIVITY ───────────────────── */}
                <MDBox>
                    <Grid container spacing={3}>
                        {/* Left Column: Projects (placeholder for transactions table) */}
                        <Grid item xs={12} md={6} lg={8}>
                            <Projects />
                        </Grid>
                        {/* Right Column: Orders Overview (placeholder for recent activity) */}
                        <Grid item xs={12} md={6} lg={4}>
                            <OrdersOverview />
                        </Grid>
                    </Grid>
                </MDBox>
            </MDBox>

            <Footer />
        </DashboardLayout>
    );
}

export default Dashboard;
