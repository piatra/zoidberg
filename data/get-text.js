//textArea.addEventListener('keyup', function onkeyup(event) {
  //console.log('keyup');
  //if (event.keyCode == 13) {
    //// Remove the newline.
    //text = textArea.value.replace(/(\r\n|\n|\r)/gm,"");
    //console.log(text);
    //self.port.emit("text-entered", text);
    //textArea.value = '';
  //}
//}, false);

self.port.on("show", function onShow(links) {
  var ul = document.getElementById("container");

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
  var el = document.createElement("li");
  el.innerHTML = data[0];
  return el;
}
