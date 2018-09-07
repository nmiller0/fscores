
var mongoose = require('mongoose');
var request = require('request');
var Team = require("../models/team").Team;
mongoose.connect("mongodb://localhost:27018/fscores", { useNewUrlParser: true });
var http = require('http');
var fs = require('fs');
// var standingsReq = {
//     url : "http://api.football-data.org/v2/competitions/2021/standings",
//     headers: {
//         "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
//     }
// };

function genStandingsReq(id){
    var standingsReq = {
        url : "http://api.football-data.org/v2/competitions/"+id+"/standings",
        headers: {
            "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
        }
    };
    return standingsReq;
}

module.exports = {
    getTable: function getTable(id)
    {
        var standingsReq = genStandingsReq(id);
        request(standingsReq, function(error,response,body){
            if(!error){

                var results = JSON.parse(body);
                var data = results["standings"][0]["table"];

                data.forEach(function(team){
                    console.log(team);
                    Team.find({name : team["team"]["name"]}, function(err, teams){
                        if(teams.length === 0){
                            var fileName = "/res/crests/"+ team["team"]["name"] +".svg";
                            var file = fs.createWriteStream(fileName);
                            var request = http.get(team["team"]["crestURL"], function(response) {
                                response.pipe(file);
                            });
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
                                goalDifference: team["goalDifference"],
                                clubCrest : fileName 
                            });
                            newTeam.save(function (err, cat) {
                                    if (err) {
                                        console.log("ERR!");
                                    } else {
                                        console.log("CAT SAVED");
                                        console.log(cat);
                                }});
                        } else {
                            var fileName = "res/crests/"+ team["team"]["name"] +".svg";
                            var file = fs.createWriteStream(fileName);
                            var url = team["team"]["crestURL"];
                            console.log(url);
                            if (typeof url != 'undefined'){
                                var request = http.get("http://"+ team["team"]["crestURI"], function(response) {
                                    response.pipe(file);
                                });
                            }     
                            teams[0].set({
                                points: team["points"],
                                gamesPlayed: team["playedGames"],
                                wins: team["won"],
                                leagueID: id, 
                                losses: team["lost"],
                                draws: team["draw"],
                                goalsScored: team["goalsFor"],
                                goalsAgainst: team["goalsAgainst"],
                                goalDifference: team["goalDifference"],
                                clubCrest : fileName
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
    }
}