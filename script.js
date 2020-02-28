// |= adds to the bitmask
// ^= toggles from the bitmask
// &= ~PROP always removes from the bitmask
// & checks if true

// Tech to make it harder for hackers to do stuff (this is definitely bullet-proof)
(function(){
	///////////////////////
	////// VARIABLES //////
	///////////////////////
	
	// Elements
	const BODY				= document.body;
	const BUTTON			= document.getElementById('button');
	const HOLDER			= document.getElementById('button-holder');
	const NUMBER			= document.getElementById('number');
		
	const R					= document.getElementById('r');
	const G					= document.getElementById('g');
	const B					= document.getElementById('b');
	
	const BUTTONDOWN		= document.createElement('audio');
	BUTTONDOWN.preload		= true;
	BUTTONDOWN.src			= 'assets/button-down.mp3';
	const BUTTONUP			= document.createElement('audio');
	BUTTONUP.preload		= true;
	BUTTONUP.src			= 'assets/button-up.mp3';
	
	const COMMENTARYVOLUME	= document.getElementById('commentary');
	const COMMENTARYEL		= document.createElement('audio');
	COMMENTARYEL.autoplay	= true;
	COMMENTARYEL.volume		= COMMENTARYVOLUME.value
	
	// Bitmasks for all possible presses
	const MOUSE				= 1 << 0;
	const TOUCH0			= 1 << 1;
	const TOUCH1			= 1 << 2;
	const TOUCH2			= 1 << 3;
	const TOUCH3			= 1 << 4;
	const TOUCH4			= 1 << 5;
	const TOUCH5			= 1 << 6;
	const TOUCH6			= 1 << 7;
	const TOUCH7			= 1 << 8;
	const TOUCH8			= 1 << 9;
	const TOUCH9			= 1 << 10;
	
	// Ints
	var number				= 0;
	var windowPresses		= 0;
	var buttonPresses		= 0;
	
	var buttonCenterX		= 0;
	var buttonCenterY		= 0;
	var buttonRadius		= 0;
	
	// Arrays
	const COMMENTARY		= [1,5];
	
	///////////////////////
	////// FUNCTIONS //////
	///////////////////////
	
	function getCenter(){
		var buttonRect	= BUTTON.getBoundingClientRect();
		buttonRadius	= buttonRect.width / 2;
		buttonCenterX	= buttonRect.left	+ buttonRadius;
		buttonCenterY	= buttonRect.top	+ buttonRadius;
	}
	
	function incrementNumber(event){
		number++;
		NUMBER.innerHTML = number;
		
		// Play commentary if we're set up to and have one to play
		if(COMMENTARYEL.volume){
			// See if the current position is in the array of positions
			for(var i = 0, l = COMMENTARY.length; i < l; i ++){
				if(COMMENTARY[i] === number){
					// Get the source
					COMMENTARYEL.src = 'commentary/' + ('00000000' + number).slice(-7) + '.wav';
					break;
				}
			}
		}
	}
	
	// Angle the button
	function angle(event){
		// Need to add support for multiple touches tho?
	
		// If the button is being targeted at all by the movement, angle it
		if(event.target === BUTTON){
			var pressStrength		= buttonRadius / 700;
			var pressMove			= buttonRadius / 1200;
			var pressScale			= 1;
			
			// If pressing down, restrict further (amounts are arbitrary based on what I think looks good)
			if(buttonPresses){
				pressStrength	/= 1.75;
				pressMove		/= 1.75;
				pressScale		= .95;
			}
		
			// Set button rotation angle
			// rotate3d(rotate left, rotate up, LEAVE 0, strongest amount)
			var xAngle = (event.clientX - buttonCenterX) / buttonRadius;
			var yAngle = (event.clientY - buttonCenterY) / buttonRadius * -1;
			
			// Distance
			var a = event.clientX - buttonCenterX;
			var b = event.clientY - buttonCenterY;
			var distance = Math.sqrt(a*a + b*b);
			
			BUTTON.style.transform = 'rotate3d(' + yAngle + ',' + xAngle + ',0,' + (distance * pressStrength) + 'deg) translate(' + (a * pressMove) + 'px,' + (b * pressMove) + 'px) scale(' + pressScale + ')';
		} else {
			BUTTON.style.transform = 'rotate3d(0,0,0,0deg) translate(0px,0px) scale(1)';
		}
	}
	
	// On clicking/pressing a pointer
	function press(event){
		// Touches (fingers, stylus)
		if(event.touches){
			// add the newest touch addition(s); could be more than one
		}
		// Regular mouse clicks
		else {
			windowPresses |= MOUSE;
			if(event.target === BUTTON) buttonPresses |= MOUSE;
		}
		
		// Press the button
		if(!BUTTON.className && buttonPresses) setButtonDown();
		if(windowPresses) BODY.className	= 'pressed';
		
		angle(event);
	}
	
	// On unclicking/unpressing a pointer
	function unpress(event){
		var pressedStart = buttonPresses;
		
		// Touches (fingers, stylus)
		if(event.touches){
			// remove the numbered touch(es); update all of the touches (the ids need to stay consistent)
		}
		// Regular mouse clicks
		else {
			windowPresses &= ~MOUSE;
			buttonPresses &= ~MOUSE;
		}
		
		// See if nothing is pressing the button anymore
		if(pressedStart && !buttonPresses) setButtonUp();
		
		if(!windowPresses) BODY.className	= '';
		
		angle(event);
	}
	
	// On moving a pointer
	function move(event){
		// If the window is being pressed at all
		if(windowPresses){
			var buttonPressState = buttonPresses;
			
			// Touches (fingers, stylus)
			if(event.touches){
				// update all of the touches (the ids need to stay consistent; we'll have to see how browsers handle that)
			}
			// Regular mouse clicks
			else {
				// If the button is being moved onto with a pressed button, add it to the tracked presses
				if(event.target === BUTTON && !buttonPresses){
					buttonPresses |= MOUSE;
				}
				// If the button is being moved off of, track the press
				else if(event.target !== BUTTON && buttonPresses){
					buttonPresses &= ~MOUSE;
				}
			}
			
			if(!buttonPressState && buttonPresses){
				setButtonDown();
			}
			else if(buttonPressState && !buttonPresses){
				setButtonUp();
			}
		}
		
		angle(event);
	}
	
	function setButtonDown(){
		BUTTON.className		= 'pressed';
		// Slight change in the playback rate, so the sound feels a little different each time
		BUTTONDOWN.playbackRate	= 1.4 + (Math.random() * .1)
		BUTTONDOWN.currentTime	= 0;
		BUTTONDOWN.play();
	}
	
	function setButtonUp(){
		incrementNumber();
		BUTTON.className		= '';
		// Slight change in the playback rate, so the sound feels a little different each time
		BUTTONUP.playbackRate	= 1.8 + (Math.random() * .1)
		BUTTONUP.currentTime	= 0;
		BUTTONUP.play();
	}
	
	/// SET COLOR ///
	function setColor(){
		BUTTON.style.background = 'rgb(' + R.value + ',' + G.value + ',' + B.value + ') linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.4))';
		
		HOLDER.style.background = 'radial-gradient(rgba(0,0,0,.65) 60%,rgba(0,0,0,1) 63%,#bfbfbf 20%) rgb(' + R.value + ',' + G.value + ',' + B.value + ')';
	}
	
	///////////////////////
	/// EVENT LISTENERS ///
	///////////////////////
	
	// Adjust button data when we change the window's size, etc (so that the center stays correct)
	window.addEventListener('resize',getCenter);
	
	window.addEventListener('mousedown'		,press		);
	window.addEventListener('mouseup'		,unpress	);
	window.addEventListener('mousemove'		,move		);
	
	window.addEventListener('touchstart'	,press		);
	window.addEventListener('touchend'		,unpress	);
	window.addEventListener('touchmove'		,move		);
	
	R.addEventListener('input',setColor);
	G.addEventListener('input',setColor);
	B.addEventListener('input',setColor);
	
	COMMENTARYVOLUME.addEventListener('input',function(event){
		COMMENTARYEL.volume = COMMENTARYVOLUME.value;
	});
	
	///////////////////////
	//////// START ////////
	///////////////////////
	
	getCenter();
})();