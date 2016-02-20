var mongoose = require('mongoose');


var Transfer = mongoose.model('Transfer');

module.exports = (function(){
	return {
		saveTransferRx: function(req, res){
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

		addInsuranceInfo: function(req, res){
			var userID = req.body.id;
			var userInsuranceInfo = req.body.insuranceInfo;
			
			Transfer.findByIdAndUpdate(userID, {$set: {insuranceInfo: userInsuranceInfo}}, {new: true}, function(err, result){
				if(err){
					console.log('Error updating billing Info');
				} else {
					res.json(result)
				}
			})
		},

		updateTransferRxDelivery: function(req, res){
			var userID = req.body.id;
			var userDeliverySchedule = req.body.deliveryInfo;

			Transfer.findByIdAndUpdate(userID, {$set: {deliveryInfo: userDeliverySchedule}}, {new: true},function(err, result){
				if(err){
					console.log('Error updating schedule time');
				}else{
					console.log('Successfully updated.')
					sendgrid.send({
							to : ['anthony@medicyne.com', 'tracy@medicyne.com'],
							from: 'service@medicyne.com',
							subject: 'New Order!',
							text: 'We got a new order!',
							html: '<h1>Patient Information</h1><p>First Name: ' + result.firstName + '</p><p>Last Name: ' + result.lastName + '</p><p>Email: ' + result.email + '</p><p>DOB: ' + result.dob + '</p><p>Mobile: ' + result.phoneNumber + '</p><h1>Prescripiton Information</h1><p>Pharmacy: ' + result.pharmacyName + '</p><p>Pharmacy Phone: ' + result.pharmacyPhone + '</p><p>Prescription Info: ' + result.prescriptionsInfo + '</p><h1>Insurance Information</h1><p>Carrier Name: '+result.insuranceInfo.carrierName + '</p><p>Member ID Number: '+result.insuranceInfo.memberNumber + '</p><p>RxGroup: '+result.insuranceInfo.rxGroup + '</p><p>RxBin: '+result.insuranceInfo.rxBin + '</p><p>PCN: '+result.insuranceInfo.rxGroup + '</p><p>Get patient insurance from existing pharmacy: '+result.insuranceInfo.collect + '</p><p>Cash paying patient: '+result.insuranceInfo.cash + '</p><h1>Delivery Information</h1><p>Street: ' + result.deliveryInfo.street + '</p><p>City: ' + result.deliveryInfo.city + ' ' + result.deliveryInfo.zipcode + '</p><p>Delivery Time: ' + result.deliveryInfo.time + '</p>'
						}, function(err, json) {
							if(err) {
								return console.error(err);
							} else {
								sendgrid.send({
									to : [result.email],
									from: 'service@medicyne.com',
									subject: 'New Order!',
									text: 'We got a new order!',
									html: '<h1>Thank You For Using Medicyne!</h1><p>Hi ' + result.firstName + ',</p><p>This email is to confirm that we have received your prescription order.  Our pharmacist will contact you within 1 hour to confirm your prescription price and delivery time.</p><p>Feel free to contact us at service@medicyne.com for any questions regarding your prescripitons.</p><p>Thank you,</p><p>The Medicyne Team</p>'
								})
							}
					});

					res.json(result);
				}
			})

		},

		getTransferRxInfo: function(req, res){
			Transfer.find({_id: req.body.id}, function(err, results){
				if(err){
					return;
				}else{
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
							to : ['anthony@medicyne.com', 'tracy@medicyne.com'],
							from: 'service@medicyne.com',
							subject: 'New Order!',
							text: 'We got a new order!',
							html: '<p>Transfer to medicyne: ' + results.transferRx + '</p><p>First Name: ' + results.firstName + '</p> <p>Last Name: ' + results.lastName + '</p> <p>Email: ' + charge.receipt_email + '</p><p>DOB: ' + results.dob + '</p><p>Mobile: ' + results.phoneNumber + '</p><p>Pharmacy: ' + results.pharmacyName + '</p><p>Pharmacy Phone: ' + results.pharmacyPhone + '</p><p>Prescription Info: ' + results.prescriptionsInfo + '</p><p>Street: ' + results.deliveryInfo.street + '</p><p>City: ' + results.deliveryInfo.city + '</p><p>zipcode: ' + results.deliveryInfo.zipcode + '</p><p>Delivery Time: ' + results.deliveryInfo.time + '</p>'
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








