if (typeof Main == 'undefined')
    Main = {};

Main.Utils = {
	Capitalize: function (str) {
   		return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}
}