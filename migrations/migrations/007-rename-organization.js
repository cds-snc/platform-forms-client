const query = `
  ALTER TABLE organisations
  RENAME TO organizations;

  ALTER TABLE templates
  RENAME COLUMN organisation TO organization;

  ALTER TABLE users
  RENAME COLUMN organisation TO organization;

  ALTER TABLE users RENAME CONSTRAINT users_organisation_fkey TO users_organization_fkey;
`;

module.exports.generateSql = () => `${query}`;
