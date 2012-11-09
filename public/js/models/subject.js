if (typeof exports === 'object' && typeof define !== 'function') {
  define = function (factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require) {

  return Backbone.Model.extend({

    idAttribute: "_id",

    url: '/subjects',

    defaults: {
      //label: 'subject' 
    },

    validation: {
      author:      {required: true},
      authorSlug:  {required: true},
      body:        {required: true},
      location:    {required: true},
    }

  })

})
