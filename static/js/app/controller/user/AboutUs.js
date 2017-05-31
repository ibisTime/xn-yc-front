define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
], function(base, Ajax, loading) {
    init();
	
	function init(){
		loading.createLoading();
		base.getSysConfig("807717","aboutus")
			.then(function(res){
			 	if(res.success){
				 	$("#title").html(res.data.cvalue);
				 	$("#content").html(res.data.note);
				}else{
					base.showMsg(res.msg);
				}
			 	loading.hideLoading();
			}, function(){
			 	base.showMsg("加载失败");
			 	loading.hideLoading();
			});
	}
})
