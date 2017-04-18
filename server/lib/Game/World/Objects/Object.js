'use strict';
class Object {
	constructor( element )
	{
		this.x = element.x || 0;
		this.y = element.y || 0;
		this.width = element.width || 0;
		this.height = element.height || 0;
	}
}
module.exports = Object;
