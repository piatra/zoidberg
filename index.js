var data = require("sdk/self").data;
var text_entry = require("sdk/panel").Panel({
  contentURL: data.url("text-entry.html"),
  contentScriptFile: data.url("get-text.js")
});
var db = require("./db.js");
const {URL} = require("sdk/url");

require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16-2.png",
    "32": "./icon-32-2.png",
    "64": "./icon-64-2.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  text_entry.show({
    width: 600,
    height: 400
  });
}

text_entry.on("show", function() {
  Promise.all([db.allHistory(), db.recentHistory()])
         .then(computeScore)
         .then(displayRecommendations);
});

text_entry.port.on("text-entered", function (text) {
  console.log(text);
  //text_entry.hide();
});

function displayRecommendations(urls) {
  console.log("displayRecommendations", urls);
  text_entry.port.emit("recommendations", urls);
}

function computeScore(values) {
  var allHistory, recentHistory;
  [allHistory, recentHistory] = values;
  var domainMap = countDomains(allHistory);

  // Validate that all history is made up of valid URLs.
  recentHistory = recentHistory.filter(e => {
    try {
      return URL(e[1]).host.length > 0;
    } catch (e) {
      console.log(e[1], "invalid url");
      return 0;
    }
  });

  var tf, idf, tfidf, url;
  var scores = recentHistory.map(function(entry) {
    url = URL(entry[1]);
    tf = entry[3]; //domainMap.get(url.host);
    idf = Math.log(domainMap.size / domainMap.get(url.host));

    return tf * idf;
  });

  return recentHistory.map(function(e, i) {
    return [e[1], scores[i], e[2], e[3], e[4], URL(e[1]).search.length, URL(e[1]).host]; // url, score, title, visit count, date
  });
}

function countDomains(allHistory) {
  var domainMap = new Map();
  var url;
  var value;

  allHistory.forEach(function(entry) {
    try {
      url = URL(entry[1]);
      value = domainMap.get(url.host);
      if (value) {
        domainMap.set(url.host, value + 1);
      } else {
        domainMap.set(url.host, 1);
      }
    } catch (e) {
      console.log(e);
    }
  });

  return domainMap;
}
