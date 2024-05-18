function isValidText(value, minLength = 3) {
  return value && value.trim().length >= minLength;
}

function isValidEmail(value) {
  return value && value.includes("@");
}

exports.isValidText = isValidText;
exports.isValidEmail = isValidEmail;
