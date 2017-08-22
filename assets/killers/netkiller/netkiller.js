/**
 * zxh
 */


let Socket = require('./socket');

let socket = null;
module.exports = (function() {
    if (!socket) {
        socket = new Socket();
        socket.Event = Socket.Event;
    }
    return socket;
})();

