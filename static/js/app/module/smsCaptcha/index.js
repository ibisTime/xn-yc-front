define([
    'jquery',
    'app/util/dialog',
    'app/interface/GeneralCtr'
], function ($, dialog, GeneralCtr) {
    function _showMsg(msg, time) {
        var d = dialog({
            content: msg,
            quickClose: true
        });
        d.show();
        setTimeout(function() {
            d.close().remove();
        }, time || 1500);
    }
    function initSms(opt){
        this.options = $.extend({}, this.defaultOptions, opt);
        var _self = this;
        $("#" + this.options.id).off("click")
            .on("click", function() {
                _self.options.checkInfo() && _self.handleSendVerifiy();
            });
    }
    initSms.prototype.defaultOptions = {
        id: "getVerification",
        mobile: "mobile",
        checkInfo: function () {
            return $("#" + this.mobile).valid();
        },
        sendCode: '805904'
    };
    initSms.prototype.handleSendVerifiy = function() {
        var verification = $("#" + this.options.id);
        verification.attr("disabled", "disabled");
        GeneralCtr.sendCaptcha(this.options.bizType, $("#" + this.options.mobile).val(), this.options.sendCode)
            .then(function() {
                for (var i = 0; i <= 60; i++) {
                    (function(i) {
                        setTimeout(function() {
                            if (i < 60) {
                                verification.val((60 - i) + "s");
                            } else {
                                verification.val("获取验证码").removeAttr("disabled");
                            }
                        }, 1000 * i);
                    })(i);
                }
            }, function(error) {
                this.options.errorFn && this.options.errorFn();
                _showMsg(error || "验证码获取失败");
                verification.val("获取验证码").removeAttr("disabled");
            });
    }
    return {
        init: function (options) {
            new initSms(options);
        }
    }
});
