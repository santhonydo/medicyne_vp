var mongoose = require('mongoose');
var stripe = require("stripe")("sk_live_DW1I6W9YtmtT2mPNRAWHiwBJ"); 
var sendgrid = require('sendgrid')('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');

var Transfer = mongoose.model('Transfer');

module.exports = (function(){
	return {
		saveTransferRx: function(req, res){
			console.log(req.body);
			var transfer = new Transfer(req.body);

			transfer.save(function(err, data){
				if(err){
					console.log('error adding transfer form');
				}else{
					console.log('added transfer form to database');
					console.log('ObjectID: ' + data._id);
					var success = {msg: "Form completed"};
					res.json(data);
				}
			})
		},

		updateTransferRxDelivery: function(req, res){
			var userID = req.body.id;
			var userDeliverySchedule = req.body.deliveryInfo;

			Transfer.update({_id: userID}, {$set: {deliveryInfo: userDeliverySchedule}}, function(err){
				if(err){
					console.log('Error updating schedule time');
				}else{
					console.log('Successfully updated.')
					res.json(req.body);
				}
			})

		},

		getTransferRxInfo: function(req, res){
			Transfer.find({_id: req.body.id}, function(err, results){
				if(err){
					console.log('Error retrieving transfer rx info');
				}else{
					console.log('Got patient: ' + results[0].firstName);
					res.json(results);
				}
			})
		},

		charge: function(req, res){
			console.log('charge controller: ' + req.body.id + ' ' + req.body.email);
			var stripeToken = req.body.id;

			stripe.customers.create({
				source: stripeToken,
				description: req.body.email	
			}).then(function(customer){
				return stripe.charges.create({
					amount: 500,
					currency: "usd",
					receipt_email: req.body.email,
					customer: customer.id
				});
			}).then(function(charge){
				console.log('Customer Stripe ID: ' + charge.customer);

				Transfer.findByIdAndUpdate(req.body.customerID, {$set: {stripeCustomerID: charge.customer, email: charge.receipt_email}}, function(err, results){
					if(err){
						console.log('Unable to save stripe customer ID');
					}else{
						console.log("Successfully saved stripe customer id");

						sendgrid.send({
							to : ['santhonydo@gmail.com', 'me.tracy@gmail.com'],
							from: 'service@medicyne.com',
							subject: 'New Order!',
							text: 'We got a new order!',
							html: '<p>First Name: ' + results.firstName + '</p> <p>Last Name: ' + results.lastName + '</p> <p>Email: ' + charge.receipt_email + '</p><p>DOB: ' + results.dob + '</p><p>Mobile: ' + results.phoneNumber + '</p><p>Pharmacy: ' + results.pharmacyName + '</p><p>Pharmacy Phone: ' + results.pharmacyPhone + '</p><p>Prescription Info: ' + results.prescriptionsInfo + '</p><p>Street: ' + results.deliveryInfo.street + '</p><p>City: ' + results.deliveryInfo.city + '</p><p>zipcode: ' + results.deliveryInfo.zipcode + '</p><p>Delivery Time: ' + results.deliveryInfo.time + '</p>'
						}, function(err, json){
							if (err) {return console.error(err);}
							console.log(json);
							var success = {success: "Charge complete"};
							res.json(success);
						});	
					}
				})
			})
		}
	}
})()








