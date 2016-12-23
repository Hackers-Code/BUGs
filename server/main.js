'use strict';
(function()
{
	try
	{
		const Server = require( './lib/Network/ServerTCP' );
		new Server( {
			host : '0.0.0.0',
			port : 31337
		} );
	}
	catch( e )
	{
	}
})();
