var Main = {
	m_pApp: false,
	m_strState: '',
	m_vecModules: [
		'ui.router',
		'angular-growl',
   		'ngAnimate',
    	'ui.bootstrap',
	    'angular-loading-bar',
	    'ngTable',
	    'ngTouch',
	    'infinite-scroll',
	    'firebase',
	    'restangular',
	    'ngMask',
	    'googlechart',

		'MainApp.Account',
		'MainApp.Dashboard'
	],
	m_strLanguage: "pt-br",
	m_uiMaxNotifications: 5,
	m_vecTranslations: [
		{
			name: 'testtranslate',
			value: 'bem loco mesmo hein'
		},
		{
			name: 'test2',
			value: 'oloco bixo'
		}
	],

	GetApp: function() {
		return this.m_pApp;
	},

	URL: function(strURL) {
		return strURL;
	},

	Asset: function(strAsset) {
		return Main.URL('assets/' + strAsset);
	},

	Image: function(strImage) {
		return Main.Asset('images/' + strImage);
	},

	View: function(strView) {
		var a = Main.URL('views/' + strView + '.html');
		return a;
	},

	Init: function() {
		this.m_pApp = angular.module("MainApp", this.m_vecModules)
		.run(
			['$rootScope', '$state', '$stateParams', '$q', '$http', '$timeout', '$templateCache', '$firebaseAuth', '$firebaseArray', '$firebaseObject', 'Restangular', '$firebaseStorage',
				function ($rootScope, $state, $stateParams, $q, $http, $timeout, $templateCache, $firebaseAuth, $firebaseArray, $firebaseObject, Restangular, $firebaseStorage) {
					$rootScope.$state = $state;
					$rootScope.$stateParams = $stateParams;
					$rootScope.$on('$routeChangeStart', function(event, next, current) {
						//if (typeof(current) !== 'undefined'){
							$templateCache.remove(current.templateUrl);
						//}
					});
					$rootScope.$on('$stateChangeSuccess', 
						function(event, toState, toParams, fromState, fromParams){ 
							var blocks = [];
							
							$rootScope.pageName = "Unknown";
							if (toState && toState.name) {
								blocks = toState.name.split('.');
								$rootScope.pageName = toState.name.split('.').pop();
							}

						    $rootScope.stateBlocks = blocks;
						    $rootScope.toState = toState;
						    $rootScope.toParams = toParams;
						}
					);

					$(document).ready(function() {
   						$("html").niceScroll();
					});

					$rootScope.logged = false;
					$rootScope.loadedResolve = false;
					$rootScope.loadedReject = false;

					$rootScope.loadedPromisse = new Promise(function(resolve, reject) {
						$rootScope.loadedResolve = resolve;
						$rootScope.loadedReject = reject;
					});

					$rootScope.user = false;
					$rootScope.$auth = $firebaseAuth();
					$rootScope.$auth.$onAuthStateChanged(function(firebaseUser) {
						if (firebaseUser) {
							console.log("Signed in as:", firebaseUser);
							$state.go('dashboard.clientvisit');

							$rootScope.user = firebaseUser;
						    $rootScope.logged = true;
						    firebaseUser.getIdToken().then(function(data) {
						      console.log('token:', data);
						      $rootScope.userToken = data;
						      $rootScope.loadedResolve(data);
						    });

						    $rootScope.loadUserdata();
						} else {
							console.log("Signed out");
						    $rootScope.logged = false;
						    $rootScope.user = false;
							$state.go('account.login');
						}
					});

					$rootScope.login = function(username, password) {
						if (!username || !password) {
							alert("Por favor, preencha os campos!");
							return;
						}

						$rootScope.$auth.$signInWithEmailAndPassword(username, password).catch(function(error) {
							console.log(error);
							alert("Login ou senha invalidos");
						});
					};

					$rootScope.changePassword = function(data) {
						if (!data.oldpass) {
							alert("Preencha a senha antiga para poder alterar");
							return;
						}

						if (!data.newpass || !data.confirmnewpass) {
							alert("Por favor, preencha as novas senhas para poder alterar");
							return;
						}

						if (data.newpass.length < 6) {
							alert("A senha tem que ter no minimo 6 caracteres.");
							return;
						}

						if (data.newpass != data.confirmnewpass) {
							alert("As senhas não coincidem");
							return;
						}

						var credential = false;
						try {
							credential = firebase.auth.EmailAuthProvider.credential(
							    $rootScope.user.email, 
							    data.oldpass
							);
						} catch(err) {
							alert("A senha antiga está incorreta");
							return;
						}

						$rootScope.user.reauthenticateWithCredential(credential).then(function() {
						  	$rootScope.user.updatePassword(data.newpass).then(function() {
								alert("Senha alterada com sucesso");
							}).catch(function() {
								alert("Erro ao alterar a senha, tente novamente mais tarde.");
							});
						}).catch(function(error) {
							alert("Erro ao alterar a senha, a senha antiga está incorreta.");
						});
					}

					$rootScope.createUser = function(data) {
						var username = data.email;
						var password = data.password;

						if (!username || !password) {
							alert("Username or password empty!");
							return;
						}
						
						$rootScope.$auth.$createUserWithEmailAndPassword(username, password)
						.catch(function(error) {
							if (error.code == "auth/email-already-in-use") {
								alert("Este email já existe!");
							} else { 
								alert('Error to create account, try later again.');
							}

							return;
						});						
					}

					$rootScope.logout = function() {
						$rootScope.$auth.$signOut().then(function() {

						});
					}

					$rootScope.getAllInfo = function(strName) {
						var ref = false;

						if (!strName)
							var ref = firebase.database().ref();
						else
							var ref = firebase.database().ref(strName);

						if (!ref)
							return false;

						return $firebaseArray(ref);
					};

					$rootScope.getInfoByChild = function(strName, strChild) {
						var ref = firebase.database().ref(strName).child(strChild);

						if (!ref)
							return false;

						return $firebaseObject(ref);	
					}

					$rootScope.setInfoByChild = function(strName, strChild, data) {
						return firebase.database().ref(strName).child(strChild).update(data);
					}

					$rootScope.loadUserdata = function(bDontAsk) {
						if (!$rootScope.user) {
							return false;
						}

						var uid = $rootScope.user.uid;
						var data = $rootScope.getInfoByChild('/users/', uid);

						// atualiza usuario
						var updateData = {
							name: $rootScope.user.email,
							email: $rootScope.user.email
						};

						if (!bDontAsk) {
							$rootScope.updateUserdata(updateData);
						}

						data.$loaded().then(function() {
							$rootScope.user.data = {
								email: data.email,
								name: data.name,
								document: data.document,
								birthday: data.birthday
							};

							var est = $rootScope.getInfoByChild('/establishmentUsers/', uid);
							est.$loaded().then(function() {
								if (est.$value != null) {
									Restangular.one('establishments', est.$value).get().then(function(data) {
										$rootScope.user.establishment = data.data;
									});
								} else {
									alert("Acesso invalido");
									$rootScope.logout();
								}
							});
						});
					}

					$rootScope.updateUserdata = function(data) {
						if (!$rootScope.user) {
							return false;
						}

						var uid = $rootScope.user.uid;
						$rootScope.setInfoByChild('/users/', uid, data);

						$rootScope.loadUserdata(true);
					};

					Restangular.addRequestInterceptor(
						function(element, operation, what, url) {
							var accessToken = $rootScope.logged ? $rootScope.userToken : null;
							Restangular.setDefaultHeaders({'user-token': accessToken, 'Content-Type': 'application/json'});
							return element;
						}
					);

					Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
					    if(response.status === 500) {
					        $rootScope.loadedPromisse.then(function(token) {
					        	response.config.headers['user-token'] = token;
					            $http(response.config).then(responseHandler, deferred.reject);
					        });

					        return false; // error handled
					    }

					    return true; // error not handled
					});

					$rootScope.checkCPF =  function (cpf) {
						cpf = cpf.replace(/[^0-9]/g, '');
					    var numeros, digitos, soma, i, resultado, digitos_iguais;
					    digitos_iguais = 1;
					    if (cpf.length < 11)
					          return false;
					    for (i = 0; i < cpf.length - 1; i++)
					          if (cpf.charAt(i) != cpf.charAt(i + 1))
					                {
					                digitos_iguais = 0;
					                break;
					                }
					    if (!digitos_iguais)
					          {
					          numeros = cpf.substring(0,9);
					          digitos = cpf.substring(9);
					          soma = 0;
					          for (i = 10; i > 1; i--)
					                soma += numeros.charAt(10 - i) * i;
					          resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
					          if (resultado != digitos.charAt(0))
					                return false;
					          numeros = cpf.substring(0,10);
					          soma = 0;
					          for (i = 11; i > 1; i--)
					                soma += numeros.charAt(11 - i) * i;
					          resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
					          if (resultado != digitos.charAt(1))
					                return false;
					          return true;
					          }
					    else
					        return false;
				    };

				    $rootScope.uploadFile = function(strChild, pFile) {
				    	var storage = $firebaseStorage(firebase.storage().ref(strChild));
				    	return storage.$put(pFile);
				    }
				}
			]
		)

		.config(
			['$stateProvider', '$urlRouterProvider', '$locationProvider', 'growlProvider', 'RestangularProvider',
				function ($stateProvider, $urlRouterProvider, $locationProvider, growlProvider, RestangularProvider) {
					$urlRouterProvider.otherwise('/account');

					growlProvider.globalTimeToLive(5000);

					RestangularProvider.setBaseUrl('https://us-central1-pontuah-ee5a0.cloudfunctions.net/api/');
					RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
						return _.extend([], data);
					});
				}
			]
		)

		.controller('MainController', function($timeout, $state, $scope, $rootScope, growlService, $http){
		    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
		    this.sidebarToggle = {
		        left: false,
		        right: false,
		        block: false
		    }

		    this.showHeader = false;
		    this.showCurrentPage = false;

		    this.menu = "";
		    this.setMenu = function(strMenu) {
		    	this.menu = strMenu;
		    }

		    this.menuData = {};
		    this.setMenuData = function(vecData) {
		    	this.menuData = vecData;
		    }

		    // By default template has a boxed layout
		    this.layoutType = '1';
		    
		    // For Mainmenu Active Class
		    this.$state = $state;    
		    
		    //Close sidebar on click
		    this.sidebarStat = function(event, logout) {
		    	if (this.sidebarToggle.block)
		    		return;

		        if (!angular.element(event.target).parent().hasClass('active')) {
		            this.sidebarToggle.left = false;
		        }

		        if (logout) {
		        	$rootScope.logout();
		        }
		    }
		    
		    //Listview Search (Check listview pages)
		    this.listviewSearchStat = false;
		    
		    this.lvSearch = function() {
		        this.listviewSearchStat = true; 
		    }
		    
		    //Listview menu toggle in small screens
		    this.lvMenuStat = false;
		    
		    //Blog
		    this.wallCommenting = [];
		    
		    this.wallImage = false;
		    this.wallVideo = false;
		    this.wallLink = false;

		    //Skin Switch
		    this.currentSkin = 'purple';

		    this.swipeMenu = function($event, stat) {
		    	this.sidebarToggle.left = stat;
			};

			this.updateContent = function($event) {

			}

		    this.skinList = [
		        'lightblue',
		        'bluegray',
		        'cyan',
		        'teal',
		        'green',
		        'orange',
		        'blue',
		        'purple'
		    ]

		    this.skinSwitch = function (color) {
		        this.currentSkin = color;
		    }
		})

		.controller('HeaderController', function($timeout){
		    // Top Search
		    this.openSearch = function(){
		        angular.element('#header').addClass('search-toggled');
		        angular.element('#top-search-wrap').find('input').focus();
		    }

		    this.closeSearch = function(){
		        angular.element('#header').removeClass('search-toggled');
		    }
		    
		    // Get messages and notification for header
		    /*this.img = messageService.img;
		    this.user = messageService.user;
		    this.user = messageService.text;

		    this.messageResult = messageService.getMessage(this.img, this.user, this.text);*/

		    this.notifications = [
		    	{
		    		title: "Saiu para entrega",
		    		text: "Seu produto saiu para entrega, logo logo estará em sua casa"
		    	}
		    ];


		    //Clear Notification
		    this.clearNotification = function($event) {
		        $event.preventDefault();
		        
		        var x = angular.element($event.target).closest('.listview');
		        var y = x.find('.lv-item');
		        var z = y.size();
		        
		        angular.element($event.target).parent().fadeOut();
		        
		        x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
		        x.find('.grid-loading').fadeIn(1500);
		        var w = 0;
		        
		        y.each(function(){
		            var z = $(this);
		            $timeout(function(){
		                z.addClass('animated fadeOutRightBig').delay(1000).queue(function(){
		                    z.remove();
		                });
		            }, w+=150);
		        })
		        
		        $timeout(function(){
		            angular.element('#notifications').addClass('empty');
		        }, (z*150)+200);
		    }
		    
		    // Clear Local Storage
		    this.clearLocalStorage = function() {
		        //Get confirmation, if confirmed clear the localStorage
		        swal({   
		            title: "Are you sure?",   
		            text: "All your saved localStorage values will be removed",   
		            type: "warning",   
		            showCancelButton: true,   
		            confirmButtonColor: "#F44336",   
		            confirmButtonText: "Yes, delete it!",   
		            closeOnConfirm: false 
		        }, function(){
		            localStorage.clear();
		            swal("Done!", "localStorage is cleared", "success"); 
		        });
		        
		    }
		    
		    //Fullscreen View
		    this.fullScreen = function() {
		        //Launch
		        function launchIntoFullscreen(element) {
		            if(element.requestFullscreen) {
		                element.requestFullscreen();
		            } else if(element.mozRequestFullScreen) {
		                element.mozRequestFullScreen();
		            } else if(element.webkitRequestFullscreen) {
		                element.webkitRequestFullscreen();
		            } else if(element.msRequestFullscreen) {
		                element.msRequestFullscreen();
		            }
		        }

		        //Exit
		        function exitFullscreen() {
		            if(document.exitFullscreen) {
		                document.exitFullscreen();
		            } else if(document.mozCancelFullScreen) {
		                document.mozCancelFullScreen();
		            } else if(document.webkitExitFullscreen) {
		                document.webkitExitFullscreen();
		            }
		        }

		        if (exitFullscreen()) {
		            launchIntoFullscreen(document.documentElement);
		        }
		        else {
		            launchIntoFullscreen(document.documentElement);
		        }
		    }
		})

		.filter('translate', function() {
			return function(strText) {
				var strTranslated = false;
				_.each(Main.m_vecTranslations, function(tra) {
					if ((tra && tra.name) && tra.name == strText) {
						strTranslated = tra.value;
						return false;
					}
				});

				return strTranslated ? strTranslated : strText;
			}
		})

		.filter('image', function() {
			return function(strURL) {
				return Main.Image(strURL);
			}
		})

		.filter('view', function() {
			return function(strURL) {
				return Main.View(strURL);
			}
		})

		// Init Services
		Main.Services.Init(this.GetApp());

		// Init Directives
		Main.Directives.Init(this.GetApp());
	},

	Dispose: function() {

	}
};