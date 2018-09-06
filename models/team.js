var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
    name: String,
    league: String,
    leagueID: Number,
    points: Number,
    gamesPlayed: Number,
    wins: Number,
    losses: Number,
    draws: Number,
    goalsScored: Number,
    goalsAgainst: Number,
    goalDifference: Number,
});
  
var Team = mongoose.model('Team', TeamSchema);

module.exports = {
    Team: Team
}

