// src/layouts/dashboard/components/TransactionsTable.js

import React from "react";
import { useQuery, gql } from "@apollo/client";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
} from "@mui/material";

// We’re re‐using the same query (but requesting all fields we need for the table).
const GET_TRANSACTIONS_FOR_TABLE = gql`
    query GetTransactionsForTable {
        clientTransactions {
            edges {
                node {
                    id
                    createTime
                    amount
                    transactionType
                    status
                    flaggedReason
                }
            }
        }
    }
`;

export default function TransactionsTable() {
    // Run the GraphQL query
    const { loading, error, data } = useQuery(GET_TRANSACTIONS_FOR_TABLE);

    if (loading) {
        // While loading, show a spinner centered in a box
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        // If there’s an error, show a simple error message
        return (
            <Typography color="error" align="center" p={4}>
                Error loading transactions.
            </Typography>
        );
    }

    // Map GraphQL edges → row objects for the table
    const rows = data.clientTransactions.edges.map(({ node }) => ({
        id: node.id,
        createTime: new Date(node.createTime).toLocaleString(),
        amount: parseFloat(node.amount).toFixed(2),
        transactionType: node.transactionType,
        status: node.status,
        flaggedReason: node.flaggedReason || "—",
    }));

    return (
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Typography variant="subtitle2">Created At</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2">Amount (USD)</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2">Type</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2">Status</Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2">Flagged Reason</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.createTime}</TableCell>
                            <TableCell>${row.amount}</TableCell>
                            <TableCell>{row.transactionType}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.flaggedReason}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
