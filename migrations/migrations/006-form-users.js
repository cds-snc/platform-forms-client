const createFormUsersTable = `
  CREATE TABLE form_users (
    id SERIAL PRIMARY KEY,
    template_id INT NOT NULL REFERENCES templates (id),
    email VARCHAR(80) NOT NULL,
    temporary_token TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;
module.exports.generateSql = () => `${createFormUsersTable}`;
