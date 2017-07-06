define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/UserCtr',
    'app/interface/AccountCtr'
], function(base, Dict, UserCtr, AccountCtr) {
    var accountNumber,
        config = {
            start: 1,
            limit: 20
        },
        isEnd = false,
        canScrolling = false,
        fundType = Dict.get("fundType"),
        tradepwdFlag;

    init()

    function init() {
        base.showLoading();
        getUserInfo();
        AccountCtr.getAccount().then(function(data) {
            base.hideLoading();
            for (var i = 0; i < data.length; i++) {
                if (data[i].currency == "CNY") {
                    config.accountNumber = data[i].accountNumber;
                    $("#amount").html(base.formatMoneyD(data[i].amount));
                    break;
                }
            }
            getPageFlow();
        });
        addListener();
    }
    //获取交易密码
    function getUserInfo() {
        return UserCtr.getUser().then(function(data) {
            tradepwdFlag = data.tradepwdFlag;
        });
    }

    function getPageFlow() {
        AccountCtr.getPageFlow(config).then(function(data) {
            if (data.list.length) {
                var html = "";
                $.each(data.list, function(index, item) {
                    html += buildHtml(item);
                });
                $("#fd-ul").append(html);
                if (+ data.totalCount <= config.limit || data.list.length < config.limit) {
                    isEnd = true;
                }
                config.start++;
                canScrolling = true;
            } else {
                if (config.start == 1) {
                    doError("暂无资金流水!");
                }
            }
        }, function(){
            if (config.start == 1) {
                doError("暂无资金流水!");
            }
        }).always(removeLoading);
    }

    function buildHtml(item){
        var positive = +item.transAmount >= 0 ? true : false,
            transClass = positive ? "t_21b504" : "t_f64444",
            prefix = positive && "+" || "";
        if (item.bizType == "92") {
            prefix = "";
        }
        return `<li class="plr20 ptb20 b_bd_b clearfix lh15rem">
                    <div class="wp60 fl s_10">
                        <p class="t_4d">${item.bizNote}</p>
                        <p class="s_09 t_999 pt10">${base.formatDate(item.createDatetime, "yyyy-MM-dd hh:mm:ss")}</p>
                    </div>
                    <div class="wp40 fl tr ${transClass} s_10">
                        <span class="inline_block va-m pt1em">${prefix + base.formatMoneyD(item.transAmount)}元</span>
                        ${
                            item.bizType == "-11" && item.fee
                                ? `<br/><span class="inline_block va-m s_09">手续费${base.formatMoneyD(item.fee)}元</span>`
                                : ""
                        }
                    </div>
                </li>`;
    }

    function addLoading() {
        $("#fd-ul").append('<li class="scroll-loadding"></li>')
    }
    function removeLoading() {
        $("#fd-ul").find(".scroll-loadding").remove()
    }
    function doError(msg) {
        $("#fd-ul").html('<li class="bg_fff" style="text-align: center;line-height: 93px;">' + (msg || "暂时无法查到数据!") + "</li>");
    }
    function addListener() {
        $("#recharge").on("click", function() {
            location.href = "../pay/cny_recharge.htm"
        });
        $("#toWithDraw").on("click", function() {
            if (tradepwdFlag == null || tradepwdFlag == "0") {
                base.showMsg("未设置交易密码");
                setTimeout(function() {
                    location.href = "set_tradePwd.htm"
                }, 1200)
            } else {
                location.href = "toWithDraw.htm"
            }
        });
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageFlow();
            }
        });
    }
});
