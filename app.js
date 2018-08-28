var teams = require("./controllers/teams");
var express = require("express");
var app = express();
var ejs = require("ejs");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require('mongoose');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/fscores", { useNewUrlParser: true });

app.use(bodyParser.urlencoded({extended: true}));
// http://api.football-data.org/v2/competitions/2114/standings
//http://api.football-data.org/v2/competitions/
var standingsReq = {
    url : "http://api.football-data.org/v2/competitions/2021/standings",
    headers: {
        "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
    }
};

var leaguesReq = {
    url : "http://api.football-data.org/v2/competitions/",
    headers: {
        "X-Auth-Token" : "43700807826d4a73a6bc70852eb1613a"
    }
};

app.get('/', function(req,res){
    request(standingsReq, function(error,response,body){
        if(!error){
            var results = JSON.parse(body);
            var data = results["standings"][0]["table"];
            //console.log(data);
            res.render("home.ejs", {results:data});
        }
    });
});

app.get('/leagues', function(req,res){
    request(leaguesReq, function(error,response,body){
        if(!error){
            var leagues = JSON.parse(body);
            //console.log(leagues);
            var usableLeagues = [];
            //console.log(leagues["competitions"])
            for(var i = 0; i < leagues["competitions"].length;i++){
                //console.log(leagues["competitions"][i]);
                //console.log(leagues["competitions"][i]["plan"]);
                var TIER = leagues["competitions"][i]["plan"];
                //console.log(typeof "TIER ONE");
                //console.log(TIER.trim() == 'TIER ONE'.trim());
                //console.log(TIER.trim() + " == " + "TIER ONE".trim());
                if(TIER === 'TIER_ONE'){
                    usableLeagues.push(leagues["competitions"][i]);
                }
            }
            console.log(usableLeagues);
            res.render("leagues.ejs", {leagues:usableLeagues});
        }
    });
 });

app.listen(3000, function(){
    console.log("server started");
    teams.getTable();
});