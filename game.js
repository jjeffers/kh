//pro tip: see also this work in progress by Hex http://jsfiddle.net/hexaust/HV4TX/
window.onload = function() {
	Crafty.c('CustomControls', {
	    __move: {left: false, right: false, up: false, down: false},   
	    __zoom: { in: false, out: false }, 
	    __zoom_factor: 1,
	    _speed: 3,
	    CustomControls: function(speed) {
	      if (speed) this._speed = speed;
	      var move = this.__move;
		  var zoom = this.__zoom;
			console.log("init");
	      this.bind('EnterFrame', function() {
	        if (move.right) {
				//Crafty.viewport.scroll('x', Crafty.viewport.x+this._speed); 
				Crafty.viewport.pan('x', this._speed, 1);
				console.log("moving right");
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
			console.log("keydown");
	        move.right = move.left = move.down = move.up = false;
	        // If keys are down, set the direction
	        if (e.keyCode === Crafty.keys.RIGHT_ARROW) {
				move.right = true;
				console.log("Right arrow down");
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

	var z = 0;
	for(var i = 10; i >= 0; i--) {
		for(var y = 0; y < 10; y++) {
			var tile = Crafty.e("2D, DOM, DiamondIsometric, hex, Mouse")
				  .attr({w:128, h:64})
			      .areaMap([28,0],[100,0],[128,32],[100,64],[28,64],[0,32])
      
			iso.place(tile,i,y,0);
		}
	}
	var ship = Crafty.e("2D, DOM, DiamondIsometric, ship_n").attr({w:128, h:64});
	var ship2 = Crafty.e("2D, DOM, DiamondIsometric, ship_ne").attr({w:128, h:64});
	
	iso.place(ship, 0, 0, 0);
	iso.place(ship2, 1, 0, 0);
			
	var player = Crafty.e("CustomControls, controls").CustomControls(10);
	Crafty.viewport.clampToEntities = false;
	
};
