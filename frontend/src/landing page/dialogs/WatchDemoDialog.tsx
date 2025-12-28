// src/pages/LandingPage/dialogs/WatchDemoDialog.tsx

import { Box, Button, Dialog, IconButton, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { useEffect, useState } from "react";

// libphonenumber-js is the source of truth for phone validity + length rules. 
import {
    isValidPhoneNumber,
    validatePhoneNumberLength,
} from "libphonenumber-js";

// mui-tel-input renders the phone input + country dropdown (flags) and gives us country info in onChange. 
import {
    MuiTelInput,
    matchIsValidTel,
    type MuiTelInputInfo,
} from "mui-tel-input";

// privacy-enhanced embed
const YT_EMBED = "https://www.youtube-nocookie.com/embed/352oIe3aPuk?autoplay=1&rel=0";

// ✅ Keep allowed countries in ONE place (easy to maintain).
const ALLOWED_COUNTRIES = ["US", "GB", "EG", "IN", "AE"] as const;
type AllowedCountry = (typeof ALLOWED_COUNTRIES)[number];

// ✅ Map ISO country -> calling code digits (used to safely extract national digits from E.164).
// This avoids relying on info.nationalNumber (which can vary depending on formatting). 
const CALLING_CODE: Record<AllowedCountry, string> = {
    US: "1",
    GB: "44",
    EG: "20",
    IN: "91",
    AE: "971",
};

// ✅ Mobile prefix rules per country (national digits AFTER the country code).
// - EG: mobile operators commonly start 010/011/012/015 locally => after +20 it becomes 10/11/12/15. 
// - AE: common mobile prefixes include 050/052/054/055/056/058 => after +971 it becomes 50/52/54/55/56/58. 
// - GB: UK mobile starts 07 locally => after +44 it becomes 7... 
// - IN: India mobile starts with 6/7/8/9.
const MOBILE_PREFIX_RULES: Partial<Record<AllowedCountry, string[]>> = {
    EG: ["10", "11", "12", "15"],
    AE: ["50", "52", "54", "55", "56", "58"],
    GB: ["7"],
    IN: ["6", "7", "8", "9"],
    // US handled by NANP rules below.
};

// ✅ NANP (US/Canada style): area code and exchange cannot start with 0 or 1 (N=2..9). 
function isUsNanpPartial(nationalDigits: string) {
    // Allow empty (user is starting).
    if (!nationalDigits) return true;

    // Only digits allowed here.
    if (!/^\d+$/.test(nationalDigits)) return false;

    // 1) First digit (area code) must be 2-9 (as soon as it exists).
    if (nationalDigits.length >= 1 && !/^[2-9]/.test(nationalDigits)) return false;

    // 2) Fourth digit (exchange first digit) must be 2-9 (as soon as it exists). 
    if (nationalDigits.length >= 4 && !/^[2-9]\d{2}[2-9]/.test(nationalDigits)) return false;

    // 3) US national number is 10 digits (cap typing early).
    if (nationalDigits.length > 10) return false;

    return true;
}

// ✅ Helper: E.164 (+<code><national>) -> national digits.
function getNationalDigitsFromE164(e164: string, country: AllowedCountry) {
    const digits = (e164 || "").replace(/\D/g, "");
    const cc = CALLING_CODE[country];
    return digits.startsWith(cc) ? digits.slice(cc.length) : digits;
}

// ✅ Helper: allow partial typing toward a prefix.
// Example: allowed prefix is "10" and user typed "1" => OK (still possible).
function isAllowedPrefixPartial(nationalDigits: string, allowedPrefixes: string[]) {
    if (!nationalDigits) return true;
    return allowedPrefixes.some((p) => p.startsWith(nationalDigits) || nationalDigits.startsWith(p));
}

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function WatchDemoDialog({ open, onClose }: Props) {
    // ✅ UI state: form gate (form first, then video).
    const [watchUnlocked, setWatchUnlocked] = useState(false);

    // ✅ Form fields.
    const [watchForm, setWatchForm] = useState({
        companyName: "",
        fullName: "",
        email: "",
        phone: "",
    });

    // ✅ Default country = US (as requested).
    const [selectedCountry, setSelectedCountry] = useState<AllowedCountry>("US");

    // ✅ Error message shown under phone input.
    const [phoneError, setPhoneError] = useState("");

    // ✅ Reset when dialog closes.
    useEffect(() => {
        if (!open) {
            setWatchUnlocked(false);
            setPhoneError("");
            setSelectedCountry("US");
            setWatchForm((p) => ({ ...p, phone: "" }));
        }
    }, [open]);

    const handleClose = () => {
        onClose();
        setWatchUnlocked(false);
        setPhoneError("");
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                },
            }}
        >
            <Box sx={{ p: 4, position: "relative", bgcolor: "#fff" }}>
                <IconButton onClick={handleClose} size="small" sx={{ position: "absolute", top: 10, right: 10 }}>
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            bgcolor: "rgba(16, 52, 166, 0.12)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <PlayArrowRoundedIcon sx={{ color: "#1034A6" }} />
                    </Box>

                    <Typography sx={{ fontWeight: 700, color: "#2C3E50", fontSize: "1.25rem", mb: 1 }}>
                        See NomiAI in action
                    </Typography>

                    <Typography sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                        Fill out the form below to unlock our 6-minute product walkthrough.
                    </Typography>
                </Box>

                {!watchUnlocked ? (
                    <Box
                        component="form"
                        onSubmit={(e) => {
                            e.preventDefault();

                            // ✅ Final validation on submit (must be a real valid number).
                            // matchIsValidTel is a helper from mui-tel-input. 
                            const ok = matchIsValidTel(watchForm.phone, { onlyCountries: [...ALLOWED_COUNTRIES] });
                            if (!ok) {
                                setPhoneError("Enter a valid phone number for the selected country.");
                                return;
                            }

                            // ✅ Extra strict: real libphonenumber validity on E.164 string. 
                            if (!isValidPhoneNumber(watchForm.phone)) {
                                setPhoneError("Phone number is not valid.");
                                return;
                            }

                            setPhoneError("");
                            setWatchUnlocked(true);
                        }}
                        sx={{ display: "grid", gap: 2 }}
                    >
                        <TextField
                            label="COMPANY NAME"
                            value={watchForm.companyName}
                            onChange={(e) => setWatchForm((p) => ({ ...p, companyName: e.target.value }))}
                            required
                            fullWidth
                        />

                        <TextField
                            label="FULL NAME"
                            value={watchForm.fullName}
                            onChange={(e) => setWatchForm((p) => ({ ...p, fullName: e.target.value }))}
                            required
                            fullWidth
                        />

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            <TextField
                                label="WORK EMAIL"
                                value={watchForm.email}
                                onChange={(e) => setWatchForm((p) => ({ ...p, email: e.target.value }))}
                                type="email"
                                required
                                fullWidth
                            />

                            <Box>
                                <MuiTelInput
                                    label="PHONE NUMBER"
                                    value={watchForm.phone}
                                    // ✅ Default country = US.
                                    defaultCountry="US"
                                    // ✅ Show +1 / +20 / +971 next to the flag (no duplicate Country field). 
                                    forceCallingCode
                                    // ✅ Restrict dropdown to only these countries. 
                                    onlyCountries={[...ALLOWED_COUNTRIES]}
                                    preferredCountries={["US", "EG", "AE", "GB", "IN"]}
                                    focusOnSelectCountry
                                    fullWidth
                                    error={Boolean(phoneError)}
                                    helperText={phoneError || " "}
                                    onChange={(newValue: string, info?: MuiTelInputInfo) => {
                                        // ----------------------------
                                        // 0) Always allow deletion/backspace
                                        // ----------------------------
                                        if (newValue.length < watchForm.phone.length) {
                                            setPhoneError("");
                                            setWatchForm((p) => ({ ...p, phone: newValue }));
                                            return;
                                        }

                                        // ----------------------------
                                        // 1) Detect country change (flag dropdown) and "lock it in"
                                        //    IMPORTANT: forceCallingCode needs defaultCountry (or it defaults to US). [page:0]
                                        //    So when the user selects EG/AE/GB/IN, we store "+<countryCallingCode>" in state
                                        //    to prevent the component from snapping back to US on re-render.
                                        // ----------------------------
                                        const nextCountry = info?.countryCode as AllowedCountry | undefined;
                                        if (nextCountry && nextCountry !== selectedCountry) {
                                            setSelectedCountry(nextCountry);
                                            setPhoneError("");

                                            // Save at least the country code in the controlled value.
                                            // Example: EG -> "+20", AE -> "+971", etc.
                                            setWatchForm((p) => ({ ...p, phone: `+${CALLING_CODE[nextCountry]}` }));
                                            return;
                                        }

                                        // ----------------------------
                                        // 2) If we don't have an E.164 value yet, just update normally
                                        //    (this happens while the library is still formatting). [page:0]
                                        // ----------------------------
                                        if (!info?.numberValue) {
                                            setPhoneError("");
                                            setWatchForm((p) => ({ ...p, phone: newValue }));
                                            return;
                                        }

                                        const cc = selectedCountry;     // keep using the selected country (don’t “guess”)
                                        const e164 = info.numberValue;  // E.164 string (e.g. +2010123...) [page:0]

                                        // ----------------------------
                                        // 3) Hard length blocking by country rules (prevents extra digits)
                                        // ----------------------------
                                        const lengthResult = validatePhoneNumberLength(e164, cc);
                                        if (lengthResult === "TOO_LONG" || lengthResult === "INVALID_LENGTH") {
                                            setPhoneError("Number length is invalid for the selected country.");
                                            return;
                                        }

                                        // ----------------------------
                                        // 4) Prefix blocking (mobile prefixes) / US NANP blocking
                                        // ----------------------------
                                        const nationalDigits = getNationalDigitsFromE164(e164, cc);

                                        if (cc === "US") {
                                            if (!isUsNanpPartial(nationalDigits)) {
                                                setPhoneError("US number format is invalid (must follow NANP rules).");
                                                return;
                                            }
                                        } else {
                                            const allowedPrefixes = MOBILE_PREFIX_RULES[cc] || [];
                                            if (!isAllowedPrefixPartial(nationalDigits, allowedPrefixes)) {
                                                const msg =
                                                    cc === "EG"
                                                        ? "Egypt mobile must start with 10, 11, 12, or 15."
                                                        : cc === "AE"
                                                            ? "UAE mobile must start with 50, 52, 54, 55, 56, or 58."
                                                            : cc === "GB"
                                                                ? "UK mobile must start with 7 (internationally +44 7...)."
                                                                : cc === "IN"
                                                                    ? "India mobile must start with 6, 7, 8, or 9."
                                                                    : "Invalid prefix for selected country.";
                                                setPhoneError(msg);

                                                // Keep the selected country by reverting to just the calling code
                                                setWatchForm((p) => ({ ...p, phone: `+${CALLING_CODE[cc]}` }));
                                                return;
                                            }
                                        }

                                        // ----------------------------
                                        // 5) When complete, enforce strict validity
                                        // ----------------------------
                                        if (lengthResult === undefined && !isValidPhoneNumber(e164)) {
                                            setPhoneError("Phone number is not valid.");
                                            return;
                                        }

                                        // ----------------------------
                                        // 6) Accept the change
                                        // ----------------------------
                                        setPhoneError("");
                                        setWatchForm((p) => ({ ...p, phone: newValue }));
                                    }}

                                />

                                <Typography sx={{ fontSize: "0.75rem", color: "#000000ff", mt: 0.5 }}>
                                    Allowed countries: US, UK, Egypt, India, UAE — Choose your country.
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            type="submit"
                            sx={{
                                mt: 1,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: "#1034A6",
                                color: "#fff",
                                py: 1.5,
                                borderRadius: "10px",
                                boxShadow: "0 10px 25px rgba(16,52,166,0.22)",
                                "&:hover": { bgcolor: "#003D82" },
                            }}
                        >
                            Unlock Demo
                        </Button>

                        <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: "#94a3b8", textAlign: "center" }}>
                            No spam. We'll only use this to provide access.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                            <Box
                                component="iframe"
                                src={YT_EMBED}
                                title="Watch demo video"
                                allow="autoplay; encrypted-media; picture-in-picture"
                                allowFullScreen
                                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </Dialog>
    );
}
