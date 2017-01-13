'use strict';
const App = require( './lib/App/App' );
const Config = require( './config' );
(function()
{
	let app = new App( Config );
	app.runTCP();
	app.runUDP();
})();
