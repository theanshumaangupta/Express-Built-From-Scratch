const myExpress = require('./myexpress')

const app = myExpress();

app.get("/", (req, res) => {
  res.fileBhejo("index.html", "text/html");
});
app.post("/", (req, res) => {
  console.log("the body is", req.body);
});
app.get("/user", (req, res) => {
  console.log("\nHello i am rendering User\n");
  res.sandesh("User Page");
});

app.get("/user/:id", (req, res) => {
  console.log(req.params.id);
  res.sandesh(`/user/:id Your parameter value is ${req.params.id}`)
});

app.get("/user/:id/post/:no", (req, res) => {
  console.log("",req.params.id);
  res.sandesh(`Your parameter value is ${req.params.id} and post is ${req.params.no}`)
});


// // Middlewares
// // Global Middleware
app.use((req, res, next) => {
  console.log("Universal Middleware Before");
  next()
  console.log("Universal Middleware After");

})
// Specific Middleware + chain of mw
app.use("/user", (req, res, next) => {
  console.log("Middleware 1 Before");
  next()
  console.log("Middleware 1 After");
}, (req, res, next) => {
  console.log("Middleware 2 Before");
  next()
  console.log("Middleware 2 After");
})



app.listen(3000, () => {
  console.log("Server running...\n");
});

