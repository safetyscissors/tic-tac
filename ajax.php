<?php
	require('dbConfig.php');
	$db = new mysqli('localhost', $user, $pass, 'thenint2_fun-tictac');
	if($db->connect_errno > 0){
	    die('Unable to connect to database [' . $db->connect_error . ']');
	}	


	if(isset($_POST['action'])){
		$action=$_POST['action'];
		if($action=='save'){
			$allTurns;
			$turns=explode('.',$_POST['boardstate']);
			foreach($turns as $turn){
				$outputTurn;
				$turn=explode('|',$turn);
				$outputTurn['board']=explode(',',$turn[2]);
				$outputTurn['move']=$turn[1];
				$outputTurn['turn']=$turn[0];
				$allTurns[]=$outputTurn;
			}
			foreach ($allTurns as $turn){
				setScoreInDb($db,$_POST['score'],$turn['board'],$turn['turn'],$turn['move']);
			}
		}else if($action=='find'){
			$result=findMoveInDb($db,$_POST['turn'],$_POST['boardstate']);
			if($result){
				if($move=rotateResult($_POST['boardstate'],$result['boardmatch'],$result['nextmove'])){
				}else if($move=reflectResult($_POST['boardstate'],$result['boardmatch'],$result['nextmove'])){
				}
				echo $move;
				return;
			}
		}else if($action=='test'){
			$result=findMoveInDb($db,$_POST['turn'],$_POST['boardstate']);
			if($result){
print_r($result);
echo '<br>';
			if($move=rotateResult($_POST['boardstate'],$result['boardmatch'],$result['nextmove'])){
echo 'rotated '.$move.'<br>';
			}else if($move=reflectResult($_POST['boardstate'],$result['boardmatch'],$result['nextmove'])){
echo 'reflected '.$move.'<br>';
			}
			echo $move;
			return;
			}

		}
	}	
	echo false;

	$db->close();


function makePossibleBoardRotations($board){
	$rotations=array(
		array(0,1,2,3,4,5,6,7,8),
		array(2,5,8,1,4,7,0,3,6),
		array(8,7,6,5,4,3,2,1,0),
		array(6,3,0,7,4,1,8,5,2));	
	$output;
	foreach($rotations as $sequence){
		$pattern='';
		foreach($sequence as $key){
			$pattern.=''.$board[$key];
		}
		$output[]=$pattern;
	}
	return $output;
}
function rotateResult($boardIn,$boardMatch,$nextMove){
	$boardMatch=str_pad($boardMatch, 9, '0', STR_PAD_LEFT);
	$boardMatch=str_split($boardMatch);
	$rotations=array(
		array(0,1,2,3,4,5,6,7,8),
		array(2,5,8,1,4,7,0,3,6),
		array(8,7,6,5,4,3,2,1,0),
		array(6,3,0,7,4,1,8,5,2));
	foreach($rotations as $sequence){
		$pattern='';
		foreach($sequence as $key){
			$pattern.=''.$boardMatch[$key];
		}
		if($pattern==$boardIn){
			return ($sequence[($nextMove-1)]+1);
		}
	}
	return false;
}
function makePossibleReflections($board){ //just horizontal and vertical for now
	$reflections=array(
		array(2,1,0,5,4,3,8,7,6),
		array(6,7,8,3,4,5,0,1,2));
	$output;
	foreach($reflections as $sequence){
		$pattern='';
		foreach($sequence as $key){
			$pattern.=''.$board[$key];
		}
		$output[]=$pattern;
	}
	return $output;
}
function reflectResult($boardIn,$boardMatch,$nextMove){ //just horizontal and vertical for now
	$boardMatch=str_pad($boardMatch, 9, '0', STR_PAD_LEFT);
	$boardMatch=str_split($boardMatch);
	$reflections=array(
		array(2,1,0,5,4,3,8,7,6),
		array(6,7,8,3,4,5,0,1,2));
	foreach($reflections as $sequence){
		$pattern='';
		foreach($sequence as $key){
			$pattern.=''.$boardMatch[$key];
		}
echo $pattern.' ';
		if($pattern==$boardIn){ echo 'reflect pattern match';
			return ($sequence[($nextMove-1)]+1);
		}
	}
	return false;

}
function boardExistsInDb($db,$board,$turn,$move){
	$allBoardArrangements=array_unique(array_merge(makePossibleBoardRotations($board),
										    makePossibleReflections($board)));
	if(count($allBoardArrangements)){
		$matchesBoardString=implode(',',$allBoardArrangements);
		$matchesBoardString='boardstate IN ('.$matchesBoardString.')';
		$sqlToFindABoard="SELECT boardstate FROM HISTORY 
					   WHERE {$matchesBoardString} AND nextmove={$move} AND turn={$turn}";
		if(!$result = $db->query($sqlToFindABoard)){
		    die('There was an error running the query [' . $db->error . ']');
		}
		if($result->num_rows){
			$row = $result->fetch_assoc();
			$result->free();
			return $row['boardstate'];
		}
	}
	return -1; //its possible for boardExist to return 0. so i have to use negative value
}
function insertBoardToDb($db,$score,$board,$turn,$move){
	$board=implode('',$board);
	$sqlInsert="INSERT INTO HISTORY(turn, score, boardstate, nextmove) VALUES ({$turn},{$score},{$board},{$move})";
	if(!$result = $db->query($sqlInsert)){
	    die('There was an error running the query [' . $db->error . ']');
	}
}
function updateBoardScores($db,$score,$board,$turn,$move){

	$sqlUpdate="UPDATE HISTORY SET `score`=`score`+{$score} WHERE boardstate={$board} AND turn={$turn} AND nextmove={$move}";
	if(!$result = $db->query($sqlUpdate)){
	    die('There was an error running the query [' . $db->error . ']');
	}
}
function setScoreInDb($db,$score,$board,$turn,$move){
	if(($dbBoardState=boardExistsInDb($db,$board,$turn,$move))>=0){
		updateBoardScores($db,$score,$dbBoardState,$turn,$move);
	}else{	
		insertBoardToDb($db,$score,$board,$turn,$move);
	}
}
function findMoveInDb($db,$turn,$board){
	$allBoardArrangements=array_unique(array_merge(makePossibleBoardRotations($board),
										    makePossibleReflections($board)));
	if(count($allBoardArrangements)){
		$matchesBoardString=implode(',',$allBoardArrangements);
		$matchesBoardString='boardstate IN ('.$matchesBoardString.')';
		$sqlToFindABoard="SELECT * FROM HISTORY 
					   WHERE {$matchesBoardString} AND turn={$turn}";
		if(!$result = $db->query($sqlToFindABoard)){
		    die('There was an error running the query [' . $db->error . ']');
		}
		if($result->num_rows){
			$bestMove=0;
			$bestScore=-1000;
			$boardMatch=0;
			while($row = $result->fetch_assoc()){
				if($row['score']>$bestScore){
					$bestMove=$row['nextmove'];
					$bestScore=$row['score'];
					$boardMatch=$row['boardstate'];
				}
			}
			$result->free();
			if($bestScore>0){
				return array('boardmatch'=>$boardMatch,'nextmove'=>$bestMove);
			}
		}
	}
	return false;
}

?>
