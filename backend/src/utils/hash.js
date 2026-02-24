require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = process.env.SALT

async function hashPassword(plainPassword) {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
}

async function verifyPassword(plainPassword, storedHash) {
  const isMatch = await bcrypt.compare(plainPassword, storedHash);
  return isMatch;
}
module.exports = {
  hashPassword,
  verifyPassword,
};