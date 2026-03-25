import React from "react";
import { Box, Typography } from "@mui/material";
import { IITP_HEADER_SETTINGS } from "../config/formUiSettings";

const IITPFormHeader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        pb: 1,
      }}
    >
      <Box
        component="img"
        src={IITP_HEADER_SETTINGS.logoPath}
        alt="IITP Logo"
        sx={{ width: 52, height: 52, objectFit: "contain" }}
      />
      <Box>
        <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
          {IITP_HEADER_SETTINGS.instituteNameEnglish}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {IITP_HEADER_SETTINGS.instituteNameHindi}
        </Typography>
      </Box>
    </Box>
  );
};

export default IITPFormHeader;
