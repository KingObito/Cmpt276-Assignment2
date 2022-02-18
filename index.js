const express = require('express');
const { get } = require('express/lib/response');
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require ('pg');
var pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:Dragon122.@localhost/rectangles",
  ssl: {rejectUnauthorized: false}
  /*
  user: 'postgres',
  host: 'localhost',
  database: 'rectangles',
  password: 'Dragon122.',
  port: 5432,
  */
})
pool.connect();

var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
app.get('/EditNdDelete/:uid', (req, res) => {
  var getRectangle = `SELECT * FROM rectangle WHERE uid = ${req.params.uid}`;
  pool.query(getRectangle, (error,result) =>{
    if(error)
    res.end(error);
    var results = {'rows': result.rows}
    res.render('pages/EditNdDelete',results);
  })
});


app.get('/database',(req,res) =>{
  var getRectangles = 'SELECT * FROM rectangle';
  pool.query(getRectangles, (error,result) =>{
    if(error)
    res.end(error);
    var results = {'rows': result.rows}
    res.render('pages/db',results);
  })
});
app.listen(PORT, () => console.log('Listening on ${PORT}'));

app.post('/create',(req,res) =>{
  const tableName = "rectangle";
  const rectanglename = req.body.name;
  const color = req.body.color;
  const width = req.body.width;
  const height = req.body.height;

  const values = [
  rectanglename,
  color,
  width,
  height]
  
  let string = `
  INSERT INTO ${tableName}
  (rectanglename, color, width, height)
  VALUES
  ($1, $2, $3, $4)`

  pool.query(string, values, (error,result) => {
    if(error)
    res.end(error);
    var results = {'rows': result.rows}
    res.redirect("/database");
  })
});

//https://www.zentut.com/sql-tutorial/sql-update/
app.post('/edit',(req,res) =>{
  const tableName = "rectangle";
  const rectanglename = req.body.name;
  const color = req.body.color;
  const width = req.body.width;
  const height = req.body.height;
  const rowNumber = req.body.uid;

  const values = [
  rectanglename,
  color,
  width,
  height,
  rowNumber]

  let string = `
  UPDATE ${tableName} SET rectanglename = $1, color = $2, width = $3, height = $4 WHERE uid = $5 RETURNING *`

  pool.query(string,values, (error,result) => {
    if(error)
    res.end(error);
    var results = {'rows': result.rows}
    res.redirect("/database");
  })
});

//https://www.w3schools.com/sql/sql_delete.asp
app.post('/delete',(req,res) =>{
  const tableName = "rectangle";
  const rowNumber = req.body.uid;

  const values = [rowNumber]
  
  let string = `
  DELETE FROM ${tableName} WHERE uid=$1 RETURNING *`
  pool.query(string,values, (error,result) => {
    if(error)
    res.end(error);
    var results = {'rows': result.rows}
    res.redirect("/database");
  })
});

 
