'use strict';
const App = require( './lib/App/App' );
const Config = require( './config' );
const UDP = require( './startUDP' );
const HTTP = require( './startHTTP' );
(function()
{
	let options = {
		config : Config,
		httpStart : HTTP
	};
	new App( options );
})();
