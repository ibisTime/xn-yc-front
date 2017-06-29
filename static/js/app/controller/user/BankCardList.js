define([
    'app/controller/base',
    'app/interface/UserCtr'
], function (base, UserCtr) {
    init();
    function init(){
        base.showLoading();
        getBankCardList();
        addListeners();
    }
    // 获取银行卡列表
    function getBankCardList(){
        UserCtr.getBankCardList()
            .then(function(data){
                base.hideLoading();
                if(data.length){
                    var html = "";
                    data.forEach(function(item){
                        html += '<div class="bankcard-item-wrap">'+
                            '<div class="bankcard-item" data-code="' + item.code + '">'+
                                '<img src="/static/images/backcard_icon.png?__inline"/>'+
                                '<div class="bankcard-item-right">'+
                                    '<div class="bankcard-item-title">' + item.bankName + '</div>'+
                                    '<div class="bankcard-item-number">' + base.getBankCard(item.bankcardNumber) + '</div>'+
                                '</div>'+
                                '<span class="bankcard-delete">修改</span>'+
                            '</div>'+
                        '</div>';
                    });
                    $("#bankCardContainer").html(html);
                }else{
                    doError();
                    $("footer").removeClass("hidden");
                }
            });
    }

    function addListeners(){
        $("#sbtn").on("click", function(){
            location.href = "./add_bankCard.html";
        });
        $("#bankCardContainer").on("click", ".bankcard-item", function(e){
            var me = $(this);
            location.href = "./add_bankCard.html?code="+me.attr("data-code");
        });
    }

    function doError() {
        $("#bankCardContainer").html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂无银行卡</div>');
    }
});
