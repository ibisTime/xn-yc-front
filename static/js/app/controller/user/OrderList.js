define([
    'app/controller/base',
    'app/util/dict',
    'app/module/loadImg',
    'app/interface/MallCtr'
], function(base, Dict, loadImg, MallCtr) {
    var config = {
            limit: 15,
            start: 1,
            type: 1
        },
        orderStatus = Dict.get("orderStatus"),
        isEnd, index = base.getUrlParam("i") || 0,
        canScrolling;

    init();

    function init() {
        addListener();
        $("#status_ul>li:eq(" + index + ")").click();
    }

    function addListener() {
        $("#status_ul").on("click", "li", function(e) {
            config.start = 1;
            $("#status_ul").find("li.active").removeClass("active");
            var status = $(this).addClass("active").attr("status");
            status = status == "0" ? "" : status;
            config.status = status;
            isEnd = false;
            canScrolling = false;
            $("#ol-ul").empty();
            $("#noItem").addClass("hidden");
            addLoading();
            getPageOrders();
            e.stopPropagation();
        });
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
            location.href = "../pay/pay_order.htm?code=" + me.closest("li[code]").attr("code");
        });
    }

    function getPageOrders() {
        MallCtr.getPageOrders(config)
            .then(function(data) {
                var html = "",
                    totalCount = +data.totalCount,
                    curList = data.list;
                if (totalCount <= config.limit || curList.length < config.limit) {
                    isEnd = true;
                }
                if (curList.length) {
                    curList.forEach(function(invoice) {
                        html += buildHtml(invoice);
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
                if (config.start == 1) {
                    doError();
                }
            }).always(removeLoading);
    }

    function buildHtml(invoice){
        var code = invoice.code;
        return `<li class="clearfix b_bd_b b_bd_t bg_fff mt10" code="${code}">
                    <a class="show plr10" href="./order_detail.htm?code=${code}" class="show">
                        <div class="wp100 b_bd_b clearfix ptb10">
                            <div class="fl">订单号：<span>${code}</span></div>
                        </div>
                        <div class="wp100 clearfix ptb4 p_r min-h100p">
                            <div class="order-img-wrap tc default-bg top15">
                                <img class="center-img1" src="${base.getImg(invoice.product.advPic)}"/>
                            </div>
                            <div class="order-right-wrap clearfix">
                                <div class="fl wp60 pt12">
                                    <p class="tl line-tow s_12">${invoice.product.name}</p>
                                </div>
                                <div class="fl wp40 tr pt12">
                                    <p class="item_totalP">
                                        <span>${base.formatMoneyD(invoice.price2)}橙券</span>
                                        <br/>或<span class="item_totalP">${base.formatMoneyD(invoice.price1)}元</span>
                                    </p>
                                    <p class="t_80">×<span>${invoice.quantity}</span></p>
                                    <p>&nbsp;</p>
                                    <p class="ol_total_p right0">总计:
                                        <span class="pl4">${base.formatMoneyD(invoice.amount2)}橙券/${base.formatMoneyD(invoice.amount1)}元</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="wp100 clearfix ptb6 mt1em ">
                            <span class="fr inline_block bg_f64444 t_white s_10 plr8 ptb4 b_radius4 ${invoice.status == "1" ? "ol-tobuy" : ""}">${getStatus(invoice.status)}</span>
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

    function getStatus(status) {
        return orderStatus[status] || "未知状态";
    }
});
