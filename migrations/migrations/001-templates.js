const createTemplateTable = `
  CREATE TABLE templates (
    id UUID PRIMARY KEY,
    json_config JSONB,
    organisation UUID
  );
`;

module.exports.generateSql = () => `${createTemplateTable}`;
