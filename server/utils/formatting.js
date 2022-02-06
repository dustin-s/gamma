const chalk = require("chalk");

exports.successMsg = (value) => chalk.bgHex("#345414").hex("#2a9df4")(value);

exports.errorMsg = (value) => chalk.bgHex("#ff0000").yellow(value);

exports.informationMsg = (value) => chalk.bgHex("#1167b1").whiteBright(value);
