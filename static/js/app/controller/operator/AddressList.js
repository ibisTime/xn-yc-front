define([
    'app/controller/base',
    'app/interface/UserCtr',
    'Handlebars'
], function(base, UserCtr, Handlebars) {
    var userId = base.getUserId(),
        code = base.getUrlParam("c"),
        returnUrl = sessionStorage.getItem("returnhref"),
        contentTmpl = __inline("../../ui/address-items.handlebars"),
        returnStatus = base.getUrlParam("return");

    init();

    function init() {
        base.showLoading();
        getAddressList().then(base.hideLoading);
        addListeners();
    }
    // 获取地址列表
    function getAddressList() {
        return UserCtr.getAddressList()
            .then(function(data) {
                if (data.length) {
                    $("#addressDiv").append(contentTmpl({items: data}));
                    data.forEach(function(v, i) {
                        if (v.isDefault == 1) {
                            $("#addressDiv").find(".z_index0").eq(i).children("div").children(".radio-tip").addClass("active")
                        }
                    })
                    $("footer").removeClass("hidden");
                } else {
                    doError("#addressDiv", 1);
                }
            }, function(){
                doError("#addressDiv");
            });
    }
    var currentElem;
    function addListeners() {
        $("#addressDiv").on("click", "div div .radio-tip", function() {
            var me = $(this).siblings("a");
            base.showLoading();
            UserCtr.setDefaultAddr(me.attr("code"))
                .then(function(data) {
                    base.hideLoading();
                    if (returnStatus) {
                        location.href = returnUrl;
                    } else {
                        //选择刷新当前页
                        location.reload(true);
                    }
                });
        })

        $("#addressDiv").on("click", "a", function() {
            var thisCode = $(this).attr("code");
            if (code) {
                location.href = "./add_address.htm?eCode=" + thisCode + "&return=1";
            } else {
                location.href = "./add_address.htm?eCode=" + thisCode;
            }
        });

        $("#addressDiv").on("touchstart", ".addr_div", function(e) {
            e.stopPropagation();
            var touches = e.originalEvent.targetTouches[0],
                me = $(this);
            var left = me.offset().left;
            me.data("x", touches.clientX);
            me.data("offsetLeft", left);
        });
        $("#addressDiv").on("touchmove", ".addr_div", function(e) {
            e.stopPropagation();
            var touches = e.originalEvent.changedTouches[0],
                me = $(this),
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex,
                left = me.data("offsetLeft");
            if (xx > 10) {
                me.css({
                    "transition": "none",
                    "transform": "translate3d(" + (-xx / 2) + "px, 0px, 0px)"
                });
            } else if (xx < -10) {
                var left = me.data("offsetLeft");
                me.css({
                    "transition": "none",
                    "transform": "translate3d(" + (left + (-xx / 2)) + "px, 0px, 0px)"
                });
            }
        });
        $("#addressDiv").on("touchend", ".addr_div", function(e) {
            e.stopPropagation();
            var me = $(this);
            var touches = e.originalEvent.changedTouches[0],
                ex = touches.clientX,
                xx = parseInt(me.data("x")) - ex;
            if (xx > 56) {
                me.css({"transition": "-webkit-transform 0.2s ease-in", "transform": "translate3d(-56px, 0px, 0px)"});
            } else {
                me.css({"transition": "-webkit-transform 0.2s ease-in", "transform": "translate3d(0px, 0px, 0px)"});
            }
        });
        $("#addressDiv").on("click", ".al_addr_del", function(e) {
            e.stopPropagation();
            currentElem = $(this);
            $("#od-mask, #od-tipbox").removeClass("hidden");
        });

        $("#sbtn").on("click", function() {
            if (code) {
                location.href = "./add_address.htm?return=1";
            } else {
                location.href = "./add_address.htm";
            }

        });

        $("#odOk").on("click", function() {
            deleteAddress();
            $("#od-mask, #od-tipbox").addClass("hidden");
        })
        $("#odCel").on("click", function() {
            $("#od-mask, #od-tipbox").addClass("hidden");
        })
    }
    // 删除地址
    function deleteAddress() {
        base.showLoading("删除中...");
        UserCtr.deleteAddress(currentElem.prev().find("a").attr("code"))
            .then(function(data) {
                base.hideLoading();
                var addrD = $("#addressDiv");
                if (addrD.children("div").length == 1) {
                    doError("#addressDiv", 1);
                } else {
                    var $parent = currentElem.parent();
                    if (currentElem.prev().find(".radio-tip.active").length) {
                        if (!$parent.index()) {
                            $parent.next().find(".radio-tip").addClass("active");
                        } else {
                            addrD.children("div:first").find(".radio-tip").addClass("active");
                        }
                    }
                    $parent.remove();
                }
                base.showMsg('收货地址删除成功！');
            });
    }

    function doError(cc, flag) {
        var msg = "暂时无法获取数据"
        if (flag) {
            msg = "暂时没有收货地址";
            $("footer").removeClass('hidden');
        }
        $(cc).replaceWith('<div class="bg_fff" style="text-align: center;line-height: 150px;">' + msg + '</div>');
    }
});
