var NAVIGATION_OPEN = false;

function init_navigation() {
    //Inventory close
    $('#navigation_close').on("mousedown", function(e) {
    	NAVIGATION_OPEN = false;

		close_popup($('#navigation-ui'));
		$('#navigation').removeClass('active');
    });
}

function on_navigation_click() {
	//on_navigation_click();
	toggle_popup('#navigation-ui');
	$(this).toggleClass('active');
}