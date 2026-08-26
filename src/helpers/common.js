
const moment = require('moment')
const { isLocalHost, requestBase } = require("./requestContext");

const _basePath = () => {
    const env = String(process.env.BASE_PATH || "").replace(/\/$/, "");
    if (env && !isLocalHost(env)) return env;
    const fromRequest = String(requestBase() || "").replace(/\/$/, "");
    if (fromRequest && !isLocalHost(fromRequest)) return fromRequest;
    return env || "http://localhost:3000";
}

const filePublicBase = () => {
    return `${_basePath().replace(/\/app$/, "")}/app`;
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
    let value = String(filePath);
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value)) {
        value = value.replace(/^https?:\/\/[^/]+/i, "");
    }
    if (value.startsWith("http")) {
        try {
            const url = new URL(value);
            value = url.pathname;
        } catch {
            return value;
        }
    }
    const relative = value.replace(/^storage\//, "").replace(/^\/?app\//, "").replace(/^\//, "");
    return `${filePublicBase()}/${relative}`;
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
