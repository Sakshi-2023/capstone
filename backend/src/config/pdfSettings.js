const path = require("path");

const PDF_PAGE_SETTINGS = {
  margin: 32,
  leftMargin: 64,
  rightMargin: 32,
  topMargin: 28,
  bottomMargin: 28,
};

const PDF_HEADER_SETTINGS = {
  instituteNameEnglish: "Indian Institute of Technology Patna",
  instituteNameHindi: "भारतीय प्रौद्योगिकी संस्थान पटना",
  subtitle: "Forms Portal",
  logoPath: path.join(__dirname, "..", "assets", "iitp-logo.png"),
  hindiFontPath: path.join(
    __dirname,
    "..",
    "assets",
    "fonts",
    "NotoSansDevanagari-Regular.ttf"
  ),
  hindiFontName: "NotoSansDevanagari",
  logoWidth: 50,
};

module.exports = {
  PDF_PAGE_SETTINGS,
  PDF_HEADER_SETTINGS,
};
