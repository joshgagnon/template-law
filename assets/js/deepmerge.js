
export default function deepmerge(target, src, options={sentinal: null, path: []}) {
    var array = Array.isArray(src);
    var dst = array && [] || {};
    if(!options.path){
        options.path = [];
    }
    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = deepmerge(target[i], e, options);
            } else {
                const index = target.indexOf(e);
                if (index === -1) {
                    dst.splice(i, 0, e);
                }
            }
            if(options.sentinal){
                options.sentinal(dst, options.path);
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            })
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    options.path = options.path.concat([key]);
                    dst[key] = deepmerge(target[key], src[key], options);
                }
                if(options.sentinal){
                    options.sentinal(dst[key], options.path.concat([key]))
                }
            }
        });
    }

    return dst;
}
