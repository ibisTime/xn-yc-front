define([
    'app/controller/base',
    'app/util/dict',
    'swiper',
    'app/module/loadImg',
    'app/module/foot',
    'app/interface/MallCtr'
], function(base, dict, Swiper, loadImg, Foot, MallCtr) {

    var isEnd = false,
        canScrolling = false;
    var config = {
        "start": 1,
        "limit": 15,
        "location": "1"
    };

    init();

    function init() {
        Foot.addFoot(1);
        base.showLoading("加载中...", 1);
        addListeners();
        $.when(
            //获取大类的数据字典
            MallCtr.getBigCategoryList(),
            //获取产品信息
            getPageProduct()
        ).then(function(data) {
            base.hideLoading();
            //    遍历大类
            $.each(data, function(i, val) {
                var pic1 = val.pic,
                    name1 = val.name,
                    code1 = val.code;
                var html1 = '<li><div><img src="' + base.getImg(pic1) + '"></div><p>' + name1 + '</p></li>';
                html1 = $(html1);
                html1.on("click", function() {
                    location.href = "./mall_list.html?c=" + code1;
                })
                $(".classOne").append(html1)
            });
        });
    }


    function getPageProduct(refresh){
        config.start = refresh && 1 || config.start;
        return MallCtr.getPageProduct(config, refresh)
            .then(function(data){
                var html = "";
                $.each(data.list, function(i, val) {
                    var originalPrice = base.formatMoneyD(val.originalPrice ) + "元",
                        price1 = base.formatMoneyD(val.price1) + "元",
                        price2 = base.formatMoneyD(val.price2) + "橙券";

                    html += '<li class="ptb8 clearfix b_bd_b plr10">'+
                        '<a class="show p_r min-h100p" href="../operator/buy.html?code=' + val.code +'">'+
                            '<div class="order-img-wrap tc"><img class="center-img1" src="' + base.getImg(val.advPic, 1) +'"/></div>'+
                            '<div class="order-right-wrap clearfix">'+
                                '<div class="am-flexbox am-flexbox-align-top">'+
                                    '<p class="t_323232 s_12 line-tow am-flexbox-item">' + val.name + '</p>';
                    if(val.saleStatus){
                        html += '<p class="item-rt-red">' + val.saleStatus + '</p>';
                    }
                    html += '</div>'+
                        '<p class="t_999 s_10 line-tow">' + val.slogan +'</p>'+
                        '<p class="t_red ptb4">'+
                            '<span class="s_12 t_red">' + price2 +'</span>/'+
                            '<span class="s_12 t_red">' + price1 +'</span>'+
                        '</p>';
                    if(val.category == "FL2017062716471159133341" || val.category == "FL2017062717580920664616"){
                        html += '<p>' + val.strain + " | " + val.logisticsDate + '</p>'
                    } else {
                        html += '<p class="s_10" style="text-decoration: line-through;">市场参考价：<span>' + originalPrice + '</span></p>';
                    }
                    html += '</div></a></li>';
                })

                $("#contUl").append(loadImg.loadImg(html));

                if(config.limit > data.list.length || config.limit >= data.totalCount){
                    isEnd = true;
                }else{
                    config.start++;
                }
                canScrolling = true;
            }).always(function() {
                removeLoading();
            });
    }

    function addListeners() {
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageProduct();
            }
        });
    }
    //添加下拉加载时的loading图标
    function addLoading() {
        $("#contUl").append('<li class="scroll-loadding"></li>');
    }
    //移除下拉加载时的loading图标
    function removeLoading() {
        $("#contUl").find(".scroll-loadding").remove();
    }

});
