define([
    'app/util/ajax'
], function(Ajax) {
    return {
        // 获取微信sdk初始化的参数
        getInitWXSDKConfig() {
            return Ajax.get("807910", {
                url: location.href.split('#')[0]
            }, true);
        },
        // 获取appId
        getAppId() {
            return Ajax.get("806031", {
                account: "ACCESS_KEY",
                type: "3"
            }, true);
        },
        // 发送短信
        sendCaptcha(bizType, mobile, sendCode = '805904') {
            return Ajax.post(sendCode, {
                bizType,
                mobile,
                "kind": "f1"
            });
        },
        // 获取转化汇率
        getTransRate(fromCurrency, toCurrency) {
            return Ajax.get("002051", {
                fromCurrency,
                toCurrency
            });
        },
        // 分页查询系统公告
        getPageSysNotice(start, limit, refresh) {
            return Ajax.get("804040", {
                start,
                limit,
                "pushType": 41,
                "toKind": 1,
                "channelType": 4,
                "status": 1,
                "fromSystemCode": SYSTEM_CODE
            }, refresh);
        },
        // 查询数据字典列表
        getDictList(parentKey, code = "808907"){
            return Ajax.get(code, {parentKey});
        },
        // 查询系统参数
        getSysConfig(ckey, code = "807717"){
            return Ajax.get(code, {ckey});
        },
        // 查询banner列表
        getBanner(refresh){
            return Ajax.get("806051", {
                type: "2"
            }, refresh);
        },
        // 查询导航列表
        getNavList(refresh){
            return Ajax.get("808007", {
                "parentCode": "0",
                "status": "1",
                "orderColumn": "order_no",
                "orderDir": "asc",
                "type": "2"
            }, refresh);
        },
        //获取货品商
    	getSeller() {
            return Ajax.get('805055', {
                kind: "05",
                status: "0"
            });
        },
        // 检查手机号是否被注册
        checkMobile(mobile) {
            return Ajax.post("805040", {
                mobile,
                "kind": "f1"
            });
        }
    };
})
