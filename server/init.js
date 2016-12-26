'use strict';
const readline = require( 'readline' );
const rl = readline.createInterface( {
	input : process.stdin,
	output : process.stdout
} );
const ConfigManager = require( './lib/App/ConfigManager' );
(function()
{
	let config = new ConfigManager();
	if( config.exist() )
	{
		rl.question( 'Config file already exist. Create anyway? Old data will be deleted. Y/N', ( answer ) =>
		{
			if( answer === 'N' )
			{
				console.log( 'Config creating aborted by user.' );
				rl.close();
			}
			else if( answer === 'Y' )
			{
				config.create( handleConfigCreate );
				rl.close();
			}
		} );
	}
	else
	{
		config.create( handleConfigCreate );
		rl.close();
	}
})();

function handleConfigCreate( err )
{
	if( err )
	{
		console.log( 'Config file could not be created' );
		console.log( err.message );
		return;
	}
	console.log( 'File successfully created' );
}
