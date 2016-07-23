const getDomain = url => {
  const a = document.createElement('a');
  a.href = url;

  if (typeof(a.hostname) === 'string') {
    return a.hostname.toLowerCase();
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

const renderAlternative = alternative => {
  return `<li><a href="${alternative.url}">${alternative.name}</a></li>`;
};

const createAlternativeSearch = urlStore => currentUrl => {
  let urls;

  Object.keys(urlStore).forEach((genre) => {
    if (urlStore[genre].sources.find(urlObj => getDomain(urlObj.url) === getDomain(currentUrl))) {
      urls = urlStore[genre].alternatives;
    }
  });

  return urls;
};

let url = 'https://gist.githubusercontent.com/jotto/3ac53d5036bafd9c17fc63ecec6ff9f1/raw/85056383c2815e16f4edffe2a79b64d95ae3efe0/url_datastore';

fetch(url)
.then((response) => response.json())
.then(createAlternativeSearch)
.then(getAlternatives => {
  chrome.tabs.query({ active: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    const alternatives = getAlternatives(currentUrl);
    let html;

    if (!alternatives) {
      html = 'no matching urls found';
    } else {
      let htmlList = alternatives.map(renderAlternative).join('');
      html = `<ul>${htmlList}</ul>`;
    }

    document.getElementById('mainPopup').innerHTML = html;
    fixAnchors();
  });

})
.catch(console.log)


