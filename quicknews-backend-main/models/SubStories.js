const mongoose = require('mongoose');
const {Schema} = mongoose;

const  subStoriesSchema = Schema({
    story: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    text: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chooseFile: {
        type: String,
        required: false,
      }
});

module.exports = mongoose.model('SubStories', subStoriesSchema);
