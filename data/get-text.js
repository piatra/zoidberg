function decay(value, e, c) {
  var exp = e.reduce(function(acc, v, i) {
    return acc + v * c[i]; 
  }, 0);

  return value * Math.pow(Math.E, -exp);
}

self.port.on("recommendations", function onShow(links) {
  var ul = document.getElementById("container");
  ul.innerHTML = "";

  links = links
            .map(function(e) {
              e[1] = decay(e[1], [e[3]], [1]);
              return e;
            })
            .sort(function(a, b) { return b[1] - a[1]; });

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
  var title = data[2];

  console.log(title, typeof title, title === "null", !title);

  if (!title || title === "null") {
    title = data[0];
  }

  a.innerHTML = title + " " + data[1];
  a.href = data[0];
  a.target = "_blank";
  el.appendChild(a);
  console.log(el.innerHTML);

  return el;
}
