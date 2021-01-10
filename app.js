if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: __dirname + "/.env" });
  }
  
  const express = require("express");
  const app = express();
  const cors = require("cors");
  const bodyParser = require("body-parser");
  const fileUpload = require("express-fileupload");
  const path = require("path");
  const port = process.env.PORT || 3000;

  
  app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));
  app.use(bodyParser.json({ limit: "10mb" }));
  
  app.use(cors());
  
  app.use(
    fileUpload({
      createParentPath: true,
      limits: {
        fileSize: 100 * 1024 * 1024 * 1024, //2MB max file(s) size
      },
    })
  );
  
//file route
const fileRoute = require('./routes/files')
app.use("/files", fileRoute)

const userRoute = require('./routes/users')
app.use("/users", userRoute)


//connect to db..........................................................
const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
const db = mongoose.connection
db.on("error", error => console.log(error))
db.on("open", () => console.log("Connected to DB"))


app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
