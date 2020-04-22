<!DOCTYPE HTML>
<html>
<head>
	<title>BUTTON</title>
	<link rel="stylesheet" type="text/css" href="styles.css?t=<?php echo filemtime('styles.css'); ?>">
	
	<meta name="description" content="Press a button. Increment a number. Change reality."><!-- 155-160 char max -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<!-- Get favicons -->
	<link id="dynamic-favicon" rel="icon" type="image/png">
</head>
<body>
	<div id="number">0</div> 
	
	<div id="button-holder">
		<div id="button"></div>
	</div>
	
	<button id="menu-button">Menu</button>
	
	<div id="menu-container">
		<div id="menu" style="display:none;">
			<div id="account">
				<div id="if-logged-out">
					<input id="username" type="text" maxlength="13" placeholder="Username">
					<input id="password" type="password" placeholder="Password">
					<br>
					<button id="login">Login</button><button id="signup">Sign up</button>
				</div>
				<div id="if-logged-in">
					<p id="username-display"></p>
					<button id="logout">Log out</button>
				</div>
			</div>
			
			<input id="r" type="range" min="0" max="255" step="1" value="255">
			<input id="g" type="range" min="0" max="255" step="1" value="0">
			<input id="b" type="range" min="0" max="255" step="1" value="0">
			
			<p>Commentary Volume <input id="commentary" type="range" min="0" max="1" step=".1" value="0"></p>
			
			<p>Creator: Josh Powlison</p>
			<p>Co-Producers: MB, PM, RS, JL, KO, cA, DH</p>
			
			<p><a target="_blank" href="https://www.kickstarter.com/projects/joshuapowlison/button-a-game-about-pressing-issues">Funded with Kickstarter</a></p>
			
			<p><em>V 0.9.1 or something</em></p>
			<button id="menu-close-button">Close Menu</button>
		</div>
	</div>
	
	<script>
	// Commentary files
		const COMMENTARY		= [<?php
			// Read all of the commentary file names from the folder; add them into here
			
			$files = scandir('commentary');
			
			for($i = 0, $l = count($files); $i < $l; $i ++){
				if(intval($files[$i]) === 0) continue;
				
				echo intval($files[$i]);
				
				// Exit out so we don't echo a comma
				if(intval($files[$i]) !== 999999999) echo ',';
			}
		?>];
	</script>
	<script src="script.js?t=<?php echo filemtime('script.js'); ?>"></script>
</body>
</html>