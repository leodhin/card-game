const { SOCKET_EVENTS } = require('../../utils/constants');
const jwt = require('jsonwebtoken');

module.exports.verifySocketAuth = (socket, next) => {
    // Get token from handshake.auth or query string
    const authHeader = socket?.handshake?.headers?.authorization || socket.handshake.query.token;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        socket.emit(SOCKET_EVENTS.UNAUTHORIZED, 'You must be logged in to play');
    } else {
        const token = authHeader?.split(' ')[1]; 
        if (!token) {
            socket.emit(SOCKET_EVENTS.UNAUTHORIZED, 'Authentication error: token expired or invalid');
        } else {
            jwt.verify(token, process.env.SESSION_SECRET, (err, decoded) => {
                if (err) {
                    console.error(err);
                    socket.emit(SOCKET_EVENTS.UNAUTHORIZED, 'Authentication error: token expired or invalid')
                }
                socket.request.user = decoded;
                next();
            });
        }
    }
}

