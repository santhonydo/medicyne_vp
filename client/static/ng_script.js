var medicyneAppModule = angular.module('medicyneApp', ['ngRoute', 'ngMessages', 'stripe.checkout', 'ngCookies', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics']);

medicyneAppModule.config(function ($analyticsProvider) {
            $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
            $analyticsProvider.withAutoBase(true);  /* Records full path */
        });

medicyneAppModule.config(function($routeProvider, StripeCheckoutProvider){
	StripeCheckoutProvider.defaults({
		key: 'pk_live_OXNGP4KluZ8nTkm4rypVJwZa'
	});

	$routeProvider
		.when('/', {
			templateUrl: '/static/partials/homepage.html'
		})
		.when('/order', {
			templateUrl: '/static/partials/tx_form.html'
		})
		.when('/signup', {
			templateUrl: '/static/partials/signup.html'
		})
		.when('/delivery_schedule/:id', {
			templateUrl: '/static/partials/delivery_schedule.html'
		})
		.when('/payment/:id', {
			templateUrl: '/static/partials/payment.html',
			resolve: {
				stripe: StripeCheckoutProvider.load
			}
		})
		.when('/payment_success', {
			templateUrl: '/static/partials/payment_success.html'
		})
		.when('/signup_success', {
			templateUrl: '/static/partials/signup_success.html'
		})
		.otherwise({
			redirectTo: '/'
		});
});

medicyneAppModule.run(function($log, StripeCheckout, $cookies){
	StripeCheckout.defaults({
		opened: function(){
			// $log.debug("Stripe Checkout opened");
		},
		closed: function(){
			// $log.debug("Stripe Checkout closed");
		}
	})
});

medicyneAppModule.factory('medicyneAppFactory', function($http){
	var factory = {};

	factory.transferRx = function(info, callback){
		// console.log("factory data: " + info.pharmChoice)
		$http.post('/transferRx', info).success(function(success){
			callback(success);
		})
	};

	factory.newDelivery = function(info, callback){
		// console.log("factory schedule data: " + info.id);
		$http.post('/newDelivery', info).success(function(success){
			callback(success);
		})
	};

	factory.getTransferRxInfo = function(info, callback){
		$http.post('/getTransferRxInfo', info).success(function(success){
			callback(success);
		})
	};

	factory.charge = function(info, callback){
		$http.post('/charge', info).success(function(success){
			callback(success);
		})
	};

	factory.signup = function(info, callback){
		$http.post('/signup', info).success(function(success){
			callback(success);
		})
	}

	return factory;
});

// medicyneAppModule.controller('QuitController', function($scope, $uibModalInstance){
	// console.log('in quitConfirmation controller');
	// $scope.open = function($event){
	// 	$event.preventDefault();
	// 	$event.stopPropagation();
	// 	$scope.opened = true;
	// }
	// $scope.closeOut = function(){
	// 	$uibModalInstance.close();
	// }
// })

medicyneAppModule.controller('HomepageController', function($scope, $route, $location, $routeParams, medicyneAppFactory, $anchorScroll, $cookies){
	$scope.scrollTo = function(id){
		var old = $location.hash();
		$location.hash(id);
		$anchorScroll();
		$location.hash(old);
	}

	$scope.goOrder = function() {
		if (angular.isUndefined($scope.newOrder)){

		} else {
			$cookies.put('prescriptionsInfo', $scope.newOrder.prescriptionsInfo)
			$location.path('/order/')
		}
	}


})

medicyneAppModule.controller('TransferRxController', function($scope, $route, $location, $routeParams, medicyneAppFactory, $cookies){
	
	var allCookies = $cookies.getAll();
	$scope.newTransferRx = allCookies;
	

	$scope.reset = function(){
		$cookies.remove('firstName');
		$cookies.remove('lastName');
		$cookies.remove('dob');
		$cookies.remove('phoneNumber');
		$cookies.remove('pharmacyName');
		$cookies.remove('pharmacyPhone');
		$cookies.remove('prescriptionsInfo');
		$route.reload();
	}

	$scope.transferRx = function(){
		if(angular.isUndefined($scope.newTransferRx)){
			// console.log('All fields empty');
		}else if(angular.isUndefined($scope.newTransferRx.pharmChoice)){
			// console.log('Missing pharmacy choice');
		}else{
			var keys = Object.keys($scope.newTransferRx).length;
			if(keys < 8){
				// console.log("Not all fields are entered");
			}else if(angular.isUndefined($scope.newTransferRx.phoneNumber) || angular.isUndefined($scope.newTransferRx.pharmacyPhone)){
				// console.log("Wrong phone number!");
			}else{
				if($scope.newTransferRx.pharmChoice === 'other'){
					$scope.newTransferRx.transferRx = false;
				}
				medicyneAppFactory.transferRx($scope.newTransferRx, function(data){
					// console.log("ObjectID: " + data._id);
					var userID = data._id;
					$cookies.put('firstName', data.firstName);
					$cookies.put('lastName', data.lastName);
					$cookies.put('dob', data.dob);
					$cookies.put('phoneNumber', data.phoneNumber);
					$cookies.put('pharmacyName', data.pharmacyName);
					$cookies.put('pharmacyPhone', data.pharmacyPhone);
					$cookies.put('prescriptionsInfo', data.prescriptionsInfo);
					$location.path('/delivery_schedule/' + userID);
				})
			}
		}	
	}

	$scope.samePx = function(){
		$scope.newRx.transferRx = false;

		if(typeof $scope.newRx == 'undefined'){
			// console.log('All fields empty');
		}else{
			var keys = Object.keys($scope.newRx).length;
			if(keys < 7){
				// console.log("Not all fields are entered");
			}else{
				// console.log($scope.newRx);
				medicyneAppFactory.transferRx($scope.newRx, function(data){
					// console.log("ObjectID: " + data._id);
					var userID = data._id;
					$cookies.put('firstName', data.firstName);
					$cookies.put('lastName', data.lastName);
					$cookies.put('dob', data.dob);
					$cookies.put('phoneNumber', data.phoneNumber);
					$cookies.put('pharmacyName', data.pharmacyName);
					$cookies.put('pharmacyPhone', data.pharmacyPhone);
					$cookies.put('prescriptionsInfo', data.prescriptionsInfo);
					$location.path('/delivery_schedule/' + userID);
				})
			}
		}	
	}
});

medicyneAppModule.controller('DeliveryController', function($scope, $route, $location, $routeParams, medicyneAppFactory, $cookies){
	
	var allCookies = $cookies.getAll();
	$scope.deliverySchedule = allCookies;
	
	
	$scope.reset = function(){
		$cookies.remove('street');
		$cookies.remove('city');
		$cookies.remove('zipcode');
		$cookies.remove('time');
		$route.reload();
	}

	$scope.backBtn = function(){

		$location.path('/order/');
	}

	$scope.newDelivery = function(){
		var userDeliveryInfo = {id: $routeParams.id, deliveryInfo: $scope.deliverySchedule};

		if(angular.isUndefined($scope.deliverySchedule)){
			// console.log('All fields empty');
		}else if (!('street' in $scope.deliverySchedule) || !('city' in $scope.deliverySchedule) || !('zipcode' in $scope.deliverySchedule)) {
			// console.log("Empty fields")
		}else if (angular.isUndefined($scope.deliverySchedule.street) || angular.isUndefined($scope.deliverySchedule.city) || angular.isUndefined($scope.deliverySchedule.zipcode)){
			// console.log("Empty touched fields");
		}else{
			medicyneAppFactory.newDelivery(userDeliveryInfo, function(data){
				var userID = data.id;
				$cookies.put('time', data.deliveryInfo.time);
				$cookies.put('street', data.deliveryInfo.street);
				$cookies.put('city', data.deliveryInfo.city);
				$cookies.put('zipcode', data.deliveryInfo.zipcode);
				$location.path('/payment/' + userID);
			})
		}
	}
});

medicyneAppModule.controller('PaymentController', function($scope, $location, $routeParams, medicyneAppFactory, StripeCheckout, $cookies){

	var userID = {id: $routeParams.id};

	$scope.addressEdit = function(){
		$location.path('/delivery_schedule/' + $routeParams.id);
	}
	
	$scope.rxInfoEdit = function(){
		$location.path('/order/');
	}

	medicyneAppFactory.getTransferRxInfo(userID, function(data){
		$scope.userData = data[0];
		// console.log($scope.userData);
	})

	var handler = StripeCheckout.configure({
    		image: '../static/img/medicyne_full_logo.jpeg',
    		locale: 'auto',
    		token: function(token) {
    			token.customerID = $routeParams.id;
    			// console.log('got token: ' + token.id + ' ' + token.customerID);
		    	medicyneAppFactory.charge(token, function(data){
		    		if(typeof data !== 'undefined'){
		    			$cookies.remove('firstName');
						$cookies.remove('lastName');
						$cookies.remove('dob');
						$cookies.remove('phoneNumber');
						$cookies.remove('pharmacyName');
						$cookies.remove('pharmacyPhone');
						$cookies.remove('prescriptionsInfo');
						$cookies.remove('street');
						$cookies.remove('city');
						$cookies.remove('zipcode');
						$cookies.remove('time');
		    			$location.path('/payment_success');
		    		}
		    	})
		    }
  		});

	$scope.payment = function(){
  		handler.open({
  			name: 'Medicyne Virtual Pharmacy',
  			description: 'Prescription order desposit',
  			amount: 500
  		});
	}
});

medicyneAppModule.controller('SignupController', function($scope, $location, medicyneAppFactory, $cookies){
		
	$cookies.remove('firstName');
	$cookies.remove('lastName');
	$cookies.remove('dob');
	$cookies.remove('phoneNumber');
	$cookies.remove('pharmacyName');
	$cookies.remove('pharmacyPhone');
	$cookies.remove('prescriptionsInfo');
	$cookies.remove('street');
	$cookies.remove('city');
	$cookies.remove('zipcode');
	$cookies.remove('time');

	$scope.emailSignup = function(){
		if(angular.isUndefined($scope.signup)){
			// console.log('required fields empty');
		}else if(angular.isUndefined($scope.signup.name) || angular.isUndefined($scope.signup.email)){
			// console.log('something undefined');
		}else{
			medicyneAppFactory.signup($scope.signup, function(data){
				// console.log(data);
				if(data){
					$location.path('/signup_success');	
				}
			})
		}	
	}
});


