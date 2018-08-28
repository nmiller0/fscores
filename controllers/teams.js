
var mongoose = require('mongoose');
var request = require('request');
var Team = require("../models/team").Team;
mongoose.connect("mongodb://localhost:27017/fscores", { useNewUrlParser: true });

var standingsReq = {
    url : "http://api.football-data.org/v2/competitions/2021/standings",
    headers: {
        "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
    }
};

module.exports = {
    getTable: function getTable(){
        request(standingsReq, function(error,response,body){
            if(!error){
                var results = JSON.parse(body);
                var data = results["standings"][0]["table"];
                for(var i = 0; i < data.length; i++){
                    if(Team.find({name : data[i]["team"]["name"]}) === []){
                        var newTeam = {
                            name : data[i]["team"]["name"]
                        };
                        Team.create(newTeam);
                    }
                }
                console.log(Team.find());
            }
        });
    }
}