# Form Design System & Standards

## Overview
This document defines the unified design standards for all forms in the IIT Patna application. All new forms must follow these guidelines to ensure consistency across fonts, sizing, and design.

---

## Frontend Form Standards

### Font Family
- **Primary Font**: IBM Plex Sans with fallbacks: "Segoe UI", Roboto, sans-serif
- **Defined in**: [frontend/src/theme/theme.js](frontend/src/theme/theme.js)

### Input Styling

#### Standard Form Inputs (Use for all new forms)
```javascript
import { standardInputSx, standardInputProps } from '../../utils/formStyles';

// In your form component:
<TextField
  value={formValues.fieldName}
  onChange={handleChange('fieldName')}
  sx={{ ...standardInputSx, minWidth: 160 }}
  {...standardInputProps}
/>
```

**Standard Input Properties:**
- **Variant**: `standard` (underline style) - NOT `outlined`
- **Font Size**: `16px` for input text
- **Font Size**: `14px` for labels
- **Underline Color**: `#222` (dark gray, normal state)
- **Underline Color**: `#0d47a1` (blue, focused state)
- **Line Height**: `1.4`

### Typography Sizes (Per MUI Theme)
- **h4** (Form Title): 34px, Weight 600, Letter-spacing -0.02em
- **h5** (Section Headers): 24px, Weight 600
- **body2** (Body Text): Line-height 1.6
- **label** (Field Labels): 14px, Weight 500-600

### Form Container & Paper Styling
```javascript
import { formContainerSx, formPaperSx, formTitleSx } from '../../utils/formStyles';

<Container maxWidth="md" sx={formContainerSx}>
  <Paper sx={formPaperSx}>
    <Typography variant="h4" sx={formTitleSx}>
      My Form Title
    </Typography>
    {/* form fields */}
  </Paper>
</Container>
```

### Color Palette
- **Primary**: `#0d47a1` (Deep Blue)
- **Primary Light**: `#5472d3`
- **Primary Dark**: `#002171`
- **Secondary**: `#00695c` (Teal)
- **Background**: `#f5f7fa`
- **Paper/White**: `#ffffff`
- **Border/Underline**: `#222` (Dark Gray)

### Button Styling
- **Text Transform**: None (use normal capitalization)
- **Font Weight**: 600
- **Border Radius**: 8px
- **Padding**: py: 1.2, px: 3

---

## Backend PDF Standards

### Font Family
- **Font**: Helvetica & Helvetica-Bold exclusively
- **No custom fonts** - use system fonts for PDF generation

### Font Sizes (Standardized via pdfStyles)
```javascript
const PDF_FONTS = {
  TITLE: 16,              // Main document/form title
  SECTION_HEADER: 13,     // Section headers (A, B, C, etc.)
  LABEL: 11,              // Field labels and subsection headers
  BODY: 11,               // Body text and field values
  SMALL: 10,              // Small supporting text (notes, remarks)
};
```

### PDF Generation Helper
Use the centralized `pdfStyles` helper for consistent formatting:

```javascript
const pdfStyles = require('../../utils/pdfStyles');

// Apply main title (centered, bold, underlined)
pdfStyles.applyMainTitle(doc, "DOCUMENT TITLE");

// Apply section header (A. Personal Information)
pdfStyles.applySectionHeader(doc, "A. Section Title");

// Apply field with label and value
pdfStyles.applyFieldRow(doc, "Label:", value, indent, leftMargin);

// Apply body text
pdfStyles.applyBodyText(doc, "Body paragraph text", { lineHeight: 1.5 });

// Apply signature block
pdfStyles.applySignatureBlock(doc, "SIGNATURE BLOCK", name, empNo, place, date, rightX, drawWidth);
```

### PDF Layout Guidelines
- **Left Margin**: `doc.page.margins.left` (default 72 points)
- **Right Margin**: `doc.page.margins.right` (default 72 points)
- **Line Width**: `0.5` points for underlines and borders
- **Spacing**: Use `doc.moveDown(n)` for vertical spacing between sections
- **Text Alignment**: Center titles, justify body text when appropriate

### PDF Header Format
```
TITLE (16px, bold, centered, underlined)
↓ (0.15 moveDown)
Institution Name (16px, bold, centered)
↓ (0.2 moveDown)
Department/Section (13px, bold, centered)
↓ (0.2 moveDown)
Form Type (13px, bold, centered)
↓ (0.9 moveDown)
```

---

## Form Structure Guidelines

### Section Organization
1. **Header**: Institution name, department, form type
2. **Section A, B, C**: Organized field groups
3. **Signature Block**: Signature lines with name, date, etc.
4. **Footer**: Approver information (optional)

### Field Rendering (Backend PDF)
```javascript
// Use the helper for consistent field rendering
const underlineField = (label, value, lineStart, lineEnd) => {
  pdfStyles.applyFieldRow(doc, label, value);
  // Draw underline
  doc.moveTo(lineStart, doc.y).lineTo(lineEnd, doc.y).lineWidth(0.5).stroke();
};
```

### Signature Blocks
- **Width**: 210 points
- **Height**: ~80 points
- **Format**: Signature line, then name/emp_no/place/date below (11px font)
- **Use Helper**: `pdfStyles.applySignatureBlock()` for consistency

---

## Creating New Forms

### Frontend Form Checklist
- [ ] Import form styles from `utils/formStyles.js`
- [ ] Use `standard` input variant (underline only)
- [ ] Set input font size to `16px` via `standardInputSx`
- [ ] Use theme colors from MUI theme
- [ ] Wrap form in Container with `formContainerSx`
- [ ] Wrap content in Paper with `formPaperSx`
- [ ] Apply `formTitleSx` to main title
- [ ] Use `h4` or `h5` variants for text hierarchy

### Backend PDF Form Checklist
- [ ] Import `pdfStyles` from `utils/pdfStyles.js`
- [ ] Use `pdfStyles.applyMainTitle()` for document title
- [ ] Use `pdfStyles.applySectionHeader()` for section headers
- [ ] Use `pdfStyles.applyFieldRow()` or custom field rendering with consistent font sizes
- [ ] Use `pdfStyles.getFontSize('TYPE')` instead of hardcoded sizes
- [ ] Use standard signature block helper `pdfStyles.applySignatureBlock()`
- [ ] Helvetica font exclusively
- [ ] Proper spacing via `doc.moveDown()`

---

## Files to Reference

### Frontend
- Theme: [frontend/src/theme/theme.js](frontend/src/theme/theme.js)
- Form Styles: [frontend/src/utils/formStyles.js](frontend/src/utils/formStyles.js)
- Example: [frontend/src/forms/security/SecurityCampusLeavePermissionForFemaleStudents.js](frontend/src/forms/security/SecurityCampusLeavePermissionForFemaleStudents.js)

### Backend
- PDF Styles: [backend/src/utils/pdfStyles.js](backend/src/utils/pdfStyles.js)
- PDF Utils: [backend/src/utils/pdfUtils.js](backend/src/utils/pdfUtils.js)
- Example: [backend/src/forms/genadmin/pdfGenerator.js](backend/src/forms/genadmin/pdfGenerator.js)

---

## Consistency Verification

Run a visual inspection to verify consistency:

### Frontend
- All form inputs have same font size (16px)
- All underlines are dark gray (#222)
- Blue active state appears on focus
- Titles and labels follow typography hierarchy

### Backend
- All titles are 16px, bold, centered, underlined
- Section headers are 13px, bold
- Field labels are 11px, bold
- Body text is 11px, regular
- Small supporting text is 10px

---

## Updates Made (Current Session)

### Frontend Changes
1. Updated [GenAdminForm.js](frontend/src/forms/genadmin/GenAdminForm.js): Changed font size from 18px to 16px
2. Updated [SecurityCampusLeavePermissionForFemaleStudents.js](frontend/src/forms/security/SecurityCampusLeavePermissionForFemaleStudents.js): Changed font size from 15px to 16px

### Backend Changes
1. Updated [ComputerCenterRequestingLdapAccountPdf](backend/src/forms/cc/ComputerCenterRequestingLdapAccountCreationOfProjectStaffTemporaryStaff.js): Now uses pdfStyles constants
2. Updated [GenAdminPdf](backend/src/forms/genadmin/pdfGenerator.js): Now uses pdfStyles constants
3. Updated [SecurityCampusLeavePermissionForFemaleStudentsPdf](backend/src/forms/security/SecurityCampusLeavePermissionForFemaleStudents.js): Now uses pdfStyles constants

### New Files Created
1. [frontend/src/utils/formStyles.js](frontend/src/utils/formStyles.js) - Centralized frontend form styling constants
2. [backend/src/utils/pdfStyles.js](backend/src/utils/pdfStyles.js) - Centralized backend PDF styling constants and helpers
