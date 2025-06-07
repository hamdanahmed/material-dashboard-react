// src/layouts/rules/RuleDialog.js

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// ────────────────────────────────────────────────────────────────────────
const fieldSx = {
    "& .MuiOutlinedInput-root": {
        height: "56px",
        "& .MuiOutlinedInput-notchedOutline": {
            top: 0,
        },
    },
    "& .MuiOutlinedInput-input": {
        padding: "18.5px 14px",
    },
};

const MATCH_TYPES = [
    { value: "MATCH_TYPE_UNSPECIFIED", label: "—" },
    { value: "MATCH_TYPE_ALL", label: "ALL" },
    { value: "MATCH_TYPE_ANY", label: "ANY" },
];
const PARAM_TYPE_OPTIONS = [
    { value: "RULE_PARAMETER_TYPE_AMOUNT", label: "Amount" },
    { value: "RULE_PARAMETER_TYPE_TRANSACTION_TYPE", label: "Transaction Type" },
    { value: "RULE_PARAMETER_TYPE_TRANSACTION_STATUS", label: "Transaction Status" },
    { value: "RULE_PARAMETER_TYPE_REVIEW_STATUS", label: "Review Status" },
    { value: "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_STATUS", label: "Additional Info Status" },
    { value: "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_TYPE", label: "Additional Info Type" },
];
const OPERATOR_OPTIONS = [
    { value: "OPERATOR_UNSPECIFIED", label: "—" },
    { value: "OPERATOR_EQUAL", label: "=" },
    { value: "OPERATOR_NOT_EQUAL", label: "≠" },
    { value: "OPERATOR_GREATER_THAN", label: ">" },
    { value: "OPERATOR_GREATER_EQUAL", label: "≥" },
    { value: "OPERATOR_LESS_THAN", label: "<" },
    { value: "OPERATOR_LESS_EQUAL", label: "≤" },
    { value: "OPERATOR_IN", label: "IN" },
];
const TRANSACTION_TYPE_OPTIONS = [
    { value: "TRANSACTION_TYPE_UNSPECIFIED", label: "—" },
    { value: "TRANSACTION_TYPE_DEPOSIT", label: "Deposit" },
    { value: "TRANSACTION_TYPE_WITHDRAWAL", label: "Withdrawal" },
];
const TRANSACTION_STATUS_OPTIONS = [
    { value: "TRANSACTION_STATUS_UNSPECIFIED", label: "—" },
    { value: "TRANSACTION_STATUS_PENDING", label: "Pending" },
    { value: "TRANSACTION_STATUS_COMPLETED", label: "Completed" },
    { value: "TRANSACTION_STATUS_FAILED", label: "Failed" },
];
const REVIEW_STATUS_OPTIONS = [
    { value: "REVIEW_STATUS_UNSPECIFIED", label: "—" },
    { value: "REVIEW_STATUS_FLAGGED", label: "Flagged" },
    { value: "REVIEW_STATUS_PENDING", label: "Pending Review" },
    { value: "REVIEW_STATUS_IN_REVIEW", label: "In Review" },
    { value: "REVIEW_STATUS_ESCALATED", label: "Escalated" },
    { value: "REVIEW_STATUS_REJECTED", label: "Rejected" },
    { value: "REVIEW_STATUS_APPROVED", label: "Approved" },
    { value: "REVIEW_STATUS_COMPLETED", label: "Completed Review" },
];
const ADDITIONAL_INFO_STATUS_OPTIONS = [
    { value: "ADDITIONAL_INFO_STATUS_UNSPECIFIED", label: "—" },
    { value: "ADDITIONAL_INFO_STATUS_REQUESTED", label: "Requested" },
    { value: "ADDITIONAL_INFO_STATUS_RECEIVED", label: "Received" },
    { value: "ADDITIONAL_INFO_STATUS_IN_REVIEW", label: "In Review" },
    { value: "ADDITIONAL_INFO_STATUS_COMPLETED", label: "Completed" },
];
const ADDITIONAL_INFO_TYPE_OPTIONS = [
    { value: "ADDITIONAL_INFO_TYPE_UNSPECIFIED", label: "—" },
    { value: "ADDITIONAL_INFO_TYPE_WAIVER", label: "Waiver" },
    { value: "ADDITIONAL_INFO_TYPE_SOURCE_OF_FUNDS", label: "Source of Funds" },
    { value: "ADDITIONAL_INFO_TYPE_OTHER", label: "Other" },
];

// ────────────────────────────────────────────────────────────────────────
export default function RuleDialog({
                                       open,
                                       onClose,
                                       existingRule,
                                       onSaveSuccess,
                                   }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [matchType, setMatchType] = useState("MATCH_TYPE_ALL");
    const [analystID, setAnalystID] = useState("");
    const [parameters, setParameters] = useState([]);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const generateParamId = () => Math.random().toString(36).substr(2, 9);

    // ────────────────── PREFILL ON “EDIT” ─────────────────────────────────────
    useEffect(() => {
        if (existingRule) {
            setName(existingRule.name || "");
            setDescription(existingRule.description || "");
            setIsActive(existingRule.isActive ?? true);
            setMatchType(existingRule.matchType || "MATCH_TYPE_ALL");
            setAnalystID(existingRule.analystID || "");

            // --- Fixed: Use existingRule.Parameters, map GraphQL union to editable array
            const unionParams = (existingRule.Parameters || []).map((param) => {
                const id = generateParamId();
                if (param.amount) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_AMOUNT",
                        operator: param.amount.Operator || "OPERATOR_UNSPECIFIED",
                        value: param.amount.Value || 0,
                        enumValue: "",
                    };
                }
                if (param.transactionType) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_TRANSACTION_TYPE",
                        operator: "",
                        value: 0,
                        enumValue: param.transactionType,
                    };
                }
                if (param.transactionStatus) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_TRANSACTION_STATUS",
                        operator: "",
                        value: 0,
                        enumValue: param.transactionStatus,
                    };
                }
                if (param.reviewStatus) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_REVIEW_STATUS",
                        operator: "",
                        value: 0,
                        enumValue: param.reviewStatus,
                    };
                }
                if (param.additionalInfoStatus) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_STATUS",
                        operator: "",
                        value: 0,
                        enumValue: param.additionalInfoStatus,
                    };
                }
                if (param.additionalInfoType) {
                    return {
                        id,
                        type: "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_TYPE",
                        operator: "",
                        value: 0,
                        enumValue: param.additionalInfoType,
                    };
                }
                // fallback (shouldn't be needed)
                return {
                    id,
                    type: "RULE_PARAMETER_TYPE_AMOUNT",
                    operator: "OPERATOR_UNSPECIFIED",
                    value: 0,
                    enumValue: "",
                };
            });

            setParameters(unionParams);
            setErrorMsg("");
        } else {
            setName("");
            setDescription("");
            setIsActive(true);
            setMatchType("MATCH_TYPE_ALL");
            setAnalystID("");
            setParameters([]);
            setErrorMsg("");
        }
    }, [existingRule]);

    // ────────────────── PARAMETER HELPERS ────────────────────────────────────
    const handleAddParameter = () => {
        setParameters((prev) => [
            ...prev,
            {
                id: generateParamId(),
                type: "RULE_PARAMETER_TYPE_AMOUNT",
                operator: "OPERATOR_UNSPECIFIED",
                value: 0,
                enumValue: "",
            },
        ]);
    };

    const handleRemoveParameter = (paramId) => {
        setParameters((prev) => prev.filter((p) => p.id !== paramId));
    };

    const handleParameterTypeChange = (paramId, newType) => {
        setParameters((prev) =>
            prev.map((p) =>
                p.id === paramId
                    ? {
                        id: paramId,
                        type: newType,
                        operator: newType === "RULE_PARAMETER_TYPE_AMOUNT" ? p.operator : "",
                        value: newType === "RULE_PARAMETER_TYPE_AMOUNT" ? p.value : 0,
                        enumValue: newType === "RULE_PARAMETER_TYPE_AMOUNT" ? "" : p.enumValue,
                    }
                    : p
            )
        );
    };

    const handleAmountFieldChange = (paramId, field, newValue) => {
        setParameters((prev) =>
            prev.map((p) => (p.id === paramId ? { ...p, [field]: newValue } : p))
        );
    };

    const handleEnumFieldChange = (paramId, newEnumValue) => {
        setParameters((prev) =>
            prev.map((p) => (p.id === paramId ? { ...p, enumValue: newEnumValue } : p))
        );
    };

    const buildRuleParametersForPayload = () => {
        return parameters
            .map((p) => {
                switch (p.type) {
                    case "RULE_PARAMETER_TYPE_AMOUNT":
                        return {
                            amount: {
                                operator: p.operator,
                                value: parseFloat(p.value) || 0,
                            },
                        };
                    case "RULE_PARAMETER_TYPE_TRANSACTION_TYPE":
                        return {
                            transactionTypeRule: p.enumValue || "TRANSACTION_TYPE_UNSPECIFIED",
                        };
                    case "RULE_PARAMETER_TYPE_TRANSACTION_STATUS":
                        return {
                            transactionStatusRule: p.enumValue || "TRANSACTION_STATUS_UNSPECIFIED",
                        };
                    case "RULE_PARAMETER_TYPE_REVIEW_STATUS":
                        return {
                            reviewStatusRule: p.enumValue || "REVIEW_STATUS_UNSPECIFIED",
                        };
                    case "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_STATUS":
                        return {
                            additionalInfoStatusRule:
                                p.enumValue || "ADDITIONAL_INFO_STATUS_UNSPECIFIED",
                        };
                    case "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_TYPE":
                        return {
                            additionalInfoTypeRule:
                                p.enumValue || "ADDITIONAL_INFO_TYPE_UNSPECIFIED",
                        };
                    default:
                        return null;
                }
            })
            .filter((obj) => obj !== null);
    };

    // ────────────────── HANDLE SAVE ───────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setErrorMsg("");

        const payload = {
            analystId: analystID.trim(),
            rule: {
                name: name.trim(),
                description: description.trim(),
                isActive,
                parameters: buildRuleParametersForPayload(),
                matchType,
            },
        };

        // Replace with your GRPC gateway URL:
        const RPC_GATEWAY_URL = "http://localhost:50052";
        let url = `${RPC_GATEWAY_URL}/v1/rule`;
        let method = "POST";
        if (existingRule && existingRule.id) {
            payload.ruleId = existingRule.id;
            method = "PUT";
        }

        try {
            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`HTTP ${resp.status}: ${text}`);
            }
            onSaveSuccess();
        } catch (e) {
            setErrorMsg(e.message || "Unknown error saving rule");
        } finally {
            setSaving(false);
        }
    };

    // ────────────────── RENDER A SINGLE PARAMETER ROW ───────────────────────
    const renderParameterRow = (p) => (
        <Paper
            key={p.id}
            elevation={1}
            sx={{ p: 2, mb: 2, backgroundColor: (theme) => theme.palette.background.paper }}
        >
            <Grid container spacing={2} alignItems="center">
                {/* Parameter Type */}
                <Grid item xs={12} sm={3}>
                    <TextField
                        select
                        fullWidth
                        size="medium"
                        label="Parameter Type"
                        value={p.type}
                        onChange={(e) => handleParameterTypeChange(p.id, e.target.value)}
                        sx={fieldSx}
                    >
                        {PARAM_TYPE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Amount parameter */}
                {p.type === "RULE_PARAMETER_TYPE_AMOUNT" && (
                    <>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                select
                                fullWidth
                                size="medium"
                                label="Operator"
                                value={p.operator}
                                onChange={(e) =>
                                    handleAmountFieldChange(p.id, "operator", e.target.value)
                                }
                                sx={fieldSx}
                            >
                                {OPERATOR_OPTIONS.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                size="medium"
                                label="Value"
                                type="number"
                                value={p.value}
                                onChange={(e) =>
                                    handleAmountFieldChange(p.id, "value", e.target.value)
                                }
                                sx={fieldSx}
                            />
                        </Grid>
                    </>
                )}

                {/* Transaction Type parameter */}
                {p.type === "RULE_PARAMETER_TYPE_TRANSACTION_TYPE" && (
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            size="medium"
                            label="Transaction Type"
                            value={p.enumValue}
                            onChange={(e) => handleEnumFieldChange(p.id, e.target.value)}
                            sx={fieldSx}
                        >
                            {TRANSACTION_TYPE_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Transaction Status parameter */}
                {p.type === "RULE_PARAMETER_TYPE_TRANSACTION_STATUS" && (
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            size="medium"
                            label="Transaction Status"
                            value={p.enumValue}
                            onChange={(e) => handleEnumFieldChange(p.id, e.target.value)}
                            sx={fieldSx}
                        >
                            {TRANSACTION_STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Review Status parameter */}
                {p.type === "RULE_PARAMETER_TYPE_REVIEW_STATUS" && (
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            size="medium"
                            label="Review Status"
                            value={p.enumValue}
                            onChange={(e) => handleEnumFieldChange(p.id, e.target.value)}
                            sx={fieldSx}
                        >
                            {REVIEW_STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Additional Info Status parameter */}
                {p.type === "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_STATUS" && (
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            size="medium"
                            label="Add’l Info Status"
                            value={p.enumValue}
                            onChange={(e) => handleEnumFieldChange(p.id, e.target.value)}
                            sx={fieldSx}
                        >
                            {ADDITIONAL_INFO_STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Additional Info Type parameter */}
                {p.type === "RULE_PARAMETER_TYPE_ADDITIONAL_INFO_TYPE" && (
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            fullWidth
                            size="medium"
                            label="Add’l Info Type"
                            value={p.enumValue}
                            onChange={(e) => handleEnumFieldChange(p.id, e.target.value)}
                            sx={fieldSx}
                        >
                            {ADDITIONAL_INFO_TYPE_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {/* Remove Parameter Button */}
                <Grid item xs={12} sm={1}>
                    <Box textAlign="right">
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleRemoveParameter(p.id)}
                            sx={{ minWidth: "32px", height: "32px" }}
                        >
                            <Icon fontSize="small">close</Icon>
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <MDTypography variant="h6">
                    {existingRule ? "Edit Rule" : "Add New Rule"}
                </MDTypography>
            </DialogTitle>

            <Divider />

            <DialogContent dividers>
                <MDBox px={2} py={1}>
                    {/* Top Row: Name / Description */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="medium"
                                label="Rule Name"
                                variant="outlined"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                sx={fieldSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                size="medium"
                                label="Description"
                                variant="outlined"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                sx={fieldSx}
                            />
                        </Grid>
                    </Grid>

                    <MDBox mt={2} />

                    {/* Next Row: Active / Match Type / Analyst ID */}
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                select
                                fullWidth
                                size="medium"
                                label="Match Type"
                                value={matchType}
                                onChange={(e) => setMatchType(e.target.value)}
                                sx={fieldSx}
                            >
                                {MATCH_TYPES.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                size="medium"
                                label="Analyst ID (UUID)"
                                variant="outlined"
                                value={analystID}
                                onChange={(e) => setAnalystID(e.target.value)}
                                helperText="ID of the analyst making this change"
                                sx={fieldSx}
                            />
                        </Grid>
                    </Grid>

                    <Box mt={4} mb={1}>
                        <MDTypography variant="subtitle1" fontWeight="medium">
                            Parameters
                        </MDTypography>
                    </Box>
                    <Divider />

                    <MDBox mt={2}>
                        {parameters.map((param) => renderParameterRow(param))}

                        <Box textAlign="left" mt={1}>
                            <Button
                                variant="contained"
                                color="info"
                                size="small"
                                startIcon={<Icon>add</Icon>}
                                onClick={handleAddParameter}
                                sx={{ "& .MuiButton-startIcon": { marginRight: "4px" } }}
                            >
                                Add Parameter
                            </Button>
                        </Box>
                    </MDBox>

                    {errorMsg && (
                        <Box mt={2}>
                            <MDTypography variant="caption" color="error">
                                {errorMsg}
                            </MDTypography>
                        </Box>
                    )}
                </MDBox>
            </DialogContent>

            <Divider />

            {/* Save / Cancel Buttons */}
            <DialogActions sx={{ pr: 3, pb: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={saving}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="success"
                    disabled={saving}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

RuleDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    existingRule: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        description: PropTypes.string,
        isActive: PropTypes.bool,
        matchType: PropTypes.string,
        analystID: PropTypes.string,
        Parameters: PropTypes.arrayOf(PropTypes.object), // <-- note Parameters, not parameters!
        createTime: PropTypes.string,
        updateTime: PropTypes.string,
    }),
    onSaveSuccess: PropTypes.func.isRequired,
};
