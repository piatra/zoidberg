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
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

function handleClick(state) {
  text_entry.show();
}

text_entry.on("show", function() {
  //db.allHistory().then(links => {
    //console.log("index", links);
    //text_entry.port.emit("show", links);
  //}).catch(e => {
    //console.log("error", e);
  //});

  Promise.all([db.allHistory(), db.recentHistory()]).then(computeScore);
});

text_entry.port.on("text-entered", function (text) {
  console.log(text);
  //text_entry.hide();
});

function computeScore(values) {
  console.log("computing score", values);
  var allHistory, recentHistory;
  [allHistory, recentHistory] = values;
  var domainMap = countDomains(allHistory);

  console.log("all history", allHistory);
  console.log("recentHistory", recentHistory);

  var tf, idf, tfidf, url;
  var scores = recentHistory.map(function(entry) {
    console.log(entry);
    url = URL(entry[1]);
    tf = entry[3]; //domainMap.get(url.host);
    idf = Math.log(domainMap.size / domainMap.get(url.host));

    console.log(tf, idf, domainMap, url.host);
    return tf * idf;
  });

  console.log("scores", scores);
}

function countDomains(allHistory) {
  console.log("count domains 1");
  var domainMap = new Map();
  var url;
  var value;
  console.log("count domains 2", allHistory);

  allHistory.forEach(function(entry) {
    console.log("count domains", entry);
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
