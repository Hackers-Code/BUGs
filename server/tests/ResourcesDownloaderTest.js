'use strict';
const chai = require( 'chai' );
const mocha = require( 'mocha' );
const expect = chai.expect;
const ResourcesDownloader = require( '../lib/ResourcesDownloader/ResourcesDownloader' );

describe( 'ResourcesDownloader', () =>
{
	it( 'getMapList() should return object', ( done ) =>
	{
		let resourcesDownloader = new ResourcesDownloader();
		resourcesDownloader.getMapList( ( err, list ) =>
		{
			if( err )
			{
				done( err );
				return;
			}
			if( typeof list === 'object' )
			{
				done();
			}
			else
			{
				done( new Error( 'List must be an object' ) );
			}
		} );
	} );
} );
