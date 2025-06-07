import React from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useTheme from "@mui/material/styles/useTheme";

function renderParameterRow(param, idx) {
    if (param.amount) {
        return (
            <TableRow key={idx}>
                <TableCell>Amount</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "info.light",
                            color: "info.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.amount.Operator.replace("OPERATOR_", "")} {param.amount.Value}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    if (param.transactionType) {
        return (
            <TableRow key={idx}>
                <TableCell>Transaction Type</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "primary.light",
                            color: "primary.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.transactionType.replace("TRANSACTION_TYPE_", "")}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    if (param.transactionStatus) {
        return (
            <TableRow key={idx}>
                <TableCell>Transaction Status</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "success.light",
                            color: "success.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.transactionStatus.replace("TRANSACTION_STATUS_", "")}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    if (param.reviewStatus) {
        return (
            <TableRow key={idx}>
                <TableCell>Review Status</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "warning.light",
                            color: "warning.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.reviewStatus.replace("REVIEW_STATUS_", "")}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    if (param.additionalInfoType) {
        return (
            <TableRow key={idx}>
                <TableCell>Additional Info Type</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "secondary.light",
                            color: "secondary.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.additionalInfoType.replace("ADDITIONAL_INFO_TYPE_", "")}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    if (param.additionalInfoStatus) {
        return (
            <TableRow key={idx}>
                <TableCell>Additional Info Status</TableCell>
                <TableCell>
                    <Box
                        component="span"
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: "error.light",
                            color: "error.contrastText",
                            fontWeight: 500,
                        }}
                    >
                        {param.additionalInfoStatus.replace("ADDITIONAL_INFO_STATUS_", "")}
                    </Box>
                </TableCell>
            </TableRow>
        );
    }
    return null;
}

export default function RuleParametersDialog({ open, onClose, rule }) {
    const theme = useTheme();
    if (!rule) return null;
    const params = rule.Parameters || [];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: 12,
                },
            }}
        >
            <Box
                sx={{
                    background: theme.palette.grey[100],
                    px: 3,
                    py: 2,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                }}
            >
                <Typography variant="h6" fontWeight={700} color="primary.main">
                    Parameters for Rule:{" "}
                    <Box component="span" color="text.primary">
                        {rule.name}
                    </Box>
                </Typography>
            </Box>
            <Divider />
            <DialogContent sx={{ p: 3 }}>
                {params.length === 0 ? (
                    <Typography>No parameters found.</Typography>
                ) : (
                    <Table size="small">
                        <TableBody>
                            {params.map((param, idx) => (
                                <React.Fragment key={idx}>
                                    {renderParameterRow(param, idx)}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    color="primary"
                    sx={{
                        borderRadius: 2,
                        minWidth: 100,
                        fontWeight: 600,
                        boxShadow: "none",
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

RuleParametersDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    rule: PropTypes.shape({
        name: PropTypes.string,
        Parameters: PropTypes.arrayOf(PropTypes.object),
    }),
};
