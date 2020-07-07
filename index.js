const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require("path");
const express = require('express');
const multer  = require('multer');
const app = express();
const port = 3000;
const XLSX = require('xlsx');
const fs = require("fs");
const uploadsJSON = path.resolve(__dirname, 'uploads/uploads.json');
let upload = multer({ dest: 'uploads/', 
    fileFilter: function (req, file, cb) {
    if(!req.body.email){ 
      return cb(new Error('Email required'), false);
    }
    cb(null, true);
  } 
});

app.get('/', (req, res) => res.send('Hello !!'));

app.get('/document/:id', (req, res) => {
  const id = req.params.id;
  let documentData = JSON.parse(fs.readFileSync(uploadsJSON));
  documentData = documentData.files.filter(record => record.id === id);
  if (documentData.length == 0) {
    res.status(404).end();
  }else{
    let dataBuffer = fs.readFileSync(documentData[0]['path']);
    pdf(dataBuffer).then((data) => {
      let str = data.text;
      let rows = (str.trim().split('\n')).filter(entry => /\S/.test(entry));
      
      fileData = {
        uploadedBy : documentData[0]['uploadedBy'],
        uploadTimestamp : documentData[0]['timestamp']
      }
      res.json(fileData);
    });
  }
});

require("dotenv").config();
const { AbortController } = require("@azure/abort-controller");
const { ShareServiceClient, StorageSharedKeyCredential } = require("@azure/storage-file-share");
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const credential = new DefaultAzureCredential();
const vaultName = process.env["KEYVAULT_NAME"] ;
const url = `https://${vaultName}.vault.azure.net`;
const client = new SecretClient(url, credential);
const account =  process.env["ACCOUNT"];

router.post('/', async function(req, res, next) {
  const accountKey = await client.getSecret(account);
  // for await(const share of serviceClient.listShares()) {
  //   console.log(`Share ${i++}: ${share.name}`);
  // }res.render(viewData.viewName, viewData);
// });
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  const username = req.body.email;
  const file = req.file;
  if(!file){
    res.status(400).end();
    return next(new Error('File required'));
  }
  const timestamp = new Date;
  let fileData = {
    id: uuidv4(),
    uploadedBy: username,
    uploadTimestamp: timestamp.toLocaleString(),
    path: file.path,
    size: file.size
  }
  res.json({id:id});
  fs.readFile(uploadsJSON, { flag: 'wx' }, (err, data) => {
    if (err) throw err;
    var obj = (data === undefined ||  data == '') ? { files: [] } : JSON.parse(data);
    obj.files.push(fileData); 
    fs.writeFile(uploadsJSON, JSON.stringify(obj), (err) => console.log(err)); 
  });
});

app.get('/excel', (req, res) => {
let data = '[{"title":"form","value":{}}]';
data = JSON.parse(data);
let date = new Date();
let files  = [];
let jsonData = {};
let name = "";
Object.keys(data).map(function(prop){
  let tit = data[prop].title;
  let value = data[prop].value;
  let count = 0;
  try{
  if (typeof value === "object") {
      Object.keys(value).map(function(sub){
        if(value[sub] == true){
          jsonData[tit+count] = sub;
          count++;
        }
        if(value[sub] != false){
          jsonData[tit+count] = value[sub];
          count++;
          console.log(sub + value[sub])
        }
      });
  }else{  
    jsonData[tit] = value;
  }
}
catch(e){
  value = data[prop].value;
  jsonData[tit] = value;
}
  if(tit.startsWith("form")){
      name = value;
  }
})
jsonData["datetime"] = date.toString();
files.push(jsonData);

let fileName = 'example_' + name +'.xlsx';
let ws, wb;
if(fs.existsSync(fileName)) {
  wb = XLSX.readFile(fileName);
  ws = XLSX.utils.sheet_add_json(wb.Sheets[wb.SheetNames[0]], files, {skipHeader: true, origin: -1});
}else{
  ws = XLSX.utils.json_to_sheet(files);
  wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");  
}

XLSX.writeFileAsync(fileName, wb, function(err, success) {
  if (err) handleError(err);
  if (success && success.length > 0) {
    console.log(`Success had a greater length than 1. ${success }`);
  }
});

});


app.listen(port, () => console.log(`Hubdoc Intake listening on port ${port}!`))

module.exports = app;