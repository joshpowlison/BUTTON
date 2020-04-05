<?php

// This holds HOST, PORT, DBNAME, USERNAME, and PASSWORD variables
require('private.php');

session_start();

// error_reporting(1);

// Response for the user
$response = [
	'number'	=> null
	,'username'	=> null
	,'error'	=> null
	,'color'	=> null
];

// Get database
$db = new PDO(
	'mysql:host='.HOST.';
	port='.PORT.';
	dbname='.DBNAME.';
	charset=utf8',
	USERNAME,
	PASSWORD,
	[PDO::ATTR_EMULATE_PREPARES => false, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

function login(){
	global $_POST;
	global $db;
	global $response;
	global $_SESSION;
	
	// If the button is too 
	if(strlen($_POST['username']) < 1){
		$response['error'] = 'Your username must be at least 1 character long!';
		return;
	}
	
	// Prepare the query
	$call = $db->prepare(
		'SELECT id,username,password,number,color FROM main WHERE username=?'
	);

	// Pass the username and hashed password
	if($call -> execute([$_POST['username']])){
		// If we get the result
		if($data = $call -> fetchAll()){
			if(password_verify(
				$_POST['password']
				,$data[0]['password']
			)){
				$response['username']	= $data[0]['username'];
				$response['number']		= $data[0]['number'];
				$response['color']		= $data[0]['color'];
				$_SESSION['user']		= $data[0]['id'];
			} else {
				$response['error']	= 'Your password is incorrect.';
			}
		// If we don't get a result, default to nothing
		} else {
			$response['username']	= null;
			$response['number']		= null;
			$_SESSION['user']		= null;
			$_SESSION['color']		= null;
			$response['error']	= 'An account with that username doesn\'t exist!';
		}
	}
}

// Change the reaction based on the post type
switch($_POST['type']){
	case 'login':
		login();
		break;
	case 'signup':
		// Check if the user's already logged in
		if($_SESSION['user'] !== null){
			$response['error'] = 'You have to log out first.';
			break;
		}
		
		// Check if the username is over 13 characters
		if(strlen($_POST['username']) > 13){
			$response['error'] = 'You must keep your username to 13 characters or less.';
			break;
		}
	
		// Prepare the query
		$call = $db->prepare(
			'SELECT username FROM main WHERE username=?'
		);
		
		// Just pass the username first- see if it's already taken
		if($call -> execute([$_POST['username']])){
			// If info is passed, let the user know
			if($data = $call -> fetchAll()){
				$response['error'] = 'A user with that username already exists!';
			// If there is no user with that name, create them
			} else {
				$call2 = $db->prepare(
					'INSERT INTO main (username,password,number) VALUES (?,?,?)'
				);
				
				// On successfully creating them, log them in
				if($call2 -> execute([$_POST['username'],password_hash($_POST['password'],PASSWORD_DEFAULT),$_POST['number']])){
					login();
				}
			}
		}
		break;
	case 'logout':
		$_SESSION['user']		= null;
		break;
	case 'getNumber':
		if($_SESSION['user'] !== null){
			// Prepare the query
			$call = $db->prepare(
				'SELECT username,number,color FROM main WHERE id=?'
			);

			// Pass the username and hashed password
			if($call -> execute([$_SESSION['user']])){
				// If we get the result
				if($data = $call -> fetchAll()){
					$response['username']	= $data[0]['username'];
					$response['number']		= $data[0]['number'];
					$response['color']		= $data[0]['color'];
				// If we don't get a result, default to nothing; something's wrong
				} else {
					$response['username']	= null;
					$response['number']		= null;
					$_SESSION['user']		= null;
					$_SESSION['color']		= null;
					$response['error']	= 'An account with that username doesn\'t exist!';
				}
			}
		}
		break;
	case 'setNumber':
		if($_SESSION['user'] !== null){
			$call = $db->prepare(
				'UPDATE main SET number=?,color=? WHERE id=?'
			);
			
			// If the call fails, let the user know
			if(!$call -> execute([$_POST['number'],$_POST['color'],$_SESSION['user']])){
				$response['message'] = 'Error posting to your account!';
			}
		}
		break;
	default:
		break;
}

echo json_encode($response);

?>