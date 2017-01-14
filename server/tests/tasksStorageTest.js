'use strict';
const TasksStorage = require( '../lib/Tasks/TasksStorage' );
const chai = require( 'chai' );
const expect = chai.expect;
describe( 'Tasks storage', () =>
{
	let tasksStorage;
	beforeEach( () =>
	{
		tasksStorage = new TasksStorage();
	} );
	it( 'addTask() should return buffer', () =>
	{
		expect( tasksStorage.addTask( () => {} ) ).to.be.instanceof( Buffer );
	} );
	it( 'removeTask() should return false if task not exist', () =>
	{
		expect( tasksStorage.removeTask( Buffer.from( '12345678', 'hex' ) ) ).to.be.false;
	} );
	it( 'removeTask() should return true if task exists', () =>
	{
		let id = tasksStorage.addTask( () => {} );
		expect( tasksStorage.removeTask( id ) ).to.be.true;
	} );
	it( 'runTask() should return false if task not exist', () =>
	{
		expect( tasksStorage.runTask( Buffer.from( '12345678', 'hex' ) ) ).to.be.false;
	} );
	it( 'runTask() should return false if task exist but is currently running', () =>
	{
		let id = tasksStorage.addTask( () => {} );
		tasksStorage.runTask( id );
		expect( tasksStorage.runTask( id ) ).to.be.false;
	} );
	it( 'runTask() should return true if task exists and is not currently running', () =>
	{
		let id = tasksStorage.addTask( () => {} );
		expect( tasksStorage.runTask( id ) ).to.be.true;
	} );
	it( 'getTasks() should return empty array if no tasks were added', () =>
	{
		expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
	} );
	it( 'getTasks() should return array with length 1 after adding 1 task', () =>
	{
		tasksStorage.addTask( () => {}, 1000 );
		expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 1 );
	} );
	it( 'getTasks() should return empty array if task was added and then removed', () =>
	{
		let id = tasksStorage.addTask( () => {}, 1000 );
		tasksStorage.removeTask( id );
		expect( tasksStorage.getTasks() ).to.be.an( 'array' ).with.length( 0 );
	} );
} );
