define([
    'app/controller/base',
    'app/util/dict',
    'app/interface/AccountCtr',
    'app/module/weixin',
], function(base, Dict, AccountCtr, weixin) {
    var accountNumber,
        config = {
            start: 1,
            limit: 20
        },
        isEnd = false,
        canScrolling = false,
        fundType = Dict.get("fundType");

    init();

    function init(){
        base.showLoading();
        AccountCtr.getAccount()
            .then(function(data){
                for(var i = 0; i < data.length; i++){
                    if(data[i].currency == "CB"){
                        config.accountNumber = data[i].accountNumber;
                        $("#amount").html(base.formatMoneyD(data[i].amount));
                        break;
                    }
                }
                getPageFlow().then(base.hideLoading);
            })
        addListener();
    }
    function getPageFlow(){
        return AccountCtr.getPageFlow(config)
            .then(function(data){
                if(data.list.length){
                    var html = "";
                    $.each(data.list, function(index, item){
                        html += buildHtml(item);
                    });
                    $("#fd-ul").append(html);
                    config.start++;
                    if(+data.totalCount <= config.limit || data.list.length < config.limit){
                        isEnd = true;
                    }
                    canScrolling = true;
                }else{
                    if(config.start == 1){
                        doError("暂无资金流水!");
                    }
                }
            }, function(){
                if(config.start == 1){
                    doError("暂无资金流水!");
                }
            }).always(removeLoading);
    }
    function buildHtml(item){
        var positive = +item.transAmount >= 0 ? true : false,
            transClass = positive ? "t_21b504" : "t_f64444",
            prefix = positive && "+" || "";
        return `<li class="plr20 ptb20 b_bd_b clearfix lh15rem">
                    <div class="wp60 fl s_10">
                        <p class="t_4d">${item.bizNote}</p>
                        <p class="s_09 t_999 pt10">${base.formatDate(item.createDatetime, "yyyy-MM-dd hh:mm:ss")}</p>
                    </div>
                    <div class="wp40 fl tr ${transClass} s_10">
                        <span class="inline_block va-m pt1em">${prefix + base.formatMoneyD(item.transAmount)}</span>
                    </div>
                </li>`;
    }
    function doError(msg) {
        $("#fd-ul").html('<li class="bg_fff" style="text-align: center;line-height: 93px;">' + (msg || "暂时无法查到数据!") + "</li>");
    }
    function addListener(){
        $("#buyCg").on("click",function(){
            location.href="../pay/buyCgM.html"
        })
        $(window).on("scroll", function() {
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getPageFlow();
            }
        });
        $("#buyCard").click(function(){
            base.showLoading();
            weixin.initScanQRCode(function (res) {
                base.showLoading("卡券充值中...");
                AccountCtr.rechargeByCard(res.resultStr.split('code=')[1])
                    .then(function() {
                        base.hideLoading();
                        location.href = "./get_success.html";
                    });
            }, function(msg) {
                alert(JSON.stringify(msg));
            });
        })
    }

    function addLoading() {
        $("#fd-ul").append('<li class="scroll-loadding"></li>');
    }
    function removeLoading() {
        $("#fd-ul").find(".scroll-loadding").remove();
    }
});
