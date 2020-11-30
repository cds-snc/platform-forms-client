const { getViewData } = require('./data.helpers')

test('populates data from session', () => {
  const req = {
    body: {},
    session: { formdata: { code: '123' } },
    headers: { host: 'localhost' },
  }

  const obj = getViewData(req)
  expect(obj.data.code).toEqual('123')
})

test('populates session and includes errors', () => {
  const req = {
    body: {},
    session: { formdata: { code: '123' }, flashmessage: 'the error' },
    headers: { host: 'localhost' },
  }

  const obj = getViewData(req)
  expect(obj.data.code).toEqual('123')
  expect(obj.errors).toEqual('the error')
})

test('returns an object with additional params', () => {
  const req = {
    body: {},
    session: { formdata: { code: '123' } },
    headers: { host: 'localhost' },
  }

  const obj = getViewData(req, { file1: 'hello.js', file2: 'goodbye.js' })
  expect(obj.data.code).toEqual('123')
  expect(obj.file1).toEqual('hello.js')
  expect(obj.file2).toEqual('goodbye.js')
})
