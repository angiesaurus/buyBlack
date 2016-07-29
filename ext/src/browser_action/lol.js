const dataSourceUrl = '../../data/mappings.json';

// GOOGLE ANALYTICS

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-81258619-2']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

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

const renderNoAlternatives = (sourceUrl) => {
  return `
    <h1>no known alternatives</h1>
    <div class='no-alternatives'>
      We don't know of any alternatives to <u>${sourceUrl}</u>, send us suggestions at hello@buyblack.io
    </div>
  `;
}

const renderAlternatives = (currentUrl, alternatives) => {
  let alternativesList = alternatives.map(renderAlternative).join('');
  return `<h1>${getDomain(currentUrl)} alternatives</h1><ul>${alternativesList}</ul>`
}

const renderAlternative = alternative => {
  return `<li><a href="${alternative.url}">${alternative.name}</a></li>`;
};

// APPLICATION

const urlObjSort = (leftHandSide, rightHandSide) => leftHandSide.name.localeCompare(rightHandSide.name);

const createAlternativeSearch = urlStore => currentUrl => {
  let urls;

  Object.keys(urlStore).forEach((genre) => {
    const sourcesMatch = urlStore[genre].sources.find(url => getDomain(url) === getDomain(currentUrl));
    const alternativesMatch = urlStore[genre].alternatives.find(urlObj => getDomain(urlObj.url) === getDomain(currentUrl));

    if (sourcesMatch || alternativesMatch) {
      urls = urlStore[genre].alternatives.sort(urlObjSort);
    }
  });

  return urls;
};

fetch(dataSourceUrl)
  .then((response) => response.json())
  .then(createAlternativeSearch)
  .then(getAlternatives => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      const alternatives = getAlternatives(currentUrl);
      let html;

      if (!alternatives) {
        html = renderNoAlternatives(getDomain(currentUrl));
      } else {
        html = renderAlternatives(currentUrl, alternatives);
      }

      document.getElementById('mainPopup').innerHTML = html;
      fixAnchors();
    });

  })
  .catch(e => console.error(e));
