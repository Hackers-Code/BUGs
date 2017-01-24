const UniqueKeyGenerator = require( '../Utils/UniqueKeyGenerator' );
const SearchEngine = require( '../Utils/SearchEngine' );
const Task = require( './Task' );
class TasksStorage {
	constructor( tickrate )
	{
		this.tickrate = tickrate;
		this.tasks = [];
		this.uniqueKeyGenerator = new UniqueKeyGenerator( 4 );
	}

	getTasks()
	{
		return this.tasks;
	}

	addTask( func, interval = 1000 / this.tickrate )
	{
		let id = this.uniqueKeyGenerator.generateKey();
		let task = new Task( func, interval, id );
		this.tasks.push( task );
		return id;
	}

	removeTask( id )
	{
		let index = SearchEngine.findByUniqueID( id, this.tasks );
		if( index !== false && index !== -1 )
		{
			this.tasks[ index ].stop();
			this.uniqueKeyGenerator.freeKey( id );
			this.tasks.splice( index, 1 );
			return true;
		}
		return false;
	}

	runTask( id )
	{
		let index = SearchEngine.findByUniqueID( id, this.tasks );
		if( index !== false && index !== -1 )
		{
			return this.tasks[ index ].run();
		}
		return false;
	}
}
module.exports = TasksStorage;
