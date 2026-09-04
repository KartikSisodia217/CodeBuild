import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

function ExportReportDialog({ open, onClose }) {
  const [format, setFormat] = useState("pdf");

  const handleExport = () => {
    console.log(`Exporting report as ${format}`);

    // Future API
    // exportAnalytics(format)

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Export Analytics Report
      </DialogTitle>

      <DialogContent>

        <Typography mb={2}>
          Choose report format
        </Typography>

        <RadioGroup
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <FormControlLabel
            value="pdf"
            control={<Radio />}
            label="PDF Report"
          />

          <FormControlLabel
            value="excel"
            control={<Radio />}
            label="Excel Spreadsheet"
          />

          <FormControlLabel
            value="csv"
            control={<Radio />}
            label="CSV File"
          />
        </RadioGroup>

      </DialogContent>

      <DialogActions>

        <Stack
          direction="row"
          spacing={2}
        >
          <Button
            onClick={onClose}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleExport}
          >
            Export
          </Button>

        </Stack>

      </DialogActions>
    </Dialog>
  );
}

export default ExportReportDialog;