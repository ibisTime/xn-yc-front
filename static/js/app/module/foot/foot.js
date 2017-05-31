define([
    'jquery'
], function ($) {
    var tmpl = __inline("foot.html");
    var activeImgs = [
        __inline('../../../../images/消费红@2x.png'),
        __inline('../../../../images/兑换红@2x.png'),
        __inline('../../../../images/发现红@2x.png'),
        __inline('../../../../images/个人中心红@2x.png')
    ];

    return {
        addFoot: function (idx) {
            var temp = $(tmpl);
            idx == undefined ? temp.appendTo($("body")) :
                temp.find("a:eq(" + idx + ")")
                    .addClass("active")
                    .find("img").attr("src", activeImgs[idx])
                    .end().end()
                    .appendTo($("body"));
        }
    }
});