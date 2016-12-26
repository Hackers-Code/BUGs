'use strict';
const ConfigManager = require( './lib/App/ConfigManager' );
const App = require( './lib/App/App' );
(function()
{
	let config = new ConfigManager();
	if( !config.exist() )
	{
		console.log( 'Config file not found, run init.js first' );
		return;
	}
	let app = new App();
	app.run();
})();
