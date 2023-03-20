import express from 'express';
import { connect, Schema as _Schema, model } from 'mongoose';
import pkg from 'body-parser';
const { urlencoded } = pkg;
import { nanoid as _nanoid } from 'nanoid';
import { config } from 'dotenv';
config({path: '.env'})
const app = express();

app.use(urlencoded({extended:true}));

// MongoDB Atlas connection

const uri = 'mongodb+srv://Akinwalee:Mn9fdvfENsw1pV7y@links.vue8mgy.mongodb.net/?retryWrites=true&w=majority'
connect(uri, {
	useUnifiedTopology: true,
	connectTimeoutMS: 3000}
	);

//Schema
const Schema = _Schema;
const linkSchema = new Schema({
	longURL: { type: String, required:true},
	shortURL: { type: String,  required:true, unique: true},
	creationDate: {type: Date, default: Date.now},
	clicks: {type: Number}
	});

const Link = model('links', linkSchema);

app.get('/', async(req, res) => {
	const { longURL } = req.body

	try {	
		let link = await Link.findOne({ longURL });

		if(link){
		res.json({shortURL: link.shortURL});
		return;
		}

		const shortURL = _nanoid(5);

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
				link.clicks += link.clicks
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