const mongoose = require('mongoose');
const {Schema} = mongoose;

const storiesSchema = Schema({
    publishedby: {
        type: String,
        required: true
    },
    likecounts: {
        type: Number,
        default : 0
    },
    shareCount: {
        type: Number,
        default : 0
    }
}, {
    timestamps: true
});

storiesSchema.virtual("__stories", {
    ref: "SubStories",
    localField: "_id",
    foreignField: "story"
})

module.exports = mongoose.model('Stories', storiesSchema);