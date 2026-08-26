
const moment = require('moment')

const _basePath = () => {
    return process.env.BASE_PATH
}

const _success = (res, message='', result=[], status=true) => {
    return res.status(200).json({ status: status, message: message, result: result });
}

const _error = (res, message='', result=[]) => {
    return res.status(500).json({ status: false, message: message, result: result });
}

const _unauthorized = (res, message='', result=[]) => {
    return res.status(401).json({ status: false, message: message, result: result });
}

const _unprocessable = (res, message='', result=[]) => {
    return res.status(422).json({ status: false, message: message, result: result });
}

const _moment = (data='', type='') => {
    return moment().format();
}

const _filesData = (data) => {
    switch(data){
        case "chat-files":
            return { path: 'chat/files', name: 'files', link: `${_basePath()}/chat/files/` }
    }
}

const toPublicFileUrl = (filePath) => {
    if (!filePath) return filePath;
    if (String(filePath).startsWith('http')) return filePath;
    const relative = String(filePath).replace(/^storage\//, '').replace(/^\//, '');
    return `${_basePath()}/${relative}`;
}

const inviteUrl = (token) => {
    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');
    return `${clientUrl}/workspace/${token}`;
}

module.exports = { 
    _basePath,
    _success,
    _error, 
    _unauthorized,
    _unprocessable,
    _moment,
    _filesData,
    toPublicFileUrl,
    inviteUrl,
};
