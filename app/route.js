
var handleMap = {}

handleMap['/'] = require('./handler/mainhandle');
//handleMap['/login'] = require('./handler/loginhandle');

exports.handleMap = handleMap;
