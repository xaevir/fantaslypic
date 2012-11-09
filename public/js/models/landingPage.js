if (typeof exports === 'object') {
  define = function (factory) {
    module.exports = factory(require, exports, module);
  };
  var node = true
}


define(function(require) {


return Backbone.Model.extend({

  idAttribute: "_id",

  url: '/landing',

  validation: {
    email: {
      required: true,
      pattern: 'email',
    },
    fantasy: {
      required: true,
    },
    name: {
      required: true,
    },

  },

})

})
