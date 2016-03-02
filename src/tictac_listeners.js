$(function() {
	load();
	main();
});

$("body").on("click",".tile",function(e){
	var objId="#"+$(this).attr("id");
	var id=objId.substring(5);
	if(validInput(id)){
		makeMoveOnBoard(id,OPPONENT);
		TURN=AI;
		main();
	}
});
$("#menu ul li").on("click", function(e){
	GAMEMODE=$(this).attr("id");
	nextState();
	main();
});
$("#exitblock").on("click", function(e){
	setState(0);
});


$("#menu ul li").mouseenter(function(e){
	colorChangingMenuEffect($(this).attr("id"));
});
$("#menu ul").mouseleave(function(e){
	colorChangingMenuEffect("mouseout");
});
