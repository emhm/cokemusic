var GameItem = IgeEntity.extend({
	classId: 'GameItem',

	init: function (gameItem, direction, x, y) {
		IgeEntity.prototype.init.call(this);

		var self = this;

		self.data('gameItem', gameItem);
		self.data('currentDirection', direction);

		//Set as isometric and set the texture
		self.isometric(true)
			.texture(ige.gameTexture.furniture);

		//Get the data for the object
		var object = FURNITURE[gameItem];
		self.data('object', object);

		//Load in the texture and offsets.
		self.cell(object['offsets'][direction][0])
			.anchor(object['offsets'][direction][1], object['offsets'][direction][2])
			.dimensionsFromCell();

		//Set the tileX and tileY cordinates
		self.data('tileX', x)
			.data('tileY', y)
			.data('tileXWidth',  object['offsets'][direction][3])
			.data('tileYHeight', object['offsets'][direction][4])
			.data('objectHeight', object['info']['height']);

		self.place();
		
		self._mouseEventsActive = true;

		//Mouse Over
		self._mouseOver = function(x, y) {
			if(ige.movingItem === false) {
				//self.highlight(true);
			}
		};

		//Mouse Out
		self._mouseOut = function(x, y) {
			if(ige.movingItem === false) {
				//self.highlight(false);
			}
		};

		//Mouse Down
		self._mouseDown = function(mouseEvent) {
			var stand = $('#infostand'),
				standImage = $('#infostand .furniture'),
				standTitle = $('#infostand .title'),
				standDescriptin = $('#infostand .description'),
				furniInfo = FURNITURE[this.data('gameItem')];

			standTitle.text(furniInfo['info']['title']);
			standDescriptin.text(furniInfo['info']['description']);
			standImage.attr('src', './assets/furniture/icons/' + furniInfo['info']['icon']);
			stand.show();

			if($HIGHLIGHT_SELECTED)
				ige.$('tileMap1').strokeTile(this.data('tileX'), this.data('tileY'));

			ige.selected = self;
		};
	},

	/**
	 * Places the item down on the map by setting the tiles it
	 * is "over" as occupied by the item on the tile map.
	 * @return {*}
	 */
	place: function (rotating ) {
		// Call the occupyTile method with the tile details.
		// This method doesn't exist in IgeEntity but is instead
		// added to an entity when that entity is mounted to a
		// tile map. The method tells the tile map that the
		// entity is mounted to that the tiles specified are now
		// taken up by this entity.
		this.occupyTile(
			this.data('tileX'),
			this.data('tileY'),
			this.data('tileXWidth'),
			this.data('tileYHeight')
		);

		var cords = this.getItemTransform(),
			tilemap = ige.$('tileMap1'),
			translateX = cords['x'], 
			translateY = cords['y'];

		this.mount(ige.$('tileMap1'))
			.tileWidth( this.data('tileXWidth'))
			.tileHeight( this.data('tileYHeight'))
			.bounds3d(this.data('tileXWidth') * tilemap._tileWidth, this.data('tileYHeight') * tilemap._tileHeight, this.data('objectHeight'))
			.translateToTile(translateX, translateY, 0)
			.occupyTile(this.data('tileX'), this.data('tileY'), this.data('tileXWidth'), this.data('tileYHeight'));

		if($HIGHLIGHT_SELECTED)
			ige.$('tileMap1').strokeTile(this.data('tileX'), this.data('tileY'));

		this.data('placed', true);

		return this;
	},

	/**
	 * Moves the tile placement of the item from it's current
	 * tile location to the new tile location specified. Also
	 * translates the entity.
	 * @param tileX
	 * @param tileY
	 * @return {*}
	 */
	moveTo: function (tileX, tileY) {
		if (this.data('placed')) {
			// Un-occupy the current tiles
			this.unOccupyTile(
				this.data('tileX'),
				this.data('tileY'),
				this.data('tileXWidth'),
				this.data('tileYHeight')
			);

			// Set the new tile position
			if(tileX !== undefined && tileY !== undefined) {
				this.data('tileX', tileX)
					.data('tileY', tileY);
			}

			this.occupyTile(
				this.data('tileX'),
				this.data('tileY'),
				this.data('tileXWidth'),
				this.data('tileYHeight')
			);

			var cords = this.getItemTransform();
			this.translateToTile(
				cords['x'],
				cords['y'],
				0
			);

			if($HIGHLIGHT_SELECTED)
				ige.$('tileMap1').strokeTile(this.data('tileX'), this.data('tileY'));
		}

		return this;
	},

	/**
	 * Gets the new x,y location for the object
	 */
	getItemTransform: function(x, y) {
		var translateX = this.data('tileX'),
			translateY = this.data('tileY'),
			returnObj;

		if(x !== undefined)
			translateX = x;
		if(y !== undefined)
			translateY = y;

		//If both sides are greater than 2. i.e the obj is larger than 2x2
		if( (this.data('tileXWidth') >= 2) && (this.data('tileYHeight') >= 2) ) { 
			translateX = this.data('tileX') +
							((ige.$('tileMap1').tileWidth() / 
							this.data('tileXWidth')) /
							ige.$('tileMap1').tileWidth());

			translateY = this.data('tileY') +
							((ige.$('tileMap1').tileHeight() / 
							this.data('tileYHeight')) /
							ige.$('tileMap1').tileHeight());

		} 
		//If the tile height is greater or equal 1x2
		else if(this.data('tileYHeight') >= 2) {
			translateY = this.data('tileY') +
							((ige.$('tileMap1').tileHeight() / 
							this.data('tileYHeight')) /
							ige.$('tileMap1').tileHeight());

		} 
		//If the tile width is greater or equal 2x1
		else if(this.data('tileXWidth') >= 2) { 
			translateX = this.data('tileX') +
							((ige.$('tileMap1').tileWidth() / 
							this.data('tileXWidth')) /
							ige.$('tileMap1').tileWidth());
		} 

		returnObj = {
			'x' : translateX,
			'y' : translateY,
		}

		return returnObj;
	},

	/**
	 * Handles destroying the entity from memory.
	 */
	destroy: function () {
		// Un-occupy the tiles this entity currently occupies
		if (this.data('placed')) {
			this.unOccupyTile(
				this.data('tileX'),
				this.data('tileY'),
				this.data('tileXWidth'),
				this.data('tileYHeight')
			);

			this.data('placed', false);
		}

		$('#infostand').hide();

		// Call the parent class destroy method
		IgeEntity.prototype.destroy.call(this);
	},

	/**
	 * Handles rotating the item.
	 */
	rotate: function() {
		var self = this;

		//console.log(this.data('tileX'), this.data('tileY'));
		//Un-occupy the current tiles
		this.unOccupyTile(
			this.data('tileX'),
			this.data('tileY'),
			this.data('tileXWidth'),
			this.data('tileYHeight')
		);

		function getNewDirection() {
			var current = self.data('currentDirection'),
				newDir = 'SE';

			switch(current) {
				case 'SE': newDir = 'SW'; break;
				case 'SW': newDir = 'NW'; break;
				case 'NW': newDir = 'NE'; break;
				case 'NE': newDir = 'SE'; break;
			}

			console.log(newDir);
			return newDir;
		}

		//Get the new direction
		var newDirection = getNewDirection(),
			direction = self.data('object')['offsets'][newDirection];

		//Update the current direction
		this.data('currentDirection', newDirection);

		//Set the new sprite cell, anchor, and update texture given
		//the new direction
		self.cell(direction[0])
			.anchor(direction[1], direction[2])
			.dimensionsFromCell();

		//Update the tile x and y values
		self.data('tileXWidth', direction[3])
			.data('tileYHeight', direction[4]);

		if($HIGHLIGHT_SELECTED)
			ige.$('tileMap1').strokeTile(this.data('tileX'), this.data('tileY'));

		self.moveTo();
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientItem; }