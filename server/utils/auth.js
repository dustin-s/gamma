const jwt = require("jsonwebtoken");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const SECRET = process.env.JWT;
const EXPIRATION = "12h";

exports.signToken = ({ email, userId }) => {
  const payload = { email, userId };
  return jwt.sign({ data: payload }, SECRET, { expiresIn: EXPIRATION });
};

exports.verifyToken = ({ req }) => {
  logger.debug("verify token reached", {
    controller: "auth.js --> verifyToken()",
  });

  // allows token to be sent via req.body, req.query, or headers
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    return req;
  }

  try {
    const { data } = jwt.verify(token, SECRET, { maxAge: EXPIRATION });
    req.user = data;
  } catch (e) {
    logger.error("Invalid token", { controller: "auth.js --> verifyToken()" });
  }

  return req;
};
