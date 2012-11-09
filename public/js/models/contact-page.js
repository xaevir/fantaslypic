define(function(require) {

  return Backbone.Model.extend({
    
    url: '/contact',

    validation: {
      name: {
        required: true,
      },
      email: {
        required: true,
        pattern: 'email',
      },
      message: {
        required: true,
      },
    }, 

  })
})
