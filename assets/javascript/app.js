
var competitions = '';

$.ajax({
  headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
  url: 'http://api.football-data.org/v1/competitions/',
  dataType: 'json',
  type: 'GET',
  }).done(function(response) {

    console.log(response);
    competitions = response;
    console.log(competitions);

    for(var i = 0; i < competitions.length; i++){

      var competition_button = $('<button class="competition-btn">' + competitions[i].caption + '</button>');
      competition_button.attr('id', i);
      $('#buttons-view').append(competition_button);

    }

  });

function displayFixtures(){

  $('#fixture-view').empty();
  var current_competition = $(this).attr('id');

  $.ajax({
    headers: { 'X-Auth-Token': 'a1343c1c5d024bafb3c6be16564808e2' },
    url: competitions[current_competition]._links.fixtures.href,
    dataType: 'json',
    type: 'GET',
  }).done(function(response){

    console.log(response);
    var next_fixtures = [];
    var match_day = 0;

    for(var i = 0; i < response.fixtures.length; i++){

      if(response.fixtures[i].status == 'TIMED'){

        if(match_day == 0){

          match_day = response.fixtures[i].matchday;

        }

        if(response.fixtures[i].matchday == match_day){

          next_fixtures.push(response.fixtures[i]);

        }
      }
    }

    for(var j = 0; j < next_fixtures.length; j++){

      var away_team = next_fixtures[j].awayTeamName;
      var home_team = next_fixtures[j].homeTeamName;
      console.log(away_team + ' at ' + home_team);
      var fixture_div = $('<div>');
      fixture_div.attr('id', 'fixture');
      fixture_div.html('<a href="#">' + away_team + '</a>' + ' at ' + '<a href="#">' + home_team + '</a>');
      $('#fixture-view').append(fixture_div);

    }

  });
}

$(document).on('click', '.competition-btn', displayFixtures);