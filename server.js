const express = require("express");
const routes = require("./src/routes/routes");
const path = require("path");
const helmet = require("helmet");
const csrf = require("csurf");
const connectDB = require("./src/config/mongodbConfig");
const session = require("express-session");
const app = express();

const { user } = require("./src/middlewares/globalsMiddleware");
const PORT = process.env.PORT || 3000;

app.use(helmet());
connectDB(app);

app.use(
  session({
    secret: "user-dash",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true }, // secure: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));
app.use("/lib/axios", express.static(__dirname + "/node_modules/axios/dist"));
app.use(
  "/lib/validator",
  express.static(__dirname + "/node_modules/validator")
);

//app.use(csrf());

app.use(user);
app.use(routes);

app.get("/", (req, res) => {
  res.redirect("/produtos");
});

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "src", "views"));

app.on("Ready", () => {
  app.listen(PORT, () => {
    console.log("Server started");
    console.log(`Running in: http://localhost:${PORT}/produtos`);
  });
});
