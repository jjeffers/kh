//pro tip: see also this work in progress by Hex http://jsfiddle.net/hexaust/HV4TX/
window.onload = function() {
	
	Crafty.c("ShipToken", {
		__map_x: 0,
		__map_y: 0,
		__facing: 1,
		__ADF: 3,
		__MR: 2,
		__movesLeft: 0,
		__currentMR: 2,
		__currentSpeed: 3,
		init: function() {
			this.__movesLeft = __currentSpeed;
		},
		setFacing: function(new_facing) {
			if (new_facing != this.__facing) Crafty.trigger("ShipTurned")
			
			this.__facing = new_facing;
			this.__MR -= 1
		}
	});

	Crafty.c("HUD", {
	       init: function() {

	           if (this.has("DOM")) {
	               this._element.parentNode.removeChild(this._element);
	               Crafty.stage.elem.appendChild(this._element);
	               this.z = 100;

	               Crafty.addEvent(this, this._element, "click", function() {
	                        //clicked
	               });
	           }
	       }
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
		ship_ne: [1,0],
		ship_se: [2,0],
		ship_s: [3,0],
		ship_sw: [4,0],
		ship_nw: [5,0]
	});
	
	Crafty.background("url('images/background.png')");
	
	var iso = Crafty.diamondIso.init(196, 64, 10, 10);
	

	Crafty.c('MapManager', {
		__TileOffset: { x:64, y:-32 },
		__IsDragging: false,
		__StartMapCoords: { x:0, y:0 },
		__CurrentPointerMapCoords: { x:0, y: 0 },
		__MoveBox: Crafty.e("2D, Canvas, Color").attr({w:50, h:10, alpha:0.5}).color("red"),
		__ship: Crafty.e("2D, DOM, DiamondIsometric, SpriteAnimation, ShipToken, ship_n")
			.attr({w:128, h:64}),
		__eligibleMoves: new Array(),
		init: function() {
			
			this.__MoveBox.attr("visible",false)
			this.bind('HexClick', function(pos) {
				//console.log("hex click at " + pos.x + " " + pos.y)

				if ((this.__ship.__map_x == pos.x) && (this.__ship.__map_y == pos.y)) {
					this.__StartMapCoords.x = pos.x
					this.__StartMapCoords.y = pos.y
					var px = iso.pos2px(this.__StartMapCoords.x, this.__StartMapCoords.y)
					//console.log(px)
					this.__MoveBox.attr("x", px.left + this.__TileOffset.x)
					this.__MoveBox.attr("y", px.top + this.__TileOffset.y)
					this.__MoveBox.attr("visible", false)
				}
				
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
					
					Crafty.trigger("ShipSelected", this.__ship.__MR);
					
					this.__IsDragging = true;
					this.calculateEligibleMoves()
					
					
				}
				//console.log(e)
			});
			this.bind('HexMouseUp', function(pos) {
				
				if (this.__IsDragging) {
					
					if (this.isAnEligibleMove(pos)) {
						
						this.__IsDragging = false;
						this.__MoveBox.attr("visible", false)
					
						this.__ship.removeComponent("ship_n")
						this.__ship.removeComponent("ship_ne")
						this.__ship.removeComponent("ship_se")
						this.__ship.removeComponent("ship_s")
						this.__ship.removeComponent("ship_sw")
						this.__ship.removeComponent("ship_nw")
						
						if (pos.x == this.__ship.__map_x) {
							if (pos.y > this.__ship.__map_y) {
								this.__ship.addComponent("ship_sw").attr({w:128, h:64})
								this.__ship.setFacing(5)
							}
							else if (pos.y < this.__ship.__map_y) {
								this.__ship.addComponent("ship_ne").attr({w:128, h:64})
								this.__ship.setFacing(2)
							}
						}
						else if (pos.x > this.__ship.__map_x) {
							if (pos.y > this.__ship.__map_y) {
								this.__ship.addComponent("ship_s").attr({w:128, h:64})
								this.__ship.setFacing(4)
							}
							else if (pos.y < this.__ship.__map_y) {
								this.__ship.addComponent("ship_s").attr({w:128, h:64})
								this.__ship.setFacing(4)
							}
							else {
								this.__ship.addComponent("ship_se").attr({w:128, h:64})
								this.__ship.setFacing(3)
							}
						}
						else if (pos.x < this.__ship.__map_x) {
							if (pos.y > this.__ship.__map_y) {
								this.__ship.addComponent("ship_nw").attr({w:128, h:64})
								this.__ship.setFacing(6)
							}
							else if (pos.y < this.__ship.__map_y) {
								this.__ship.addComponent("ship_n").attr({w:128, h:64})
								this.__ship.setFacing(1)
							}
							else {
								this.__ship.addComponent("ship_nw").attr({w:128, h:64})
								this.__ship.setFacing(6)
							}
						}
						
						this.place(this.__ship,pos.x, pos.y);
							
					}
					else console.log("move to " + pos.x + ", " + pos.y + " was not an eligble move!")
				}
			});	
				
			this.bind('HexMouseMove', function(pos) {
				if (this.__IsDragging)
				{
					this.__MoveBox.attr("visible", true)
					this.__CurrentPointerMapCoords.x = pos.x
					this.__CurrentPointerMapCoords.y = pos.y
					
					if (this.isAnEligibleMove(pos.x, pos.y)) {
						console.log(pos.x + ", " + pos.y + " would be a legal move")
					}
					
					if (true) {
						
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
					}
				}
			});
					
			
			for(var i = 9; i >= 0; i--) {
				for(var y = 9; y >= 0; y--) {
					var tile = Crafty.e("2D, DOM, DiamondIsometric, hex, maphex, Text, Mouse")
						  .attr({w:128, h:64})
					      .areaMap([28,0],[100,0],[128,32],[100,64],[28,64],[0,32]);

					tile.setPos(i,y);

					iso.place(tile,i,y,0);
				}
			}
			
			console.log("Created map")
		
			this.place(this.__ship, 2, 6);	
			

		},
		place: function(tile, x, y) {
			
			iso.place(tile,x,y,0);
			
			tile.__map_x = x;
			tile.__map_y = y;
			
			this.__StartMapCoords.x = x
			this.__StartMapCoords.y = y
			
		},
		calculateEligibleMoves: function() {
			this.__eligibleMoves = new Array()
			console.log("ship facing is " + this.__ship.__facing)
			for(var i = 9; i >= 0; i--) {
				for(var j = 9; j >= 0; j--) {
					//console.log("looking at " + i + ", " + j)
					if (this.__ship.__map_x == i) {
						if (j < this.__ship.__map_y) {
							
							if ((this.__ship.__facing == 1) || 
								(this.__ship.__facing == 2) || 
								(this.__ship.__facing == 3)) {
									this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
									
								}
						}
						else if (j > this.__ship.__map_y) {
							if ((this.__ship.__facing == 4) ||
								(this.__ship.__facing == 5) ||
								(this.__ship.__facing == 6)) {
									this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
									//console.log("added " + i + ", " + j + " to list of eligible moves")
								}
						}
					}
					else if (this.__ship.__map_y == j) {
						if (i > this.__ship.__map_x) {
							if ((this.__ship.__facing == 2) || 
								(this.__ship.__facing == 3) || 
								(this.__ship.__facing == 4)) {
									this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
								}
							}
						else if (i < this.__ship.__map_x) {
							if ((this.__ship.__facing == 1) || 
								(this.__ship.__facing == 5) || 
								(this.__ship.__facing == 6)) {
									this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
								}
							}
					}
					else {
						m = (this.__ship.__map_y - j)/(this.__ship.__map_x - i)
						
						if (m == 1) {
							//console.log("slope to " + i + ", " + j + " from " + 
							//this.__ship.__map_x + ", " +
							//this.__ship.__map_y + " was " + m)
							//console.log("ship facing is " + this.__ship.__facing)
							if (i < this.__ship.__map_x) {
								if ((this.__ship.__facing == 6) || 
									(this.__ship.__facing == 1) || 
									(this.__ship.__facing == 2)) {
										this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
										//console.log("added " + i + ", " + j + " to list of eligible moves")
								}
							}
							else if (i > this.__ship.__map_x) {
								if ((this.__ship.__facing == 3) || 
									(this.__ship.__facing == 4) || 
									(this.__ship.__facing == 5)) {
										this.__eligibleMoves[this.__eligibleMoves.length] = { x:i, y:j }
										//console.log("added " + i + ", " + j + " to list of eligible moves")
								}
							}
						}
						
					}
				}
			}
		},
		isAnEligibleMove: function(pos) {

			return this.__eligibleMoves.some( function(element, index, array) {
				return ((pos.x == element.x) && (pos.y == element.y)) 
			})
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
	
	Crafty.c('Display', {
		__name: Crafty.e("DOM, HUD, Text").text("Ship").textColor('#FFFFFF'),
		__MRLabel: Crafty.e("DOM, HUD, Text").text("MR").textColor('#FFFFFF').attr({y:20}),
		__MR: Crafty.e("DOM, HUD, Text").textColor('#FFFFFF').attr({ x: 60, y:20}),
		__currentMR: 0,
		__MovesLeftLabel: Crafty.e("DOM, HUD, Text").text("MP Left").textColor('#FFFFFF').attr({y:40}),
		__MovesLeft: Crafty.e("DOM, HUD, Text").text("3").textColor('#FFFFFF').attr({ x: 60, y:40}),
		init: function() {
        	this.bind('ShipMove', function(hexes_moved) {
				this.decrementMR(hexes_moved)
			})
			this.bind('ShipSelected', function(mr) {
				this.setMR(mr)
			})
			this.bind('ShipTurned', function() {
				this.decrementMR(1)
			})
			
		},
		setMR: function(mr) {
			this.__currentMR = mr;
			this.__MR.text(this.__currentMR)
		},
		decrementMR: function(amount) {
			console.log("old mr " + this.__currentMR)
			this.__currentMR = this.__currentMR - amount;
			console.log("new mr " + this.__currentMR)
			if (this.__currentMR < 0) this.__currentMR = 0
			this.__MR.text(this.__currentMR)
		}
	});
	
	var player = Crafty.e("CustomControls, controls, Mouse").CustomControls(10);
	
	var hud = Crafty.e('Display')
	var game = Crafty.e("MapManager")
	
	Crafty.viewport.clampToEntities = false;
	
};
