define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 获取账户
        getAccount(refresh) {
            return Ajax.get("802503", {
                userId: base.getUserId()
            }, refresh);
        },
        // 账户的橙券购买
        payCQ(amount, payType, toUserId = SYSTEM_USERID) {
            return Ajax.post("802420", {
    			toUserId,
                amount,
                payType,
                fromUserId : base.getUserId(),
                currency: "CB"
            })
        },
        // 账户余额微信充值
        recharge(amount, openId) {
            return Ajax.post("802710", {
                amount,
                openId,
                applyUser: base.getUserId(),
                channelType: 35
            });
        },
        /*
         * 分页查询流水
         * config: {start, limit, accountNumber}
         */
        getPageFlow(config) {
            return Ajax.get("802524", config);
        },
        // 卡券充值
        rechargeByCard(couponCode) {
            return Ajax.post("805321", {
                couponCode,
                userId: base.getUserId()
            });
        },
        /*
         * 取现
         * config: {accountNumber,payCardNo,remainAmount,amount,applyUser,applyNote,tradePwd,payCardInfo}
         */
        withDraw(config) {
            return Ajax.post("802750", {
                applyUser: base.getUserId(),
                ...config
            });
        }
    };
})
