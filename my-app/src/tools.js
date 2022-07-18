//#region [Url Tools]
function fixUrl(url) {
    if (url.startsWith('http') || url.startsWith('https'))
        return url;
    return 'http://' + url;
}

function getName(url) {
    let res = url.split('/').pop();
    if (res.includes('.'))
        res = res.split('.')[0];
    var format = /[ `!@#$%^&*()+=\[\]{};':"\\|,<>\/?~]/;
    if (format.test(res))
        return "";
    return res;
}

function urlToName(url) {
    let res = url.replace(/^https?:\/\//, '');
    res = res.replace(/^www\./, '');
    res = res.replace(/\//g, '_');
    res = res.replace(/\./g, '-');
    return res;
}

function checkIcon(url) {
    return url.includes('svg');
}

//#endregion

//#region [List Tools]
function removeElm(list, elm) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].elm == elm)
            list.splice(i, 1);
        }
    return list;
}
//#endregion

module.exports = {
    fixUrl,
    getName,
    checkIcon,
    urlToName
}