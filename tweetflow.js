/**
 * @file
 * TweetFlow implementation of jquery-twitter-plugin.
 */

function relative_time(time_value) {
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);

  if(delta < 60) {
    return 'less than a minute ago';
  }
  else if(delta < 120) {
    return 'about a minute ago';
  }
  else if(delta < (45*60)) {
    return (parseInt(delta / 60)).toString() + ' minutes ago';
  } 
  else if(delta < (90*60)) {
    return 'about an hour ago';
  } 
  else if(delta < (24*60*60)) {
    return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
  }
  else if(delta < (48*60*60)) {
    return '1 day ago';
  }
  else {
    return (parseInt(delta / 86400)).toString() + ' days ago';
  }
}

function tweetflow_run(query_text, rpp) {
  var search_url = "http://search.twitter.com/search.json?rpp=" + rpp + "&q=";
  var target = $("div.tweetflow-realtime");

  target.text('');

  $.getJSON(search_url + query_text + '&callback=?', function (data) {
    var content = '<ul class="tweetflow-wrapper">';

    $.each(data.results, function (i, item) {
      // Make url link.
      var link_regexp = /(?:^| )((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
      var user_regexp = /(?:^| )[\@]+([A-Za-z0-9-_]+)/gi;
      var hash_regexp = /(?:^| )[\#]+([A-Za-z0-9-_]+)/gi;

      text = item.text.replace(hash_regexp, ' <a href="http://search.twitter.com/search?q=&tag=$1&lang=all">#$1</a>');
      text = text.replace(user_regexp," <a href=\"http://twitter.com/$1\">@$1</a>");
      text = text.replace(link_regexp," <a href=\"$1\">$1</a>");

      content += '<li class="tweetflow-tweet">';
      content += '<div class="tweet-text">' + text + '</div>';
      content += '<div class="tweet-data">';
      content += '<div class="tweet-avatar"><img src="' + item.profile_image_url + '" width="48px" height="48px" /></div>';
      content += '<div class="tweet-data-r"><div class="tweet-from"><a href="http://twitter.com/' + item.from_user + '">' + item.from_user + '</a></div>';
      content += '<div class="tweet-when">' + relative_time(item.created_at) + '</div></div>';
      content += '</div></li>';

    });

    content += '</ul>';
    target.append(content);
  });
}

$(document).ready(function () {
  tweetflow_run(Drupal.settings.tweetflow_query, Drupal.settings.tweetflow_rpp);
});
