var transfers = require('./../server/controllers/transfers.js'); 
var emails = require('./../server/controllers/emails.js');


module.exports = function(app){
	
	app.post('/transferRx', function (req, res){
		transfers.saveTransferRx(req, res);
	});

	app.post('/billingInfo', function (req, res){
		transfers.addInsuranceInfo(req, res);
	});

	app.post('/newDelivery', function(req, res){
		transfers.updateTransferRxDelivery(req, res);
	});

	app.post('/getTransferRxInfo', function (req, res){
		transfers.getTransferRxInfo(req, res);
	});

	app.post('/charge', function (req, res){
		transfers.charge(req, res);
	});

	app.post('/signup', function (req, res){
		emails.signup(req, res);
	});

	app.post('/premiumSignup', function(req, res){
		emails.premiumSignup(req, res);
	});
}