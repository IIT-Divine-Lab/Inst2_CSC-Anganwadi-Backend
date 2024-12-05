const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const connection = require("./startup/db");
const app = express();
const userRoutes = require("./routes/student")
const assessmentRoutes = require("./routes/assessment")
const resultRoutes = require("./routes/result")
const categoryRoutes = require("./routes/category")

app.use(morgan("dev"));
app.use(helmet());
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token"
   );
   if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "*");

      return res.status(200).json({});
   }
   next();
});

app.use("/admin/api/v1/category", categoryRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/assessment", assessmentRoutes)
app.use("/api/v1/result", resultRoutes)

app.use("/", (req, res, next) => {
   res.status(200).json({ message: "Api Working of Instance 2" })
})

app.listen(process.env.PORT || 5000, function () {
   console.log(
      "Express server listening on port %d in %s mode",
      this.address().port,
      app.settings.env
   );
   connection("mongodb+srv://divinelabcsc:SdQZ3dKkp1m2AITl@cscanganwadii2.d6mu5.mongodb.net/?retryWrites=true&w=majority&appName=csctabapp");
});