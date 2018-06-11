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

				.state('account.forget', {
					url: '/forget',
					templateUrl: Main.View('account/ForgetPassword'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', '$rootScope',
						function ($scope, $state, $rootScope) {
							$scope.data = [];
							$scope.sent = false;

							$scope.resetPassword = function() {
								if (!$rootScope.checkEmail($scope.data.username)) {
									alert("Email invalido");
									return;
								}

								$scope.sent = true;
								$rootScope.resetPassword($scope.data.username);
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
						'$scope', '$state', '$rootScope',
						function ($scope, $state, $rootScope) {
							$scope.data = [];

							$scope.createUser = function() {
								if (!$scope.data.email || !$scope.data.password || !$scope.data.confirmpassword) {
									alert("Preencha todos os campos!");
									return;
								}

								if ($scope.data.password != $scope.data.confirmpassword) {
									alert("As senhas não coincidem");
									return;
								}

								$rootScope.createUser($scope.data);
							};
						}
					]
				})

				.state('account.update', {
					url: '/update',
					templateUrl: Main.View('account/Update'), // ng-template
					resolve: {
					},
					controller: [
						'$scope', '$state', '$rootScope', 'Restangular',
						function ($scope, $state, $rootScope, Restangular) {
							$scope.data = false;
							$scope.update = function() {
								if ((!$rootScope.user.data.name && !$scope.data.name)
									|| (!$rootScope.user.data.document && !$scope.data.document)
									|| (!$rootScope.user.data.birthday && !$scope.data.birthday)) {				
										alert("Preencha os dados");
										return;
								};

								if ($scope.data.document) {
									if (!$rootScope.checkCPF($scope.data.document)) {
										alert("CPF Invalido");
										return;
									}

									Restangular.all('users/checkCPF').post({
										document: $scope.data.document
									}).then(function(data) {
										if (data.exists) {
											alert("Já existe uma conta cadastrada neste CPF!");
											return;
										}

										$rootScope.updateUserdata($scope.data);
										$state.go('dashboard.home');
									});
								} else {
									$rootScope.updateUserdata($scope.data);
									$state.go('dashboard.home');
								}
							}
						}
					]
				})
		}
	]
);
