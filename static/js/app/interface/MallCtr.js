define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 获取商品大类列表
        getBigCategoryList(refresh) {
            return Ajax.get("808007", {
                "parentCode": "0",
                "status": "1",
                "orderColumn": "order_no",
                "orderDir": "asc",
                type: "1"
            }, refresh);
        },
        // 获取商品小类列表
        getSmallCategoryList(parentCode, refresh) {
            return Ajax.get("808007", {
                parentCode,
                "status": "1",
                "orderColumn": "order_no",
                "orderDir": "asc",
                type: "1"
            }, refresh);
        },
        /*
         * 分页查询商品
         * config: {start, limit, ...}
         */
        getPageProduct(config, refresh) {
            return Ajax.get("808025", {
                "status": "3",
                "orderColumn": "order_no",
                "orderDir": "asc",
                ...config
            }, refresh);
        },
        // 详情查询商品
        getProduct(code) {
            return Ajax.post("808026", {code});
        },
        /*
         * 提交订单
         * config: {productSpecsCode, quantity, toUser,
         *    pojo : {receiver,reMobile,reAddress,applyUser,applyNote,companyCode,systemCode}
         * }
         */
        submitOrder(config) {
            return Ajax.post("808050", config);
        },
        /*
         * 分页查询订单
         * config: {start, limit, status}
         */
        getPageOrders(config, refresh) {
            return Ajax.post("808068", {
                orderDir: "desc",
                orderColumn: "apply_datetime",
                applyUser: base.getUserId(),
                ...config
            });
        },
        //查询订单信息
        getOrder(code, refresh) {
            return Ajax.get("808066", {
                code
            }, refresh);
        },
        // 支付订单
        payOrder(codeList, payType) {
            return Ajax.post('808052', {codeList, payType});
        },
        // 取消订单
        cancelOrder(code) {
            return Ajax.post("808053", {
                code,
                userId: base.getUserId()
            });
        },
        // 确认收货
        confirmReceipt(code) {
            return Ajax.post('808057', {
                code,
                updater: base.getUserId()
            });
        },
        /*
         * 分页查询充值卡
         * config: {start, limit, ...}
         */
        getRechargeCards(config, refresh) {
            return Ajax.get("808615", {
                "status": 1,
                "orderColumn": "order_no",
                "orderDir": "asc",
                ...config
            }, refresh);
        },
        // 详情查询充值卡
        getRechargeCard(code, refresh) {
            return Ajax.get("808616", {code});
        },
        /*
         * 提交充值卡订单
         * config: {vproductCode, reCardno, reName, amount}
         */
        submitRechargeCardOrder(config) {
            return Ajax.post("808650", {
                "reMobile": "0",
                "applyUser": base.getUserId(),
                ...config
            });
        },
        // 橙券支付充值卡订单
        payRechargeCardOrder(codeList) {
            return Ajax.post('808651', {
                codeList,
                payType: 50
            });
        },
        // 查询充值订单
        getRechargeOrder(code, refresh) {
            return Ajax.get("808666", {code}, refresh);
        },
        // 分页查询充值订单
        getPageRechargeOrders(config, refresh) {
            return Ajax.get("808668", {
                applyUser: base.getUserId(),
                ...config
            })
        },
        // 取消充值订单
        cancelRechargeOrder(codeList, remark) {
            return Ajax.post("808652", {
                codeList,
                remark,
                updater: base.getUserId()
            });
        }
    };
})
