define([
    'app/controller/base',
    'app/module/foot',
    'app/module/weixin',
    'app/interface/GeneralCtr',
    'swiper'
], function(base, Foot, weixin, GeneralCtr, Swiper) {
    init();
    function init(){
        Foot.addFoot(2);
        base.showLoading();
    	$.when(
    		getBanner(),
    		getNotice()
    	).then(base.hideLoading, base.hideLoading);
    	addListener();
        weixin.initShare({
            title: document.title,
            desc: document.title,
            link: location.href,
            imgUrl: base.getShareImg()
        });
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
        // 当季水果
        $("#djsg").click(function(){
            location.href = "detail/mall_list.html?c=" + DJSG;
        });
        // 配送计划
        $("#psjh").click(function(){
            location.href = "detail/mall_list.html?c=" + PSJH;
        });
        // 果树认购
        $("#gsrg").click(function(){
            location.href = "detail/mall_list.html?c=" + GSRG;
        });
        // 北大荒
        $("#bdh").click(function(){
            location.href = "detail/mall_list.html?c=" + BDH;
        });
        // 热门活动
        $("#rmhd").click(function(){
            location.href = "operator/buy.html?code=" + RMHD;
        });
    }

    //banner图
    function getBanner(){
        return GeneralCtr.getBanner()
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic, 1)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#top-swiper").html(html);
                    new Swiper('#swiper-container', {
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
    	return GeneralCtr.getPageSysNotice(1, 1)
            .then(function(data){
    			if(data.list.length){
    				$(".noticeCon p").text(data.list[0].smsTitle)
    			}
        	});
    }
});
