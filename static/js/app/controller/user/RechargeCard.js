define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
], function(base, Ajax, loading) {
	var couponCode=base.getUrlParam("code");
	
    init();
	
	function init(){
		loading.createLoading("卡券充值中...");
		var param={
			"userId": base.getUserId(),
			"couponCode": couponCode,
		}
		
		Ajax.post("805321",{
			json:param
		}).then(function(res){
			if(res.success){
				loading.hideLoading();
				location.href="./get_success.html";
			}else{
				loading.hideLoading();
				base.showMsg(res.msg);
				setTimeout(function(){
					location.href="../index.html"
				},1600)
			}
		})
	}
})
