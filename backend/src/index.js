const CookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({
  path: 'variables.env'
});
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

server.express.use(CookieParser());

// decode the JWT so we can get usreId on each request
server.express.use(
  (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
      const { userId } = jwt.verify(token, process.env.APP_SECRET);
      console.log(userId);
      req.userId = userId;
    }
    next();
  }
);

// create middleware that populate user on each request
server.express.use(
  async (req, res, next) => {
    if (!req.userId) return next();
    const user = await db.query.user({
      where: { id: req.userId }
    }, '{id, permissions, name, email}')
    // console.log(user);
    req.user = user;
    next();
  }
);

server.start({
  cors: {
    credentials: true,
    origin: process.env.FRONTEND_URL
  }
}, deets => {
  console.log(`Server is running on http://localhost:${deets.port}`);
})