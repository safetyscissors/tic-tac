<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
	<meta charset="utf-8">
	<title>TicTac</title>
	<link href='http://fonts.googleapis.com/css?family=Source+Sans+Pro:300' rel='stylesheet' type='text/css'>
	<link href='src/styles.css' rel='stylesheet' type='text/css'>
</head>



<body>
	<div id="load"><br><br><br><br>Thinking...</div>
	<div id="menupage">
		<div id="menubg"></div>
		<div id="menu">
			<span>TicTac</span>
			<ul>
				<li id="PLAY">play</li>
				<li id="ONLINE">play someone</li>
				<li id="AI">play the cool ai</li>
			</ul>
		</div>
	</div>
		

	<div id="errors"></div>
<div id="wrapper">
	<div id="grid">
		<?php for($i=1;$i<10;$i++){
			echo"<div class='tile' id='tile{$i}'></div>";
		}?>
	</div>
	<div id="sidePane">
		<div class="scoreblock OPPONENT" id="win">
			WIN<br>
			<span class="bigText" id="wincount">0</span>
		</div>
		<div class="scoreblock AI" id="loss">
			LOSS<br>
			<span class="bigText" id="losscount">0</span>
		</div>
		<div class="scoreblock" id="exitblock">
			EXIT<br>
			<span class="bigText" id="online">X</span>
		</div>
		<div id="output">
		</div>

		
	</div>
</div>

<script>
//globals
var BOARD;
var STATE=0;
var URL='http://theninthbit.us/tictac/';
var EMPTY=0;

var AI=1;
var REMOTEPLAYER=1;
var OPPONENT=2;
var TURN=0;

var DEBUG=false;
var WINCONDITIONS=[
	[1,2,3],[4,5,6],[7,8,9],
	[1,4,7],[2,5,8],[3,6,9],
	[1,5,9],[3,5,7]];
var WINCOUNT=0;
var LOSSCOUNT=0;
var HISTORY=[];
var SCORE=0;
var GAMEMODE='PLAY';
</script>

<script src="src/jquery10.2.js"></script>
<script src="src/tictac_listeners.js"></script>
<script src="src/tictac_core.js"></script>
</body>
</html>

