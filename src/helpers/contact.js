const normalizeEmail = (email) => {
  if (!email) return null;
  const value = String(email).trim().toLowerCase();
  return value || null;
};

const normalizePhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
};

module.exports = { normalizeEmail, normalizePhone };
