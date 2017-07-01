define([
    'app/controller/base',
    'app/module/validate',
    'app/module/smsCaptcha',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, Validate, smsCaptcha, GeneralCtr, UserCtr) {
    init();
    function init() {
        addListeners();
    }

    function addListeners() {
        var _cmForm = $("#cmForm");
        _cmForm.validate({
            'rules': {
                "smsCaptcha": {
                    sms: true,
                    required: true
                },
                "newMobile": {
                    required: true,
                    mobile: true
                }
            },
            onkeyup: false
        });
        smsCaptcha.init({
            checkInfo: function () {
                return $("#newMobile").valid();
            },
            bizType: "805047",
            id: "getVerification",
            mobile: "newMobile"
        });
        // 设置
        $("#sbtn").on("click", function(e) {
            if(_cmForm.valid()){
                changeMobile();
            }
        });
    }
    // 修改手机号
    function changeMobile() {
        base.showLoading("设置中...");
        UserCtr.changeMobile($("#newMobile").val(), $("#smsCaptcha").val())
            .then(function(){
                base.hideLoading();
                base.showMsg("手机号修改成功！");
                setTimeout(function() {
                    history.back();
                }, 1000);
            });
    }
});
