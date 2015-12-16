var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.set('views', __dirname);
app.set('view engine', 'html');

app.use(session({secret: 'medicyne2014'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

require('./config/mongoose.js');
require('./config/routes.js')(app);

app.use(express.static(path.join(__dirname, './client')));

app.listen(8888, function(){
	console.log('Listening on port 8888');
});
