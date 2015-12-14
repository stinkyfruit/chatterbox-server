var app;
$(function() {
  app = {
//TODO: The current 'addFriend' function just adds the class 'friend'
//to all messages sent by the user
    server: 'https://api.parse.com/1/classes/chatterbox/',
    username: 'anonymous',
    roomname: 'lobby',
    lastMessageId: 0,
    friends: {},

    init: function() {
      // Get username
      app.username = window.location.search.substr(10);

      // Cache jQuery selectors
      app.$main = $('#main');
      app.$message = $('#message');
      app.$chats = $('#chats');
      app.$roomSelect = $('#roomSelect');
      app.$send = $('#send');

      // Add listeners
      app.$main.on('click', '.username', app.addFriend);
      app.$send.on('submit', app.handleSubmit);
      app.$roomSelect.on('change', app.saveRoom);

      // fetch initial data
      app.fetch();

      // Poll for new messages
      setInterval(app.fetch, 3000);
    },
    send: function(data) {
      // Clear messages input
      app.$message.val('');
      // POST the message to the server
      $.ajax({
        url: app.server,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
          console.log('chat: Message sent successfully');
          // Trigger a fetch to update the messages, pass true to animate
          app.fetch();
        },
        error: function (data) {
          console.error('chat: Failed to send message');
        }
      });
    },
    fetch: function(animate) {
      $.ajax({
        url: app.server,
        type: 'GET',
        contentType: 'application/json',
        data: { order: '-createdAt'},
        success: function(data) {
          console.log('chat: Messages fetched successfully');

          // Get the last message
          var mostRecentMessage = data.results[data.results.length-1];
          var displayedRoom = $('.chat span').first().data('roomname');
          // Only bother updating the DOM if we have a new message
          if (mostRecentMessage.objectId !== app.lastMessageId || app.roomname !== displayedRoom) {
            app.updateRooms(data.results);
            app.updateMessages(data.results);
            app.lastMessageId = mostRecentMessage.objectId;
          }
        },
        error: function(data) {
          console.error('chat: Failed to fetch messages');
        }
      });
    },
    clearMessages: function() {
      app.$chats.html('');
    },
    updateMessages: function(results) {
      // Clear existing messages
      app.clearMessages();
      // Add all fetched messages
      _.each(results, app.addMessage);
    },
    updateRooms: function(results) {
      app.$roomSelect.html('<option value="__newRoom">New room...</option><option value="" selected>Lobby</option></select>');

      if (results) {
        var rooms = {};
        _.each(results, function(message) {
          var roomname = message.roomname;
          if (roomname && !rooms[roomname]) {
            // Add the room to the select menu
            app.addRoom(roomname);
            // Store that we've added this room already
            rooms[roomname] = true;
          }
        });
      }
      // Select the menu option
      app.$roomSelect.val(app.roomname);
    },
    addRoom: function(roomname) {
      var $option = $('<option/>').val(roomname).text(roomname);
      app.$roomSelect.append($option);
    },
    addMessage: function(data) {
      if (!data.roomname){
        data.roomname = 'lobby';
      }

      // Only add messages that are in our current room
      if (data.roomname === app.roomname) {
        // Create a div to hold the chats
        var $chat = $('<div class="chat"/>');
        // Store the username in the element's data
        var $username = $('<span class="username"/>');
        $username.text(data.username+': ').attr('data-username', data.username).attr('data-roomname',data.roomname).appendTo($chat);
        // Add the friend class
        if (app.friends[data.username] === true)
          $username.addClass('friend');
        var $message = $('<br><span/>');
        $message.text(data.text).appendTo($chat);
        // Add  message to the window
        app.$chats.append($chat);
      }
    },
    addFriend: function(event) {
      var username = $(event.currentTarget).attr('data-username');
      if (username !== undefined) {
        console.log('chat: Adding ',username,' as a friend');
        // Store as a friend
        app.friends[username] = true;
        // Bold all previous messages
        // Escape the username in case it contains a quote
        var selector = '[data-username="'+username.replace(/"/g, '\\\"')+'"]';
        var $usernames = $(selector).addClass('friend');
      }
    },
    saveRoom: function() {
      var selectIndex = app.$roomSelect.prop('selectedIndex');
      // New room is always the first option
      if (selectIndex === 0) {
        var roomname = prompt('Enter room name');
        if (roomname) {
          // Set as the current room
          app.roomname = roomname;
          // Add the room to the menu
          app.addRoom(roomname);
          // Select the menu option
          app.$roomSelect.val(roomname);
          // Fetch messages again
          //app.fetch();
          app.clearMessages();
        }
      }
      else {
        // Store as undefined for empty names
        app.roomname = app.$roomSelect.val();
        // Fetch messages again
        app.fetch();
      }
    },
    handleSubmit: function(evt) {
      var message = {
        username: app.username,
        text: app.$message.val(),
        roomname: app.roomname || 'lobby'
      };

      app.send(message);

      // Stop the form from submitting
      evt.preventDefault();
    }
  };

  app.init();
});