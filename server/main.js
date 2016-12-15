'use strict';
(function()
{
	console.log( 'Running server v. 1.0' );
	console.log( 'Author: BOAKGP' );
	try
	{
		const Server = require( './lib/Server' );
		new Server();
	}
	catch( e )
	{
		console.log( 'Caught exception, more info:' );
		console.log( e );
	}
})();
