
module.exports = {
  '/': require('./handler/mainhandler'),
  '/login': require('./handler/loginhandler'),
  '/no_task': require('./handler/notaskhandler'),
  '/llk': require('./handler/llkhandler'),
};
