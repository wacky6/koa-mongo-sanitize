
function deepSomeEntryIs(obj, pred) {
    for (let key in obj) {
        if ( pred( obj[key], key ) )
            return true
        if ( typeof obj[key] === 'object' )
            if ( deepSomeEntryIs(obj[key], pred) )
                return true
    }
    return false
}

function isInjection(val, key) {
    return key[0] === '$'
}

module.exports = function CreateKoaMongoSanitize({
    reject: {
        code = 400,
        body = 'Bad Request'
    } = {}
} = {}) {
    return function* KoaSanitize(next) {
        if ( deepSomeEntryIs( this.request.body, isInjection ) ) {
            this.response.status = code
            this.response.body = body
        } else {
            yield next
        }
    }
}
