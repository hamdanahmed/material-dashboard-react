// src/layouts/dashboard/components/Projects/data/index.js

/**
 =========================================================
 * Fraud Detection System - FDS - v2.2.0
 =========================================================
 * This file only exports the “columns” needed by DataTable.
 * The main Projects component (Projects/index.js) will fill in `rows`.
 =========================================================
 */

// IMPORTANT: The “accessor” keys here must exactly match the object keys
// that you assign on each row in Projects/index.js
export const columns = [
    { Header: "Created At",      accessor: "createdAt",      align: "left"   },
    { Header: "Amount (USD)",    accessor: "amount",         align: "center" },
    { Header: "Type",            accessor: "transactionType", align: "center" },
    { Header: "Status",          accessor: "status",         align: "center" },
    { Header: "Flagged Reason",  accessor: "flaggedReason",   align: "center" },
];

// The default export just returns { columns, rows: [] }.
// Projects/index.js will override the rows at runtime.
export default function data() {
    return {
        columns,
        rows: [],
    };
}
