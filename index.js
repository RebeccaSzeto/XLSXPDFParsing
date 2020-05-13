const XLSX = require('xlsx');
const fs = require("fs");

let data =  '{"glossary": {"title": "example glossary","GlossDiv": {"title": "S","GlossList": {"GlossEntry": {"ID": "SGML","SortAs": "SGML","GlossTerm": "Standard Generalized Markup Language","Acronym": "SGML","Abbrev": "ISO 8879:1986","GlossDef": {"para": "A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso": ["GML", "XML"]},"GlossSee": "markup"}}}}}';
let date = new Date();
let files  = [];
let jsonData = {};
let name = "";
Object.keys(data).map(function(prop){
        let tit = data.title;
        jsonData[tit] = data.GlossList;
})
jsonData["datetime"] = date;
files.push(data);

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