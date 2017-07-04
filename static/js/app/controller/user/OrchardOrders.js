define([
    'app/controller/base',
    'app/util/dict',
    'app/module/loadImg',
    'app/interface/MallCtr'
], function(base, Dict, loadImg, MallCtr) {
    var config = {
            limit: 10,
            start: 1,
            type: 2
        }, isEnd = false, canScrolling = false,
        orderStatus = Dict.get("orderStatus");

    init();

    function init() {
        base.showLoading();
        getOrderList().then(base.hideLoading);
        addListener();
    }

    function addListener() {
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getOrderList();
            }
        });
    }

    function getOrderList() {
        return MallCtr.getPageOrders(config)
            .then(function(data) {
                var html = "",
                    curList = data.list;
                if (+data.totalCount <= config.limit || curList.length < config.limit) {
                    isEnd = true;
                }
                if (curList.length) {
                    curList.forEach(function(cl) {
                        html += buildHtml(cl);
                    });
                    $("#content").append(loadImg.loadImg(html));
                    config.start += 1;
                    canScrolling = true;
                } else {
                    if(config.start == 1){
                        doError();
                    }
                }
            }, function(){
                if (config.start == 1) {
                    doError();
                }
            }).always(removeLoading);
    }

    function buildHtml(cl) {
        return `<div class="distribution-item plr10">
                    <div class="d-item-top">订单号: <span>${cl.code}</span></div>
                    <div class="d-item-content am-flexbox am-flexbox-align-top">
                        <div class="default-bg d-icont-img p_r">
                            <img class="center-img1 hp100" src="${base.getImg(cl.product.advPic)}" />
                        </div>
                        <div class="d-icont-infos am-flexbox-item">
                            <div class="am-flexbox am-flexbox-dir-column am-flexbox-justify-between am-flexbox-align-top">
                                <div class="d-infos-title line-tow">${cl.product.name}</div>
                                <div class="d-infos-price">${base.formatMoneyD(cl.amount2)}橙券/${base.formatMoneyD(cl.amount1)}元</div>
                                <div class="d-infos-desc">
                                    ${cl.product.strain} | ${cl.product.logisticsDate} | ${cl.logisticsSum}年
                                </div>
                            </div>
                        </div>
                        <div class="d-icont-status">${orderStatus[cl.status]}</div>
                    </div>
                    ${cl.status == "1" ? `<div class="d-item-bottom clearfix">
                        <a href="../pay/pay_order.html?code=${cl.code}" class="d-item-button">立即支付</a>
                    </div>` : ''}
                </div>`;
    }

    function addLoading() {
        $("#content").append('<div class="scroll-loadding"></div>');
    }

    function removeLoading() {
        $("#content").find(".scroll-loadding").remove();
    }

    function doError() {
        $("#content").empty();
        $("#noItem").removeClass("hidden");
    }

});
