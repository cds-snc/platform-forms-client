const query = `
  ALTER TABLE users
    ADD COLUMN admin boolean DEFAULT false,
    ADD COLUMN organisation UUID REFERENCES organisations (id);
`;

module.exports.generateSql = () => `${query}`;
