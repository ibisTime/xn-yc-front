define([
    'app/controller/base',
    'app/interface/UserCtr'
], function(base, UserCtr) {
    var eCode = base.getUrlParam("eCode"),
        returnUrl = sessionStorage.getItem("returnhref"),
        returnStatus = base.getUrlParam("return"),
        isDefault = 1;

    init();

    function init(){
        if (eCode) {
            getAddress();
        }
        addListener();
    }

    function addListener() {
        $("#accept_name").on("change", checkAName);
        $("#mobile").on("change", checkMobile);
        $("#provinceCode").on("change", checkPCode);
        $("#cityCode").on("change", checkCCode);
        $("#districtCode").on("change", checkDCode);
        $("#street").on("change", checkStreet);
        $("#sbtn").on("click", function() {
            if (valide()) {
                addOrEditAddr(eCode)
            }
        });
    }
    // 查询地址详情
    function getAddress() {
        UserCtr.getAddress(eCode).then(function(data) {
            var addressee = data.addressee,
                mobile = data.mobile,
                province = data.province,
                city = data.city,
                district = data.district,
                detailAddress = data.detailAddress;
            if (returnStatus) {
                isDefault = 1;
            } else {
                isDefault = data.isDefault;
            }
            $("#accept_name").val(addressee);
            $("#mobile").val(mobile);
            $("#provinceCode").val(province);
            $("#cityCode").val(city);
            $("#districtCode").val(district);
            $("#street").val(detailAddress);
        });
    }

    function addOrEditAddr(edCode) {
        base.showLoading(edCode
            ? "修改中..."
            : "新增中...");
        if (edCode) {
            var param = {
                "code": edCode,
                "addressee": $("#accept_name").val(),
                "mobile": $("#mobile").val(),
                "province": $("#provinceCode").val(),
                "city": $("#cityCode").val(),
                "district": $("#districtCode").val(),
                "detailAddress": $("#street").val(),
                "isDefault": isDefault
            };
        } else {
            var param = {
                "addressee": $("#accept_name").val(),
                "mobile": $("#mobile").val(),
                "province": $("#provinceCode").val(),
                "city": $("#cityCode").val(),
                "district": $("#districtCode").val(),
                "detailAddress": $("#street").val(),
                "isDefault": isDefault
            };
        }
        UserCtr.addOrEditAddr(param).then(function() {
            base.hideLoading();
            if (returnStatus) {
                location.href = returnUrl;
            } else {
                base.getBack();
            }
        });
    }

    function checkAName() {
        if ($("#accept_name").val() == "") {
            $("#accept_name").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if ($("#accept_name").val().length > 20) {
            $("#accept_name").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }
    function checkMobile() {
        if ($("#mobile").val() == "") {
            $("#mobile").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if (!/^1[3,4,5,7,8]\d{9}$/.test($("#mobile").val())) {
            $("#mobile").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }
    function checkPCode() {
        if ($("#provinceCode").val() == "") {
            $("#provinceCode").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if ($("#provinceCode").val().length > 20) {
            $("#provinceCode").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }
    function checkCCode() {
        if ($("#cityCode").val() == "") {
            $("#cityCode").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if ($("#cityCode").val().length > 20) {
            $("#cityCode").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }
    function checkDCode() {
        if ($("#districtCode").val() == "") {
            $("#districtCode").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if ($("#districtCode").val().length > 20) {
            $("#districtCode").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }
    function checkStreet() {
        if ($("#street").val() == "") {
            $("#street").next().fadeIn(300).fadeOut(2000);
            return false;
        } else if ($("#street").val().length > 128) {
            $("#street").next().next().fadeIn(300).fadeOut(2000);
            return false;
        }
        return true;
    }

    function valide() {
        if (checkAName() && checkMobile() && checkPCode() && checkCCode() && checkDCode() && checkStreet()) {
            return true;
        }
        return false;
    }
});
