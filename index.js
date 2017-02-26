
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
    return async function KoaSanitize(ctx, next) {
        let payload = ctx.is('multipart') ? ctx.request.body.fields : ctx.request.body
        if ( deepSomeEntryIs( payload, isInjection ) ) {
            ctx.response.status = code
            ctx.response.body = body
        } else {
            await next()
        }
    }
}
