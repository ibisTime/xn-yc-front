define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'lib/swiper-3.3.1.jquery.min',
    'app/module/loadImg/loadImg',
    'app/module/foot/foot',
], function(base, Ajax, dict, Swiper, loadImg, Foot) {

    var isEnd = false,
        canScrolling = false;
    var indexTopImg = dict.get("indexTopImg");
    var imgWidth = (($(window).width() - 20) / 2 - 8) + "px";
    var config = {
        "status": "3",
        "start": 1,
        "limit": 15,
        "orderColumn": "order_no",
        "orderDir": "asc",
        "location":"1"
    };
	
	Foot.addFoot(1);
    init();

    function init() {
        addListeners();
        $.when(
            //获取大类的数据字典
            Ajax.post("808007", {
                json: {
                    "parentCode": "0",
                    "status": "1",
                    "orderColumn": "order_no",
                    "orderDir": "asc",
                    type: "1"
                }
            }),
            //获取产品信息
            getPageProduct(true)
        ).then(function(res1) {
            if (res1.success) {
                var list1 = res1.data;
                //    遍历大类
                $.each(list1, function(i, val) {
                    var pic1 = val.pic,
                        name1 = val.name,
                        code1 = val.code;

                    var html1 = '<li><div><img src="' + base.getImg(pic1) + '" alt=""></div><p>' + name1 + '</p></li>';
                    html1 = $(html1);
                    html1.on("click", function() {
                        location.href = "./mall_list.html?c=" + code1;
                    })
                    $(".classOne").append(html1)
                });
                $("#cont").hide();
            }else{
            	base.showMsg(res1.msg)
            	$("#cont").hide();
            }
        });
    }
    
    
    function getPageProduct(refresh){
        config.start = refresh && 1 || config.start;
        return Ajax.get("808025", config, !refresh)
            .then(function(res){
                if(res.success){
                    var html = "";
                    $.each(res.data.list, function(i, val) {
                        var pic2 = val.advPic,
                            name = val.name,
                            slogan = val.slogan,
                            originalPrice = base.formatMoneyD(val.originalPrice ) + "元";
                            price1 = base.formatMoneyD(val.price1) + "元";
                            price2 = base.formatMoneyD(val.price2) + "橙券";
                            code = val.code;
                        
                        
                        html += '<li class="ptb8 clearfix b_bd_b plr10"><a class="show p_r min-h100p" href="../operator/buy.html?code=' + code +
	                        '"><div class="order-img-wrap tc"><img class="center-img1" src="' + base.getImg(pic2, 1)  + 
	                        '"></div><div class="order-right-wrap clearfix"><p class="t_323232 s_12 line-tow">' + name + 
	                        '</p><p class="t_999 s_10 line-tow">' + slogan +'</p><p class="t_red ptb4">';
                        
                        html +='<span class="s_12 t_red">' + price2 +'</span>/';
                        html +='<span class="s_12 t_red">' + price1 +'</span>';
                        
                        html +='</p><p class="s_10" style="text-decoration: line-through;">市场参考价：<span>' + originalPrice + '</span></p></div></a></li>';
                    })
                    
                    $("#contUl").append(loadImg.loadImg(html));
                    
                    if(config.limit > res.data.list.length || config.limit >= res.data.totalCount){
                        isEnd = true;
                    }else{
                        config.start++;
                    }
                }else{
                    base.showMsg(res.msg);
            		$("#cont").hide();
                }
            });
    }
    
    function addListeners() {
        $("#searchIcon").on("click", function() {
            var sVal = $("#searchInput").val().trim();
            sVal = decodeURIComponent(sVal);
            location.href = "./search.html?s=" + sVal;
        });
        
        $(window).on("scroll", function() {
            // var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                addListener();
            }
        });
    }

});
