'use strict';
const App = require( './lib/App/App' );
const Config = require( './config' );
const TCP = require( './startTCP' );
const UDP = require( './startUDP' );
(function()
{
	let options = {
		config : Config,
		tcpStart : TCP,
		udpStart : UDP
	};
	new App( options );
})();
