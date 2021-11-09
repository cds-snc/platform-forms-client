const alterTemplatesTableToAddBearerToken = `
  ALTER TABLE templates ADD COLUMN bearer_token TEXT;
  UPDATE templates SET bearer_token = 'tempstring';
  ALTER TABLE templates ALTER COLUMN bearer_token SET NOT NULL;
`;

module.exports.generateSql = () => `${alterTemplatesTableToAddBearerToken}`;
