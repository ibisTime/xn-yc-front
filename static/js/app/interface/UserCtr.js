define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 微信登录
        /*
         * 微信登录
         * config: {code,mobile?,smsCaptcha?,userReferee}
         */
        wxLogin(config) {
            return Ajax.post("805151", config);
        },
        // 获取用户详情
        getUser(refresh) {
            return Ajax.get("805056", {
                "userId": base.getUserId()
            }, refresh);
        },
        // 绑定手机号
        bindMobile(mobile, smsCaptcha) {
            return Ajax.post("805151", {
                mobile,
                smsCaptcha,
                userId: base.getUserId()
            });
        },
        // 设置交易密码
        setTradePwd(tradePwd, smsCaptcha) {
            return Ajax.post('805045', {
                tradePwd,
                smsCaptcha,
                tradePwdStrength: base.calculateSecurityLevel(tradePwd),
                userId: base.getUserId(),
            });
        },
        // 修改手机号
        changeMobile(newMobile, smsCaptcha) {
            return Ajax.post("805047", {
                newMobile,
                smsCaptcha,
                userId: base.getUserId()
            });
        },
        // 详情查询地址
        getAddress(code, refresh) {
            return Ajax.get("805166", {code}, refresh);
        },
        // 查询地址列表
        getAddressList() {
            return Ajax.post("805165", {
                userId: base.getUserId(),
                isDefault: ""
            });
        },
        // 新增或修改地址
        addOrEditAddr(config) {
            return config.code ? this.editAddress(config) : this.addAddress(config);
        },
        // 修改地址
        editAddress(config) {
            return Ajax.post("805162", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 新增地址
        addAddress(config) {
            return Ajax.post("805160", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 设置为默认地址
        setDefaultAddr(code) {
            return Ajax.post("805163", {
                code,
                userId: base.getUserId()
            });
        },
        // 删除地址
        deleteAddress(code) {
            return Ajax.post("805161", {code});
        },
        // 详情查询银行卡
        getBankCard(code) {
            return Ajax.get("802017", {code});
        },
        // 列表查询银行的数据字典
        getBankList(){
            return Ajax.get("802116");
        },
        // 新增或修改银行卡
        addOrEditBankCard(config) {
            return config.code ? this.editBankCard(config) : this.addBankCard(config);
        },
        // 修改银行卡
        editBankCard(config) {
            return Ajax.post("802012", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 新增银行卡
        addBankCard(config) {
            return Ajax.post("802010", {
                userId: base.getUserId(),
                ...config
            });
        },
        // 获取银行卡列表
        getBankCardList(){
            return Ajax.get("802016", {
                userId: base.getUserId(),
                status: "1"
            });
        }
    };
})
