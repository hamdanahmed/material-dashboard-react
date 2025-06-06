/**
 =========================================================
 * Projects/index.js
 *
 * Displays a “Transactions” table that fetches via GraphQL.
 * When an analyst clicks “Review 🔍,” it opens a modal dialog
 * (TransactionReviewDialog) to set:
 *   • reviewStatus
 *   • additionalInfoStatus
 *   • additionalInfoType
 *   • notes
 *
 * On save, the dialog will POST to /v1/transaction/review.
 =========================================================
 */

import React, { useState } from "react";
import { useQuery } from "@apollo/client";

// MD components from the template
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// The template’s built-in DataTable
import DataTable from "examples/Tables/DataTable";

// GraphQL query to fetch all client transactions
import { GET_ALL_CLIENT_TRANSACTIONS } from "graphql/queries/getTransactionCount";

// Static columns and an empty rows array
import data, { columns as transactionColumns } from "./data";

// The dialog component for reviewing a transaction
import TransactionReviewDialog from "./TransactionReviewDialog";

// ────────────────────────────────────────────────────────────
// ENUM → LABEL MAPS and ENUM → BADGE COLOR MAPS (unchanged)
// These must match exactly the proto enum names on the server.
// ────────────────────────────────────────────────────────────
const TYPE_LABELS = {
    TRANSACTION_TYPE_UNSPECIFIED: "—",
    TRANSACTION_TYPE_DEPOSIT: "Deposit",
    TRANSACTION_TYPE_WITHDRAWAL: "Withdrawal",
};

const STATUS_LABELS = {
    TRANSACTION_STATUS_UNSPECIFIED: "—",
    TRANSACTION_STATUS_PENDING: "Pending",
    TRANSACTION_STATUS_COMPLETED: "Completed",
    TRANSACTION_STATUS_FAILED: "Failed",
};

const REVIEW_LABELS = {
    REVIEW_STATUS_UNSPECIFIED: "—",
    REVIEW_STATUS_FLAGGED: "Flagged",
    REVIEW_STATUS_PENDING: "Pending Review",
    REVIEW_STATUS_IN_REVIEW: "In Review",
    REVIEW_STATUS_ESCALATED: "Escalated",
    REVIEW_STATUS_REJECTED: "Rejected",
    REVIEW_STATUS_APPROVED: "Approved",
    REVIEW_STATUS_COMPLETED: "Completed Review",
};

const ADDITIONAL_INFO_STATUS_LABELS = {
    ADDITIONAL_INFO_STATUS_UNSPECIFIED: "—",
    ADDITIONAL_INFO_STATUS_REQUESTED: "Requested",
    ADDITIONAL_INFO_STATUS_RECEIVED: "Received",
    ADDITIONAL_INFO_STATUS_IN_REVIEW: "In Review",
    ADDITIONAL_INFO_STATUS_COMPLETED: "Completed",
};

const ADDITIONAL_INFO_TYPE_LABELS = {
    ADDITIONAL_INFO_TYPE_UNSPECIFIED: "—",
    ADDITIONAL_INFO_TYPE_WAIVER: "Waiver",
    ADDITIONAL_INFO_TYPE_SOURCE_OF_FUNDS: "Source of Funds",
    ADDITIONAL_INFO_TYPE_OTHER: "Other",
};

const TYPE_COLORS = {
    TRANSACTION_TYPE_UNSPECIFIED: "dark",
    TRANSACTION_TYPE_DEPOSIT: "success",
    TRANSACTION_TYPE_WITHDRAWAL: "error",
};

const STATUS_COLORS = {
    TRANSACTION_STATUS_UNSPECIFIED: "dark",
    TRANSACTION_STATUS_PENDING: "warning",
    TRANSACTION_STATUS_COMPLETED: "success",
    TRANSACTION_STATUS_FAILED: "error",
};

const REVIEW_COLORS = {
    REVIEW_STATUS_UNSPECIFIED: "dark",
    REVIEW_STATUS_PENDING: "warning",
    REVIEW_STATUS_IN_REVIEW: "info",
    REVIEW_STATUS_FLAGGED: "error",
    REVIEW_STATUS_ESCALATED: "error",
    REVIEW_STATUS_REJECTED: "error",
    REVIEW_STATUS_APPROVED: "success",
    REVIEW_STATUS_COMPLETED: "success",
};

const ADDITIONAL_INFO_STATUS_COLORS = {
    ADDITIONAL_INFO_STATUS_UNSPECIFIED: "dark",
    ADDITIONAL_INFO_STATUS_REQUESTED: "warning",
    ADDITIONAL_INFO_STATUS_RECEIVED: "info",
    ADDITIONAL_INFO_STATUS_IN_REVIEW: "info",
    ADDITIONAL_INFO_STATUS_COMPLETED: "success",
};

// ────────────────────────────────────────────────────────────
// Projects component → Renders the table and the review dialog
// ────────────────────────────────────────────────────────────
export default function Projects() {
    // ────────────────── DIALOG STATE ───────────────────────────
    // Which transaction is being reviewed (row.node.id), and dialog open/close
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentTxnId, setCurrentTxnId] = useState("");
    const [currentValues, setCurrentValues] = useState({
        reviewStatus: "REVIEW_STATUS_UNSPECIFIED",
        additionalInfoStatus: "ADDITIONAL_INFO_STATUS_UNSPECIFIED",
        additionalInfoType: "ADDITIONAL_INFO_TYPE_UNSPECIFIED",
        notes: "",
    });

    // When the user clicks “Review 🔍,” open the dialog and prefill values
    const handleOpenDialog = (node) => {
        setCurrentTxnId(node.id);
        setCurrentValues({
            reviewStatus: node.reviewStatus || "REVIEW_STATUS_UNSPECIFIED",
            additionalInfoStatus:
                node.additionalInfoStatus || "ADDITIONAL_INFO_STATUS_UNSPECIFIED",
            additionalInfoType:
                node.additionalInfoType || "ADDITIONAL_INFO_TYPE_UNSPECIFIED",
            notes: node.notes || "",
        });
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // After saving (successful POST), refetch the table
    const handleSaveSuccess = () => {
        refetch();
        setDialogOpen(false);
    };

    // ─────────────────── FETCH & BUILD TABLE ─────────────────────
    // Start with a fresh { columns, rows: [] }
    const tableData = data();

    // Override columns to add “Review Status,” “Additional Info,” and “Action”
    tableData.columns = [
        // Spread in the original five columns: createdAt, amount, transactionType, status, flaggedReason
        ...transactionColumns,

        // Add the new enum fields:
        { Header: "Review Status", accessor: "reviewStatus", align: "center" },
        {
            Header: "Add’l Info Status",
            accessor: "additionalInfoStatus",
            align: "center",
        },
        { Header: "Add’l Info Type", accessor: "additionalInfoType", align: "center" },

        // Finally, the “Action” column
        {
            Header: "Action",
            accessor: "action",
            align: "center",
        },
    ];

    // Run the GraphQL query
    const { loading, error, data: txData, refetch } =
        useQuery(GET_ALL_CLIENT_TRANSACTIONS);

    // Build rows: show a placeholder if loading / error, otherwise map nodes → rows
    if (loading) {
        tableData.rows = [
            {
                createdAt: "Loading…",
                amount: "",
                transactionType: "",
                status: "",
                flaggedReason: "",
                reviewStatus: "",
                additionalInfoStatus: "",
                additionalInfoType: "",
                action: "",
            },
        ];
    } else if (error || !txData?.clientTransactions?.edges) {
        tableData.rows = [
            {
                createdAt: "Error loading data",
                amount: "",
                transactionType: "",
                status: "",
                flaggedReason: "",
                reviewStatus: "",
                additionalInfoStatus: "",
                additionalInfoType: "",
                action: "",
            },
        ];
    } else {
        tableData.rows = txData.clientTransactions.edges.map(({ node }) => {
            // a) Format “Created At” & “Amount”
            const createdAtLabel = node.createTime
                ? new Date(node.createTime).toLocaleString()
                : "—";
            const amountLabel = node.amount
                ? `$${parseFloat(node.amount).toFixed(2)}`
                : "—";

            // b) Type badge
            const typeKey = node.transactionType || "TRANSACTION_TYPE_UNSPECIFIED";
            const typeLabel = TYPE_LABELS[typeKey] || "Unknown";
            const typeColor = TYPE_COLORS[typeKey] || "dark";

            // c) Status badge
            const statusKey = node.status || "TRANSACTION_STATUS_UNSPECIFIED";
            const statusLabel = STATUS_LABELS[statusKey] || "Unknown";
            const statusColor = STATUS_COLORS[statusKey] || "dark";

            // d) Review Status: if unspecified → show a dash instead of a badge
            const rawReviewKey = node.reviewStatus;
            let reviewCell;
            if (!rawReviewKey) {
                reviewCell = "—";
            } else {
                const reviewKey = rawReviewKey;
                const reviewLabel = REVIEW_LABELS[reviewKey] || "Unknown";
                const reviewColor = REVIEW_COLORS[reviewKey] || "dark";

                reviewCell = (
                    <MDBox
                        px={1.5}
                        py={0.5}
                        mr={1}
                        variant="gradient"
                        bgColor={reviewColor}
                        borderRadius="md"
                        textAlign="center"
                        sx={{ display: "inline-block" }}
                    >
                        {reviewLabel}
                    </MDBox>
                );
            }

            // e) Additional Info Status: if unspecified → show a dash
            const rawAddInfoStatusKey = node.additionalInfoStatus;
            let addInfoStatusCell;
            if (!rawAddInfoStatusKey) {
                addInfoStatusCell = "—";
            } else {
                const addInfoStatusKey = rawAddInfoStatusKey;
                const addInfoStatusLabel =
                    ADDITIONAL_INFO_STATUS_LABELS[addInfoStatusKey] || "Unknown";
                const addInfoStatusColor =
                    ADDITIONAL_INFO_STATUS_COLORS[addInfoStatusKey] || "dark";

                addInfoStatusCell = (
                    <MDBox
                        px={1.5}
                        py={0.5}
                        mr={1}
                        variant="gradient"
                        bgColor={addInfoStatusColor}
                        borderRadius="md"
                        textAlign="center"
                        sx={{ display: "inline-block" }}
                    >
                        {addInfoStatusLabel}
                    </MDBox>
                );
            }

            // f) Additional Info Type: if unspecified → show a dash
            const rawAddInfoTypeKey = node.additionalInfoType;
            let addInfoTypeCell;
            if (!rawAddInfoTypeKey) {
                addInfoTypeCell = "—";
            } else {
                const addInfoTypeKey = rawAddInfoTypeKey;
                const addInfoTypeLabel =
                    ADDITIONAL_INFO_TYPE_LABELS[addInfoTypeKey] || "Unknown";
                addInfoTypeCell = addInfoTypeLabel;
            }

            // g) “Review 🔍” button
            const actionButton = (
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
                    Review 🔍
                </MDBox>
            );

            // h) Return the final row (accessors must match column definitions)
            return {
                createdAt: createdAtLabel, // accessor: "createdAt"
                amount: amountLabel, // accessor: "amount"

                transactionType: (
                    <MDBox
                        px={1.5}
                        py={0.5}
                        mr={1}
                        variant="gradient"
                        bgColor={typeColor}
                        borderRadius="md"
                        textAlign="center"
                        sx={{ display: "inline-block" }}
                    >
                        {typeLabel}
                    </MDBox>
                ), // accessor: "transactionType"

                status: (
                    <MDBox
                        px={1.5}
                        py={0.5}
                        mr={1}
                        variant="gradient"
                        bgColor={statusColor}
                        borderRadius="md"
                        textAlign="center"
                        sx={{ display: "inline-block" }}
                    >
                        {statusLabel}
                    </MDBox>
                ), // accessor: "status"

                flaggedReason: node.flaggedReason || "—", // accessor: "flaggedReason"

                reviewStatus: reviewCell, // accessor: "reviewStatus"
                additionalInfoStatus: addInfoStatusCell, // accessor: "additionalInfoStatus"
                additionalInfoType: addInfoTypeCell, // accessor: "additionalInfoType"

                action: actionButton, // accessor: "action"
            };
        });
    }

    // ────────────────────── RENDER TABLE & DIALOG ────────────────────────────
    return (
        <>
            <DataTable table={tableData} />

            <TransactionReviewDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                transactionId={currentTxnId}
                currentValues={{
                    reviewStatus: currentValues.reviewStatus,
                    additionalInfoStatus: currentValues.additionalInfoStatus,
                    additionalInfoType: currentValues.additionalInfoType,
                    notes: currentValues.notes,
                }}
                onSaveSuccess={handleSaveSuccess}
            />
        </>
    );
}
