const mappingsFilename = './ext/data/mappings.json';

try {
  const genreMappings = require(mappingsFilename);
} catch(err) {
  console.error("could not parse json:", err);
  process.exit(1);
}

Object.keys(genreMappings).forEach((genre) => {
  genreMappings[genre].sources.forEach((source) => {
    if (!source.startsWith("http")) {
      console.error("source url", source, " does not start with 'http'");
      process.exit(1);
    };
  });

  genreMappings[genre].alternatives.forEach((alternative) => {
    if (!alternative.url.startsWith("http")) {
      console.error("alternative url", alternative.url, " does not start with 'http'");
      process.exit(1);
    };
  });
});

var path = require('path');
console.log(path.basename(mappingsFilename), 'data structure is valid!');
