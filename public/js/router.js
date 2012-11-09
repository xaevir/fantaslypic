define(function(require) {

var ModelExtended = require('models/modelExtended')
  , SignupView = require('views/users/signup').signup
  , LoginView = require('views/users/login').login
  , SubjectsNav = require('views/subjects_nav')
  , Subjects = require('collections/subjects')
  , Subject = require('models/subject')
  , Messages = require('collections/messages')
  , Message = require('models/message')
  , ContactedCompanies = require('collections/contacted-companies')
  , Subjects = require('collections/subjects')
  , Subject = require('models/subject')
  , ChatColumns = require('views/chatColumns')
  , MessageBodyView = require('views/messageBody')
  , MessagesView = require('views/messages')
  , ProfileView = require('views/users/profile')
  , ProfileEditView = require('views/users/profile-edit')
  , ProfileMenuView = require('views/profile-menu')
  , ContactedCompaniesView = require('views/contacted-companies')
  , ChatCompositeView = require('views/chatComposite')         
  , ReplyView = require('views/reply').Reply
  , ReplyLeadView = require('views/reply').Lead
  , ReplySellerView = require('views/reply').Seller
  , instructionsTpl = require('text!templates/instructions.mustache')
  , UserMenu = require('views/user-menu')
  , User = require('models/user')
  , NewUser = require('models/newUser')
  , MainMenu = require('views/main-menu')         
  , Spider = require('views/spider')         
  , BubblesView = require('views/bubbles')         
  , InstructionsView = require('views/site/alert').instructions
  , AlertContainedView = require('views/site/alert').contained
  , ContactView = require('views/contact')

var rp = Backbone.Router.prototype
var _route = rp.route;
rp.route = function(route, name, callback) {
  return _route.call(this, route, name, function() {
    //this.trigger.apply(this, ['beforeroute:' + name].concat(_.toArray(arguments)));
    this.reset(name)
    callback.apply(this, arguments);
    this.modernizr()
  });
};

var AppRouter = Backbone.Router.extend({

  initialize: function() {
    _.bindAll(this); 
    this.user = new User(window.user) 
    this.on('all', this.setupNav)
    //this.on('all', this.highlight)
    window.events = _.clone(Backbone.Events)
    window.dispatcher.on('session:logout', this.logout, this)
    this.router = new Backbone.Router()

    events.on("messageAdded-Reply.js", function(chatCompositeView, message) {
      chatCompositeView.messagesView.addOne(message)
    }); 

    var self = this
    events.on("subjectCreated-create_subject.js", function() {
      self.navigate('subjects', {trigger: true})
    });

  },

  routes: {
      'signup':                                 'signup'
    , 'signup/:type':                           'signup'
    , 'login':                                  'login'
    , 'contact':                                'contact'
    , 'how-it-works':                           'how_it_works'
    , 'profile/:username':                      'profile'
    , 'profile/:username/edit':                 'profile_edit'
    , 'subjects':                               'subjects' 
    , 'subjects/:id':                           'subject' 
    , 'helper/:id':                             'helper' 
    , 'subjects/:id/contacted-companies':       'contacted_companies' 
    , 'subjects/:id/seller':                    'seller' 
    , 'subjects':                               'subjects'
    , 'subjects/:id':                           'subject'
    , 'lead/:id/:slug':                         'lead'
    , 'spider':                                 'spider'
    , '':                                       'home'
    , 'home/:thankyou':                         'home'
    , 'admin':                                  'admin'
    , 'electronic-repair':                      'electronic_repair'
    , 'how-it-works':                           'how_it_works'
    , '*actions':                               'notFound'
  },
}) 
AppRouter.prototype.notFound = function(){
  $('#app').html('<h1 style="text-align: center">404 Error: This page was not found</h1>')
}

AppRouter.prototype.setupNav = function(route, section){
  var isHome = false
  if (route === 'route:home' || route === 'route:electronic_repair')
    isHome = true
  new MainMenu({ el: $("#main-menu"), user: this.user, isHome: isHome}).render()
  new UserMenu({ el: $("#user-menu"), model: this.user}).render()
}

AppRouter.prototype.modernizr = function(){
   Modernizr.load({
     test: Modernizr.input.placeholder,
     nope: ['/js/libs/HTML5-placeholder-polyfill/placeholder_polyfill.min.css',
            '/js/libs/HTML5-placeholder-polyfill/placeholder_polyfill.jquery.min.combo.js']
   });
} 

AppRouter.prototype.reset = function(route, section) {
  $('#notification').html(''); //clear alerts
  route = route.replace('route:', '');
  if(this.prev_route)
    if(_.has(this, 'reset_'+this.prev_route)){
      var path = 'reset_'+this.prev_route 
      this[path]()
    }
  this.prev_route = route
}

AppRouter.prototype.getUser = function() {
  var self = this
  $.ajax({ 
    url: "/user", 
    async: false, 
    success: function(user) {   
      if (user) self.user.set(user)
    }
  });
}


AppRouter.prototype.spider = function(){
  this.view = new Spider({context: 'main'})
  this.view.render()
  $('#app').html(this.view.el)
  document.title = 'Spider'
  _gaq.push(['_trackPageview', '/spider'])
}

AppRouter.prototype.subjects  = function(e) {
  var self = this
  $.get('/subjects', function(subjects) {
    $('body').attr('id','subjects')
    var views = []
    _.each(subjects, function(subject){
      var chatCompositeView = new ChatCompositeView(
        {
          bigTextarea: true, 
          user: self.user, 
          noReply: true,
          timer: subject.timer,
          model: new Subject(subject)
        })
      var messages = new Messages(subject)
      chatCompositeView.messagesView = new MessagesView({collection: messages, truncate: 200, user: self.user})
      if (self.user.get('role') == 'admin')
        $(chatCompositeView.el).prepend('<div class="admin-options">shortId:'+subject.shortId+'</div>')
        //$(chatCompositeView.el).prepend('<div class="admin-options"><a href="/subjects/'+subject_id+'/setup">setup</a></div>')

      views.push(chatCompositeView);
   }, this);
    var view = new ChatColumns({views: views})
    var html =  view.render().el
    $('#app').html(html);
    _gaq.push(['_trackPageview', '/subjects'])
    document.title = 'Subjects';
  });
}

AppRouter.prototype.reset_subjects = function(){
  $('body').removeAttr('id')
}

AppRouter.prototype.subject = function(id) {
  var self = this
  $.get('/subjects/'+id, function(res) {
    $('body').attr('id','subject')
    if (res.success === false)
      return self.notFound()
    // header
    var chatCompositeView = new ChatCompositeView({user: self.user, noReply: true})
    var messages = new Messages(res.subject)
    chatCompositeView.messagesView = new MessagesView({collection: messages, user: self.user})
    chatCompositeView.replyView = new ReplyView({subject_id: id, 
                                                 parentView: chatCompositeView, 
                                                 context: 'subject',
                                                 bigTextarea: true,
                                                 user: self.user})
    $('#app').html('<div id="header" />')
    $('#header', '#app').html(chatCompositeView.render().el);
    // body
    var views = []
    _.each(res.messages, function(message){
      var chatCompositeView = new ChatCompositeView({noReply: true, user: self.user})
      var messages = new Messages(message)
      chatCompositeView.messagesView = new MessagesView({collection: messages, user: self.user})
      var opts = {
        convo_id: message._id,
        subject_id: message.subject_id,
        parentView: chatCompositeView,
        user: self.user
      }
      chatCompositeView.replyView = new ReplyView(opts)
      views.push(chatCompositeView);
   }, this);
    var view = new ChatColumns({views: views, columns: 3, span: 4})
    var html =  view.render().el
    $('#app').append('<div id="body" />')
    $('#body' ,'#app').append(html);
    _gaq.push(['_trackPageview', '/subjects/'+ res.subject.body])
    document.title = 'Subject';
  });
}

AppRouter.prototype.reset_subject = function(){
  $('body').removeAttr('id')
}

AppRouter.prototype.seller = function(id, slug) {
  $.get('/subjects/'+id+'/seller', $.proxy(function(res) {
    $('body').addClass('_lead seller')
    var message = '<div class="instructions"><h2>How this page works</h2>\
      <p>You have a lead from a potential buyer. To send a message to the lead\
         all you have to do is reply in the box below.\
      </p></div>'
    $('#app').html(message)
    var messages = new Messages([res.subject])
    var bubblesView = new BubblesView({collection: messages,
                                       user: this.user})
    $('#app').append(bubblesView.render().el)
    var opts = {convo_id: res.convo_id,
                subject_id: res.subject_id,
                collection: messages,
                user: this.user}
    var replySellerView = new ReplySellerView(opts)
    $('button', replySellerView.render().el).addClass('btn-large btn-success')
    $('#app').append(replySellerView.el)

    var ul = $('.bubbles')[0];
    var height = ul.scrollHeight
    ul.scrollTop = height
    _gaq.push(['_trackPageview', '/lead/'+ res.subject.body])
    document.title = 'Ruby Rate';
  }, this));
}

AppRouter.prototype.reset_seller = function(){
  $('body').removeClass('_lead seller')
}

AppRouter.prototype.lead = function(id, slug) {
  $('body').addClass('_lead')

  $.get('/lead/'+id+'/'+slug, $.proxy(function(res){
    this.getUser()
    $('#app').html('')
    var message = '<div class="instructions"><h2>How this page works</h2>\
      <p>To continue your conversation just fill in the box at the bottom.\
      </p></div>'
    $('#app').html(message)

    var messages = new Messages(res.messages)
    var bubblesView = new BubblesView({collection: messages,
                                       user: this.user})
    $('#app').append(bubblesView.render().el)
    var opts = {convo_id: res.convo_id,
                subject_id: res.subject_id,
                collection: messages,
                user: this.user}
    var replyLeadView = new ReplyLeadView(opts)
    $('button', replyLeadView.render().el).addClass('btn-large btn-success')
    $('#app').append(replyLeadView.el)

    var ul = $('.bubbles')[0];
    var height = ul.scrollHeight
    ul.scrollTop = height
    _gaq.push(['_trackPageview', '/lead/'+ res.subject.body])
    document.title = 'Ruby Rate';
   
  }, this));
}

AppRouter.prototype.reset_lead = function(){
  $('body').removeClass('lead')
}

AppRouter.prototype.helper = function(id) {
  $.get('/helper/'+id, $.proxy(function(res){
    $('body').attr('id','helper')
    if (res.success === false)
      return this.notFound()
    this.getUser()
    $('#app').html('')
    var message = '<div class="instructions"><h2>How this page works</h2>\
      <p>Shown below are answers to your request. You can respond to any \
         company you are interested in by clicking on the reply.\
      </p></div>'
    $('#app').html(message)

    var tpl = '<div class="you"><div class="bubble-green bubble-header">\
                <blockquote>{{{body}}}</blockquote>\
              </div>'
              //<div class="author">You</div></div>'

    tpl = Hogan.compile(tpl)
    tpl = tpl.render(res.subject)
    $('#app').append(tpl)
    
    _gaq.push(['_trackPageview', '/helper/'+ res.subject.body])
    document.title = 'Ruby Rate - Helper';
    var views = []
    _.each(res.conversations, function(convo){
      var chatCompositeView = new ChatCompositeView({user: this.user, unread: convo.value.unread})
      var messages = new Messages(convo.value.comments)
      chatCompositeView.messagesView = new MessagesView({collection: messages, user: this.user})
      var opts = {
        convo_id: convo._id,
        subject_id: convo.value.comments[0].subject_id,
        parentView: chatCompositeView,
        user: this.user
      }
      chatCompositeView.replyView = new ReplyView(opts)
      views.push(chatCompositeView);
   }, this);
    var view = new ChatColumns({views: views, columns: 2, span: 6})
    var html =  view.render().el
    $('#app').append(html);
    $.each($('.scrollable'), function(index, ul) { 
      var unread = $('.msg-unread', ul)[0]
      if (unread)
        var height1 = unread.scrollHeight
      else 
        var height1 = 0
      var height = ul.scrollHeight
      var total = height-height1
      ul.scrollTop = total 
    });
  }, this));
}

AppRouter.prototype.reset_helper = function(){
  $('body').removeAttr('id')
}

AppRouter.prototype.contacted_companies = function(id) {
  $.get('/subjects/'+id+'/contacted-companies', $.proxy(function(res) {
    $('body').attr('id','contacted-companies')
    // header
    $('#app').html('<div class="chat-composite" />')
    var message =  new Message(res.subject)
    var subjectHeader = new MessageBodyView({model: message, 
                                          user: this.user})
    $('.chat-composite','#app').html(subjectHeader.render().el);

    // body
    var contactedCompanies = new ContactedCompanies(res.contacted, 
                                                    {subjects_id: message.id})
    contactedCompanies.subjects_id = message.id 
    var view = new ContactedCompaniesView({collection: contactedCompanies})
    $('#app').append(view.render().el);
  }, this));
}

AppRouter.prototype.reset_contacted = function(){
  $('body').removeAttr('id')
}


AppRouter.prototype.profileMenu = function(userSlug){
  if (this.user.isLoggedIn()){ 
    if (this.user.get('slug') == userSlug){
      this.profileMenuView = new ProfileMenuView({user: this.user})
      var template = this.profileMenuView.render().el
      $('#main-menu').after(template)
    }
  }
}


AppRouter.prototype.how_it_works = function() {

}

AppRouter.prototype.profile = function(userSlug){
  this.profileMenu(userSlug) 
  $.get('/profile/'+userSlug, function(user) {
    var view = new ProfileView(user)
    $('#app').html(view.render(user).el)
    _gaq.push(['_trackPageview', '/profile/'+ user.slug])
    document.title = user.username + ' on Rubyrate'
  })
}

AppRouter.prototype.reset_profile = function(){
  if (this.profileMenuView)
    this.profileMenuView.remove()
}

AppRouter.prototype.profile_edit = function(username){
  var self = this
  $.get('/profile/'+username+'/edit', function(user) {
    var view = new ProfileEditView({user: self.user})
    $('#app').html(view.render(user).el)
    _gaq.push(['_trackPageview', '/profile/'+ user.slug+'/edit'])
    document.title = 'Editing '+user.username+ ' on Rubyrate'
  })
}

AppRouter.prototype.alreadyLoggedIn = function(callback) { 
  if (this.user.isLoggedIn()) 
    return this.navigate('/', true) 
  callback.apply(this, Array.prototype.slice.call(arguments,1)); 
}

AppRouter.prototype.restrict = function(callback) { 
  if (!this.user.isLoggedIn()) 
    return this.navigate('/login', true)
  callback.apply(this, Array.prototype.slice.call(arguments,1)); 
}


AppRouter.prototype.login = _.wrap(function(){
    var view = new LoginView({className: 'small-content', user: this.user}).render()
    $('#app').html(view.el)
    document.title = 'Login'
    _gaq.push(['_trackPageview', '/login'])
  }, AppRouter.prototype.alreadyLoggedIn)

AppRouter.prototype.signup = _.wrap(function(type){ 
    this.signupView = new SignupView(
      {
        model: new NewUser(), 
        type: type,
        className: 'small-content',
        user: this.user
      })
    this.signupView.render();
    $('#app').html(this.signupView.el)
    document.title = 'Sign Up'
    _gaq.push(['_trackPageview', '/signup'])
  }, 
  AppRouter.prototype.alreadyLoggedIn
)

AppRouter.prototype.contact = function(){
  var view = new ContactView()
  $('#app').html(view.render().el)
  document.title = 'Contact'
  _gaq.push(['_trackPageview', '/contact'])
}


AppRouter.prototype.highlight = function(route, section) {
  route = route.replace('route:', '/');
  if (route === '/home') route = '/' 
  var hrefString = "a[href='" + route + "']"
  var el = $(hrefString, '.navbar');
  if (el.parent().hasClass('active')) return
  else {
    $('.navbar li.active').removeClass('active');
    var parent = el.parent(); 
    if (route== '/') return 
    parent.addClass('active');
  }
}

return AppRouter
});
