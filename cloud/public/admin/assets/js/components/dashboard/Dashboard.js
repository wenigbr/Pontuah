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
							pMainCtrl.sidebarToggle.left = true;
							pMainCtrl.sidebarToggle.block = false;

							pMainCtrl.showCurrentPage = false;
							pMainCtrl.showHeader = true;

							pMainCtrl.layoutType = '1';

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
						data: [
							'Restangular',
							function(Restangular) {
								return Restangular.all('statistics').getList();
							}
						]
					},
					controller: [
						'$scope', '$state', 'Restangular', 'data',
						function ($scope, $state, Restangular, data) {
			            	$scope.data = data.data;

			            	var pointsGroup = _.map($scope.data.pointsGroup, function(item, index) {
			            		return {value: item, date: index};
			            	});

			            	pointsGroup = _.sortBy(pointsGroup, 'date');
			            	var pointsRows = [];
			            	_.each(pointsGroup, function(item) {
				            	var temp = {c: []};
			            		temp.c.push(
		            				{
		            					"v": item.date
		            				},
		            				{
		            					"v": item.value,
		            					"f": item.value
		            				}
			            		);

				            	pointsRows.push(temp);
			            	});


			            	var usersGroup = _.map($scope.data.usersGroup, function(item, index) {
			            		return {value: item, date: index};
			            	});

			            	usersGroup = _.sortBy(usersGroup, 'date');
			            	var usersRows = [];
			            	_.each(usersGroup, function(item) {
				            	var temp = {c: []};
			            		temp.c.push(
		            				{
		            					"v": item.date
		            				},
		            				{
		            					"v": item.value,
		            					"f": item.value
		            				}
			            		);

				            	usersRows.push(temp);
			            	});


			            	$scope.pointsChart = {
							  "type": "LineChart",
							  "cssStyle": "height:200px; width:auto;",
							  "data": {
							    "cols": [{
							    	"id": "data",
							    	"label": "Data",
							    	"type": "string"
							    },
							    {
							    	"id": "qnt",
							    	"label": "Quantidade",
							    	"type": "number"
							    }],
							    "rows": pointsRows
							  },
							  "options": {
							    "isStacked": "false",
							    "fill": 20,
							    "displayExactValues": true,
							    "vAxis": {
							      "title": "Qnt",
							      "gridlines": {
							        "count": 6
							      }
							    },
							    "hAxis": {
							      "title": "Data"
							    }
							  },
							  "formatters": {},
							  "displayed": true
							};

							$scope.usersChart = {
							  "type": "LineChart",
							  "cssStyle": "height:200px; width:auto;",
							  "data": {
							    "cols": [{
							    	"id": "data",
							    	"label": "Data",
							    	"type": "string"
							    },
							    {
							    	"id": "qnt",
							    	"label": "Quantidade",
							    	"type": "number"
							    }],
							    "rows": usersRows
							  },
							  "options": {
							    "isStacked": "false",
							    "fill": 20,
							    "displayExactValues": true,
							    "vAxis": {
							      "title": "Qnt",
							      "gridlines": {
							        "count": 6
							      }
							    },
							    "hAxis": {
							      "title": "Data"
							    }
							  },
							  "formatters": {},
							  "displayed": true
							};

							console.log($scope.pointsChart);
							console.log($scope.usersChart);
						}
					]
				})

				.state('dashboard.clientvisit', {
					url: '/clientvisit',
					templateUrl: Main.View('dashboard/ClientVisit'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', 'Restangular', '$rootScope',
						function ($scope, $state, Restangular, $rootScope) {
							$scope.onSend = function() {
								if (!$scope.data.document) {
									alert("Digite o CPF");
									return;
								}

								Restangular.all('points').post({
									document: $scope.data.document,
									establishmentId: $rootScope.user.establishment.id
								}).then(function(data) {
									if (data.data.added) {
										alert(data.data.toAdd + " pontos adicionado com sucesso.");
									} else {
										alert("Já foram adicionado pontos para esse CPF, tente novamente daqui 1 hora.");
									}
									$scope.data.document = '';
								}).catch(function() {
									$scope.data.document = '';
									alert("CPF Invalido");
								});
							}
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
						'$scope', '$state', 'ngTableParams', 'Restangular', 'data', '$filter', '$timeout',
						function ($scope, $state, ngTableParams, Restangular, data, $filter, $timeout) {
							$scope.data = data[0].data;
					        $scope.alreadyAdd = false;

							//Editable
					        $scope.tableEdit = new ngTableParams({
					            page: 1,            // show first page
					            count: 10,           // count per page,
					            sorting: {
					                points: 'asc'     // initial sorting
					            }
					        }, {
					            total: $scope.data.length, // length of data
					            getData: function($defer, params) {
               					 	var orderedData = params.sorting() ? $filter('orderBy')($scope.data, params.orderBy()) : $scope.data;

					                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					            }
					        });

					        $scope.editItem = function(item, index, data) {
					        	item.$edit = false;

								var result = false;

								var newItem = item.$new;
								if (newItem) {
									if (!item.name || !item.points) {
										alert("Preencha todos os campos antes de adicionar");
										return;
									}
								}

								var info = {
									"name": item.name,								
									"points": item.points									
								};

								if (newItem) {
									result = Restangular.all('products').post(info);
								} else {
									result = Restangular.all('products/'+(item.id-1)).post(info);
								}

								if (!result) {
									alert("Um erro desconhecido aconteceu, tente novamente mais tarde");
									return;
								}

								result.then(function(data) {
									if (newItem) {
										$scope.data = data[0].data;
										$scope.tableEdit.reload();
										$scope.alreadyAdd = false;
									}
								}).catch(function() {
									if (newItem) {
										alert("Error ao alterar o produto, tente novamente mais tarde!");
									} else {
										alert("Error ao adicionar o produto, tente novamente mais tarde!");
									}
								});					        	
					        };

					        $scope.removeItem = function(item, index, data) {
					        	if (!item.$new && !confirm("Tem certeza que deseja remover esse produto?"))
					        		return;

					        	data.splice(index, 1);
						        $scope.data.splice((item.id - 1), 1);
					        	
					        	if (!item.$new) {
						        	Restangular.all('products/' + (item.id-1)).remove().then(function(data) {
										$scope.data = data[0].data;
										$scope.tableEdit.reload();
										$scope.alreadyAdd = false;
									}).catch(function() {
										alert("Error ao remover o produto, tente novamente mais tarde!");
									});	
								} else {
									$scope.alreadyAdd = false;
									$timeout(function () {
										$scope.tableEdit.reload();
									}, 50);
								}
					        };

					        $scope.addItem = function() {
					        	if ($scope.alreadyAdd) {
					        		alert("Você já está adicionando um item!");
					        		return;
					        	}

					        	$scope.alreadyAdd = true;
					        	var lastId = 0;
					        	if ($scope.data.length > 0) {
					        		lastId = $scope.data[$scope.data.length-1];
					        	}
					        	
					        	$scope.data.push({id: lastId.id+1,$edit: true, $new: true});
					        	$scope.tableEdit.reload();
					        };
						}
					]
				})

				.state('dashboard.config', {
					url: '/config',
					templateUrl: Main.View('dashboard/Config'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', '$rootScope', 'Restangular',
						function ($scope, $state, $rootScope, Restangular) {
							$scope.data = $rootScope.user.establishment;

							if (!$scope.data.addPoints)
								$scope.data.addPoints = 10;

							$scope.onSave = function() {
								var execSave = function(data) {
									var data = _.extend($scope.data, data);
									console.log(data);

									Restangular.all('establishments/' + $rootScope.user.establishment.id).post($scope.data).then(function(a) {
										alert("Alterado com sucesso");
									}).catch(function(error) {
										alert("Erro ao alterar");
									});	
								}

								if ($scope.logoImg) {
									if ($scope.logoImg[0].size > 2000000) {
										alert("Imagem com tamanho acima de 2mb, favor selecionar uma imagem menor")
										return; 
									}
									
									var uploadTask = $rootScope.uploadFile('establishmentImages/' + $rootScope.user.establishment.id, $scope.logoImg[0]);
									uploadTask.$complete(function(snap) {
										execSave({img: 'establishmentImages/' + $rootScope.user.establishment.id});
									});
								} else {
									execSave({});
								}
							};
						}
					]
				})

		}
	]
);
