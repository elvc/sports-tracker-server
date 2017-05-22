var socket = io.connect('http://localhost:8080');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});


document.getElementById("one").addEventListener("submit", function (event) {
  event.preventDefault();
  var input = document.getElementById("one-text").value
  socket.emit('post', { room: "one", post: "input" });
  return false;
});

document.getElementById("one-join").addEventListener("click", function () {
  socket.emit('join', { room: "one" });
});

document.getElementById("two").addEventListener("submit", function (event) {
  event.preventDefault();
  var input = document.getElementById("two-text").value
  socket.emit('post', { room: "two", post: "input" });
  return false;
});

document.getElementById("two-join").addEventListener("click", function () {
  socket.emit('join', { room: "two" });
});

document.getElementById("three").addEventListener("submit", function (event) {
  event.preventDefault();
  var input = document.getElementById("three-text").value
  socket.emit('post', { room: "three", post: "input" });
  return false;
});

document.getElementById("three-join").addEventListener("click", function () {
  socket.emit('join', { room: "three" });
});