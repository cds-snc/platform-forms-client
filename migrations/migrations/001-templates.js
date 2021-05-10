const createTemplateTable = `
  CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    json_config JSONB,
    organisation UUID
  );
`;

module.exports.generateSql = () => `${createTemplateTable}`;
