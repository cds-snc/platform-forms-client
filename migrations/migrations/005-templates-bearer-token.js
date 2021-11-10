const alterTemplatesTableToAddBearerToken = `
  ALTER TABLE templates ADD COLUMN bearer_token TEXT;
`;

module.exports.generateSql = () => `${alterTemplatesTableToAddBearerToken}`;
