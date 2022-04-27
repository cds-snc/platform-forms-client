const query = `
  CREATE TABLE admin_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users (id),
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action      VARCHAR(255) NOT NULL,
    event       VARCHAR(255) NOT NULL,
    description TEXT
  );
`;

module.exports.generateSql = () => `${query}`;
