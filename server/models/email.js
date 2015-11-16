var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EmailSchema = new mongoose.Schema({
	name: String,
	email: String,
	city: String,
	state: String,
	zipcode: Number,
	created_at: {type: Date, default: Date.now}
});

mongoose.model('Email', EmailSchema);