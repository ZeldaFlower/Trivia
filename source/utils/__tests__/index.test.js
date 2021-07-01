const index = require("../../../index"); 
jest.dontMock("../../../index");

describe('Test index', function () {

  it('works', function () {
    expect(index()).toEqual("");
  });
});

