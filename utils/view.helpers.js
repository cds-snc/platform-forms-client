const addViewPath = (app, path) => {
  // set views accepts an array of paths
  // app.set("views", [path1, path2]);
  // -> add another path for lookup by view engine
  app.set('views', [...app.get('views'), path])
}

module.exports = {
  addViewPath,
}
