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
    		getBanner("1-1"),
            hotEvents("1-2"),
            hotProduct("1-3"),
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

        $("#banner-swiper-container").on("touchstart", ".swiper-slide img", function (e) {
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            me.data("x", touches.clientX);
        });
        $("#banner-swiper-container").on("touchend", ".swiper-slide img", function (e) {
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
        $("#event-swiper-container").on("touchend", ".swiper-slide img", function (e) {
            var me = $(this),
                touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
                var url = me.attr('data-url');
                if(url){
                    if(!/^http/i.test(url)){
                        location.href = "http://"+url;
                    }else{
                        location.href = url;
                    } 
                }               
        });        
        // 当季水果
        // $("#item0").click(function(){
        //     location.href = "detail/mall_list.htm?c=" + DJSG;
        // });
        // // 配送计划
        // $("#item1").click(function(){
        //     location.href = "detail/mall_list.htm?c=" + PSJH;
        // });
        // // 果树认购
        // $("#item2").click(function(){
        //     location.href = "detail/mall_list.htm?c=" + GSRG;
        // });
        // // 北大荒
        // $("#item3").click(function(){
        //     location.href = "detail/mall_list.htm?c=" + BDH;
        // });
        // // 热门活动
    }

    //banner图
    function getBanner(location){
        return GeneralCtr.getBanner1(location)
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic, 1)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#banner-top-swiper").html(html);
                    if(data.length > 1){
                        new Swiper('#banner-swiper-container', {
                        'direction': 'horizontal',
                        'loop': true,
                        'autoplay': 4000,
                        'autoplayDisableOnInteraction': false,
                        // 如果需要分页器
                        'pagination': '.swiper-pagination'
                    });                        
                    }                    
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

    function hotEvents(location){
        return GeneralCtr.getBanner1(location)
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += `<div class="swiper-slide"><img data-url="${item.url}" class="wp100 hp100" src="${base.getImg(item.pic, 1)}"></div>`;
                    });
                    if(data.length <= 1){
                        $(".swiper-pagination").addClass("hidden");
                    }
                    $("#event-top-swiper").html(html);

                    if(data.length > 1){
                        new Swiper('#event-swiper-container', {
                            'direction': 'horizontal',
                            'loop': true,
                            'autoplay': 4000,
                            'autoplayDisableOnInteraction': false,
                            // 如果需要分页器
                            'pagination': '.swiper-pagination'
                        });                        
                    }
                    
                }
            });
    } 

    function hotProduct(location){
        return GeneralCtr.getBanner1(location)
            .then(function(data){
                if(data.length){
                    var html = "";
                    data.forEach(function(item,i){
                        if (item.url.length) {
                            item.url
                        }else{
                            item.url = 'javascript:void(0)'
                        }
                        html +='<li class="wp50 b_e_b b_e_r fl" >'+
                                '<a href="'+ item.url +'" id="item'+i+'" class="wp100 pt10 pb4 over-hide">'+
                                '<div class="fl pl20 pr15"><img src="'+base.getImg(item.pic, 1)+'" /></div>'+
                                '<p class="fs14 t_333 tl lh45">'+item.name+'</p>'+
                                '</a></li>'
                    });

                    $("#hotProduct").append(html);
                    
                }
            });
    }       
});
