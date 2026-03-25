const getResponseValue = (responses, key) => {
  if (!responses) return "";
  if (typeof responses.get === "function") {
    const value = responses.get(key);
    return value === undefined || value === null ? "" : value;
  }
  const value = responses[key];
  return value === undefined || value === null ? "" : value;
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
};

module.exports = { getResponseValue, formatDate };
