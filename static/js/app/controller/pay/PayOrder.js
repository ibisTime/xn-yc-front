define([
    'app/controller/base',
    'app/interface/AccountCtr',
    'app/interface/MallCtr',
    'app/module/loadImg',
    'app/module/weixin'
], function(base, AccountCtr, MallCtr, loadImg, weixin) {
    var code = base.getUrlParam("code"),
        choseIdx = 0,
        CBAmount, RMBAmount,
        totalAmount = 0;

    init();

    function init() {
        base.showLoading();
        $.when(
            queryOrder(),
            getAccount()
        ).then(function() {
            base.hideLoading();
            addListener();
        });
    }

    //查询订单信息
    function queryOrder() {
        return  MallCtr.getOrder(code).then(function(data) {
            //如果不是待支付订单，则直接跳到个人中心页面
            if (data.status !== "1") {
                location.href = "../user/user_info.htm";
            }
            //订单相关商品信息
            var html = buildHtml(data);
            $("footer, #items-cont").removeClass("hidden");
            $("#items-cont").append(loadImg.loadImg(html));

            CBAmount = base.formatMoney(data.amount2) + "橙券";
            RMBAmount = base.formatMoney(data.amount1) + "元";
            $("#totalAmount").html(CBAmount);

            //添加地址信息
            var addrHtml = buildAddrHtml(data);
            $("#addressDiv").html(addrHtml);
        }, function(){
            doError("#container");
        });
    }
    // 生成商品html
    function buildHtml(data) {
        var productSpecs = data.product;
        return `<ul>
                    <li class="ptb8 clearfix b_bd_b plr10" modelCode="${productSpecs.productCode}">
                        <a class="show p_r min-h100p" href="../operator/buy.htm?code=${productSpecs.productCode}">
                            <div class="order-img-wrap tc default-bg">
                                <img class="center-img1" src="${base.getImg(data.product.advPic)}"/>
                            </div>
                            <div class="order-right-wrap clearfix">
                                <div class="fl wp60"><p class="tl line-tow">${productSpecs.name}</p></div>
                                <div class="fl wp40 tr s_11">
                                    <p class="item_totalP">
                                        <span>${base.formatMoneyD(productSpecs.price2)}橙券</span><br/>或
                                        <span class="item_totalP">${base.formatMoney(productSpecs.price1)}元</span>
                                    </p>
                                    <p class="t_80">×<span>${data.quantity}</span></p>
                                </div>
                            </div>
                        </a>
                    </li>
                </ul>`;
    }
    // 生成地址html
    function buildAddrHtml(data) {
        return `<p>
                    <span class="pr2em">总计</span>：
                    <span class="pl_5rem">${base.formatMoney(data.amount2)}橙券/${base.formatMoney(data.amount1)}元<span>
                </p>
                <p><span class="pr1em">订单号</span>：<span class="pl_5rem">${data.code}</span></p>
                ${
                    data.reAddress
                        ? `<p>
                            <span>配送信息：</span>
                            <span class="pl_5rem">${data.receiver}</span>
                            <span class="pl10">${data.reMobile}</span>
                        </p><p class="pl5_5rem t_73 s_09_5">${data.reAddress}</p>`
                        : ""
                }`;
    }

    // 获取账户信息
    function getAccount() {
        return AccountCtr.getAccount()
            .then(function(data) {
                data.forEach(function(d, i) {
                    if (d.currency == "CNY") {
                        $("#rmbRemain").html("¥" + base.formatMoneyD(d.amount));
                    } else if (d.currency == "CB") {
                        $("#CBRemain").html(base.formatMoneyD(d.amount));
                    }
                });
            });
    }

    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }

    function addListener() {
        $("#content").on("click", ".pay-item", function() {
            var _self = $(this),
                idx = _self.index();
            _self.siblings(".active").removeClass("active");
            _self.addClass("active");
            choseIdx = idx;
            if (choseIdx == 0) { //  橙券余额支付
                $("#totalAmount").html(CBAmount);
            } else {
                $("#totalAmount").html(RMBAmount);
            }
        });

        /*********支付订单前的确认框start*********/
        //确定支付按钮
        $("#odOk").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
            if (choseIdx == 0) { //  橙券余额支付
                doPayOrder(50);
            } else if (choseIdx == 1) { //  RMB余额支付
                doPayOrder(1);
            } else { //微信支付
                doPayOrder(5);
            }

        });
        $("#odCel").on("click", function(e) {
            $("#od-mask, #od-tipbox").addClass("hidden");
        });
        /*********支付订单前的确认框end*********/
        //点击支付按钮
        $("#sbtn").on("click", function(e) {
            e.stopPropagation();
            $("#od-mask, #od-tipbox").removeClass("hidden");
        });
    }

    function doPayOrder(payType) {
        base.showLoading("支付中...");
        MallCtr.payOrder([code], payType).then(function(data) {
            if (payType == 50 || payType == 1) {
                base.hideLoading();
                base.showMsg("支付成功");
                setTimeout(function() {
                    location.href = "../operator/pay_success.htm";
                }, 1000);
            } else {
                wxPay(data);
            }
        }, function(error, d){
            if(d){
                if(error == "橙券不足"){
                    d.close().remove();
                    base.confirm("橙券余额不足，是否前往购买？", "否", "是").then(function() {
                        location.href = "../pay/buyCgM.htm";
                    }, function() {})
                }else if (error == "人民币账户余额不足") {
                    d.close().remove();
                    base.confirm("人民币账户余额不足，是否前往购买？", "否", "是").then(function() {
                        location.href = "../pay/cny_recharge.htm";
                    }, function() {});
                }

            }
        });
    }
    function wxPay(data) {
        if (data && data.signType) {
            weixin.initPay(data, () => {
                base.showMsg("支付成功");
                setTimeout(function(){
                    location.href = "../consume/detail.htm?c=" + code;
                }, 1000);
            }, () => {
                base.showMsg("支付失败");
            });
        } else {
            base.hideLoading();
            base.showMsg("微信支付失败");
        }
    }
});
