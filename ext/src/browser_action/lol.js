const dataSourceUrl = 'https://gist.githubusercontent.com/jotto/3ac53d5036bafd9c17fc63ecec6ff9f1/raw';

// HELPERS

const getDomain = url => {
  const a = document.createElement('a');
  a.href = url;

  if (typeof(a.hostname) === 'string') {
    return a.hostname.toLowerCase().replace(/^www\./, '');
  }

  return '';
}

const fixAnchors = () => {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
          chrome.tabs.create({active: true, url: location});
      };
    })();
  }
}

// VIEW/RENDERING

const renderAlternatives = (currentUrl, alternatives) => {
  let alternativesList = alternatives.map(renderAlternative).join('');
  return `<h1>${getDomain(currentUrl)} alternatives</h1><ul>${alternativesList}</ul>`
}

const renderAlternative = alternative => {
  return `<li><a href="${alternative.url}">${alternative.name}</a></li>`;
};

// APPLICATION

const createAlternativeSearch = urlStore => currentUrl => {
  let urls;

  Object.keys(urlStore).forEach((genre) => {
    if (urlStore[genre].sources.find(url => getDomain(url) === getDomain(currentUrl))) {
      urls = urlStore[genre].alternatives;
    }
  });

  return urls;
};

fetch(dataSourceUrl)
  .then((response) => response.json())
  .then(createAlternativeSearch)
  .then(getAlternatives => {
    chrome.tabs.query({ active: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const alternatives = getAlternatives(currentUrl);
      let html;

      if (!alternatives) {
        html = 'no matching websites found';
      } else {
        html = renderAlternatives(currentUrl, alternatives);
      }

      document.getElementById('mainPopup').innerHTML = html;
      fixAnchors();
    });

  })
  .catch(e => console.error(e));
