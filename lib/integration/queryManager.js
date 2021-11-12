import { logMessage } from "../logger";
import { dbConnector } from "./dbConnector";

export const executeQuery = async (sql, params) => {
  const client = await dbConnector();
  return client
    .query(sql, params)
    .then((data) => buildResult(data))
    .catch((error) => {
      logMessage.error(`{"error: "${formatError(error)}"}`);
      throw new Error(error);
    });
};
function buildResult(data) {
  //Result list
  let result = [];
  if (data.rowCount > 0) {
    for (let record in data.rows) {
      let recordResult = {};
      //Create result row object without meta data
      for (const [key, value] of Object.entries(data.rows[record])) {
        recordResult[key] = value;
      }
      //Adding row's content to the list
      result.push(recordResult);
    }
  }
  return result;
}
const formatError = (err) => {
  return typeof err === "object" ? JSON.stringify(err) : err;
};

export default executeQuery;
