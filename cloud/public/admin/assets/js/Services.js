if (typeof Main == 'undefined')
    Main = {};

Main.Services = {
    Init: function(pApp) {
        pApp
        .service('growlService', function(){
            var gs = {};
            gs.growl = function(message, type) {
                /*$.growl({
                    message: message
                },{
                    type: type,
                    allow_dismiss: false,
                    label: 'Cancel',
                    className: 'btn-xs btn-inverse',
                    placement: {
                        from: 'top',
                        align: 'right'
                    },
                    delay: 2500,
                    animate: {
                            enter: 'animated bounceIn',
                            exit: 'animated bounceOut'
                    },
                    offset: {
                        x: 20,
                        y: 85
                    }
                });*/
            }
            
            return gs;
        })

        .service('scrollService', function() {
            var ss = {};
            ss.malihuScroll = function scrollBar(selector, theme, mousewheelaxis) {
                $(selector).mCustomScrollbar({
                    theme: theme,
                    scrollInertia: 100,
                    axis:'yx',
                    mouseWheel: {
                        enable: true,
                        axis: mousewheelaxis,
                        preventDefault: true
                    }
                });
            }
            
            return ss;
        })

        
    }
}
