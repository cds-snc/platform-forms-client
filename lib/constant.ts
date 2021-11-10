// Template table raw queries
export const TemplateSelectTokenByFormIdQuery =
  "SELECT bearer_token FROM Templates WHERE id = ($1)";
export const TemplateDeleteQuery = "DELETE from Templates WHERE id = ($1)";
export const TemplateInsertQuery = "INSERT INTO Templates (json_config) VALUES ($1) RETURNING id";
export const TemplateSelectByIdQuery = "SELECT * FROM Templates WHERE id = ($1)";
export const TemplateSelectAllQuery = "SELECT * FROM Templates";
export const TemplateUpdateQuery = "UPDATE Templates SET json_config = ($1) WHERE id = ($2)";
