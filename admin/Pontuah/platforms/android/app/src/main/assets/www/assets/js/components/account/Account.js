angular.module("MainApp.Account",
[
	'ui.router',
])

.config(
	['$stateProvider', '$urlRouterProvider',
		function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				.state('account', {
					abstract: true,
					url: '/account',
					
					resolve: {
					},
					templateUrl: Main.View('account/Account'),
					//template: '<div ui-view></div>',
					controller: ['$rootScope', '$scope',
						function($rootScope, $scope) {
							var pMainCtrl = $scope.$parent.MainCtrl;
							// Disable sidebar
							pMainCtrl.sidebarToggle.left = false;
							pMainCtrl.sidebarToggle.block = true;

							pMainCtrl.showHeaderPage = false;
							pMainCtrl.showHeader = false;
							pMainCtrl.layoutType = '0';
						}
					]
				})

				.state('account.login', {
					url: '/login',
					templateUrl: Main.View('account/Login'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$rootScope', '$state', 'growl',
						function ($scope, $rootScope, $state, growl) {
							/*$('.message a').click(function(){
							   $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
							});*/

							$scope.data = [];


							$scope.onLogin = function(pElement) {
								growl.success("aaaaaaaaaaa loco" + Math.random(), {});
							}
						}
					]
				})

				.state('account.register', {
					url: '/register',
					templateUrl: Main.View('account/Register'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', '$rootScope', 'Restangular',
						function ($scope, $state, $rootScope, Restangular) {
							$scope.data = [];

							$scope.data.document = $rootScope.tryDocument;

							$scope.createUser = function() {
								if (!$rootScope.checkCPF($scope.data.document)) {
									alert("CPF Invalido");
									return;
								}

								if (!$scope.data.email || !$scope.data.password || !$scope.data.confirmpassword || !$scope.data.document) {
									alert("Preencha todos os campos!");
									return;
								}

								if ($scope.data.password.length < 6) {
									alert("A senha deve ter no minimo 6 caracteres.");
									return;
								}

								if ($scope.data.password != $scope.data.confirmpassword) {
									alert("As senhas não coincidem");
									return;
								}

								Restangular.all('users').post({
									email: $scope.data.email,
									password: $scope.data.password,
									document: $scope.data.document
								}).then(function(data) {
									if (!data.created) {
										alert("Erro ao criar a conta, tente novamente mais tarde.");
										return;
									}

									Restangular.all('users/loadInfo').post({
										document: $scope.data.document
									}).then(function(data) {
										if (!data.exists) {
											alert("Erro ao criar a conta, tente novamente mais tarde.");
											return;
										}
		
										$rootScope.userInfo = data.user;
										Restangular.all('points').post({
											document: $scope.data.document,
											establishmentId: $rootScope.user.establishment.id
										}).then(function(data) {
											$rootScope.userInfo.points = data.data;
											$state.go('dashboard.choose');
										});
									});
								});
							};
						}
					]
				})
		}
	]
);
