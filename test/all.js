const { test } = require('tape')
const co = require('co')
const MongoSanitize = require('../')

// Simplified Koa ctx for middleware
const DEFAULT_STATUS = 404
const DEFAULT_MESSAGE = 'Not Found'
const Ctx = (body) => {
    return {
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
const Exec = (m, body, next) => {
    let ctx = Ctx(body)
    let yields = m.call( ctx, next ).next().value
    return { ctx, next: yields }
}

test('safe payload', ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        next,
        ctx: { response: { status, body } }
    } = Exec(m, { key: '$value$$$$', obj: { ca$h: 'this is safe' } }, ok)

    equal( next, ok, 'yields next middleware' )
    equal( status, DEFAULT_STATUS, 'does not alter status' )
    equal( body, DEFAULT_MESSAGE, 'does not alter resp.body' )
    end()
})

test('unsafe payload, inject at root', ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        next,
        ctx: { response: { status, body } }
    } = Exec(m, { $where: 'dangerous server-side js' }, ok)

    equal( next, undefined, 'does not yield next middleware' )
    equal( status, EXPECT_REJECTED_STATUS, 'sets status' )
    equal( body, EXPECT_REJECTED_BODY, 'sets resp.body' )
    end()
})

test('unsafe payload, inject in nested object', ({
    end,
    equal,
    ok,
    fail
}) => {
    let m = MongoSanitize()
    let {
        next,
        ctx: { response: { status, body } }
    } = Exec(m, { obj: { $where: 'dangerous server-side js' } }, ok)

    equal( next, undefined, 'does not yield next middleware' )
    equal( status, EXPECT_REJECTED_STATUS, 'sets status' )
    equal( body, EXPECT_REJECTED_BODY, 'sets resp.body' )
    end()
})
