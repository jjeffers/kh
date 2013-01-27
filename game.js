//pro tip: see also this work in progress by Hex http://jsfiddle.net/hexaust/HV4TX/
window.onload = function() {

	Crafty.c("ShipToken", {
		__map_x: 0,
		__map_y: 0
	});
	
	Crafty.c('CustomControls', {
	    __move: {left: false, right: false, up: false, down: false},   
	    __zoom: { in: false, out: false }, 
	    __zoom_factor: 1,
	    _speed: 3,
	    CustomControls: function(speed) {
	      if (speed) this._speed = speed;
	      var move = this.__move;
		  var zoom = this.__zoom;
	      this.bind('EnterFrame', function() {
	        if (move.right) {
				//Crafty.viewport.scroll('x', Crafty.viewport.x+this._speed); 
				Crafty.viewport.pan('x', this._speed, 1);
			}
	        if (move.left) {
				Crafty.viewport.pan('x', -1*this._speed, 1); 
			}
	        if (move.up) {
				Crafty.viewport.pan('y', -1*this._speed, 1);
			} 
	        if (move.down) {
				Crafty.viewport.pan('y', this._speed, 1); 
			}
	
	      }).bind('KeyDown', function(e) {
	        // Default movement booleans to false
	        move.right = move.left = move.down = move.up = false;
	        // If keys are down, set the direction
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
				move.right = true;
			}
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = true;
	        if (e.keyCode === Crafty.keys.UP_ARROW) move.up = true;
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = true;
			if (e.keyCode === Crafty.keys.Q) zoom.in = true;
			if (e.keyCode === Crafty.keys.E) zoom.out = true;

	      }).bind('KeyUp', function(e) {
	        // If key is released, stop moving
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = false;
	        if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = false;
	        if (e.keyCode === Crafty.keys.UP_ARROW) move.up = false;
	        if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = false;
			if (e.keyCode === Crafty.keys.Q) zoom.in = false;
			if (e.keyCode === Crafty.keys.E) zoom.out = false;
			
	      }).bind('mousedown', function(e) {
		        var pos = Crafty.diamondIso.px2pos(e.realX, e.realY);
				console.log("Click on map at " + this.__DragStart.x + " " + this.__DragStart.y);
		      });

	      return this;
	    }
	  });
	
	
	Crafty.init(1024, 768);

	Crafty.sprite(1, "images/sprite.png", {
		hex: [0,0]
	});

	Crafty.sprite(128, "images/ship.png", {
		ship_n: [0,0],
		ship_ne: [1,0]
	});
	
	Crafty.background("url('images/background.png')");
	
	var iso = Crafty.diamondIso.init(196, 64, 10, 10);
	

	Crafty.c('MapManager', {
		__TileOffset: { x:64, y:-32 },
		__TileSelectedContainsShip: false,
		__IsDragging: false,
		__StartMapCoords: { x:0, y:0 },
		__CurrentPointerMapCoords: { x:0, y: 0 },
		__MoveBox: Crafty.e("2D, Canvas, Color").attr({w:50, h:10, alpha:0.5}).color("red"),
		__ship: Crafty.e("2D, DOM, DiamondIsometric, ShipToken, ship_n").attr({w:128, h:64}),
		init: function() {
			
			this.__MoveBox.attr("visible",false)
			this.bind('HexClick', function(pos) {
				console.log("hex click at " + pos.x + " " + pos.y)
				console.log(this.__ship.__map_x)
				console.log(this.__ship.__map_x == pos.x)
				if ((this.__ship.__map_x == pos.x) && (this.__ship.__map_y == pos.y)) {
					console.log("a ship is there")
					this.__StartMapCoords.x = pos.x
					this.__StartMapCoords.y = pos.y
					var px = iso.pos2px(this.__StartMapCoords.x, this.__StartMapCoords.y)
					//console.log(px)
					this.__MoveBox.attr("x", px.left + this.__TileOffset.x)
					this.__MoveBox.attr("y", px.top + this.__TileOffset.y)
					this.__MoveBox.attr("visible", false)
					
					this.__TileSelectedContainsShip = true;
				}
				else this.__TileSelectedContainsShip = false
			});
			this.bind('HexMouseDown', function(pos) {
				if ((this.__ship.__map_x == pos.x) && (this.__ship.__map_y == pos.y)) {
					this.__StartMapCoords.x = pos.x
					this.__StartMapCoords.y = pos.y
					var px = iso.pos2px(this.__StartMapCoords.x, this.__StartMapCoords.y)
					//console.log(px)
					this.__MoveBox.attr("x", px.left + this.__TileOffset.x)
					this.__MoveBox.attr("y", px.top + this.__TileOffset.y)
					this.__MoveBox.attr("visible", false)
					
					this.__TileSelectedContainsShip = true;
					this.__IsDragging = true;
				}
				//console.log(e)
			});
			this.bind('HexMouseUp', function(pos) {
				
				if (this.__IsDragging) {
					console.log("moving ship")
					this.__IsDragging = false;
					this.__MoveBox.attr("visible", false)
					this.place(this.__ship,pos.x,pos.y);
					this.__StartMapCoords.x = pos.x
					this.__StartMapCoords.y = pos.y
				}
			});	
				
			this.bind('HexMouseMove', function(pos) {
				if (this.__IsDragging)
				{
					this.__MoveBox.attr("visible", true)
					this.__CurrentPointerMapCoords.x = pos.x
					this.__CurrentPointerMapCoords.y = pos.y
					
					var pxStart = iso.pos2px(this.__StartMapCoords.x, this.__StartMapCoords.y)
					var pxEnd = iso.pos2px(this.__CurrentPointerMapCoords.x, this.__CurrentPointerMapCoords.y)
					var deltaX = pxEnd.left-pxStart.left;
					var deltaY = pxEnd.top-pxStart.top;
					var length = Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2))
					
					var angle = 0
					if (deltaX == 0)
					{
						if (deltaY >= 0) angle = 90
						else angle = 270
					} 
					else if (deltaX >= 0)
					{
						if (deltaY >= 0) angle = 18
						else angle = 342
					}
					else if (deltaX < 0)
					{
						if (deltaY >= 0) angle = 162
						else angle = 198
					}
					
					this.__MoveBox.attr("rotation", angle)
					//console.log(length)
					
					this.__MoveBox.attr("w", length)
					//console.log(length)
					//console.log("dragging to " + this.__CurrentPointerMapCoords.x +
					//	" " + this.__CurrentPointerMapCoords.y)
				}
			});
					
			
			for(var i = 9; i >= 0; i--) {
				for(var y = 9; y >= 0; y--) {
					var tile = Crafty.e("2D, DOM, DiamondIsometric, hex, maphex, Mouse")
						  .attr({w:128, h:64})
					      .areaMap([28,0],[100,0],[128,32],[100,64],[28,64],[0,32]);

					tile.setPos(i,y);

					iso.place(tile,i,y,0);
				}
			}
			
			console.log("Created map")
		
			this.place(this.__ship, 1, 9);	

		},
		place: function(tile, x, y) {
			iso.place(tile,x,y,0);
			console.log("ship placed at " + x + ", " + y)
			tile.__map_x = x;
			tile.__map_y = y
		}
	});
	
	Crafty.c('maphex', { 
		_XMapCoordinate: 0,
		_YMapCoordinate: 0,
		init: function() {
        	this.bind('Click', function(e) {
				Crafty.trigger('HexClick', { x: this._XMapCoordinate, y: this._YMapCoordinate });
			})
			.bind('MouseDown', function(e) {
				Crafty.trigger("HexMouseDown", { x: this._XMapCoordinate, y: this._YMapCoordinate });
			});
			this.bind('MouseMove', function(e) {
				Crafty.trigger("HexMouseMove", { x: this._XMapCoordinate, y: this._YMapCoordinate });
			});
			this.bind('MouseUp', function(e) {
				Crafty.trigger("HexMouseUp", { x: this._XMapCoordinate, y: this._YMapCoordinate });
			});
		},
		setPos: function(x,y) {
        	this._XMapCoordinate = x;
 			this._YMapCoordinate = y;
		}
	});	
	
	var player = Crafty.e("CustomControls, controls, Mouse").CustomControls(10);
	
	var game = Crafty.e("MapManager")
	
	Crafty.viewport.clampToEntities = false;
	
};
