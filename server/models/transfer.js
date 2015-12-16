var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TransferSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	dob: String,
	phoneNumber: String,
	pharmacyName: String,
	pharmacyPhone: String,
	email: String,
	prescriptionsInfo: String,
	deliveryInfo: Object,
	insuranceInfo: Object,
	stripeCustomerID: String,
	email: String,
	transferRx: {type: Boolean, default: true},
	created_at: {type: Date, default: Date.now}
});

mongoose.model('Transfer', TransferSchema);