var endPoint = UserProperties.getProperty("TUBE_NOTIFIER_ENDPOINT");
var token = UserProperties.getProperty("TUBE_NOTIFIER_TOKEN");
var channel = UserProperties.getProperty("TUBE_NOTIFIER_CHANNEL");

// 上記の処理は非推奨なのでこちらを使用したいが、なぜか動かない
//var userProperties = PropertiesService.getUserProperties();
//var endPoint = userProperties.getProperty('TUBE_NOTIFIER_ENDPOINT');
//var token = userProperties.getProperty('TUBE_NOTIFIER_TOKEN');
//var channel = userProperties.getProperty('TUBE_NOTIFIER_CHANNEL');

function doPost() {
  var videoId = getLastVideoId();
  var relatedVideoId = searchRelatedVideo(videoId);
  var videoUrl = "https://www.youtube.com/watch?v=" + relatedVideoId;
  sendSlack(videoUrl);
  return ContentService.createTextOutput("Successful display of related video!");
}

function searchRelatedVideo(videoId) {
  var results = YouTube.Search.list("id,snippet",{
    type: "video",
    relatedToVideoId: videoId,
    maxResults: 5,
  });
  return results.items[Math.floor(Math.random() * results.items.length)].id.videoId;
}

function sendSlack(message) {
  var postData = {
    "text": message
  };
  var payload = JSON.stringify(postData);
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": payload
  };

  UrlFetchApp.fetch(endPoint, options);
}

function getLastVideoId() {
  var url = "https://slack.com/api/channels.history?token=" + token + "&channel=" + channel;
  var result = JSON.parse(UrlFetchApp.fetch(url));
  for (var i = 0; i < result.messages.length; i++) {
    var item = result.messages[i];
    var match = item.text.match(/^<https:\/\/www\.youtube\.com\/watch\?v=(.*)>$/);
    if (match) {
      return match[1];
    }
  }
}