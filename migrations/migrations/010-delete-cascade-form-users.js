const query = `
  ALTER TABLE form_users
  DROP CONSTRAINT form_users_template_id_fkey;

  ALTER TABLE form_users
    ADD CONSTRAINT form_users_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES templates (id)
    ON DELETE CASCADE;
`;

module.exports.generateSql = () => `${query}`;
