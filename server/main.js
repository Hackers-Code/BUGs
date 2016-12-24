'use strict';
(function()
{
	try
	{
		const ServerTCP = require( './lib/Network/ServerTCP' );
		const ServerUDP = require( './lib/Network/ServerUDP' );
		new ServerTCP( {
			host : '0.0.0.0',
			port : 31337
		} );
		new ServerUDP( 31337 );
	}
	catch( e )
	{
	}
})();
