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
        $("#mobile").on("change", validate_mobile);
        $("#sbtn").on("click", function(e) {
            changeMobile();
        });
        $("#getVerification").one("click", function innerFunc() {
            if (validate_mobile()) {
                handleSendVerifiy();
            } else {
                $("#getVerification").one("click", innerFunc);
            }
        });
    }

    //修改手机号，修改验证码
    function handleSendVerifiy() {
        $("#getVerification").addClass("cancel-send");
        GeneralCtr.sendCaptcha("805047", $("#mobile").val())
            .then(function() {
                for (var i = 0; i <= 60; i++) {
                    (function(i) {
                        setTimeout(function() {
                            if (i < 60) {
                                $("#getVerification").text((60 - i) + "s");
                            } else {
                                $("#getVerification").text("获取验证码").removeClass("cancel-send").one("click", function innerFunc() {
                                    if (validate_mobile()) {
                                        handleSendVerifiy();
                                    } else {
                                        $("#getVerification").one("click", innerFunc);
                                    }
                                });
                            }
                        }, 1000 * i);
                    })(i);
                }
            }, function() {
                $("#getVerification").one("click", function() {
                    if (validate_mobile()) {
                        handleSendVerifiy();
                    } else {
                        $("#getVerification").one("click", innerFunc);
                    }
                });
                var parent = $("#verification").parent();
                var span = parent.find("span.warning")[2];
                $(span).fadeIn(150).fadeOut(3000);
            });
    }
    function validate_mobile() {
        var elem = $("#mobile")[0],
            parent = elem.parentNode,
            span;
        if (elem.value == "") {
            span = $(parent).find("span.warning")[0];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        } else if (!/^1[3,4,5,7,8]\d{9}$/.test(elem.value)) {
            span = $(parent).find("span.warning")[1];
            $(span).fadeIn(150).fadeOut(3000);
            return false;
        }
        return true;
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

    function validate() {
        if (validate_mobile() && validate_verification()) {
            return true;
        }
        return false;
    }
    function checkMobile() {
        GeneralCtr.checkMobile($("#mobile").val())
            .then(function() {
                finalChangeMobile();
            }, function(){
                var parent = $("#mobile").parent();
                var span = parent.find("span.warning")[2];
                $(span).fadeIn(150).fadeOut(3000);
            });
    }
    function doSuccess() {
        $("#sbtn").text("设置");
        base.showMsg("手机号修改成功！");
        setTimeout(function() {
            location.href = './user_info.html';
        }, 1000);
    }
    function finalChangeMobile() {
        $("#sbtn").attr("disabled", "disabled").text("设置中...");
        UserCtr.changeMobile($("#mobile").val(), $("#verification").val())
            .then(doSuccess, function(){
                $("#sbtn").removeAttr("disabled").text("设置");
            });
    }
    function changeMobile() {
        if (validate()) {
            checkMobile();
        }
    }
});
