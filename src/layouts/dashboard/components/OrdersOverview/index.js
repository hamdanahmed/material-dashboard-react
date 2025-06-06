// src/layouts/dashboard/components/OrdersOverview/index.js
import React from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

import { useQuery } from "@apollo/client";
// ← Re‐use your existing “all transactions” query:
import { GET_ALL_CLIENT_TRANSACTIONS } from "../../../../graphql/queries/getTransactionCount";

/**
 * OrdersOverview
 *
 * Now simply calls GET_ALL_CLIENT_TRANSACTIONS, then takes the first 5 edges.
 */
function OrdersOverview() {
    // 1) Run the GraphQL query to get *all* transactions
    const { loading, error, data } = useQuery(GET_ALL_CLIENT_TRANSACTIONS);

    // 2) Show placeholders on loading / error
    if (loading) {
        return (
            <Card sx={{ height: "100%" }}>
                <MDBox pt={3} px={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                        Recent Transactions
                    </MDTypography>
                    <MDBox mt={2} mb={2}>
                        <MDTypography variant="body2" color="text">
                            Loading…
                        </MDTypography>
                    </MDBox>
                </MDBox>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ height: "100%" }}>
                <MDBox pt={3} px={3}>
                    <MDTypography variant="h6" fontWeight="medium">
                        Recent Transactions
                    </MDTypography>
                    <MDBox mt={2} mb={2}>
                        <MDTypography variant="body2" color="error">
                            Error loading data
                        </MDTypography>
                    </MDBox>
                </MDBox>
            </Card>
        );
    }

    // 3) Grab all edges, then slice(0,5) to show the latest 5
    const allEdges = data?.clientTransactions?.edges || [];
    const edges = allEdges.slice(0, 5);

    return (
        <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
                <MDTypography variant="h6" fontWeight="medium">
                    Recent Transactions
                </MDTypography>
                <MDBox mt={0} mb={2}>
                    <MDTypography variant="button" color="text" fontWeight="regular">
                        <MDTypography display="inline" variant="body2" verticalAlign="middle">
                            <Icon sx={{ color: ({ palette: { success } }) => success.main }}>
                                arrow_upward
                            </Icon>
                        </MDTypography>
                        &nbsp;
                        <MDTypography variant="button" color="text" fontWeight="medium">
                            {edges.length} fetched
                        </MDTypography>{" "}
                        (latest 5)
                    </MDTypography>
                </MDBox>
            </MDBox>

            <MDBox p={2}>
                {edges.length === 0 ? (
                    <MDTypography variant="body2" color="text" align="center">
                        No recent transactions.
                    </MDTypography>
                ) : (
                    edges.map(({ node }) => {
                        // Format createTime
                        const dt = new Date(node.createTime);
                        const dateTimeLabel = dt.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        });

                        // Build a title: “$50.00 — Deposit (Pending)”
                        const amountLabel = node.amount
                            ? `$${parseFloat(node.amount).toFixed(2)}`
                            : "$0.00";
                        const typeLabel = (node.transactionType || "")
                            .replace("TRANSACTION_TYPE_", "")
                            .replace(/_/g, " ");
                        const statusLabel = (node.status || "")
                            .replace("TRANSACTION_STATUS_", "")
                            .replace(/_/g, " ");
                        const title = `${amountLabel} — ${typeLabel} (${statusLabel})`;

                        // Choose color + icon by status
                        let color = "info";
                        let icon = "shopping_cart";
                        if (node.status === "TRANSACTION_STATUS_COMPLETED") {
                            color = "success";
                            icon = "check_circle";
                        } else if (node.status === "TRANSACTION_STATUS_PENDING") {
                            color = "warning";
                            icon = "hourglass_empty";
                        } else if (node.status === "TRANSACTION_STATUS_FAILED") {
                            color = "error";
                            icon = "error_outline";
                        }

                        return (
                            <TimelineItem
                                key={node.id}
                                color={color}
                                icon={icon}
                                title={title}
                                dateTime={dateTimeLabel}
                            />
                        );
                    })
                )}
            </MDBox>
        </Card>
    );
}

export default OrdersOverview;
