const jwt = require("jsonwebtoken");

const { loggers } = require("winston");
const logger = loggers.get("logger");

const SECRET = process.env.JWT;
const EXPIRATION = "12h";

exports.signToken = ({ email, userId }) => {
  const payload = { email, userId };
  return jwt.sign({ data: payload }, SECRET, { expiresIn: EXPIRATION });
};

exports.verifyToken = (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers.authorization;

  if (req.headers.authorization) {
    token = token.split(" ").pop().trim();
  }

  if (!token) {
    logger.error("No token", {
      controller: "auth.js --> verifyToken()",
    });
    res.status(400).json({ error: "Token not present" });
    return;
  }

  try {
    const { data } = jwt.verify(token, SECRET, { maxAge: EXPIRATION });
    logger.debug(JSON.stringify(data), {
      controller: "auth.js --> verifyToken()",
      message: "verify token success",
    });

    req.user = data;
    next();
  } catch (err) {
    logger.error(err, {
      controller: "auth.js --> verifyToken()",
      errorMsg: "Invalid token",
    });
    res.status(403).json({ error: "Token invalid" });
  }
};
