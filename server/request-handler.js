var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept", //X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept
  "access-control-max-age": 10, // Seconds.
  "Content-Type": "application/json"
};

var handleResponse = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var messages = [];
var objectId = 1;

var requestHandler = function(request, response) {

  console.log("Serving request type " + request.method + " for url " + request.url);
  if (request.method === "GET" && (request.url === "/classes/messages" || request.url === "/classes/room1" || request.url === "/classes/chatterbox/")) {
    handleResponse(response, {'results': messages});
  } else if (request.method === "POST" && (request.url === "/classes/messages" || request.url === "/classes/room1" || request.url === "/classes/chatterbox/")) {
    //console.log(request);
    var data = "";
    request.on("data", function(chunk){
      data += chunk;
    });
    request.on("end", function(){
      var messageInfo = JSON.parse(data);
      messageInfo.objectId = objectId++;
      messages.push(messageInfo);
      handleResponse(response, messageInfo, 201);
    });
  } else if (request.method === "OPTIONS" && (request.url === "/classes/messages" || request.url === "/classes/room1" || request.url === "/classes/chatterbox/")) {
    handleResponse(response, null);
  } else {
    handleResponse(response, null, 404);
  }
  
};


exports.requestHandler = requestHandler;
