define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/loading/loading'
], function(base, Ajax, loading) {
    $(function() {
        var returnUrl;
        addListeners();
        init();

        function init() {
            returnUrl = base.getUrlParam("return");
            if (returnUrl) {
                $("#toRegister").attr("href", './register.html?return=' + encodeURIComponent(returnUrl));
                $("#fdPwd").attr("href", './findPwd.html?return=' + encodeURIComponent(returnUrl));
            } else {
                $("#toRegister").attr("href", './register.html');
                $("#fdPwd").attr("href", './findPwd.html');
            }
        }

        function addListeners() {
            $("#loginBtn").on('click', loginAction);
            $("#mobile").on("change", function(e) {
                validate_username();
            });
            $("#password").on("change", function() {
                validate_password();
            });
            $("#wxLogin").on("click", function(){
                loading.createLoading();
                getAppID();
            });
        }
        // 获取appId并跳转到微信登录页面
        function getAppID() {
            Ajax.get("806031", {
                    companyCode: SYSTEM_CODE,
                    account: "ACCESS_KEY",
                    type: "3"
                })
                .then(function(res) {
                    if (res.success && res.data.length) {
                        var appid = res.data[0].password;
                        var redirect_uri = location.origin + "/user/redirect.html";
                        if(returnUrl){
                            redirect_uri = redirect_uri + "?return=" + encodeURIComponent(returnUrl);
                        }
                        location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid +
                            "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                    } else {
                        loading.hideLoading();
                        base.showMsg(res.msg || "非常抱歉，微信登录失败");
                    }
                }, function() {
                    loading.hideLoading();
                    base.showMsg("非常抱歉，微信登录失败");
                });
        }

        function validate_username() {
            var username = $("#mobile")[0],
                parent = username.parentNode,
                span;
            if (username.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            } else if (!/^1[3,4,5,7,8]\d{9}$/.test(username.value)) {
                span = $(parent).find("span.warning")[1];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate_password() {
            var password = $("#password")[0],
                parent = password.parentNode,
                span;
            if (password.value == "") {
                span = $(parent).find("span.warning")[0];
                $(span).fadeIn(150).fadeOut(3000);
                return false;
            }
            return true;
        }

        function validate() {
            if (validate_username() && validate_password()) {
                return true;
            }
            return false;
        }

        function loginAction() {
            if (validate()) {
                // $("#loginBtn").attr("disabled", "disabled").val("登录中...");
                loading.createLoading("登录中...");
                var param = {
                    "loginName": $("#mobile").val(),
                    "loginPwd": $("#password").val(),
                    "kind": "f1"
                }, url = '805043';
                Ajax.post(url, {json:param})
                    .then(function(response) {
                        loading.hideLoading();
                        if (response.success) {
                            sessionStorage.setItem("user", "1");
                            sessionStorage.setItem("userId", response.data.userId);
                            sessionStorage.setItem("token",  response.data.token);
                            setTimeout(function() {
                                goBack();
                            }, 2000);
                            var amount = +response.data.amount || 0;
                            if (amount > 0) {
                                base.showMsg("每天首次登录获得积分+" + (+amount / 1000));
                                setTimeout(function() {
                                    goBack();
                                }, 2000);
                            } else {
                                goBack();
                            }
                        } else {
                            base.showMsg(response.msg);
                            sessionStorage.setItem("user", "0");
                            // $("#loginBtn").removeAttr("disabled").val("登录");
                        }
                    });
            }
        }

        function goBack() {
            if (returnUrl) {
                location.href = returnUrl;
            } else {
                location.href = "./user_info.html";
            }
        }
    });
});
