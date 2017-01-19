'use strict';
const Task = require( '../lib/Tasks/Task' );
const TasksStorage = require( '../lib/Tasks/TasksStorage' );
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
			expect( counter ).to.equal( 0 );
		} );
		it( 'should execute function once in 1 second', () =>
		{
			task.run();
			clock.tick( 1050 );
			expect( counter ).to.equal( 1 );
		} );
		it( 'should execute function twice in 2 seconds', () =>
		{
			task.run();
			clock.tick( 2100 );
			expect( counter ).to.equal( 2 );
		} );
	} );
	describe( '#stop()', () =>
	{
		it( 'should prevent function from being executed', () =>
		{
			task.run();
			task.stop();
			clock.tick( 10000 );
			expect( counter ).to.equal( 0 );
		} );
	} );
} );
describe( 'Tasks storage', () =>
{
	let tasksStorage;
	beforeEach( () =>
	{
		tasksStorage = new TasksStorage();
	} );
	describe( '#addTask()', () =>
	{
		it( 'should return buffer', () =>
		{
			expect( tasksStorage.addTask( () => {} ) ).to.be.instanceof( Buffer );
		} );
	} );
	describe( '#removeTask()', () =>
	{
		it( 'should return false if task not exist', () =>
		{
			expect( tasksStorage.removeTask( Buffer.from( '12345678', 'hex' ) ) ).to.be.false;
		} );
		it( 'should return true if task exists', () =>
		{
			let id = tasksStorage.addTask( () => {} );
			expect( tasksStorage.removeTask( id ) ).to.be.true;
		} );
	} );
	describe( '#runTask()', () =>
	{
		it( 'should return false if task not exist', () =>
		{
			expect( tasksStorage.runTask( Buffer.from( '12345678', 'hex' ) ) ).to.be.false;
		} );
		it( 'should return false if task exist but is currently running', () =>
		{
			let id = tasksStorage.addTask( () => {} );
			tasksStorage.runTask( id );
			expect( tasksStorage.runTask( id ) ).to.be.false;
		} );
		it( 'should return true if task exists and is not currently running', () =>
		{
			let id = tasksStorage.addTask( () => {} );
			expect( tasksStorage.runTask( id ) ).to.be.true;
		} );
	} );

	describe( '#getTasks()', () =>
	{
		it( 'should return empty array if no tasks were added', () =>
		{
			expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
		} );
		it( 'should return array with length 1 after adding 1 task', () =>
		{
			tasksStorage.addTask( () => {}, 1000 );
			expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 1 );
		} );
		it( 'should return empty array if task was added and then removed', () =>
		{
			let id = tasksStorage.addTask( () => {}, 1000 );
			tasksStorage.removeTask( id );
			expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
		} );
	} );

} );
