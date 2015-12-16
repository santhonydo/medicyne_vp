var medicyneAppModule = angular.module('medicyneApp', ['ngMessages', 'stripe.checkout', 'ngCookies', 'ui.bootstrap', 'angulartics', 'angulartics.google.analytics', 'ui.router', 'ngRoute', 'ngStorage']);

medicyneAppModule.config(function ($analyticsProvider) {
            $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
            $analyticsProvider.withAutoBase(true);  /* Records full path */
        });

medicyneAppModule.config(function(StripeCheckoutProvider, $stateProvider, $urlRouterProvider){
	StripeCheckoutProvider.defaults({
		// key: ''
	});
		$urlRouterProvider.otherwise('/home')

		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/static/partials/homepage.html',
				controller: 'HomepageController'
			})

			.state('faq', {
				url: '/faq',
				templateUrl: '/static/partials/faq.html'
			})

			.state('premium', {
				url: '/premium',
				templateUrl: '/static/partials/premium_services.html'
			})

			.state('signup', {
				url: '/signup',
				controller: 'SignupController',
				templateUrl: '/static/partials/signup.html'
			})

			.state('order', {
				url: '/order',
				controller: 'TransferRxController',
				templateUrl: '/static/partials/tx_form.html'
			})

			.state('billing', {
				url: '/billing',
				controller: 'BillingController',
				templateUrl: '/static/partials/billing.html',
				params: {
					obj: null
				}
			})

			.state('deliverySchedule', {
				url: '/deliverySchedule',
				controller: 'DeliveryController',
				templateUrl: '/static/partials/delivery_schedule.html',
				params: {
					obj: null
				}
			})

			.state('orderConfirmation', {
				url: '/orderConfirmation',
				templateUrl: '/static/partials/success.html',
				params: {
					obj: null
				}
			})

			.state('premiumSignupSuccess', {
				url: '/premiumSignupSuccess',
				templateUrl: '/static/partials/premium_signup_success.html'
			})

			.state('signupSuccess', {
				url: '/signupSuccess',
				templateUrl: '/static/partials/signup_success.html'
			})
});


// medicyneAppModule.run(function($log, StripeCheckout, $cookies){
// 	StripeCheckout.defaults({
// 		opened: function(){
// 			// $log.debug("Stripe Checkout opened");
// 		},
// 		closed: function(){
// 			// $log.debug("Stripe Checkout closed");
// 		}
// 	})
// });

medicyneAppModule.factory('medicyneAppFactory', function($http){
	var factory = {};

	factory.transferRx = function(info, callback){
		$http.post('/transferRx', info).success(function(success){
			callback(success);
		})
	};

	factory.billingInfo = function(info, callback){
		$http.post('/billingInfo', info).success(function(success){	
			callback(success);
		})
	}

	factory.newDelivery = function(info, callback){
		$http.post('/newDelivery', info).success(function(success){
			callback(success);
		})
	};

	factory.getTransferRxInfo = function(info, callback){
		$http.post('/getTransferRxInfo', info).success(function(success){
			callback(success);
		})
	};

	// factory.charge = function(info, callback){
	// 	$http.post('/charge', info).success(function(success){
	// 		callback(success);
	// 	})
	// };

	factory.signup = function(info, callback){
		$http.post('/signup', info).success(function(success){
			callback(success);
		})
	};

	factory.premiumSignup = function(info, callback){
		$http.post('/premiumSignup', info).success(function(success){
			callback(success);
		})
	};

	return factory;
});


medicyneAppModule.controller('HomepageController', function($scope, $state, $location, medicyneAppFactory, $anchorScroll, $cookies){
	$scope.scrollTo = function(id){
		var old = $location.hash();
		$location.hash(id);
		$anchorScroll();
		$location.hash(old);
	}

	$scope.goOrder = function() {
		if (angular.isUndefined($scope.newOrder)){
			return;
		} else {
			$cookies.put('prescriptionsInfo', $scope.newOrder.prescriptionsInfo)
			$state.go('order')
		}
	}
})

medicyneAppModule.controller('TransferRxController', function($scope, $window, $state, medicyneAppFactory, $cookies, $localStorage){

	var allCookies = $cookies.getAll();
	$scope.newTransferRx = allCookies;
	

	$scope.reset = function(){
		console.log('reset')
		$cookies.remove('firstName');
		$cookies.remove('lastName');
		$cookies.remove('dob');
		$cookies.remove('phoneNumber');
		$cookies.remove('pharmacyName');
		$cookies.remove('pharmacyPhone');
		$cookies.remove('prescriptionsInfo');
		$cookies.remove('email');
		$window.location.reload()
	}

	$scope.transferRx = function(){
		if(
			(angular.isUndefined($scope.newTransferRx.firstName) || angular.isUndefined($scope.newTransferRx.lastName) || angular.isUndefined($scope.newTransferRx.dob) || angular.isUndefined($scope.newTransferRx.phoneNumber) || angular.isUndefined($scope.newTransferRx.email) || angular.isUndefined($scope.newTransferRx.pharmacyName) || angular.isUndefined($scope.newTransferRx.pharmacyPhone) || angular.isUndefined($scope.newTransferRx.prescriptionsInfo)) 


			|| ($scope.newTransferRx.firstName == "" || $scope.newTransferRx.lastName == ""|| $scope.newTransferRx.dob == ""|| $scope.newTransferRx.phoneNumber == ""|| $scope.newTransferRx.email == ""|| $scope.newTransferRx.pharmacyName == ""|| $scope.newTransferRx.pharmacyPhone == ""|| $scope.newTransferRx.prescriptionsInfo == "")
			 ){
				$scope.error = "Please enter all required fields.";
		}else{
			medicyneAppFactory.transferRx($scope.newTransferRx, function(data){
				$scope.error = "";
				$cookies.put('firstName', data.firstName);
				$cookies.put('lastName', data.lastName);
				$cookies.put('dob', data.dob);
				$cookies.put('phoneNumber', data.phoneNumber);
				$cookies.put('pharmacyName', data.pharmacyName);
				$cookies.put('pharmacyPhone', data.pharmacyPhone);
				$cookies.put('prescriptionsInfo', data.prescriptionsInfo);
				$cookies.put('email', data.email);
				$localStorage.userID = data._id;
				$state.go('billing', {obj:data});
			})
		}
	}
});

medicyneAppModule.controller('BillingController', function($scope, $window, $state, $stateParams, medicyneAppFactory, $cookies, $localStorage){

	var allCookies = $cookies.getAll();
	$scope.insuranceInfo = allCookies;

	$scope.insuranceInfo.cash = false;
	$scope.insuranceInfo.collect = false;

	var userID = $localStorage.userID;

	$scope.reset = function(){
		console.log('reset')
		$cookies.remove('carrierName');
		$cookies.remove('memberNumber');
		$cookies.remove('rxGroup');
		$cookies.remove('rxBin');
		$cookies.remove('pcn');
		$window.location.reload()
	}

	$scope.newInsurance = function(){
		var userInsuranceData = {'carrierName' : $scope.insuranceInfo.carrierName, 'memberNumber' : $scope.insuranceInfo.memberNumber, 'rxGroup' : $scope.insuranceInfo.rxGroup, 'rxBin' : $scope.insuranceInfo.rxBin, 'pcn' : $scope.insuranceInfo.pcn, 'cash' : $scope.insuranceInfo.cash, 'collect' : $scope.insuranceInfo.collect};
		var userInsuranceInfo = {id: userID, insuranceInfo: userInsuranceData};

		if(($scope.insuranceInfo.cash == false && $scope.insuranceInfo.collect == false) && ((angular.isUndefined($scope.insuranceInfo.carrierName) || angular.isUndefined($scope.insuranceInfo.memberNumber) || angular.isUndefined($scope.insuranceInfo.rxGroup) || angular.isUndefined($scope.insuranceInfo.rxBin) || angular.isUndefined($scope.insuranceInfo.pcn)) || ($scope.insuranceInfo.carrierName == "" || $scope.insuranceInfo.memberNumber == "" || $scope.insuranceInfo.rxGroup == ""|| $scope.insuranceInfo.rxBin == "" || $scope.insuranceInfo.pcn == ""))) {
			$scope.error = "Please enter your complete insurance information or check one of the options below.";
		}else {
			$scope.error = "";
			medicyneAppFactory.billingInfo(userInsuranceInfo, function(data){
				var insuranceInfo = data.insuranceInfo
				$cookies.put('carrierName', insuranceInfo.carrierName);
				$cookies.put('memberNumber', insuranceInfo.memberNumber);
				$cookies.put('rxGroup', insuranceInfo.rxGroup);
				$cookies.put('rxBin', insuranceInfo.rxBin);
				$cookies.put('pcn', insuranceInfo.pcn);
				$cookies.put('cash', insuranceInfo.cash);
				$cookies.put('collect', insuranceInfo.collect);
				$state.go('deliverySchedule', {obj: data});
			})
		}
		
	}
})

medicyneAppModule.controller('DeliveryController', function($scope, $window, $state, $stateParams, medicyneAppFactory, $cookies, $localStorage){
	var userID = $localStorage.userID;

	var allCookies = $cookies.getAll();
	$scope.deliverySchedule = allCookies;
	
	
	$scope.reset = function(){
		$cookies.remove('street');
		$cookies.remove('city');
		$cookies.remove('zipcode');
		$cookies.remove('time');
		$window.location.reload()
	}

	$scope.backBtn = function(){
		$state.go('billing', {obj: $stateParams.obj});
	}

	$scope.newDelivery = function(){
		var userDeliverySchedule = {'street' : $scope.deliverySchedule.street, 'city' : $scope.deliverySchedule.city, 'zipcode' : $scope.deliverySchedule.zipcode, 'time' : $scope.deliverySchedule.time}
		var userDeliveryInfo = {id: userID, deliveryInfo: userDeliverySchedule};
		

		if(angular.isUndefined($scope.deliverySchedule)){
			$scope.error = "Please enter all required fields.";
		}else if (!('street' in $scope.deliverySchedule) || !('city' in $scope.deliverySchedule) || !('zipcode' in $scope.deliverySchedule)) {
			$scope.error = "Please enter all required fields.";
		}else if (angular.isUndefined($scope.deliverySchedule.street) || angular.isUndefined($scope.deliverySchedule.city) || angular.isUndefined($scope.deliverySchedule.zipcode)){
			$scope.error = "Please enter all required fields.";
		}else{
			medicyneAppFactory.newDelivery(userDeliveryInfo, function(data){
				$scope.error = "";
				$cookies.put('time', data.deliveryInfo.time);
				$cookies.put('street', data.deliveryInfo.street);
				$cookies.put('city', data.deliveryInfo.city);
				$cookies.put('zipcode', data.deliveryInfo.zipcode);
				console.log(data);
				if(data){
					$state.go('orderConfirmation', {obj: data});
				}
			})
		}
	}
});

// medicyneAppModule.controller('PaymentController', function($scope, $location, medicyneAppFactory, StripeCheckout, $cookies){

// 	var userID = {id: $routeParams.id};

// 	$scope.addressEdit = function(){
// 		$location.path('/delivery_schedule/' + $routeParams.id);
// 	}
	
// 	$scope.rxInfoEdit = function(){
// 		$location.path('/order/');
// 	}

// 	medicyneAppFactory.getTransferRxInfo(userID, function(data){
// 		$scope.userData = data[0];
// 		// console.log($scope.userData);
// 	})

// 	var handler = StripeCheckout.configure({
//     		image: '../static/img/medicyne_full_logo.jpeg',
//     		locale: 'auto',
//     		token: function(token) {
//     			token.customerID = $routeParams.id;
//     			// console.log('got token: ' + token.id + ' ' + token.customerID);
// 		    	medicyneAppFactory.charge(token, function(data){
// 		    		if(typeof data !== 'undefined'){
// 		    			$cookies.remove('firstName');
// 						$cookies.remove('lastName');
// 						$cookies.remove('dob');
// 						$cookies.remove('phoneNumber');
// 						$cookies.remove('pharmacyName');
// 						$cookies.remove('pharmacyPhone');
// 						$cookies.remove('prescriptionsInfo');
// 						$cookies.remove('street');
// 						$cookies.remove('city');
// 						$cookies.remove('zipcode');
// 						$cookies.remove('time');
// 		    			$location.path('/payment_success');
// 		    		}
// 		    	})
// 		    }
//   		});

// 	$scope.payment = function(){
//   		handler.open({
//   			name: 'Medicyne Virtual Pharmacy',
//   			description: 'Prescription order desposit',
//   			amount: 500
//   		});
// 	}
// });

medicyneAppModule.controller('SignupController', function($scope, $location, medicyneAppFactory, $state, $cookies){
		
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
					$state.go('signupSuccess');
				}
			})
		}	
	}

	$scope.premiumSignup = function(){
		if(angular.isUndefined($scope.premiumSignup.email)){
			return;
		}else{
			var email = {name: 'premium', email: $scope.premiumSignup.email};
			medicyneAppFactory.premiumSignup(email, function(data){
				if(data){
					$state.go('premiumSignupSuccess');
				}
			})
		}
	}
});


