define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/module/foot/foot',
    'lib/swiper-3.3.1.jquery.min',
], function(base, Ajax, loading, Foot, Swiper) {
    
    if(!base.isLogin()){
            base.goLogin();
    }else{
    	Foot.addFoot(2);
    	init();
    }
    
    
    function init(){
    	$.when(
    		getBanner(),
    		getNotice()
    	)
    	$("#cont").hide();
    	addListener();
    }
    
    function addListener(){
        
        $("#swiper-container").on("touchstart", ".swiper-slide img", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#swiper-container").on("touchend", ".swiper-slide img", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if(Math.abs(xx) < 6){
                var url = me.attr('data-url');
                if(url){
                	if(!/^http/i.test(url)){
                		location.href = "http://"+url;
                	}else{
                		location.href = url;
                	}
                	
                }
                    
            }
        });
    }
    
    //banner图
    function getBanner(){
        Ajax.get("806051", {
            type: "2"
        }).then(function(res){
            if(res.success && res.data.length){
                var html = "";
                res.data.forEach(function(item){
                        
                    html += '<div class="swiper-slide"><img data-url= "'+item.url+'" class="wp100" src="' + base.getImg(item.pic, 1) + '"></div>';
                });
                $("#top-swiper").html(html);
                var mySwiper = new Swiper('#swiper-container', {
                    'direction': 'horizontal',
                    'loop': true,
                    'autoplay': 4000,
		            'autoplayDisableOnInteraction': false,
                    // 如果需要分页器
                    'pagination': '.swiper-pagination'
                });
            }
        });
    }
    
    //公告
    function getNotice(){
    	Ajax.get("804040",{
    		"pushType": 41,
    		"toKind": 1,
    		"channelType": 4,
    		"status": 1,
    		"start": 1,
			"limit": 1,
			"fromSystemCode":SYSTEM_CODE
    	}).then(function(res){
    		if(res.success){
    			if(res.data.list.length){
    				$(".noticeCon p").text(res.data.list[0].smsTitle)
    			}
    		}
    		
    	})
    }
    
    
    
});
