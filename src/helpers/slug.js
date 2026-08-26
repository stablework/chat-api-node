const crypto = require("crypto");

const uniqueWorkspaceCode = async (exists) => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const suffix = crypto.randomInt(0, 10000).toString().padStart(4, "0");
    const token = `FVR-${suffix}`;
    if (!(await exists(token))) {
      return token;
    }
  }
  throw new Error("Could not allocate a workspace code");
};

module.exports = { uniqueWorkspaceCode };
