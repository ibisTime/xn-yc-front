define([
    'app/controller/base',
    'app/interface/GeneralCtr',
    'app/interface/UserCtr'
], function(base, GeneralCtr, UserCtr) {
    init();
    function init() {
        addListeners();
    }
    function addListeners() {
        $("#verification").on("change", validate_verification);

        $("#password").on("change", validate_password).on("focus", function() {
            $(this).siblings(".register_verifycon").css({"display": "block"});
        }).on("blur", function() {
            $(this).siblings(".register_verifycon").css({"display": "none"});
        });
        $("#repassword").on("change", validate_repassword).on("focus", function() {
            $(this).siblings(".register_verifycon").css({"display": "block"});
        }).on("blur", function() {
            $(this).siblings(".register_verifycon").css({"display": "none"});
        });
        $("#sbtn").on("click", function() {
            setTradePwd();
        });
        $("#getVerification").one("click", handleSendVerifiy);
    }

    function handleSendVerifiy() {
        $("#getVerification").addClass("cancel-send");
        GeneralCtr.sendCaptcha("805045", sessionStorage.getItem("m"))
            .then(function() {
                for (var i = 0; i <= 60; i++) {
                    (function(i) {
                        setTimeout(function() {
                            if (i < 60) {
                                $("#getVerification").text((60 - i) + "s");
                            } else {
                                $("#getVerification").text("获取验证码").removeClass("cancel-send").one("click", handleSendVerifiy);
                            }
                        }, 1000 * i);
                    })(i);
                }
            }, function(){
                $("#getVerification").one("click", handleSendVerifiy);
                var parent = $("#verification").parent();
                var span = parent.find("span.warning")[2];
                $(span).fadeIn(150).fadeOut(3000);
            });
    }
    function validate_verification() {
        var elem = $("#verification")[0],
            parent = elem.parentNode,
            span;
        if (elem.value == "") {
            span = $(parent).find("span.warning")[0];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        } else if (!/^[\d]{4}$/.test(elem.value)) {
            span = $(parent).find("span.warning")[1];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        }
        return true;
    }

    function validate_password() {
        var elem = $("#password")[0],
            parent = elem.parentNode,
            myreg = /^[^\s]{6,16}$/,
            span;
        if (elem.value == "") {
            span = $(parent).find("span.warning")[0];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        } else if (!myreg.test(elem.value)) {
            span = $(parent).find("span.warning")[1];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        }
        return true;
    }
    function validate_repassword() {
        var elem1 = $("#password")[0],
            elem2 = $("#repassword")[0],
            parent = elem2.parentNode,
            span;
        if (elem2.value == "") {
            span = $(parent).find("span.warning")[0];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        } else if (elem2.value !== elem1.value) {
            span = $(parent).find("span.warning")[1];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        }
        return true;
    }
    function validate() {
        if (validate_verification() && validate_password() && validate_repassword()) {
            return true;
        }
        return false;
    }
    function doSuccess() {
        base.showMsg("交易密码设置成功！");
        setTimeout(function() {
            base.getBack();
        }, 1000);
    }
    function setTradePwd() {
        if (validate()) {
            base.showLoading("设置中...");
            UserCtr.setTradePwd($("#password").val(), $("#verification").val())
                .then(function() {
                    base.hideLoading();
                    doSuccess();
                });
        }
    }
});
