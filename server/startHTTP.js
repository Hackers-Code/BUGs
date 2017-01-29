'use strict';
const express = require( 'express' );
const fs = require( 'fs' );
const expressApp = express();
module.exports = () =>
{
	expressApp.get( '/maps/list.json', function( req, res )
	{
		fs.readFile( process.cwd() + '/resources/maps/list.json', ( err, data ) =>
		{
			res.send( data );
		} );
	} );

	expressApp.get( '/weapons/list.json', function( req, res )
	{
		fs.readFile( process.cwd() + '/resources/weapons/list.json', ( err, data ) =>
		{
			res.send( data );
		} );
	} );

	expressApp.get( '/maps/:file', function( req, res )
	{
		let filename = req.params.file;
		if( /^[A-Za-z0-9]*\.((png)|(map))$/.test( filename ) )
		{
			fs.readFile( process.cwd() + '/resources/maps/' + filename, ( err, data ) =>
			{
				if( err )
				{
					res.send( 'File not found' );
				}
				else
				{
					res.send( data );
				}
			} );
		}
		else
		{
			res.send( 'Invalid filename' );
		}
	} );

	expressApp.get( '/weapons/:file', function( req, res )
	{
		let filename = req.params.file;
		if( /^[A-Za-z0-9]*\.(png)$/.test( filename ) )
		{
			fs.readFile( process.cwd() + '/resources/weapons/' + filename, ( err, data ) =>
			{
				if( err )
				{
					res.send( 'File not found' );
				}
				else
				{
					res.send( data );
				}
			} );
		}
		else
		{
			res.send( 'Invalid filename' );
		}
	} );

	expressApp.get( '*', function( req, res )
	{
		fs.readFile( process.cwd() + '/resources/resources.json', ( err, data ) =>
		{
			res.send( data );
		} );
	} );
	expressApp.listen( 31338, '0.0.0.0' );
};
