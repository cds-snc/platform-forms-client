const createTemplateTable = `
  CREATE TABLE templates (
    id UUID PRIMARY KEY,
    json_config TEXT,
    organisation UUID
  );
`;

module.exports.generateSql = () => `${createTemplateTable}`;
