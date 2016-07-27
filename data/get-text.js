function decay(value, e, c) {
  var exp = e.reduce(function(acc, v, i) {
    return acc + v * c[i];
  }, 0);

  return value * Math.pow(Math.E, -exp);
}

function timestampToDays(value) {
  var r = (Date.now() - value / 1e3) / (1e3 * 3600 * 24);
  return parseFloat(r.toFixed(2));
}

self.port.on("recommendations", function onShow(links) {
  var ul = document.getElementById("container");
  ul.innerHTML = "";

  console.log("links b4", links);

  links = links
            .map(e => {
              e[4] = timestampToDays(e[4]);
              e[1] = decay(e[1], [e[3], e[4], e[5]], [1, 1, 0.5]);
              console.log(e[1], e[2]);
              return e;
            })
            .filter(e => e[1] > 0 && e[2]) // positive score && title !== null
            .sort(function(a, b) { return b[1] - a[1]; })
            .filter((e, idx, arr) => { // filter out consecutive links from same host
              if (idx === 0) {
                return 1;
              }

              if (arr[idx - 1][6] === e[6]) { // same host
                return 0;
              }

              return 1;
            })
            .map(e => {
              e[1] = parseFloat(e[1].toFixed(3));
              return e;
            });

  console.log("get text", links);
  appendToPage(links, ul);
});

function appendToPage(data, container) {
  var fragment = document.createDocumentFragment();
  data.map(createElement).forEach(function(el) {
    fragment.appendChild(el);
  });

  container.appendChild(fragment);
}

function createElement(data) {
  console.log("createElement", data);
  var el = document.createElement("li");
  var a = document.createElement("a");
  var p = document.createElement("p");
  var title = data[2];

  if (!title || title === "null") {
    title = data[0];
  }

  p.innerHTML = " score:" + data[1] + " age:" + data[4] + " visits:" + data[3];

  a.innerHTML = title;
  a.href = data[0];
  a.target = "_blank";
  el.appendChild(a);
  el.appendChild(p);

  return el;
}
