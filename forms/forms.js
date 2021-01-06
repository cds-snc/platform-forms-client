const requireModule = require.context("./", false, /\.json$/); //
const api = {};

requireModule.keys().forEach((fileName) => {
  const moduleName = fileName.replace(/(\.\/|\.json)/g, "");
  api[moduleName] = {
    ...requireModule(fileName),
  };
});

export default api;
