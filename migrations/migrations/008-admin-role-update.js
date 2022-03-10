const query = `
  UPDATE users
  SET admin=true

`;

module.exports.generateSql = () => `${query}`;
