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
  

app.get("/", (req, res)=>{
  res.send('My Shopify-Challenge API')
})

//file route
const fileRoute = require('./routes/files')
app.use("/files", fileRoute)

//user route
const userRoute = require('./routes/users')
app.use("/users", userRoute)

// handles requests made to inexistent endpoints
app.use((req, res, next)=>{
  const error = new Error('page not found');
  error.status = 404; 
  next(error);
})
app.use((error, req, res, next)=>{
  res.status(error.status || 500);
  res.json({
      error: {
          message: error.message
      },
      handled: false
  });
})


//connect to db..........................................................
const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})
const db = mongoose.connection
db.on("error", error => console.log(error))
db.on("open", () => console.log("Connected to DB"))


app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
