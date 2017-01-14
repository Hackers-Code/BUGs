class Task {
	constructor( func = () => {}, interval = 1000, id = Buffer.from( '12345678', 'hex' ) )
	{
		this.id = id;
		this.interval = interval;
		this.func = func;
		this.timer = null;
		this.isRunning = false;
	}

	run()
	{
		if( this.isRunning === true )
		{
			return false;
		}
		this.timer = setInterval( this.func, this.interval );
		this.isRunning = true;
		return true;
	}

	stop()
	{
		if( this.timer !== null )
		{
			clearInterval( this.timer );
			this.timer = null;
		}
	}
}
module.exports = Task;
