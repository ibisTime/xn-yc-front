define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Validate, smsCaptcha, GeneralCtr, UserCtr) {
    init();
    function init() {
        var mobile = sessionStorage.getItem("m");
        if(!mobile){
            base.showLoading();
            UserCtr.getUser()
                .then((data) => {
                    base.hideLoading();
                    $("#mobile").val(data.mobile);
                    addListeners();
                });
        }else{
            $("#mobile").val(mobile);
            addListeners();
        }
    }
    function addListeners() {
        var _stForm = $("#stForm");
        _stForm.validate({
            'rules': {
                "smsCaptcha": {
                    sms: true,
                    required: true
                },
                "mobile": {
                    required: true,
                    mobile: true
                },
                "tradePwd": {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                "reTradePwd": {
                    required: true,
                    equalTo: "#tradePwd"
                }
            },
            onkeyup: false
        });
        smsCaptcha.init({
            bizType: "805045"
        });
        $("#sbtn").on("click", function() {
            if(_stForm.valid()){
                setTradePwd();
            }
        });
    }

    function setTradePwd() {
        base.showLoading("设置中...");
        UserCtr.setTradePwd($("#tradePwd").val(), $("#smsCaptcha").val())
            .then(function() {
                base.hideLoading();
                base.showMsg("交易密码设置成功！");
                setTimeout(function() {
                    base.getBack();
                }, 1000);
            });
    }
});
