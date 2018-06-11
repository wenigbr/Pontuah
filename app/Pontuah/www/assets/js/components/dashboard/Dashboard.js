angular.module("MainApp.Dashboard",
[
	'ui.router',
])

.config(
	['$stateProvider', '$urlRouterProvider',
		function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('dashboard', {
					abstract: true,
					url: '/dashboard',
					
					resolve: {
					},
					templateUrl: Main.View('dashboard/Dashboard'),
					//template: '<div ui-view></div>',
					controller: ['$rootScope', '$scope',
						function($rootScope, $scope) {
							var pMainCtrl = $scope.$parent.MainCtrl;
							// Disable sidebar
							//pMainCtrl.sidebarToggle.left = false;
							//pMainCtrl.sidebarToggle.block = true;

							//pMainCtrl.showHeaderPage = false;
							// Enable sidebar
							pMainCtrl.sidebarToggle.left = false;
							pMainCtrl.sidebarToggle.block = false;

							pMainCtrl.showCurrentPage = false;
							pMainCtrl.showHeader = true;

							$scope.openInGeo = function (lat, lon) {
							    var latLon = lat + ',' + lon;

							    window.open("geo:" + latLon, "_system");
							}
						}
					]
				})

				.state('dashboard.home', {
					url: '',
					templateUrl: Main.View('dashboard/Home'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state',
						function ($scope, $state) {

						}
					]
				})

				.state('dashboard.points', {
					url: '/points',
					abstract: true,
					templateUrl: Main.View('dashboard/Points'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state',
						function ($scope, $state) {
							
						}
					]
				})

				.state('dashboard.points.list', {
					url: '/list',
					templateUrl: Main.View('dashboard/PointsList'), // ng-template
					resolve: {
						data: [
							'Restangular',
							function(Restangular) {
								return Restangular.all('points').getList();
							}
						]
					},
					controller: [
						'$scope', '$state', 'data', 'Restangular',
						function ($scope, $state, data, Restangular) {
							$scope.data = data.data;
							$scope.updating = false;

							$scope.update = function() {
								$scope.updating = true;
								Restangular.all('points').getList().then(function(data) {
									$scope.data = data.data;
									$scope.updating = false;
								});
							}

							$scope.loadMore = function() {
								/*var tmp = angular.copy($scope.data[$scope.data.length-1]);
								tmp.id++;

								$scope.data.push(tmp);*/

							}
						}
					]
				})

				.state('dashboard.points.view', {
					url: '/:id/view',
					templateUrl: Main.View('dashboard/PointsView'), // ng-template
					resolve: {
						data: [
							'Restangular', '$stateParams',
							function (Restangular, $stateParams) {
								return Restangular.one('points', $stateParams.id).get();
							}
						]
					},
					controller: [
						'$scope', '$state', 'data',
						function ($scope, $state, data) {
							$scope.data = data.data;
						}
					]
				})

				.state('dashboard.locations', {
					url: '/locations',
					abstract: true,
					templateUrl: Main.View('dashboard/Locations'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state',
						function ($scope, $state) {

						}
					]
				})

				.state('dashboard.locations.list', {
					url: '/list',
					templateUrl: Main.View('dashboard/LocationsList'), // ng-template
					resolve: {
						data: [
							'Restangular',
							function(Restangular) {
								return Restangular.all('establishments').getList();
							}
						]
					},
					controller: [
						'$scope', '$state', 'data', 'Restangular',
						function ($scope, $state, data, Restangular) {
							$scope.data = data.data;
							$scope.updating = false;

							$scope.update = function() {
								$scope.updating = true;
								Restangular.all('establishments').getList().then(function(data) {
									$scope.data = data.data;
									$scope.updating = false;
								});
							}

							$scope.loadMore = function() {
								var tmp = angular.copy($scope.data[$scope.data.length-1]);
								tmp.id++;

								//$scope.data.push(tmp);

							}
						}
					]
				})

				.state('dashboard.locations.view', {
					url: '/:id/view',
					templateUrl: Main.View('dashboard/LocationsView'), // ng-template
					resolve: {
						data: [
							'Restangular', '$stateParams',
							function (Restangular, $stateParams) {
								return Restangular.one('establishments', $stateParams.id).get();
							}
						]
					},
					controller: [
						'$scope', '$state', 'data',
						function ($scope, $state, data) {
							$scope.data = data.data;

							$scope.initialize = function() {
								setTimeout(function() {
									var geoData = {lat: $scope.data.latitude, lng: $scope.data.longitude};
									$scope.map = new google.maps.Map(document.getElementById('map'), {
										zoom: 18,
										center: geoData
									});

									$scope.marker = new google.maps.Marker({
							          position: geoData,
							          map: $scope.map
							        });	
								}, 1000);
							}

							//trycat
							var checkGoogle = function() {
								console.log("check google");
								if (typeof google == "object" &&
									typeof google.maps.Map == "function") {
									$scope.initialize();
									return true;
								}

								setTimeout(checkGoogle, 500);
							}

							checkGoogle();
						}
					]
				})

				.state('dashboard.profile', {
					url: '/profile',
					templateUrl: Main.View('dashboard/Profile'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', '$rootScope',
						function ($scope, $state, $rootScope) {
							var pMainCtrl = $scope.$parent.MainCtrl;
							if (!$rootScope.logged) {
								$state.go('account.login');
								return;
							}

							$scope.data = {
								name: "Diego Araujo",
								email: "diegoaraujoart@hotmail.com",
								document: "391.736.658-43",
								birthday: "29/01/1996"
							}
						}
					]
				})
		}
	]
);
