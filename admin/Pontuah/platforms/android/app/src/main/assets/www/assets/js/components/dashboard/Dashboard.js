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
							pMainCtrl.sidebarToggle.block = true;

							pMainCtrl.showCurrentPage = false;
							pMainCtrl.showHeader = true;

							$scope.openInGeo = function (lat, lon) {
							    var latLon = lat + ',' + lon;

							    window.open("geo:" + latLon, "_system");
							}
						}
					]
				})

				.state('dashboard.clientvisit', {
					url: '/clientvisit',
					templateUrl: Main.View('dashboard/ClientVisit'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', 'Restangular', '$rootScope', '$timeout',
						function ($scope, $state, Restangular, $rootScope, $timeout) {
							$scope.data = [];
							$scope.data.document = '';

							$scope.onSend = function() {
								if (!$scope.data.document) {
									alert("Digite o CPF");
									return;
								}

								if (!$rootScope.checkCPF($scope.data.document)) {
									alert("CPF Invalido");
									return;
								}

								/*Restangular.all('points').post({
									document: $scope.data.document,
									establishmentId: $rootScope.user.establishment.id
								}).then(function() {
									alert("Pontos adicionado com sucesso");
								}).catch(function() {
									alert("CPF Invalido ou não está cadastrado no sistema");
								});*/

								Restangular.all('users/loadInfo').post({
									document: $scope.data.document
								}).then(function(data) {
									if (!data.exists) {
										alert("Você ainda não está no Pontuah, Aproveite e faça seu cadastro!");
										$rootScope.tryDocument = $scope.data.document;
										$state.go('account.register');
										return;
									}
	
									$rootScope.userInfo = data.user;
									Restangular .all('points').post({
										document: $scope.data.document,
										establishmentId: $rootScope.user.establishment.id
									}).then(function(data) {
										$rootScope.userInfo.points = data.data;
										$state.go('dashboard.choose');
									});
								});
							}

							$scope.appendTo = function(value) {
								$scope.data.document = $scope.data.document + value;
							}

							$scope.removeChar = function() {
								if ($scope.data.document.length > 0) {
									$scope.data.document = $scope.data.document.substring(0, $scope.data.document.length - 1);
								}
							}
						}
					]
				})

				.state('dashboard.choose', {
					url: '/choose',
					templateUrl: Main.View('dashboard/Choose'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', 'Restangular', '$rootScope', '$timeout',
						function ($scope, $state, Restangular, $rootScope, $timeout) {
							$scope.getProduct = function(reward) {
								if ($rootScope.userInfo.points.totalPoints < reward.points) {
									alert("Você ainda não tem os pontos necessários para resgatar este produto!");
									return;
								}
								
								if (!confirm("Deseja regastar o produto: " + reward.name + '?'))
									return;

								Restangular.all('points/redeem').post({
									userId: $rootScope.userInfo.id,
									establishmentId: $rootScope.user.establishment.id,
									product: reward.name,
									points: reward.points
								}).then(function(data) {
									$rootScope.reward = reward;
									$state.go('dashboard.thankyou');
								});
							}

							$scope.finish = function() {
								if (!confirm("Deseja finalizar a visita?"))
									return;

								$rootScope.userInfo = null;
								$state.go('dashboard.thankyou');
							}
						}
					]
				})

				.state('dashboard.thankyou', {
					url: '/thankyou',
					templateUrl: Main.View('dashboard/Thankyou'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', 'Restangular', '$rootScope', '$timeout',
						function ($scope, $state, Restangular, $rootScope, $timeout) {
							$scope.back = function() {
								$rootScope.reward = null;
								$state.go('dashboard.clientvisit');
							}
						}
					]
				})

				.state('dashboard.clientproducts', {
					url: '/clientproducts',
					templateUrl: Main.View('dashboard/ClientProducts'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', 'Restangular', '$rootScope', '$timeout',
						function ($scope, $state, Restangular, $rootScope, $timeout) {

						}
					]
				})
				.state('dashboard.products', {
					url: '/products',
					abstract: true,
					templateUrl: Main.View('dashboard/Products'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state',
						function ($scope, $state) {
							
						}
					]
				})

				.state('dashboard.products.manager', {
					url: '/manager',
					templateUrl: Main.View('dashboard/ProductsManager'), // ng-template
					resolve: {
						data: [
							'Restangular',
							function(Restangular) {
								return Restangular.all('products').getList();
							}
						]
					},
					controller: [
						'$scope', '$state', 'ngTableParams', 'Restangular', 'data',
						function ($scope, $state, ngTableParams, Restangular, data) {
							$scope.data = data[0].data;

							//Editable
					        $scope.tableEdit = new ngTableParams({
					            page: 1,            // show first page
					            count: 10           // count per page
					        }, {
					            total: $scope.data.length, // length of data
					            getData: function($defer, params) {
					                $defer.resolve($scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					            }
					        });

					        $scope.editItem = function(item, index, data) {
					        	item.$edit = false;

								var result = false;

								var info = {
									"name": item.name,								
									"points": item.points									
								};

								if (item.$new) {
									result = Restangular.all('products').post(info);
								} else {
									result = Restangular.all('products/'+index).post(info);
								}

								if (!result) {
									alert("Um erro desconhecido aconteceu, tente novamente mais tarde");
									return;
								}

								result.then(function() {

								}).catch(function() {
									alert("Error ao alterar o produto, tente novamente mais tarde!");
								});					        	
					        };

					        $scope.removeItem = function(item, index, data) {
					        	if (!confirm("Tem certeza que deseja remover esse produto?"))
					        		return;

					        	data.splice(index, 1);
					        	$scope.data.splice(index, 1);

					        	Restangular.all('products/' + index).remove().then(function() {

								}).catch(function() {
									alert("Error ao remover o produto, tente novamente mais tarde!");
								});	
					        };

					        $scope.addItem = function() {
					        	var lastId = $scope.data[$scope.data.length-1];
					        	$scope.data.push({id: lastId.id+1,$edit: true, $new: true});
					        	$scope.tableEdit.reload();
					        };
						}
					]
				})

		}
	]
);
