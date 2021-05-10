const createOrganisationTable = `
  CREATE TABLE organisations (
    id UUID PRIMARY KEY,
    nameEN VARCHAR(255),
    nameFR VARCHAR(255)
  )
`;
module.exports.generateSql = () => `${createOrganisationTable}`;
