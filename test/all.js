const { test } = require('tape')
const MongoSanitize = require('../')

// Simplified Koa ctx for middleware
const DEFAULT_STATUS = 404
const DEFAULT_MESSAGE = 'Not Found'
const Ctx = (body) => {
    return {
        is(type) {
            // stub for is('multipart')
            return false
        },
        request: {
            body: body
        },
        response: {
            status: DEFAULT_STATUS,
            body: DEFAULT_MESSAGE
        }
    }
}

const EXPECT_REJECTED_STATUS = 400
const EXPECT_REJECTED_BODY = 'Bad Request'

// Executor
const Exec = async (m, body, next) => {
    let ctx = Ctx(body)
    await m(ctx, next)
    return ctx
}

test('safe payload', async ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        response: { status, body }
    } = await Exec(m, { key: '$value$$$$', obj: { ca$h: 'this is safe' } }, () => ok('await next()'))

    equal( status, DEFAULT_STATUS, 'does not alter status' )
    equal( body, DEFAULT_MESSAGE, 'does not alter resp.body' )
    end()
})

test('unsafe payload, inject at root', async ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        response: { status, body }
    } = await Exec(m, { $where: 'dangerous server-side js' }, () => fail('should not await next()'))

    equal( status, EXPECT_REJECTED_STATUS, 'sets status' )
    equal( body, EXPECT_REJECTED_BODY, 'sets resp.body' )
    end()
})

test('unsafe payload, inject in nested object', async ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        response: { status, body }
    } = await Exec(m, { obj: { $where: 'dangerous server-side js' } }, () => fail('should not await next()'))

    equal( status, EXPECT_REJECTED_STATUS, 'sets status' )
    equal( body, EXPECT_REJECTED_BODY, 'sets resp.body' )
    end()
})
