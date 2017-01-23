'use strict';
const Logger = require( '../../lib/App/Logger' );
const chai = require( 'chai' );
const expect = chai.expect;
describe( 'Logger', () =>
{
	let logger;
	let errorStream;
	let logStream;
	beforeEach( () =>
	{
		logStream = Buffer.alloc( 100 );
		errorStream = Buffer.alloc( 100 );
		logger = new Logger( logStream, errorStream );
	} );
	it( 'formatData() should return correctly formatted string', () =>
	{
		expect( Logger.formatData( 'abc' ) ).to.match( /^\[[^\]]*]\sabc\s$/ );
	} );
	it( 'log() should append result of formatData() to logStream', () =>
	{
		logger.log( 'abc' );
		logger.log( 'abc' );
		let tmp = Buffer.alloc( 100 );
		tmp.write( Logger.formatData( 'abc' ) );
		tmp.write( Logger.formatData( 'abc' ) );
		expect( tmp.compare( logStream ) ).to.equal( 0 );
	} );
	it( 'error() should append result of formatData() to errorStream', () =>
	{
		logger.error( 'abc' );
		logger.error( 'abc' );
		let tmp = Buffer.alloc( 100 );
		tmp.write( Logger.formatData( 'abc' ) );
		tmp.write( Logger.formatData( 'abc' ) );
		expect( tmp.compare( errorStream ) ).to.equal( 0 );
	} );
} );
