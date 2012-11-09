define(function(require) {

  var expect = chai.expect,
      NewUser = require('models/newUser');

  describe("NewUser Model", function() {
    describe("initialize()", function() {
      it("should call setSlug on change:username", function() {
        var user = new NewUser()
        var spy = sinon.spy(user, 'setSlug');
        user.set({username: 'sam kin'})
        expect(spy).to.have.been.calledWith('sam kin')
      });
    });

    describe("inUniqueUsername()", function() {

    });
  });

})
