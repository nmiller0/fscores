var mongoose = require('mongoose');

var TeamSchema = new mongoose.Schema({
    name: String,
    points: Number,
    gamesPlayed: Number,
    wins: Number,
    losses: Number,
    draws: Number,
    goalsScored: Number,
    goalsAgainst: Number,
    goalDifference: Number,
  });
  
  var Item = mongoose.model('Team', ItemSchema);
  
  module.exports = {
    Team: Team
  }

  