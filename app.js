const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const {Client} = require('pg');
require('dotenv').config();

var mustache = mustacheExpress();
mustache.cache = null;
var app = express();

app.engine('mustache' , mustache);
app.set('view engine' , 'mustache');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended : false}));

app.get('/books' , (req , res) => {
	
	const client = new Client();
	client.connect()
	.then(() => {
		//console.log("connection established");
		const sql = "SELECT * FROM books";
		return client.query(sql);
	})
	.then((result) => {
		//console.log(result);
		res.render('book-list' , {
			books: result.rows
		});
	})
	.catch((err) => {
		console.log("error" , err);
	})
	//res.render('list');
});

app.post('/book/delete/:id' , (req , res) => {
	//console.log('deleting' , req.params.id);
	const client = new Client();
	client.connect()
	.then(() => {
		const sql = "DELETE FROM books where book_id = $1";
		const params = [req.params.id];
		return client.query(sql , params);
	})
	.then((results) => {
		//console.log("results" , results);
		res.redirect("/books");
	})
	.catch((err) => {
		console.log("error" , err);
		res.redirect("/books");
	})
});

app.get('/book/add' , (req , res) => {
	res.render('book-form');
});

app.post('/book/add' , (req , res) => {

	var client = new Client();
	client.connect()
	.then(() => {
		//console.log('connection established');
		const sql = "INSERT INTO books (book_name , authors) VALUES ($1 , $2)";
		const params = [req.body.title , req.body.authors];
		return client.query(sql , params);
	})
	.then((result) => {
		//console.log("result" , result);
		res.redirect('/books');
	})
	.catch((err) => {
		console.log("Error occured" , err);
		res.redirect('/books');
	});
});

app.get('/book/edit/:id' , (req , res) => {
	const client = new Client();
	client.connect()
	.then(() => {
		const sql = "SELECT * from books where book_id = $1";
		const params = [req.params.id];
		return client.query(sql , params);
	})
	.then((results) => {
		//console.log(results);
		if (results.rowCount == 0)
			res.redirect('/books');
		//book = results.rows[0];
		//console.log(book.book_id , book.book_name , book.authors);
		res.render('book-edit' , {
			book: results.rows[0]
		});
	})
	.catch((err) => {
		console.log("error" , err);
	})
});

app.post('/book/edit/:id' , (req , res) => {
	//console.log("request");
	//console.log(req);
	const client = new Client();
	client.connect()
	.then(() => {
		//console.log(req.body.title , req.body.authors , req.params.id);
		const sql = "UPDATE books SET book_name = $1 , authors = $2 where book_id = $3";
		const params = [req.body.title , req.body.authors , req.params.id];
		return client.query(sql , params);
	})
	.then((results) => {
		//console.log(results);
		res.redirect("/books");
	})
	.catch((err) => {
		console.log("error" , err);
		res.redirect("/books");
	})
});

app.listen(process.env.PORT , () => {
	console.log(`Listening on port ${process.env.PORT}`);
});