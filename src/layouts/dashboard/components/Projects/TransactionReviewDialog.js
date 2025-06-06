// src/layouts/dashboard/components/Projects/TransactionReviewDialog.js

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// MUI components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";

// ———————————— ENUM CONSTANTS —————————————————————————————
// (Unchanged from before—these must match your proto enums exactly)
const REVIEW_STATUS_OPTIONS = [
    { value: "REVIEW_STATUS_UNSPECIFIED", label: "Unspecified" },
    { value: "REVIEW_STATUS_FLAGGED",     label: "Flagged" },
    { value: "REVIEW_STATUS_PENDING",     label: "Pending" },
    { value: "REVIEW_STATUS_IN_REVIEW",   label: "In Review" },
    { value: "REVIEW_STATUS_ESCALATED",   label: "Escalated" },
    { value: "REVIEW_STATUS_REJECTED",    label: "Rejected" },
    { value: "REVIEW_STATUS_APPROVED",    label: "Approved" },
    { value: "REVIEW_STATUS_COMPLETED",   label: "Completed" },
];

const ADDITIONAL_INFO_STATUS_OPTIONS = [
    { value: "ADDITIONAL_INFO_STATUS_UNSPECIFIED", label: "Unspecified" },
    { value: "ADDITIONAL_INFO_STATUS_REQUESTED",   label: "Requested" },
    { value: "ADDITIONAL_INFO_STATUS_RECEIVED",    label: "Received" },
    { value: "ADDITIONAL_INFO_STATUS_IN_REVIEW",   label: "In Review" },
    { value: "ADDITIONAL_INFO_STATUS_COMPLETED",   label: "Completed" },
];

const ADDITIONAL_INFO_TYPE_OPTIONS = [
    { value: "ADDITIONAL_INFO_TYPE_UNSPECIFIED",     label: "Unspecified" },
    { value: "ADDITIONAL_INFO_TYPE_WAIVER",          label: "Waiver" },
    { value: "ADDITIONAL_INFO_TYPE_SOURCE_OF_FUNDS", label: "Source of Funds" },
    { value: "ADDITIONAL_INFO_TYPE_OTHER",           label: "Other" },
];

export default function TransactionReviewDialog({
                                                    open,
                                                    onClose,
                                                    transactionId,
                                                    currentValues,
                                                    onSaveSuccess,
                                                }) {
    // ─── Local form state ─────────────────────────────────────────────────────
    const [reviewStatus, setReviewStatus] = useState("");
    const [additionalInfoStatus, setAdditionalInfoStatus] = useState("");
    const [additionalInfoType, setAdditionalInfoType] = useState("");
    const [notes, setNotes] = useState("");
    const [escalateChecked, setEscalateChecked] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Whenever the dialog opens (or currentValues change), prefill the fields
    useEffect(() => {
        if (open) {
            setReviewStatus(currentValues.reviewStatus || "REVIEW_STATUS_UNSPECIFIED");
            setAdditionalInfoStatus(
                currentValues.additionalInfoStatus || "ADDITIONAL_INFO_STATUS_UNSPECIFIED"
            );
            setAdditionalInfoType(
                currentValues.additionalInfoType || "ADDITIONAL_INFO_TYPE_UNSPECIFIED"
            );
            setNotes(currentValues.notes || "");
            setEscalateChecked(false);
            setErrorMsg("");
        }
    }, [open, currentValues]);

    // If “Escalate Transaction” is checked, force reviewStatus → “ESCALATED”
    const handleEscalateChange = (evt) => {
        const checked = evt.target.checked;
        setEscalateChecked(checked);
        if (checked) {
            setReviewStatus("REVIEW_STATUS_ESCALATED");
        }
    };

    // Basic validation: either a reviewStatus must be selected or escalate must be on
    const canSave = () => {
        if (!reviewStatus || reviewStatus === "REVIEW_STATUS_UNSPECIFIED") {
            setErrorMsg("Please select a review status or escalate.");
            return false;
        }
        return true;
    };

    // When “Save” is clicked, send a single POST to /v1/transaction/review
    const handleSave = async () => {
        setErrorMsg("");
        if (!canSave()) return;

        setSaving(true);
        try {
            const payload = {
                transaction_id:            transactionId,
                review_status:             reviewStatus,
                additional_info_status:    additionalInfoStatus,
                additional_info_type:      additionalInfoType,
                notes:                     notes,
            };

            const res = await fetch("http://localhost:50052/v1/transaction/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Review RPC failed");
            }

            // On success, show a snackbar, call onSaveSuccess, then close
            setSnackbarOpen(true);
            onSaveSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            setErrorMsg(err.message || "Unexpected error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"            // A bit wider than “sm”
                fullWidth
                PaperProps={{ sx: { p: 2 } }}  // Add padding around the edges
            >
                <DialogTitle>Review Transaction</DialogTitle>
                <DialogContent dividers>
                    {errorMsg && (
                        <Box mb={2}>
                            <Typography color="error">{errorMsg}</Typography>
                        </Box>
                    )}

                    {/* ─── Group 1: Review Status + Escalate Switch ─────────────────────── */}
                    <Box mb={3}>
                        <Grid container spacing={2} alignItems="center">
                            {/* ─── Review Status Dropdown ────────────────────────────────── */}
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    error={!reviewStatus && !escalateChecked}
                                    // Add custom styles to make the Select taller:
                                    sx={{
                                        "& .MuiSelect-select": {
                                            paddingTop: "12px",
                                            paddingBottom: "12px",
                                            minHeight: "3rem",
                                        },
                                    }}
                                >
                                    <InputLabel id="review-status-label">Review Status</InputLabel>
                                    <Select
                                        labelId="review-status-label"
                                        id="review-status"
                                        value={reviewStatus}
                                        label="Review Status"
                                        onChange={(e) => setReviewStatus(e.target.value)}
                                        disabled={escalateChecked}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    "& .MuiMenuItem-root": {
                                                        minHeight: "2.5rem",   // Increase each menu item’s height
                                                        lineHeight: 1.5,       // For better vertical centering
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {/* Plain‐text labels (no colored chips) */}
                                        {REVIEW_STATUS_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {!reviewStatus && !escalateChecked && (
                                        <FormHelperText>
                                            Please choose a status or escalate.
                                        </FormHelperText>
                                    )}
                                </FormControl>
                            </Grid>

                            {/* ─── Escalate Switch ─────────────────────────────────────────── */}
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={escalateChecked}
                                            onChange={handleEscalateChange}
                                            color="error"
                                        />
                                    }
                                    label="Escalate Transaction"
                                />
                                <Typography variant="caption" color="textSecondary">
                                    Forces Review Status → Escalated
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ─── Group 2: Additional Info Status + Type ──────────────────────── */}
                    <Box mb={3}>
                        <Grid container spacing={2}>
                            {/* ─── Add’l Info Status Dropdown ─────────────────────────── */}
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& .MuiSelect-select": {
                                            paddingTop: "12px",
                                            paddingBottom: "12px",
                                            minHeight: "3rem",
                                        },
                                    }}
                                >
                                    <InputLabel id="add-info-status-label">
                                        Additional Info Status
                                    </InputLabel>
                                    <Select
                                        labelId="add-info-status-label"
                                        id="add-info-status"
                                        value={additionalInfoStatus}
                                        label="Additional Info Status"
                                        onChange={(e) =>
                                            setAdditionalInfoStatus(e.target.value)
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    "& .MuiMenuItem-root": {
                                                        minHeight: "2.5rem",
                                                        lineHeight: 1.5,
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {ADDITIONAL_INFO_STATUS_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* ─── Add’l Info Type Dropdown ───────────────────────────── */}
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        "& .MuiSelect-select": {
                                            paddingTop: "12px",
                                            paddingBottom: "12px",
                                            minHeight: "3rem",
                                        },
                                    }}
                                >
                                    <InputLabel id="add-info-type-label">
                                        Additional Info Type
                                    </InputLabel>
                                    <Select
                                        labelId="add-info-type-label"
                                        id="add-info-type"
                                        value={additionalInfoType}
                                        label="Additional Info Type"
                                        onChange={(e) =>
                                            setAdditionalInfoType(e.target.value)
                                        }
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    "& .MuiMenuItem-root": {
                                                        minHeight: "2.5rem",
                                                        lineHeight: 1.5,
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {ADDITIONAL_INFO_TYPE_OPTIONS.map((opt) => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* ─── Group 3: Notes (Full Width) ───────────────────────────────────── */}
                    <Box mb={3}>
                        <TextField
                            id="analyst-notes"
                            label="Notes"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        disabled={saving}
                    >
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── Success Snackbar ───────────────────────────────────────────────── */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                message="Transaction reviewed successfully"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            />
        </>
    );
}

TransactionReviewDialog.propTypes = {
    open:          PropTypes.bool.isRequired,
    onClose:       PropTypes.func.isRequired,
    transactionId: PropTypes.string.isRequired,
    currentValues: PropTypes.shape({
        reviewStatus:           PropTypes.string,
        additionalInfoStatus:   PropTypes.string,
        additionalInfoType:     PropTypes.string,
        notes:                  PropTypes.string,
    }),
    onSaveSuccess: PropTypes.func,
};

TransactionReviewDialog.defaultProps = {
    currentValues: {
        reviewStatus:         "REVIEW_STATUS_UNSPECIFIED",
        additionalInfoStatus: "ADDITIONAL_INFO_STATUS_UNSPECIFIED",
        additionalInfoType:   "ADDITIONAL_INFO_TYPE_UNSPECIFIED",
        notes:                "",
    },
    onSaveSuccess: null,
};
