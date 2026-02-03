import express from "./myexpress.js";

const app = express();

app.get("/", (req, res) => {
  res.fileBhejo("index.html", "text/html");
});
app.get("/user", (req, res) => {
  console.log("Hello i am rendering");
  res.sandesh("User Page");
});

app.get("/user/:id", (req, res) => {
  console.log(req.params.id);
  res.sandesh(`/user/:id Your parameter value is ${req.params.id}`)
});

app.get("/user/:id/post/:no", (req, res) => {
  console.log(req.params.id);
  res.sandesh(`Your parameter value is ${req.params.id} and post is ${req.params.no}`)
});

app.use( (req, res, next)=>{

  console.log("we used universal middleware");
  next()
  console.log("after we univ used middleware");
  
})

app.use("/user", (req, res, next)=>{

  console.log("we used middleware");
  next()
  console.log("after we used middleware");
  
})



app.listen(3000, () => {
  console.log("Server running...");
});

