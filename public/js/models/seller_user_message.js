define(function(require) {

var NewUser = require('models/newUser')

return NewUser.extend({

  idAttribute: "_id",

  validation: {
    username:    NewUser.prototype.validation.username,
    body:        {required: true},
  },

  parse: function(res){
    if (res.success === true)  
      return 
  }

})

})
