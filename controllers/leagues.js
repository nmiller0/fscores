
var mongoose = require('mongoose');
var Bottleneck = require("bottleneck");
var request = require('request');
var League = require("../models/league").League;
var Team = require("../models/team").Team;
mongoose.connect("mongodb://localhost:27018/fscores", { useNewUrlParser: true });

const limiter = new Bottleneck({
    minTime: 30000
  });

function genStandingsReq(id){
    var standingsReq = {
        url : "http://api.football-data.org/v2/competitions/"+id+"/standings",
        headers: {
            "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
        }
    };
    return standingsReq;
}

var leaguesReq = {
    url : "http://api.football-data.org/v2/competitions/",
    headers: {
        "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
    }
};

module.exports = {
    getLeagues: function getLeagues(){
        console.log("getLeagues fired!");     
        request(leaguesReq, function(error,response,body){
            if(!error){
                var leagues = JSON.parse(body);
                var usableLeagues = [];
                for(var i = 0; i < leagues["competitions"].length;i++){
                    var TIER = leagues["competitions"][i]["plan"];
                    if(TIER === 'TIER_ONE'){
                        usableLeagues.push(leagues["competitions"][i]);
                        var newLeague = new League({name : leagues["competitions"][i]["name"], leagueID :leagues["competitions"][i]["id"]});
                        newLeague.save(function (err, cat) {
                            if (err) {
                                console.log("ERR!");
                            } else {
                                console.log("CAT SAVED");
                                console.log(cat);
                        }});
                    }
                }
            }
        });
    },
    getTable: function getTable(id)
    {
        var standingsReq = genStandingsReq(id);
        setTimeout(function(){}, 10000);
        request(standingsReq, function(error,response,body){
            if(!error){
                var results = JSON.parse(body);
                console.log(results);
                console.log(id);
                var data = results["standings"][0]["table"];
                data.forEach(function(team){

                    Team.find({name : team["team"]["name"]}, function(err, teams){
                        if(teams.length === 0){
                            var newTeam = new Team({
                                name : team["team"]["name"],
                                leagueID: id, 
                                points: team["points"],
                                gamesPlayed: team["playedGames"],
                                wins: team["won"],
                                losses: team["lost"],
                                draws: team["draw"],
                                goalsScored: team["goalsFor"],
                                goalsAgainst: team["goalsAgainst"],
                                goalDifference: team["goalDifference"]
                            });
                            newTeam.save(function (err, cat) {
                                    if (err) {
                                        console.log("ERR!");
                                    } else {
                                        console.log("CAT SAVED");
                                        console.log(cat);
                                }});
                        } else {                            
                            teams[0].set({
                                points: team["points"],
                                gamesPlayed: team["playedGames"],
                                wins: team["won"],
                                leagueID: id, 
                                losses: team["lost"],
                                draws: team["draw"],
                                goalsScored: team["goalsFor"],
                                goalsAgainst: team["goalsAgainst"],
                                goalDifference: team["goalDifference"]
                            });
                            teams[0].save();
                        }

                    });
                });
            } else {
                console.log(reponse);
                console.log(error);
            }
            
            //debug
            Team.find({}, function(err, teams){
                console.log("FINDING TEAMS");
                console.log(teams);
            });

        });
    },
    updateTables: function updateTables(){
        League.find(function(err, leagues){
            console.log(leagues);
            leagues.forEach(function(id){
                console.log(id["leagueID"]);
                limiter.submit(module.exports.getTable, id["leagueID"], function(){
                    console.log("job ran!!");
                })
                //module.exports.getTable(id["leagueID"]);
            });
        });
    }
}
