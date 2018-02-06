// YOUR CODE HERE:
var app = {
  server: 'http://127.0.0.1:3000',
  api: {
    getMessages: '/messages',
    postMessages: '/messages'
  },
  messages: [],
  rooms: [],
  friends: [],
  currentRoom: undefined,
  username: ''
};

app.init = function() {
  this.hideCreateRoomForm();
  $('#chats').on('click', '.username', this.handleUsernameClick);
  $('.send-new-message-form').on('submit', this.handleSubmit);
  $('#send').on('submit', this.handleSubmit);
  $('#roomSelect').on('change', this.showRoomClick);
  $('.open-create-new-room-form').on('click', this.openCreateNewRoomFormClick);
  $('.retrieve-messages').on('click', this.getMessagesForRoomClick);
  $('#createRoomButton').on('click', this.createRoomButtonClick);
  $('#cancelCreateRoomButton').on('click', this.hideCreateRoomForm);
  this.username = this.getURLParameter('username');
};

// Messages section
app.send = function(message) {
  // console.log(message);
  $.ajax({
    url: this.server + this.api.postMessages,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data) {
      console.log(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(room) {
  let options = {
    'order': '-createdAt',
  };
  if (room) {
    options.where = {'roomname': room};
  }
  
  $.ajax({
    url: this.server + this.api.getMessages,
    type: 'GET',
    data: options,
    success: function(data) {
      console.log(data);
      data.results.forEach(msg => {
        for (let k in msg) {
          msg[k] = _.escape(msg[k]);
        }
      });
      console.log(data);
      app.messages = app.messages.concat(data.results);
      app.extractRooms(data.results);
      app.messages.reduceRight((acc, el) => app.renderMessage(el));
      app.showRoomClick();
    },
    error: function(error) {
      console.log('Fetch failed:', error);
    }
  });
};

app.clearMessages = function() {
  $('#chats').text('');
};

// Display messages retrieved from the parse server.
app.renderMessage = function(message) {
  let $messageContainer = $(`<div class="messageContainer chat" data-roomname="${message.roomname || 'lobby'}"></div>`);
  let $user = $('<span class="username"></span>').text(message.username);
  let $messageText = $('<span class="messageText"></span>').text(message.text);
  $messageContainer.append($user);
  $messageContainer.append($messageText);
  $('#chats').append($messageContainer);
  // $('.username').on('click', this.handleUsernameClick);
};

app.handleSubmit = function(e) {
  e.preventDefault();
  if (!app.isValidFormByClass('.send-new-message-form')) {
    return;
  }
  app.send({
    'roomname': $('#roomSelect').val(),
    'text': $('#message').val(),
    'username': app.username
  });
  return false;
};

// Rooms section
app.extractRooms = function(data) {
  this.rooms = _.uniq(this.rooms.concat(data.map(message => message.roomname)));
  console.log(this.rooms);
  this.rooms.forEach(room => this.renderRoom(room));
};

app.renderRoom = function(roomName) {
  if (!($(`#roomSelect option[value="${roomName}"]`).text() === roomName)) { 
    let $roomNode = $(`<option value ="${roomName}">${roomName}</option>`);
    $('#roomSelect').append($roomNode);
  }
};

app.showRoomClick = function() {
  let room = $('#roomSelect option:selected').val();
  let roomMessages = app.messages.filter(x => x.roomname === room);
  app.clearMessages();
  roomMessages.forEach(msg => app.renderMessage(msg));
};

app.openCreateNewRoomFormClick = function() {
  $('.create-new-room-form').show();
};

app.hideCreateRoomForm = function(event) {
  $('.create-new-room-form').hide();
  if (event) {   
    event.preventDefault();
    event.stopPropagation();
  }
};

app.isValidFormByClass = function(formClass) {
  let formIsValid = true;
  $(`${formClass} :input:visible`).each(function() {
    if (!this.validity.valid || $(this).val() === '') {
      $(this).focus();
      formIsValid = false;
      return false;
    }
  });
  return formIsValid;
};

app.createRoomButtonClick = function(e) {
  if (!app.isValidFormByClass('.create-new-room-form')) {
    e.preventDefault();
    return;
  }
  let roomName = $('.room-name').val();
  if (_.contains(app.rooms, roomName)) {
    // TODO: display error
    return;
  }
  app.rooms.push(roomName);
  app.hideCreateRoomForm();
  app.renderRoom(roomName);
  $('#roomSelect').val(roomName); //selects the room
  app.clearMessages();
  e.preventDefault();
};

app.getMessages = function() {
  app.clearMessages();
  app.messages = [];
  app.fetch(app.currentRoom);
};

app.getMessagesForRoomClick = function() {
  app.clearMessages();
  app.messages = [];
  app.currentRoom = $('#roomSelect').val();
  app.fetch(app.currentRoom);
};

app.getMessagesAutomatically = function() {
  setInterval(app.getMessages, 2000);
};

// User section
app.handleUsernameClick = function() {
  // $(this).addClass('friend');
  let newFriendName = $(this).text();
  if (!_.contains(app.friends, newFriendName)) {
    app.friends.push(newFriendName);
  }
  $(`.username:contains("${newFriendName}")`).addClass('friend');
};


// Helper Functions
// credit: http://www.jquerybyexample.net/2012/06/get-url-parameters-using-jquery.html
app.getURLParameter = function(parameter) {
  let url = _.escape(window.location.search.substring(1));
  let variables = url.split('&');
  for (let i = 0; i < variables.length; i++) {
    let parameterName = variables[i].split('=');
    if (parameterName[0] === parameter) {
      return parameterName[1];
    }
  }
};


// Setup a way to refresh the displayed messages (either automatically
// or with a button)

// Allow users to select a user name for themself and to be able to
// send messages

// Rooms
// Allow users to create rooms and enter existing rooms - Rooms are
// defined by the .roomname property of messages, so you'll need to
// filter them somehow.

// Socializing
// Allow users to 'befriend' other users by clicking on their user name
// Display all messages sent by friends in bold
