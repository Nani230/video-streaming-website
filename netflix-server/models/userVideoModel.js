const mongoose = require('mongoose');

const userVideoSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        video: { type: mongoose.Schema.Types.ObjectId, ref: 'videos' },
        currentTime: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['playing', 'finished'],
            default: 'playing',
        },
    },
    { timestamps: true },
);

const userVideoModel = new mongoose.model('user-videos', userVideoSchema);

module.exports = userVideoModel;
