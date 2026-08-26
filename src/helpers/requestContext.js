const { AsyncLocalStorage } = require("async_hooks");

const requestContext = new AsyncLocalStorage();

const isLocalHost = (value) => /localhost|127\.0\.0\.1/i.test(String(value || ""));

const baseFromRequest = (req) => {
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "http")
    .split(",")[0]
    .trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "")
    .split(",")[0]
    .trim();
  if (!host) return "";
  return `${proto}://${host}`;
};

const withRequestBase = (req, res, next) => {
  requestContext.run({ base: baseFromRequest(req) }, next);
};

const requestBase = () => requestContext.getStore()?.base || "";

module.exports = {
  isLocalHost,
  withRequestBase,
  requestBase,
};
