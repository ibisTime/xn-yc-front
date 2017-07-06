define([
    'app/controller/base',
    'app/module/loadImg',
    'app/interface/GeneralCtr',
    'app/interface/MallCtr'
], function(base, loadImg, GeneralCtr, MallCtr) {
    var code = base.getUrlParam('code'),
        dictData;

    init()

    function init(){
        GeneralCtr.getDictList("vorder_status").then(function(data) {
            dictData = data;
            initView();
        });
    }


    function initView() {
        $("#orderCode").text(code);
        base.showLoading();
        getOrder();
    }
    //查询订单
    function getOrder() {
        MallCtr.getRechargeOrder(code).then(function(data) {
            base.hideLoading();
            var html = "",
                product = data.product,
                price = data.amount / 1000,
                rate = data.product.rate;

            $("#orderDate").text(base.formatDate(data.applyDatetime, "yyyy-MM-dd hh:mm:ss"));
            $("#orderStatus").text(base.getDictListValue(data.status, dictData));
            //待支付(可取消)
            if (data.status == "0") {
                $("footer").removeClass("hidden");
                //取消订单
                $("#cbtn").on("click", function(e) {
                    $("#od-mask, #od-tipbox").removeClass("hidden");
                });
                //支付订单
                $("#sbtn").on("click", function() {
                    location.href = '../detail/recharge_cardPay.htm?code=' + code + "&a=" + price + "&rate=" + rate;
                });
                addListener();
            }
            //备注
            if (data.applyNote) {
                $("#applyNoteTitle, #applyNoteInfo").removeClass("hidden");
                $("#applyNoteInfo").text(data.applyNote);
            }
            //商品信息
            $("#od-ul").append(loadImg.loadImg(buildHtml(data)));
            $("#totalAmount").html(base.formatMoney(data.amount * data.product.rate) + "橙券");

            $("#od-id").html(data.code);
        });
    }

    function buildHtml(data) {
        var text1 = "加油卡号：",
            text2 = "加油姓名：";
        if (data.product.type == 3) {
            text1 = "手机号：";
            text2 = "姓名：";
        }
        return `<ul>
                    <li class="ptb8 clearfix b_bd_b" modelCode="${data.product.code}">
                        <a class="show p_r min-h100p" href="../detail/recharge_cardDetail.htm?code=${data.product.code}">
                            <div class="order-img-wrap ml10 tc default-bg mr10">
                                <img class="center-img1" src="${base.getImg(data.product.advPic)}"/>
                            </div>
                            <div class="order-right-wrap clearfix">
                                <div class="fl wp100 plr10">
                                    <p class="tl line-tow pt10">${text1 + data.reCardno}</p>
                                    <p class="tl line-tow pt6">${text2 + data.reName}</p>
                                    <p class="tl line-tow pt6">充值面额：${data.amount / 1000}</p>
                                </div>
                            </div>
                        </a>
                    </li>
                </ul>`;
    }

    function addListener() {
        //取消订单确认框点击确认
        $("#odOk").on("click", function() {
            cancelOrder();
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
        //取消订单确认框点击取消
        $("#odCel").on("click", function() {
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
    }

    function cancelOrder() {
        base.showLoading("取消中...");
        MallCtr.cancelRechargeOrder([code], '用户自行取消')
            .then(function() {
                base.hideLoading();
                base.showMsg("取消订单成功！");
                setTimeout(function() {
                    base.getBack();
                }, 1000);
            });
    }
});
