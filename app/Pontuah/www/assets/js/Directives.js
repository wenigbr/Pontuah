if (typeof Main == 'undefined')
    Main = {};

Main.Directives = {
    Init: function(pApp) {
        pApp
        .directive('changeLayout', function(){
            
            return {
                restrict: 'A',
                scope: {
                    changeLayout: '='
                },
                
                link: function(scope, element, attr) {
                    
                    //Default State
                    if(scope.changeLayout === '1') {
                        element.prop('checked', true);
                    }
                    
                    //Change State
                    element.on('change', function(){
                        if(element.is(':checked')) {
                            localStorage.setItem('ma-layout-status', 1);
                            scope.$apply(function(){
                                scope.changeLayout = '1';
                            })
                        }
                        else {
                            localStorage.setItem('ma-layout-status', 0);
                            scope.$apply(function(){
                                scope.changeLayout = '0';
                            })
                        }
                    })
                }
            }
        })

        .directive('toggleSidebar', function(){
            return {
                restrict: 'A',
                scope: {
                    model: '='
                },
                
                link: function(scope, element, attr) {
                    element.on('click', function(){

                        if (scope.model.block)
                            return;

                        if (element.data('target') === 'mainmenu') {
                            if (scope.model.left === false) {
                                scope.$apply(function(){
                                    scope.model.left = true;
                                })
                            }
                            else {
                                scope.$apply(function(){
                                    scope.model.left = false;
                                })
                            }
                        }
                        
                        if (element.data('target') === 'chat') {
                            if (scope.model.right === false) {
                                scope.$apply(function(){
                                    scope.model.right = true;
                                })
                            }
                            else {
                                scope.$apply(function(){
                                    scope.model.right = false;
                                })
                            }
                            
                        }
                    })
                }
            }
        })

        .directive('toggleSubmenu', function(){
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.click(function(){
                        element.next().slideToggle(200);
                        element.parent().toggleClass('toggled');
                    });
                }
            }
        })

        .directive('stopPropagate', function(){
            return {
                restrict: 'C',
                link: function(scope, element) {
                    element.on('click', function(event){
                        event.stopPropagation();
                    });
                }
            }
        })

        .directive('aPrevent', function(){
            return {
                restrict: 'C',
                link: function(scope, element) {
                    element.on('click', function(event){
                        event.preventDefault();
                    });
                }
            }
        })

        .directive('print', function(){
            return {
                restrict: 'A',
                link: function(scope, element){
                    element.click(function(){
                        window.print();
                    })   
                }
            }
        })

        .directive('cOverflow', ['scrollService', function(scrollService){
            return {
                restrict: 'C',
                link: function(scope, element) {

                    if (!$('html').hasClass('ismobile')) {
                        scrollService.malihuScroll(element, 'minimal-dark', 'y');
                    }
                }
            }
        }])

        // For .btn classes
        .directive('btn', function(){
            return {
                restrict: 'C',
                link: function(scope, element) {
                    if(element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                        Waves.attach(element, ['waves-circle']);
                    }

                    else if(element.hasClass('btn-light')) {
                        Waves.attach(element, ['waves-light']);
                    }

                    else {
                        Waves.attach(element);
                    }

                    Waves.init();
                }
            }
        })
    }
}