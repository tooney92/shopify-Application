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

  app.use(express.static(path.join(__dirname, "public")));
  
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
    res.send('HI')
})



app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
