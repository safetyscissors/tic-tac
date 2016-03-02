
function main(){
	var state=["MENU","INIT","GAME","EXIT"];
	state=state[STATE];
	testGameState();

	if(state=="MENU"){
		displayMenu();

	}else if(state=="INIT"){
		hideMenu();
		wipeBoard();
		pickFirstPlayer();	
		nextState();
		main();
	}else if(state=="GAME"){
		testGameTurn();
		if(GAMEMODE=='PLAY'&&TURN==AI){
			PLAYturn();
		}else if(GAMEMODE=='AI'&&TURN==AI){
			AIturn();
		}else if(GAMEMODE=='ONLINE'&&TURN==REMOTEPLAYER){
			ONLINEturn();
		}

		TURN=(TURN==OPPONENT)?AI:OPPONENT;
	}else if(state=="EXIT"){
		setWinner(SCORE);
		setScore();
		if(GAMEMODE=='AI'){
			saveGame();
		}
		setTimeout("setState(1)",500);
	}
	cleanOutput();
}
function AIturn(){
	lookupStateFromDB();
}
function PLAYturn(){
	PLAYpickMove();
}
function ONLINEturn(){
	console.log('online');
}
	function saveGame(){
		for(var i=0;i<HISTORY.length;i++){
			var move=HISTORY[i][1];
			HISTORY[i]=HISTORY[i][0].join(',');
			var count=9-(HISTORY[i].match(/0/g)||[]).length;
			HISTORY[i]=count+"|"+move+"|"+HISTORY[i];
		}
		var boardSerial=HISTORY.join('.');
		var scoreValues=[0,1,-1,0];
		var score=scoreValues[SCORE];
		$.post(URL+'ajax.php/',
			{ 'boardstate':boardSerial,'score':score,'action':'save' },
			function(data){
			});
	}
	function testBoardState(){
		if(DEBUG){
			console.debug('board:'+BOARD);
		}
	}
	function testGameState(){
		if(DEBUG){
			console.debug('state:'+STATE);
		}
	}
	function testGameTurn(){
		if(DEBUG){
			console.debug('turn:'+TURN);
		}
	}
	function setScore(){
		$('#wincount').html(WINCOUNT);
		$('#losscount').html(LOSSCOUNT);
	}
	function pickFirstPlayer(){
		TURN=(Math.round(Math.random())==AI)?AI:OPPONENT+1;
		if(TURN==OPPONENT+1){
			$('#output').prepend('<span class="game">'+'Player Starts - click on a tile to begin'+'</span>');
		}
	}
	function wipeBoard(){
		BOARD=["0","0","0","0","0","0","0","0","0"];
		HISTORY=[];
		drawBoardFromArray();
	}
	function setWinner(winner){
		var splashText=["nothing set to 0","Round Lost","Round Won","Ends In a Draw"];
		$('#output').prepend('<span class="game">'+splashText[winner]+'</span>');
		if(winner!=3){
			if(winner==AI){
				LOSSCOUNT++;
			}else{
				WINCOUNT++;
			}
		}
	}
	function cleanOutput(){
		$('.game').slice(5).remove();
	}
	function nextState(){
		STATE=(STATE<4)?++STATE:STATE;
	}
	function setState(state){
			STATE=state;
			main();
	}
	
	function validInput(id){
		if(TURN==OPPONENT){
			if(BOARD[(id-1)]==EMPTY){
				return true;
			}
		}
		return false;
	}
	function lookupStateFromDB(){
		var boardAsString=BOARD.join('');
		var turn=(9-(boardAsString.match(/0/g)||[]).length);
		$.post(URL+'ajax.php/',
			{ 'boardstate':boardAsString,'turn':turn,'action':'find' },
			function(data){
				if(data){
					makeMoveOnBoard(data,AI); //1 is AI id
				}else{
					makeMoveOnBoard(AIanyMove(),AI);
				}
			});
	}
	function makeMoveOnBoard(nextMove,player){
		if(player==AI){
			saveStepToHistory(nextMove);
		}

		var boardOffsetPosition=nextMove-1;
		BOARD[boardOffsetPosition]=player+"";
		testBoardState();
		drawBoardMove(nextMove,player);

		if(SCORE=checkGameOver()){
			
			nextState();
			if(player==AI){
				main();
			}
			return;
		}
	}
	function saveStepToHistory(move){
		HISTORY.push([BOARD.slice(0),move]);
	}
	function drawBoardFromArray(){
		for(var i=0;i<BOARD.length;i++){
			bgClasses=["EMPTY","AI","OPPONENT"];
			$("#tile"+(i+1)).addClass(bgClasses[BOARD[i]]);
		}	
	}
	function drawBoardMove(nextMove,player){

		var bgClasses=["EMPTY","AI","OPPONENT"];
		$("#tile"+(nextMove)).removeClass();
		$("#tile"+(nextMove)).addClass("tile "+bgClasses[player]);
	}
	function PLAYpickMove(){
		var move=0;
		if(move=aboutToWin(AI)){		
		}else if(move=aboutToWin(OPPONENT)){
		}else if(move=AIguessMove(AI)){
		}else{ 	
			move=AIanyMove(); 
		}
		
		makeMoveOnBoard(move,AI);	
	}
	function aboutToWin(player){
		for(var i=0;i<WINCONDITIONS.length;i++){
			var emptySpace=0;
			thisCondition:	for(var j=0;j<WINCONDITIONS[i].length;j++){
				var boardArrayPosition=WINCONDITIONS[i][j]-1;
				var tile=BOARD[boardArrayPosition];
				if(tile==player){
				}else if(tile==EMPTY){
					if(!emptySpace){	
						emptySpace=WINCONDITIONS[i][j];	
					}else{
						break thisCondition;
					}
				}else{	//this must be an opponent tile
					break thisCondition;
				}
				//if the whole loop hasn't been escaped yet
				if(j==WINCONDITIONS[i].length-1){
					return emptySpace;
				}
			}
		}
		return false;
	}
	function AIguessMove(player){
		var goodMoves=[];
		for(var i=0;i<WINCONDITIONS.length;i++){
			var potentialMovesForThisCondition=[];
			thisCondition:	for(var j=0;j<WINCONDITIONS[i].length;j++){

				var boardArrayPosition=WINCONDITIONS[i][j]-1;
				var tile=BOARD[boardArrayPosition];
				if(tile!=player&&tile!=EMPTY){
					break thisCondition;
				}else if(tile==EMPTY){
					potentialMovesForThisCondition.push(WINCONDITIONS[i][j]);
				}
				//if the whole loop hasn't been escaped			
				if(j==WINCONDITIONS[i].length-1){
					goodMoves=goodMoves.concat(potentialMovesForThisCondition);
				}
			}
		}
		return pickMoveWithGreatestFrequency(goodMoves);
	}
	function pickMoveWithGreatestFrequency(arr){
		if(arr.length==0){
			return false;
		}
		var arrAsString=arr.join('');
		var greatestFrequency=0;
		var pickedMove;
		for(var i=0;i<arr.length;i++){
			var re = new RegExp(arr[i], 'gi');
			if(count=(arrAsString.match(re) || []).length>greatestFrequency){
				greatestFrequency=count;
				pickedMove=arr[i];
			}	
		}
		return pickedMove;
	}
	function AIanyMove(){
		var openSpaces=new Array();
		for(var i=0;i<BOARD.length;i++){
			if(BOARD[i]==EMPTY){
				openSpaces.push(i);
			}
		}
console.debug(openSpaces);
		var openSpace=openSpaces[Math.floor(Math.random()*openSpaces.length)]+1;
console.log(openSpace);
		if(openSpace>0)
			return openSpace;
		printError('random move couldnt find something');
	}
	function checkGameOver(){
		var boardAsString=BOARD.join('');
		for(var i=0;i<WINCONDITIONS.length;i++){
			if(BOARD[(WINCONDITIONS[i][0]-1)]!=="0"&&
					BOARD[(WINCONDITIONS[i][0]-1)]==BOARD[(WINCONDITIONS[i][1]-1)]&&
					BOARD[(WINCONDITIONS[i][1]-1)]==BOARD[(WINCONDITIONS[i][2]-1)]){
					return BOARD[(WINCONDITIONS[i][0]-1)];//the winner
			}
		}
		if(!(boardAsString.match(/0/g)||[]).length){
			return 3;
		}
		return false;
	}

	function printError(message){
		$('#errors').html("<span>"+message+"</span>");
		setTimeout(function(){
			$('#errors>span').remove();
		},3000);
	}
	function getRandomColor() {
	    return '#' + Math.floor((Math.random() * 0xF00000) + 0x0FFFFF).toString(16);
	}
	function setPieceColors(){
		$(".AI").css("background",getRandomColor());
		$(".OPPONENT").css("background",getRandomColor());
	}


	function displayMenu(){
		$('#menupage').fadeIn(200);
	}
	function hideMenu(){
		$('#menupage').fadeOut(200);
	}
	function colorChangingMenuEffect(hoverId){
		var bgcolors=["lightgreen","#F4DDCA","lightblue","white"];
		var menuIds=["PLAY","ONLINE","AI","mouseout"];
		var nextcolor=bgcolors[menuIds.indexOf(hoverId)];
		swapMenuBg(nextcolor);
		
	}
	var isInAnimation=false;
	function swapMenuBg(nextcolor){
		if(!isInAnimation){
			$('#menubg').css('background',$('#menupage').css('background'));
			$('#menubg').show();
			$('#menupage').css('background',nextcolor);
			isInAnimation=true;
			$('#menubg').fadeOut(200,function(){
				isInAnimation=!isInAnimation;
			});
		}

	}
	function load(){
		//since its only js and the google font, page is loaded when js is loaded. 
		hideLoadPage();
	}
	function hideLoadPage(){
		$('#load').delay(500).fadeOut(200,function(){
			$(this).remove();
		});
	}
