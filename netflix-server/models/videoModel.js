const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        genre: { type: String, required: true },
        year: { type: String, required: true },
        releaseDate: { type: Date, required: true },
        runTime: { type: Number, required: true },
        description: { type: String, required: true },
        actors: [{ type: String }],
        rating: { type: Number, min: 0, max: 10 },
        production: { type: String, required: true },
        directors: [{ type: String }],
        videoLink: { type: String, required: true },
    },
    { timestamps: true },
);

const videoModel = new mongoose.model('videos', videoSchema);

module.exports = videoModel;
