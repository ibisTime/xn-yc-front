define([
    'app/controller/base',
    'app/util/dict',
    'app/module/loadImg',
    'app/interface/GeneralCtr',
    'app/interface/MallCtr'
], function(base, Dict, loadImg, GeneralCtr, MallCtr) {
    var config = {
            limit: 10,
            start: 1
        },
        isEnd = false,
        canScrolling = false,
        dictData,
        price = 0,
        rate = 1;

    init();
    function init() {
        GeneralCtr.getDictList("vorder_status").then(function(data) {
            dictData = data;
            initView();
        });
    }

    function initView() {
        getPageOrders().then(base.hideLoading);
        addListener();
    }

    function addListener() {
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageOrders();
            }
        });
        $("#ol-ul").on("click", "li span.ol-tobuy", function(e) {
            e.stopPropagation();
            e.preventDefault();
            var me = $(this);
            location.href = "../detail/recharge_cardPay.htm?code=" + me.closest("li[code]").attr("code") + "&a=" + me.closest("li[code]").attr("price") + "&rate=" + me.closest("li[code]").attr("rate");
        });
    }
    // 分页获取订单
    function getPageOrders() {
        return MallCtr.getPageRechargeOrders(config)
            .then(function(data) {
                var html = "",
                    totalCount = +data.totalCount,
                    curList = data.list;
                if (totalCount <= config.limit || curList.length < config.limit) {
                    isEnd = true;
                }
                if (curList.length) {
                    curList.forEach(function(cl) {
                        html += buildHtml(cl);
                    });
                    $("#ol-ul").append(loadImg.loadImg(html));
                    config.start += 1;
                    canScrolling = true;
                } else {
                    if (config.start == 1) {
                        doError();
                    }
                }
            }, function() {
                if (config.start == 1) {
                    doError();
                }
            }).always(removeLoading);
    }

    function buildHtml(invoice) {
        var code = invoice.code,
            text1 = "加油卡号：",
            text2 = "加油姓名：";

        if (invoice.product.type == 3) {
            text1 = "手机号：";
            text2 = "姓名：";
        }
        return `<li class="clearfix b_bd_b b_bd_t bg_fff mb10" code="${code}" price="${invoice.amount / 1000}" rate="${invoice.product.rate}">
                    <a class="show plr10" href="./vorder_detail.htm?code=${code}" class="show">
                        <div class="wp100 b_bd_b clearfix ptb10">
                            <div class="fl">订单号：<span>${code}</span></div>
                        </div>
                        <div class="wp100 clearfix ptb4 p_r min-h100p">
                            <div class="order-img-wrap ml10 tc default-bg">
                                <img class="center-img1" src="${base.getImg(invoice.product.advPic)}"/>
                            </div>
                            <div class="order-right-wrap clearfix">
                                <div class="fl wp100 pt12">
                                    <p class="tl line-tow">${text1 + invoice.reCardno}</p>
                                    <p class="tl line-tow">${text2 + invoice.reName}</p>
                                    <p class="tl line-tow">充值面额：${invoice.amount / 1000}</p>
                                </div>
                            </div>
                            <div class="wp100 clearfix ptb6 mt1emys">
                                <span class="fr inline_block bg_f64444 t_white s_10 plr8 ptb4 b_radius4 ${invoice.status == "0" ? "ol-tobuy" : ""}">
                                    ${base.getDictListValue(invoice.status, dictData)}
                                </span>
                            </div>
                        </div>
                    </a>
                </li>`;
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
