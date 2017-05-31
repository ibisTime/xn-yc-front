define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loadImg/loadImg',
    'app/module/foot/foot',
], function(base, Ajax, loadImg, Foot) {
      
    Foot.addFoot(1);
    init();
	
    function init() {
    	addListeners();
    }

    function addListeners() {
    	Ajax.get("808615",{
    		"status": 1,
    		"start": "1",
    		"limit": "10",
    		"orderColumn":"order_No",
    		"orderDir":"asc"
    	}).then(function(res){
    		if(res.success){
    			
    			var html = "";
    			
    			res.data.list.forEach(function(v,i){
    				var data = v;
    				
    				html += '<li class="ptb8 clearfix b_bd_b plr10">'+
            				'<a class="show p_r min-h100p" href="./recharge_cardDetail.html?code='+data.code+'"><div class="order-img-wrap tc">'+
            				'<img class="center-img1 wp100" src="'+base.getImg(data.advPic, 1)+'"></div>'+
            				'<div class="order-right-wrap clearfix pt15"><p class="t_323232 s_14 line-tow">'+data.name+'</p>'+
            				'<p class="t_999 s_12 mt10 line-tow">'+data.slogan+'</p></div></a></li>'
    			})
    			
    			$("#loaddingIcon").addClass("hidden");
    			$("#contUl").append(loadImg.loadImg(html));
    		}else{
    			base.showMsg(res.msg)
    		}
    	})
    }

});
