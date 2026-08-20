const jwt = require("jsonwebtoken");
const User = require("./models/user");
const { getAccessibleChannel } = require("./helpers/channelAccess");

const onlineUsers = new Map();

const socketAuth = async (socket, next) => {
  try {
    const header = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      (header && header.startsWith("Bearer ") ? header.slice(7) : null);

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: payload.id, status: "active" }).exec();
    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
};

const presencePayload = (entry, online) => ({
  user_id: entry.user_id,
  name: entry.name,
  role: entry.role,
  online,
});

const snapshot = () =>
  Array.from(onlineUsers.values()).map((entry) => presencePayload(entry, true));

const attachSocket = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    socket.typingChannels = new Set();

    socket.join(`user:${userId}`);
    if (socket.user.role === "admin") {
      socket.join("admins");
    }

    const existing = onlineUsers.get(userId);
    if (existing) {
      existing.sockets.add(socket.id);
    } else {
      const entry = {
        user_id: userId,
        name: socket.user.name,
        role: socket.user.role,
        sockets: new Set([socket.id]),
      };
      onlineUsers.set(userId, entry);
      io.emit("presence:update", presencePayload(entry, true));
    }

    socket.emit("presence:snapshot", { users: snapshot() });

    socket.on("channel:join", async (channelId) => {
      const channel = await getAccessibleChannel(channelId, socket.user);
      if (channel) {
        socket.join(`channel:${channel._id}`);
      }
    });

    socket.on("channel:leave", (channelId) => {
      socket.leave(`channel:${channelId}`);
    });

    const emitTyping = async (channelId, typing) => {
      const channel = await getAccessibleChannel(channelId, socket.user);
      if (!channel) return;

      const payload = {
        channel_id: String(channel._id),
        user_id: userId,
        name: socket.user.name,
        typing,
      };

      socket.to(`channel:${channel._id}`).emit("typing:update", payload);
      if (socket.user.role === "guest") {
        io.to("admins").emit("typing:update", payload);
      }

      if (typing) socket.typingChannels.add(String(channel._id));
      else socket.typingChannels.delete(String(channel._id));
    };

    socket.on("typing:start", (channelId) => emitTyping(channelId, true));
    socket.on("typing:stop", (channelId) => emitTyping(channelId, false));

    socket.on("disconnect", () => {
      socket.typingChannels.forEach((channelId) => {
        const payload = {
          channel_id: channelId,
          user_id: userId,
          name: socket.user.name,
          typing: false,
        };
        socket.to(`channel:${channelId}`).emit("typing:update", payload);
        if (socket.user.role === "guest") {
          io.to("admins").emit("typing:update", payload);
        }
      });

      const entry = onlineUsers.get(userId);
      if (!entry) return;
      entry.sockets.delete(socket.id);
      if (entry.sockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:update", presencePayload(entry, false));
      }
    });
  });
};

module.exports = attachSocket;
