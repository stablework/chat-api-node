const validation = require("../helpers/validation");
const joinController = require("../controllers/common/joinController");

const join = (router) => {
  router.get("/:token", joinController.preview);
  router.post("/:token", validation("join"), joinController.join);
  return router;
};

module.exports = join;
