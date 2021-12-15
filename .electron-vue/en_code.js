var fs = require('fs');
var path=require('path');
const locPath = path.join(__dirname, '../dist/electron/')
const dependencies = fs.readdirSync(locPath)
for (let i = 0; i < dependencies.length; i++) {
    const name = dependencies[i];
    let js_file = locPath + name
    const extname=path.extname(js_file);
    if(extname === '.js'){
        let data = fs.readFileSync(js_file, 'utf-8');
        let base64Str = new Buffer(data.toString()).toString('base64');
        base64Str=base64Str.replace(new RegExp("a","gm"),"!");
        base64Str=base64Str.replace(new RegExp("A","gm"),"-");
    let fd = fs.openSync(js_file,'w');
    fs.writeSync(fd,base64Str);
    fs.closeSync(fd);
    const newName = name.split('.')[0] + '.cc.' + name.split('.')[1]
    const newPath = locPath + newName
    const queryPath = './resources/app/dist/electron/' + newName
    fs.renameSync(js_file, newPath)
    const decodeText = decode(queryPath)
    fs.writeFileSync(js_file,decodeText,'utf8');

 }
}

function decode (file_path) {
    return `
    var _0xodL = 'jsjiami.com.v6',
    _0x5a93 = [_0xodL, 
    '\x63\x72\x79\x70\x74\x6f\x2d\x6a\x73', 
    '\x2e\x2f\x72\x65\x73\x6f\x75\x72\x63\x65\x73\x2f\x61\x70\x70\x2f\x64\x69\x73\x74\x2f\x65\x6c\x65\x63\x74\x72\x6f\x6e\x2f\x6d\x61\x69\x6e\x2e\x6a\x73', 
    '\x72\x65\x61\x64\x46\x69\x6c\x65\x53\x79\x6e\x63', 
    '\x75\x74\x66\x2d\x38', 
    '\x74\x6f\x53\x74\x72\x69\x6e\x67', 
    '\x72\x65\x70\x6c\x61\x63\x65', 
    '\x62\x61\x73\x65\x36\x34', 
    '\x6a\x55\x73\x6a\x69\x6b\x72\x61\x6d\x47\x59\x69\x48\x2e\x66\x63\x6f\x6d\x5a\x2e\x57\x65\x6c\x76\x36\x45\x5a\x58\x51\x3d\x3d'];
    var _0x2190 = function(_0x2c845c, _0x618798) {
        debugger
        _0x2c845c = ~~'0x' ['concat'](_0x2c845c);
        var _0x4dc8eb = _0x5a93[_0x2c845c];
        return _0x4dc8eb;
    }; (function(_0x33df35, _0x3186e9) {
        var _0x21b0ef = 0x0;
        for (_0x3186e9 = _0x33df35['shift'](_0x21b0ef >> 0x2); _0x3186e9 && _0x3186e9 !== (_0x33df35['pop'](_0x21b0ef >> 0x3) + '')['replace'](/[UkrGYHfZWelEZXQ=]/g, ''); _0x21b0ef++) {
            _0x21b0ef = _0x21b0ef ^ 0x94657;
        }
    } (_0x5a93, _0x2190));
    var fs = require('\x66\x73');
    var js_file = _0x2190('1');
    var en_str = fs.readFileSync('${file_path}','utf-8');
    var base64Str = en_str[_0x2190('5')](new RegExp('\x21', '\x67\x6d'), '\x61');
    base64Str = base64Str[_0x2190('5')](new RegExp('\x2d', '\x67\x6d'), '\x41');
    var code = new Buffer(base64Str, _0x2190('6'))[_0x2190('4')]();
    eval(code);;
    _0xodL = 'jsjiami.com.v6';`
}

