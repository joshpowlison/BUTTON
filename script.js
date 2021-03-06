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
	BUTTONDOWN.volume		= 0.4;
	const BUTTONUP			= document.createElement('audio');
	BUTTONUP.preload		= true;
	BUTTONUP.src			= 'assets/button-up.mp3';
	
	const COMMENTARYVOLUME	= document.getElementById('commentary');
	const COMMENTARYEL		= document.createElement('audio');
	COMMENTARYEL.autoplay	= true;
	COMMENTARYEL.volume		= COMMENTARYVOLUME.value
	
	// Bitmasks for all possible presses
	const MOUSE				= 1 << 0;
	const KEYBOARD			= 1 << 1;
	const TOUCH				= [
		1 << 2
		,1 << 3
		,1 << 4
		,1 << 5
		,1 << 6
		,1 << 7
		,1 << 8
		,1 << 9
		,1 << 10
		,1 << 11
	];
	const GAMEPAD			= 1 << 12;
	
	// Ints
	var number				= 0;
	var windowPresses		= 0;
	var buttonPresses		= 0;
	
	var buttonCenterX		= 0;
	var buttonCenterY		= 0;
	
	// Login data
	var username			= null;
	var lastNumberPosted	= null;
	
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
					COMMENTARYEL.src = 'commentary/' + ('000000000' + number).slice(-9) + '.mp3';
					break;
				}
			}
		}
	}
	
	// Yes, I did shamelessly take code from StackOverflow, don't @ me I'm bad at maths: https://stackoverflow.com/a/9939071/5006449
	function getPolygonCentroid(pts) {
		var first = pts[0], last = pts[pts.length-1];
		if (first[0] != last[0] || first[1] != last[1]) pts.push(first);
		var twicearea=0,
			x=0, y=0,
			nPts = pts.length,
			p1, p2, f;
		for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
			p1 = pts[i]; p2 = pts[j];
			f = p1[0]*p2[1] - p2[0]*p1[1];
			twicearea += f;          
			x += ( p1[0] + p2[0] ) * f;
			y += ( p1[1] + p2[1] ) * f;
		}
		f = twicearea * 3;
		return [x/f, y/f];
	}
	
	function getMidpoint(pts){
		return [
			// X
			(pts[0][0] + pts[1][0])/2
			// Y
			,(pts[0][1] + pts[1][1])/2
		];
	}

	
	// Angle the button
	function angle(event){
		// Get the position of pressing
		var pressPosition = null;
		
		// Need to add support for multiple touches tho?
		if(event.touches){
			var touchPoints = [];
			
			// Get all the touches on the button and add them to the list
			for(var i = 0; i < event.touches.length; i ++){
				// Add the touch to the touchPoints list if it's on the button
				if(getDistance(event.touches[i].clientX - buttonCenterX, event.touches[i].clientY - buttonCenterY) <= buttonRadius) touchPoints.push([event.touches[i].clientX,event.touches[i].clientY]);
			}
			
			// Get the centroid of the polygon- which, um, may be glitchy, but we'll see!
			if(touchPoints.length == 1)			pressPosition = touchPoints[0];
			else if(touchPoints.length == 2)	pressPosition = getMidpoint(touchPoints);
			else if(touchPoints.length > 2)		pressPosition = getPolygonCentroid(touchPoints);
		}
		// If it's clicking
		else if(event.target === BUTTON){
			pressPosition = [event.clientX, event.clientY];
		}
		
		// If the button is being targeted at all by the movement, angle it
		if(pressPosition){
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
			var xAngle = (pressPosition[0] - buttonCenterX) / buttonRadius;
			var yAngle = (pressPosition[1] - buttonCenterY) / buttonRadius * -1;
			
			// Distance
			var a = pressPosition[0] - buttonCenterX;
			var b = pressPosition[1] - buttonCenterY;
			var distance = Math.sqrt(a*a + b*b);
			
			BUTTON.style.transform = 'rotate3d(' + yAngle + ',' + xAngle + ',0,' + (distance * pressStrength) + 'deg) translate(' + (a * pressMove) + 'px,' + (b * pressMove) + 'px) scale(' + pressScale + ')';
		} else {
			BUTTON.style.transform = 'rotate3d(0,0,0,0deg) translate(0px,0px) scale(1)';
		}
	}
	
	// On clicking/pressing a pointer
	function press(event){
		// Don't register this if the menu's open
		if(document.getElementById('menu').style.display === 'block') return;
		
		// Touches (fingers, stylus)
		if(event.touches){
			// Don't do any of this if the user is pressing the Menu button
			if(event.changedTouches[0].target === document.getElementById('menu-button')) return;
			
			// Add the newest touch additions; could be more than one
			for(var i = 0; i < event.touches.length; i ++){
				windowPresses |= TOUCH[i];
				if(getDistance(event.touches[i].clientX - buttonCenterX, event.touches[i].clientY - buttonCenterY) <= buttonRadius) buttonPresses |= TOUCH[i];
			}
			
			// Touches cause problems
			event.preventDefault();
		}
		// Keyboard
		else if(event.key){
			// Check for the key in use
			if(event.key === 'Enter' && !event.repeat){
				windowPresses |= KEYBOARD;
				buttonPresses |= KEYBOARD;
			// Don't bother doing anything for other key presses
			} else return;
		}
		// Gamepad
		else if(event.gamepad){
			windowPresses |= GAMEPAD;
			buttonPresses |= GAMEPAD;
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
	
	function getDistance(a,b){
		return Math.sqrt(a*a + b*b);
	}
	
	// On unclicking/unpressing a pointer
	function unpress(event){
		// Don't register this if the menu's open
		if(document.getElementById('menu').style.display === 'block') return;

		var pressedStart = buttonPresses;
		
		// Touches (fingers, stylus)
		if(event.changedTouches){
			// Don't do any of this if the user is pressing the Menu button
			if(event.touches.length <= 1 && event.changedTouches[0].target === document.getElementById('menu-button')) return;
			
			// Get rid of all touch data
			for(var i = 0; i < TOUCH.length; i ++){
				windowPresses &= ~TOUCH[i];
				buttonPresses &= ~TOUCH[i];
			}
			
			// Get all of the touches' data again
			for(var i = 0; i < event.touches.length; i ++){
				windowPresses |= TOUCH[i];
				
				// If the button is being moved onto, add it to tracked presses
				if(getDistance(event.touches[i].clientX - buttonCenterX, event.touches[i].clientY - buttonCenterY) <= buttonRadius){
					buttonPresses |= TOUCH[i];
				// Otherwise, remove it from tracked presses
				}else{
					buttonPresses &= ~TOUCH[i];
				}
			}
		}
		// Keyboard
		else if(event.key){
			// Check for the key in use
			if(event.key === 'Enter' && !event.repeat){
				windowPresses &= ~KEYBOARD;
				buttonPresses &= ~KEYBOARD;
			}
		}
		// Gamepad
		else if(event.gamepad){
			windowPresses &= ~GAMEPAD;
			buttonPresses &= ~GAMEPAD;
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
		// Don't register this if the menu's open
		if(document.getElementById('menu').style.display === 'block') return;
		
		// If the window is being pressed at all
		if(windowPresses){
			var buttonPressState = buttonPresses;
			
			// Touches (fingers, stylus)
			if(event.touches){
				// Don't do any of this if the user is pressing the Menu button
				if(event.changedTouches[0].target === document.getElementById('menu-button')) return;
				
				// update all of the touches (the ids need to stay consistent; we'll have to see how browsers handle that)
				for(var i = 0; i < event.touches.length; i ++){
					// If the button is being moved onto, add it to tracked presses
					if(getDistance(event.touches[i].clientX - buttonCenterX, event.touches[i].clientY - buttonCenterY) <= buttonRadius){
						buttonPresses |= TOUCH[i];
					// Otherwise, remove it from tracked presses
					}else{
						buttonPresses &= ~TOUCH[i];
					}
				}
				
				// Touches cause problems
				event.preventDefault();
			}
			// Regular mouse clicks
			else {
				// If the button is being moved onto with a pressed button, add it to the tracked presses
				if(event.target === BUTTON){
					buttonPresses |= MOUSE;
				}
				// If the button is being moved off of, track the press
				else if(event.target !== BUTTON){
					buttonPresses &= ~MOUSE;
				}
			}
			
			if(!buttonPressState && buttonPresses){
				setButtonDown();
			}
			else if(buttonPressState && !buttonPresses){
				setButtonUp();
			}
			// Nothing is registered for the keyboard
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
	
	// Check for gamepad input
	var gamepadInput = false;
	setInterval(function(){
		// Get the first gamepad, if gamepads are connected
		var gamepads = navigator.getGamepads();
		if(gamepads[0]){
			// Only reads button 0, which should be the primary one on most controllers
			if(gamepadInput === false && gamepads[0].buttons[0].pressed){
				gamepadInput = true;
				press({gamepad:true});
			} else if(gamepadInput === true && !gamepads[0].buttons[0].pressed){
				gamepadInput = false;
				unpress({gamepad:true});
			}
		}
	},16);
	
	/// SET COLOR ///
	function setColor(passedColor = null){
		// If a value was passed, we update the forms with it
		if(passedColor !== null){
			var values = passedColor.split(',');
			R.value = values[0];
			G.value = values[1];
			B.value = values[2];
		}
		
		BUTTON.style.background = 'rgb(' + R.value + ',' + G.value + ',' + B.value + ') linear-gradient(rgba(0,0,0,0), rgba(0,0,0,.4))';
		
		HOLDER.style.background = 'radial-gradient(rgba(0,0,0,.65) 60%,rgba(0,0,0,1) 63%,#bfbfbf 20%) rgb(' + R.value + ',' + G.value + ',' + B.value + ')';
		
		// Change the favicon's color
		var canvas				= document.createElement('canvas');
		canvas.width			= 64;
		canvas.height			= 64;
		
		var ctx					= canvas.getContext('2d');
		
		// Outer gray
		ctx.fillStyle			= '#bfbfbf';
		ctx.beginPath();
		ctx.arc(32,32,32,0,Math.PI * 2);
		ctx.fill();
		
		// Inner button
		ctx.fillStyle			= 'rgb(' + R.value + ',' + G.value + ',' + B.value + ')';
		ctx.beginPath();
		ctx.arc(32,32,25,0,Math.PI * 2);
		ctx.fill();
		
		var gradient			= ctx.createLinearGradient(32,0,32,64);
		gradient.addColorStop(0,'rgba(0,0,0,0)');
		gradient.addColorStop(1,'rgba(0,0,0,.4)');
		
		ctx.fillStyle			= gradient;
		ctx.beginPath();
		ctx.arc(32,32,25,0,Math.PI * 2);
		ctx.fill();
		
		canvas.toBlob(function(blob){
			document.getElementById('dynamic-favicon').href = URL.createObjectURL(blob);
		});
	}
	
	// Load an account and its data
	function accountCall(type){
		// Don't bother updating the number if it hasn't been changed
		if(
			type === 'setNumber'
			&& (number === lastNumberPosted || username === null)
		) return;
		
		// Note the last number we sent to the server
		lastNumberPosted = number;
		
		fetch('account.php', {
			method:'POST'
			,cache:'no-cache'
			,headers: new Headers({'Content-Type':'application/x-www-form-urlencoded'})
			,body:
				'type=' + type
				+ '&username=' + encodeURIComponent(document.getElementById('username').value)
				+ '&password=' + encodeURIComponent(document.getElementById('password').value)
				+ '&number=' + number
				+ '&color=' + encodeURIComponent(R.value + ',' + G.value + ',' + B.value)
		}).then(response => response.text()).then(text => {
			var response = JSON.parse(text);
			
			// If we got a message, something went wrong
			if(response.error){
				alert(response.error);
				return;
			}

			switch(type){
				case 'login':
					// Update the data
					username = response.username;
					lastNumberPosted = number = parseInt(response.number);
					NUMBER.innerHTML = number;
					setColor(response.color);
					break;
				// Logout the user
				case 'signup':
					// Update the data
					username = response.username;
					break;
				// Logout the user
				case 'logout':
					// If the user was logged in, change stuff
					if(username){
						// Update the number
						username = null;
						lastNumberPosted = number = 0;
						NUMBER.innerHTML = number;
						setColor('255,0,0');
					}
					break;
				// Get the user's number, if one is set
				case 'getNumber':
					if(response.username !== null){
						username = response.username;
						lastNumberPosted = number = parseInt(response.number);
						NUMBER.innerHTML = number;
						setColor(response.color);
					}
					break;
				// Set the number, but let the user know if something went wrong
				case 'setNumber':
					break;
				default:
					alert('We don\'t have a command like that!');
					break;
			}
			
			// Adjust form display...
			// ...if logged out
			if(username === null){
				document.getElementById('if-logged-out').style.display = 'block';
				document.getElementById('if-logged-in').style.display = 'none';
			// ...if logged in
			} else {
				document.getElementById('username-display').innerHTML = username;
				document.getElementById('if-logged-out').style.display = 'none';
				document.getElementById('if-logged-in').style.display = 'block';
			}
		});
	}
	
	// Regularly update the button's value
	setInterval(function(){
		accountCall('setNumber');
	},30000);
	
	// Account data
	document.addEventListener('beforeunload',function(){
		accountCall('setNumber');
	});
	
	window.addEventListener('blur',function(){
		accountCall('setNumber');
	});
	
	document.getElementById('login').addEventListener('click',function(){
		accountCall('login');
	});
	
	document.getElementById('signup').addEventListener('click',function(){
		accountCall('signup');
	});
	
	document.getElementById('logout').addEventListener('click',function(){
		accountCall('logout');
	});
	
	document.getElementById('menu-button').addEventListener('click',function(){
		document.getElementById('menu').style.display = (document.getElementById('menu').style.display === 'block') ? 'none' : 'block';
	});
	
	document.getElementById('menu-close-button').addEventListener('click',function(){
		document.getElementById('menu').style.display = 'none';
	});
	
	///////////////////////
	/// EVENT LISTENERS ///
	///////////////////////
	
	// Adjust button data when we change the window's size, etc (so that the center stays correct)
	window.addEventListener('resize',getCenter);
	
	window.addEventListener('mousedown'		,press		);
	window.addEventListener('mouseup'		,unpress	);
	window.addEventListener('mousemove'		,move		);
	
	window.addEventListener('touchstart'	,press		,{passive:false});
	window.addEventListener('touchend'		,unpress	,{passive:false});
	window.addEventListener('touchmove'		,move		,{passive:false});
	
	window.addEventListener('keydown'		,press		);
	window.addEventListener('keyup'			,unpress	);
	
	// Colors
	R.addEventListener('input',function(){setColor();});
	G.addEventListener('input',function(){setColor();});
	B.addEventListener('input',function(){setColor();});
	
	COMMENTARYVOLUME.addEventListener('input',function(event){
		COMMENTARYEL.volume = COMMENTARYVOLUME.value;
	});
	
	///////////////////////
	//////// START ////////
	///////////////////////
	
	getCenter();
	setColor();
	accountCall('getNumber');
})();