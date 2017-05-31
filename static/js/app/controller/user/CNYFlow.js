define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading',
    'app/util/dict'
], function(base, Ajax, loading, Dict) {
    var accountNumber,
        config = {
            start: 1,
            limit: 20
        };
    var isEnd = false,
        canScrolling = false;
    var fundType = Dict.get("fundType");
    var tradepwdFlag;
    
	$.when(
		getUserInfo(),
		init()
	)
    

    function init(){
        loading.showLoading();
        getAccount()
            .then(function(res){
                if (res.success) {
                    var data = res.data;
                    for(var i = 0; i < data.length; i++){
                        if(data[i].currency == "CNY"){
                            config.accountNumber = data[i].accountNumber;
                            $("#amount").html(base.formatMoneyD(data[i].amount));
                            break;
                        }
                    }
                    getPageFlow();
                }
            })
        addListener();
    }
    // 获取账户信息
    function getAccount() {
        return Ajax.get("802503", {
            userId: base.getUserId()
        });
    }
    
    //获取交易密码
    function getUserInfo(){
        base.getUser()
            .then(function(res) {
                if (res.success) {
                	tradepwdFlag=res.data.tradepwdFlag
                } else {
                    base.showMsg(res.msg);
                }
            });
    }
    
    
    
    function getPageFlow(){
        Ajax.get("802524", config)
            .then(function(res){
                if(res.success && res.data.list.length){
                    var html = "";
                    $.each(res.data.list, function(index, item){
                        var positive = +item.transAmount >= 0 ? true : false,
                            transClass = positive ? "t_21b504" : "t_f64444",
                            prefix = positive && "+" || "";
                        html += '<li class="plr20 ptb20 b_bd_b clearfix lh15rem">'+
                                    '<div class="wp60 fl s_10">'+
                                        '<p class="t_4d">' + item.bizNote + '</p>'+
                                        '<p class="s_09 t_999 pt10">' + base.formatDate(item.createDatetime, "yyyy-MM-dd hh:mm:ss") + '</p>'+
                                    '</div>'+
                                    '<div class="wp40 fl tr ' + transClass + ' s_10">';
                        if(item.bizType == "92"){
                        	prefix="";
                        }
                        	html += '<span class="inline_block va-m pt1em">' + prefix + base.formatMoneyD(item.transAmount) + '元</span>'
                        if(item.bizType == "-11"&&item.fee){
                        	html += '<br/><span class="inline_block va-m s_09">手续费' + base.formatMoneyD(item.fee) + '元</span>'
                        }
                        ;
                        html += '</div></li>';
                    });
                    $("#fd-ul").html(html);
                }else{
                    if(res.msg){
                        base.showMsg(res.msg);
                        if(config.start == 1){
                            doError();
                        }
                    }else if(config.start == 1){
                        doError("暂无资金流水!");
                    }
                }
            });
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
    function addListener(){
        $("#recharge").on("click",function(){
            location.href="../pay/cny_recharge.html"
        });
        $("#toWithDraw").on("click",function(){
        	if(tradepwdFlag==null||tradepwdFlag=="0"){
        		base.showMsg("未设置交易密码");
        		setTimeout(function(){
        			location.href="set_tradePwd.html"
        		},1200)
        	}else{
        		location.href="toWithDraw.html"
        	}
            
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
