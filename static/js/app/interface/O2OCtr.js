define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        /*
         * 分页查询商家
         * config: {start, limit, ...}
         */
        getPageBusiness(config, refresh) {
            return Ajax.get("808217", {
                status: "2",
                userId: base.getUserId(),
                orderColumn: "ui_order",
                orderDir: "asc",
                ...config
            }, refresh);
        },
        // 详情查询商家
        getBusiness(code, refresh) {
            return Ajax.get("808218", {
                code,
                userId: base.getUserId()
            });
        },
        // 人民币埋单
        payByRmb(storeCode, amount, payType) {
            return Ajax.post("808240", {
                storeCode,
                amount,
                payType,
                userId: base.getUserId(),
                isOnlyRmb: 1
            })
        },
        // 橙券埋单
        payByCQ(storeCode, amount) {
            return Ajax.post('808240', {
                storeCode,
                amount,
                payType: 50,
                userId: base.getUserId()
            });
        },
        /*
         * 分页查询订单
         * config: {start, limit}
         */
        getPageOrders(config, refresh) {
            return Ajax.get("808245", {
                userId: base.getUserId(),
                status: 1,
                ...config
            });
        }
    };
})
