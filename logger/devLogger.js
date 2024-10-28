const winston = require("winston");
const { format } = winston;
const path = require("path");

const filename = path.join(__dirname, "/log/dev.json");

// 每次启动的时候都删除 log 文件
try {
  fs.unlinkSync(filename);
} catch (ex) {}

const devLogger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.File({
      filename,
      format: format.json(),
    }),
  ],
});

module.exports = devLogger;
