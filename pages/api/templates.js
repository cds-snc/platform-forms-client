import { crudTemplates } from "../../lib/dataLayer";
import { logMessage } from "../../lib/logger";

// handler

const templates = async (req, res) => {
  return crudTemplates(JSON.parse(req.body))
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      logMessage.error(err);
      res.status(500).json({ error: "Error on Server Side" });
    });
};

export default templates;
