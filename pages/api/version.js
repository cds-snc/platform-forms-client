const version = async (req, res) => {
  const privacyContent = await require(`../../VERSION`);
  const changeLog = await require(`../../CHANGELOG.md`);

  const versionInfo = {
    version: privacyContent.default,
    changeLog: changeLog.default,
  };
  res.json(versionInfo);
};

export default version;
