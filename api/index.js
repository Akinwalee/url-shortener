const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nanoid = require('nanoid');
// const { error } = require('console');
const dotenv = require('dotenv')
dotenv.config({path: '.env'})
const app = express();

app.use(bodyParser.urlencoded({extended:true}));

// MongoDB Atlas connection

const uri = process.env.MONGODB
mongoose.connect(uri, {
	useUnifiedTopology: true,
	connectTimeoutMS: 3000}
	);

//Schema
const Schema = mongoose.Schema;
const linkSchema = new Schema({
	longURL: { type: String, required:true},
	shortURL: { type: String,  required:true, unique: true},
	creationDate: {type: Date, default: Date.now}
	});

const Link = mongoose.model('links', linkSchema);

app.get('/', async(req, res) => {
	const { longURL } = req.body

	try {	
		let link = await Link.findOne({ longURL });

		if(link){
		res.json({shortURL: link.shortURL});
		return;
		}

		const shortURL = nanoid.nanoid(5);

		link = new Link({
			longURL,
			shortURL
		})

		await link.save();

		res.json({
			longURL,
			shortURL
		});
	}catch (err){
		console.error(err);
		res.status(500).json({error: 'Internal server error'})
	}});

app.get("/short/", async(req, res)=>{
		const{ shortURL } = req.body;
		
		try {
			let link = await Link.findOne({ shortURL });
			if(link){
				res.redirect(link.longURL)
			}
		}catch(err){
			console.error(err)
			res.status(400).json({error: 'The short link you entered does not exist'})
		}
	});

app.listen(3000, () => {
	console.log("Server is running on port 3000")
	});