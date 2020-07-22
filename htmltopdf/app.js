var express = require('express')
var morgan = require('morgan')
var multer = require('multer')
var bodyParser = require('body-parser')
var wkhtmltopdf = require('wkhtmltopdf')
var port = process.env.PORT||3000;
var serveStatic = require('serve-static')
var path = require('path')


//0 - IN PROGRESS
//1 - COMPLETED
//2 - DOWNLOADED

const sqlite3 = require('sqlite3').verbose()

var app = express();

//app.use(express.static('OutPDFs'))
//app.use(express.static('UploadedFiles'))
app.use(serveStatic(path.join(__dirname, 'OutPDFs')))

app.use(bodyParser.json())
app.use(morgan('combined'))


app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html')
})

app.get('/loading', function(req,res){
  res.sendFile(__dirname + '/loading.gif')
})

//MULTER CODE
var Storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "./UploadedFiles");
  },
  filename: function(req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

var upload = multer({
  storage: Storage,
}).single("uploadFiles"); //Field name and max count

app.post('/htmltopdf', upload ,function(req,res){
  let db = new sqlite3.Database('files')
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var sql = "INSERT INTO files(filename,date,status) VALUES ($1,$2,$3)"
    try {
        //run SQL Command here
        
        db.run(sql, [req.file.filename,date,0] , function(err){
          if (err) {
            res.status(500).send(err.toString())
            console.log(err.toString())
            }
          // get the last insert id
            console.log('New file!');
        });

        res.send("<html><script>window.location.replace('/')</script></html>");
    } catch(error) {
          console.log(error);
          res.sendStatus(400);
    }
})

//wkhtmltopdf('http://apple.com/', { output: './OutPDFs/out.pdf' });

app.get('/convert', function(req,res){
  let db = new sqlite3.Database('files')
  var sql = 'SELECT * FROM files WHERE status = 1'
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    //console.log(rows);
    res.send(JSON.stringify(rows))
  });
});


app.get('/download/:pathId', function(req,res){
  let db = new sqlite3.Database('files')
  var sql = "SELECT date,filename FROM files WHERE id = $1"
  db.get(sql, [req.params.pathId], (err, row) => {
    if (err) {
      throw err;
    }
    res.sendFile(__dirname + `/OutPDFs/${row.filename}.pdf`)
    db.get("UPDATE files SET status = 2 WHERE id = $1", [req.params.pathId], (err, row) => {
      if (err) {
        throw err;
      }
      console.log("Filename deleted from files!")
    //res.sendFile(__dirname + `/OutPDFs/${row.filename}.pdf`)
    });
  });
});


app.listen(port, function () {
  console.log('Server running on port: ' + port);
});