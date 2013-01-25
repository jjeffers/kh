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

	Crafty.sprite(128, "images/sprite.png", {
		grass: [0,0,1,1],
		stone: [1,0,1,1]
	});

	Crafty.background("url('images/background.png')");
	
	iso = Crafty.isometric.size(196,72);
	
	var z = 0;
	for(var i = 20; i >= 0; i--) {
		for(var y = 0; y < 30; y++) {
			var which = 0;
			var tile = Crafty.e("2D, DOM, "+ (!which ? "grass" : "stone") +", Mouse")
			.attr('z',i+1 * y+1)
      .areaMap([28,0],[100,0],[128,36],[100,72],[28,72],[0,36])
      
			
			iso.place(i,y,0, tile);
		}
	}
	
	var player = Crafty.e("CustomControls, controls").CustomControls(10);
	
};
