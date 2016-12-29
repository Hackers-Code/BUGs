'use strict';
const readline = require( 'readline' );
const ConfigManager = require( './lib/App/ConfigManager' );
(function()
{
	let checkIfConfigExists = new Promise( ConfigManager.exist );
	checkIfConfigExists.then( () =>
	{
		const rl = readline.createInterface( {
			input : process.stdin,
			output : process.stdout
		} );
		rl.question( 'Config file already exist. Create anyway? Old data will be deleted. (Y/N) : ', ( answer ) =>
		{
			if( answer === 'N' )
			{
				console.log( 'Action aborted by user' );
			}
			else if( answer === 'Y' )
			{
				ConfigManager.create( handleConfigCreate );
			}
			rl.close();
		} );
	} ).catch( () =>
	{
		ConfigManager.create( handleConfigCreate );
	} );
})();

function handleConfigCreate( err )
{
	if( err )
	{
		console.log( 'Config file could not be created' );
		console.log( `Error: ${err.message}` );
		return;
	}
	console.log( 'File successfully created' );
}
