const schemaConvertor = require("./convert");
const { isValidUrl, getUrl } = require("./proxy-service");

module.exports = async function ({
  name,
  description,
  email,
  website,
  savedState,
  settings,
  data,
  tree,
  network,
  dataStream,
}) {
  const isDataUrl = isValidUrl(data);
  const dataUrl = isDataUrl ? data : undefined;

  let dataFile;
  if (dataStream) {
    dataFile = dataStream;
  }
  else {
    dataFile = await (
      isDataUrl
        ?
        getUrl(data)
        :
        data
    );
  }

  const isTreeUrl = isValidUrl(tree);
  const treeUrl = isTreeUrl ? tree : undefined;
  const treeFile = !isTreeUrl ? tree : undefined;

  const isNetworkUrl = isValidUrl(network);
  const networkUrl = isNetworkUrl ? network : undefined;
  const networkFile = !isNetworkUrl ? network : undefined;

  const doc = {
    name,
    description,
    email,
    website,
    savedState,
    settings,
    dataFile,
    dataUrl,
    treeFile,
    treeUrl,
    networkFile,
    networkUrl,
  };
  const json = await schemaConvertor(doc);
  return json;
};
