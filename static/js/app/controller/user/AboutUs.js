define([
    'app/controller/base',
    'app/interface/GeneralCtr'
], function(base, GeneralCtr) {
    init();

	function init(){
        base.showLoading();
		GeneralCtr.getSysConfig("aboutus")
			.then(function(data){
			 	$("#title").html(data.cvalue);
			 	$("#content").html(data.note);
			 	base.hideLoading();
			});
	}
})
