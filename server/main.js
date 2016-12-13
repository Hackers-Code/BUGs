'use strict';
(function()
{
	console.log( 'Running server v. 1.0' );
	try
	{
		const Server = require( './lib/Server' );
		Server();
	}
	catch( e )
	{
		console.log( 'Caught exception, more info:' );
		console.log( e );
	}
})();
