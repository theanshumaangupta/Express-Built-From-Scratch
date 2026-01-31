import express from "./myexpress.js";

const app = express();

app.get("/", (req, res) => {
  res.fileBhejo("index.html", "text/html");
});
app.get("/user", (req, res) => {
  res.fileBhejo("index.html", "text/html");
});

app.get("/user/:id", (req, res) => {
  console.log(req.params.id);
  res.sandesh(`/user/:id Your parameter value is ${req.params.id}`)
});

app.get("/user/:id/post/:no", (req, res) => {
  console.log(req.params.id);
  res.sandesh(`Your parameter value is ${req.params.id} and post is ${req.params.no}`)
});

app.get("/user/45", (req, res) => {
  res.sandesh(`Static`)
});



app.listen(3000, () => {
  console.log("Server running...");
});

