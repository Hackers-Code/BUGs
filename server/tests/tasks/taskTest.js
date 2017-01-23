'use strict';
const Task = require( '../../lib/Tasks/Task' );
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const expect = chai.expect;

describe( 'Task', () =>
{
	let clock;
	let task;
	let spy;
	beforeEach( () =>
	{
		clock = sinon.useFakeTimers();
		spy = sinon.spy();
		task = new Task( spy, 1000, Buffer.from( '0bd4e222', 'hex' ) );
	} );
	afterEach( () =>
	{
		clock.restore();
	} );
	describe( '#run()', () =>
	{
		it( 'should return true if task is not running', () =>
		{
			expect( task.run() ).to.equal( true );
		} );
		it( 'should return false if task is already running', () =>
		{
			task.run();
			expect( task.run() ).to.equal( false );
		} );
		it( 'should not execute function in less than 1 second', () =>
		{
			task.run();
			clock.tick( 200 );
			expect( spy.callCount ).to.equal( 0 );
		} );
		it( 'should execute function once in 1 second', () =>
		{
			task.run();
			clock.tick( 1050 );
			expect( spy.callCount ).to.equal( 1 );
		} );
		it( 'should execute function twice in 2 seconds', () =>
		{
			task.run();
			clock.tick( 2100 );
			expect( spy.callCount ).to.equal( 2 );
		} );
	} );
	describe( '#stop()', () =>
	{
		it( 'should prevent function from being executed', () =>
		{
			task.run();
			task.stop();
			clock.tick( 10000 );
			expect( spy.callCount ).to.equal( 0 );
		} );
	} );
} );
