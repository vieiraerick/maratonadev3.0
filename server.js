const express = require ('express');
const server = express();

//configuring server to show static files
server.use(express.static('public'));

//enable form body
server.use(express.urlencoded({ extended:true}));

//setting the database connection
const Pool = require('pg').Pool;
const db = new Pool({
  user: 'postgres',
  password: 'docker',
  host: '192.168.99.100',
  port: 5432,
  database: 'doe',
});

//setting the nunjucks template engine
const nunjucks = require('nunjucks');
nunjucks.configure("./", {
  express: server,
  noCache: true,
})


server.get('/', function(req, res){
  db.query("SELECT * FROM donors", function(err, result){
    if (err) return res.status(500).send("Erro de banco de dados.");

    const donors = result.rows;
    return res.render("index.html", { donors });

  })
})

server.post('/', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const blood = req.body.blood;

  if(name=="" || email=="" || blood==""){
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  //saving on database
  const query = `
    INSERT INTO donors("name", "email", "blood")
    VALUES ($1, $2, $3)`

  const values = [name, email, blood];

  db.query(query, values, function(err){
    if(err) return res.status(400).send("Erro no banco de dados.");

    return res.redirect('/'); 
  });
})

server.listen(3000, function(){
  console.log("server running")
});