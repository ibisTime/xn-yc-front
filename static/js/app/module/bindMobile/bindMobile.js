define([
    'jquery',
    'app/module/validate/validate',
    'app/module/loading/loading',
    'app/util/ajax'
], function ($, Validate, loading, Ajax) {
    var tmpl = __inline("bindMobile.html");
    var css = __inline("bindMobile.css");
    var defaultOpt = {};
    var first = true;
    init();
    function init(){
        $("head").append('<style>'+css+'</style>');
    }
    function getUrlParam(name, locat) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = (locat || window.location.search).substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return '';
    }
    function bindMobile(){
        loading.createLoading("关联中...");
        Ajax.post("805153", {
            json: {
                "mobile": $("#bind-mobileSms").val(),
                "userId": sessionStorage.getItem("user")
            }
        }).then(function(res){
            loading.hideLoading();
            if(res.success){
                BMobile.hideMobileCont(defaultOpt.success);
            }else{
                defaultOpt.error && defaultOpt.error(res.msg);
            }
        }, function(){
            loading.hideLoading();
            defaultOpt.error && defaultOpt.error("手机号关联失败");
        });
    }
    var BMobile = {
        addMobileCont: function (option) {
            option = option || {};
            defaultOpt = $.extend(defaultOpt, option);
            if(!this.hasMobileCont()){
                var temp = $(tmpl);
                $("body").append(tmpl);
            }
            var wrap = $("#bindMobileWrap");
            defaultOpt.title && wrap.find(".right-left-cont-title-name").html(defaultOpt.title);
            var that = this;
            if(first){
                // $("#bind-mobile-back")
                //     .on("click", function(){
                //         BMobile.hideMobileCont(defaultOpt.hideFn);
                //     });
                wrap.find(".right-left-cont-title")
                    .on("touchmove", function(e){
                        e.preventDefault();
                    });
                $("#bind-mobile-btn")
                    .on("click", function(){
                        if($("#bind-mobile-form").valid()){
                            bindMobile();
                        }
                    });
                $("#bind-mobile-form").validate({
                    'rules': {
                        "bind-mobile": {
                            required: true,
                            mobile: true
                        }
                    },
                    onkeyup: false
                });
            }

            first = false;
            return this;
        },
        hasMobileCont: function(){
            if(!$("#bindMobileWrap").length)
                return false
            return true;
        },
        showMobileCont: function (){
            if(this.hasMobileCont()){
                var wrap = $("#bindMobileWrap");
                wrap.css("top", $(window).scrollTop()+"px");
                wrap.show().animate({
                    left: 0
                }, 200, function(){
                    defaultOpt.showFun && defaultOpt.showFun();
                });

            }
            return this;
        },
        hideMobileCont: function (func){
            if(this.hasMobileCont()){
                var wrap = $("#bindMobileWrap");
                wrap.animate({
                    left: "100%"
                }, 200, function () {
                    wrap.hide();
                    func && func($("#bind-mobile").val());
                    $("#bind-mobile").val("");
                    wrap.find("label.error").remove();
                });
            }
            return this;
        }
    }
    return BMobile;
});
