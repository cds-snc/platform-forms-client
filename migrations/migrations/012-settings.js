const createSettingsTable = `
  CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    brandingRequestFormId VARCHAR(255),
  );
`;

module.exports.generateSql = () => `${createSettingsTable}`;
