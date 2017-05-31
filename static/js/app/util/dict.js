define([
    'app/controller/base',
    'app/util/ajax'
], function(base, ajax) {
    var dict = {
        receiptType: {
            "1": "个人",
            "2": "企业"
        },
        fastMail: {
            "EMS": "邮政EMS",
            "STO": "申通快递",
            "ZTO": "中通快递",
            "YTO": "圆通快递",
            "HTKY": "汇通快递",
            "ZJS": "宅急送",
            "SF": "顺丰快递",
            "TTKD": "天天快递"
        },
        fundType: {
            "11": "充值",
            "-11": "取现",
            "19": "蓝补",
            "-19": "红冲",
            "-30": "购物",
            "30": "购物退款",
            "42": "确认收货，商户收钱",
            "80": "橙券代销",
            "81": "积分代发",
            "90": "姚橙O2O橙券支付",
            "91": "姚橙O2O橙券返点人民币",
            "92": "姚橙O2O人民币支付",
            "93": "姚橙O2O积分支付"
        },
        orderStatus: {
            "1": "待支付",
            "2": "待发货",
            "3": "待收货",
            "4": "已收货",
            "91": "用户取消",
            "92": "商户取消",
            "93": "快递异常"
        },
        currencyUnit: {
            '': '',
            'USB': '$',
            'CNY': '￥',
            'XB': 'S$',
            'SGD': 'S$'
        },
        indexTopImg: ['/static/images/ht1.jpg', '/static/images/ht2.jpg', '/static/images/ht3.jpg'],
        // gmjfdh_rate: "GMJFDH_RATE",
        // sjxffx_rate: "SJXFFX_RATE"
    };

    var changeToObj = function(data) {
        var data = data || [],
            obj = {};
        data.forEach(function(item) {
            obj[item.dkey] = item.dvalue;
        });
        return obj;
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});
