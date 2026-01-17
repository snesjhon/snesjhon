fetch("https://httpbin.org/post", {
  method: "GET",
  body: JSON.stringify("test"),
}).then((item) => {
  console.log({ item });
});
