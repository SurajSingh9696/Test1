const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertAudio = (inputPath, outputFormat, options = {}) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

        let command = ffmpeg(inputPath);

        if (options.bitrate) {
            command = command.audioBitrate(options.bitrate);
        }

        if (options.sampleRate) {
            command = command.audioFrequency(parseInt(options.sampleRate));
        }

        if (options.channels) {
            command = command.audioChannels(parseInt(options.channels));
        }

        command
            .toFormat(outputFormat)
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Audio conversion failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const trimAudio = (inputPath, startTime, duration) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase().slice(1);
        const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

        ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Audio trim failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const mergeAudio = (inputPaths, outputFormat = 'mp3') => {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(config.convertedDir, `merged_${Date.now()}.${outputFormat}`);

        let command = ffmpeg();

        inputPaths.forEach(inputPath => {
            command = command.input(inputPath);
        });

        command
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Audio merge failed: ${err.message}`));
            })
            .mergeToFile(outputPath);
    });
};

const getAudioMetadata = (inputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(new Error(`Failed to get audio metadata: ${err.message}`));
                return;
            }

            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            resolve({
                duration: metadata.format.duration,
                bitrate: metadata.format.bit_rate,
                format: metadata.format.format_name,
                codec: audioStream ? audioStream.codec_name : null,
                sampleRate: audioStream ? audioStream.sample_rate : null,
                channels: audioStream ? audioStream.channels : null
            });
        });
    });
};

module.exports = {
    convertAudio,
    trimAudio,
    mergeAudio,
    getAudioMetadata
};
