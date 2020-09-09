// --- server.js ---
const feathers = require("feathers");
const serveStatic = require("feathers").static;
const rest = require("feathers-rest");
const socketio = require("feathers-socketio");
const hooks = require("feathers-hooks");
const bodyParser = require("body-parser");
const handler = require("feathers-errors/handler");
const multer = require("multer");
const multipartMiddleware = multer();
const dauria = require("dauria");

const blobService = require("feathers-blob");
const fs = require("fs-blob-store");
const blobStorage = fs(__dirname + "/uploads");

const XLSX = require('xlsx')


// Feathers app
const app = feathers();

// Serve our index page
app.use("/", serveStatic(__dirname));
// Parse HTTP JSON bodies
app.use(bodyParser.json({ limit: "10mb" }));
// Parse URL-encoded params
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
// Register hooks module
app.configure(hooks());
// Add REST API support
app.configure(rest());
// Configure Socket.io real-time APIs
app.configure(socketio());

// Upload Service with multipart support
app.use(
  "/uploads",

  // multer parses the file named 'uri'.
  // Without extra params the data is
  // temporarely kept in memory
  multipartMiddleware.single("uri"),

  // another middleware, this time to
  // transfer the received file to feathers
  function (req, res, next) {
    req.feathers.file = req.file;
    next();
  },
  blobService({ Model: blobStorage })
);

const handleUpload = (hook) => {
  if (!hook.data.uri && hook.params.file) {
    const file = hook.params.file;
    const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
    hook.data = { uri: uri };
    hook.data.id = hook.params.file.originalname;
  }
};

function loadSheet(uri) {
  buf = dauria.parseDataURI(uri).buffer
  const workbook = XLSX.read(buf, {type:'buffer'})
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return sheet
}


function sumWeights(sheet) {
  let cellIds = []
  for (i = 38; i <= 42; i++) {
      cellIds.push(`F${i}`)
  }

  const cells = Object.entries(sheet).filter(x=>cellIds.includes(x[0]))

  // add cell values
  let sum = 0
  for (let cell of cells) {
      sum += cell[1]['v']
  }

  // round float to 2 decimal pionts.
  sum = Number.parseFloat((sum*100).toFixed(2))
  return sum
}

const validateXlsWeights = (hook) => {
  const sum = sumWeights(loadSheet(hook.data.uri))
  if (sum == 100) {
    console.log("The underlying weights sums to 100%")
  } else {
    console.log(`The underlying weights doesn't sum to 100%. The weights sum is ${sum}`)
  }
};

app.service("/uploads").before({
  create: [handleUpload, validateXlsWeights],
});

// Register a nicer error handler than the default Express one
app.use(handler());

// Start the server
app.listen(3030, function () {
  console.log("Feathers app started at localhost:3030");
});
