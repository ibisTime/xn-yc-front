define([
    'app/controller/base',
    'app/module/loadImg',
    'app/interface/GeneralCtr',
    'app/interface/O2OCtr'
], function(base, loadImg, GeneralCtr, O2OCtr) {
    var config = {
            limit: 10,
            start: 1
        },
        isEnd = false,
        index = base.getUrlParam("i") || 0,
        canScrolling = false,
        dictData;

    init();

    function init() {
        base.showLoading();
        GeneralCtr.getDictList("store_purchase_status")
            .then(function(data1) {
                dictData = data1;
                getPageOrders();
                addListener();
            });
    }

    function addListener() {
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageOrders().then(base.hideLoading);
            }
        });
        $("#ol-ul").on("click", "li span.ol-tobuy", function(e) {
            e.stopPropagation();
            e.preventDefault();
            location.href = "../detail/recharge_cardPay.html?code=" + $(this).closest("li[code]").attr("code");
        });
    }

    function getPageOrders() {
        return O2OCtr.getPageOrders(config)
            .then(function(data) {
                base.hideLoading();
                var html = "",
                    curList = data.list;
                if (+data.totalCount <= config.limit || curList.length < config.limit) {
                    isEnd = true;
                }
                if (curList.length) {
                    curList.forEach(function(invoice) {
                        var totalAmount = invoice.amount2,
                            totalJFAmount = invoice.amount3,
                            code = invoice.code;

                        html += '<li class="clearfix b_bd_b b_bd_t bg_fff mb10" code="' + code + '">' + '<div class="show plr10">' + '<div class="wp100 b_bd_b clearfix ptb10">' + '<div class="fl">订单号：<span>' + code + '</span></div></div>' + '<div class="wp100 clearfix ptb4 p_r min-h100p">' + '<div class="order-img-wrap mt10 tc default-bg" style="width:80px;height:80px;"><img class="center-img1" src="' + base.getImg(invoice.store.advPic) + '"></div>' + '<div class="pl100 clearfix"><div class="fl wp100 pt12">' + '<p class="tl line-tow">商家名称：' + invoice.store.name + '</p>';
                        if (invoice.payAmount2) {
                            html += '<p class="tl line-tow">消费金额：' + invoice.payAmount2 / 1000 + '橙券</p>';
                        } else if (invoice.payAmount1) {
                            html += '<p class="tl line-tow">消费金额：' + invoice.payAmount1 / 1000 + '元</p>' + '<p class="tl line-tow">返橙券：' + invoice.backAmount / 1000 + '橙券</p>';
                        }
                        html += '<p class="tl line-tow">时间：' + base.formatDate(invoice.createDatetime, "yyyy-MM-dd hh:mm:ss") + '</p>' + '</div></div>' + '<div class="wp100 clearfix ptb6 mt1emys">' + '<span class="fr inline_block bg_f64444 t_white s_10 plr8 ptb4 b_radius4">' + base.getDictListValue(invoice.status, dictData) + '</span>' + '</div></div>' + '</div></li>';
                    });
                    $("#ol-ul").append(loadImg.loadImg(html));
                    config.start += 1;
                    canScrolling = true;
                } else {
                    if (config.start == 1) {
                        doError();
                    }
                }
            }, function(){
                if(config.start == 1){
                    doError();
                }
            }).always(removeLoading);
    }

    function addLoading() {
        $("#ol-ul").append('<li class="scroll-loadding"></li>');
    }

    function removeLoading() {
        $("#ol-ul").find(".scroll-loadding").remove();
    }

    function doError() {
        $("#ol-ul").empty();
        $("#noItem").removeClass("hidden");
    }

});
