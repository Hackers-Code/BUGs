'use strict';
const Task = require( '../lib/Tasks/Task' );
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;
describe( 'Task', () =>
{
	let clock;
	let counter;
	let task;
	beforeEach( () =>
	{
		clock = sinon.useFakeTimers();
		counter = 0;
		task = new Task( () =>
		{
			counter++;
		}, 1000, Buffer.from( '0bd4e222', 'hex' ) );
	} );
	afterEach( () =>
	{
		clock.restore();
	} );
	it( 'run() should return true if task is not running', () =>
	{
		expect( task.run() ).to.equal( true );
	} );
	it( 'run() should return false if task is already running', () =>
	{
		task.run();
		expect( task.run() ).to.equal( false );
	} );
	it( 'run() should not execute function in less than 1 second', () =>
	{
		task.run();
		clock.tick( 200 );
		expect( counter ).to.equal( 0 );
	} );
	it( 'run() should execute function once in 1 second', () =>
	{
		task.run();
		clock.tick( 1050 );
		expect( counter ).to.equal( 1 );
	} );
	it( 'run() should execute function twice in 2 seconds', () =>
	{
		task.run();
		clock.tick( 2100 );
		expect( counter ).to.equal( 2 );
	} );
	it( 'stop() should prevent function from being executed', () =>
	{
		task.run();
		task.stop();
		clock.tick( 10000 );
		expect( counter ).to.equal( 0 );
	} );
} );
