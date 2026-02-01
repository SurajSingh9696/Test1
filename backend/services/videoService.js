const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertVideo = (inputPath, outputFormat, options = {}) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

        let command = ffmpeg(inputPath);

        if (options.resolution) {
            const resolutions = {
                '4k': '3840x2160',
                '1080p': '1920x1080',
                '720p': '1280x720',
                '480p': '854x480',
                '360p': '640x360'
            };
            const size = resolutions[options.resolution] || options.resolution;
            command = command.size(size);
        }

        if (options.videoBitrate) {
            command = command.videoBitrate(options.videoBitrate);
        }

        if (options.audioBitrate) {
            command = command.audioBitrate(options.audioBitrate);
        }

        if (options.fps) {
            command = command.fps(parseInt(options.fps));
        }

        command
            .toFormat(outputFormat)
            .on('progress', (progress) => {
                console.log(`Processing: ${progress.percent}% done`);
            })
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Video conversion failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const compressVideo = (inputPath, quality = 'medium') => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase().slice(1);
        const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

        const crfValues = {
            'low': 28,
            'medium': 23,
            'high': 18
        };

        const crf = crfValues[quality] || 23;

        ffmpeg(inputPath)
            .outputOptions([`-crf ${crf}`, '-preset medium'])
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Video compression failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const trimVideo = (inputPath, startTime, duration) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase().slice(1);
        const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

        ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .outputOptions(['-c copy'])
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Video trim failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const extractAudio = (inputPath, outputFormat = 'mp3') => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

        ffmpeg(inputPath)
            .noVideo()
            .toFormat(outputFormat)
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Audio extraction failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const changeResolution = (inputPath, resolution) => {
    return new Promise((resolve, reject) => {
        const ext = path.extname(inputPath).toLowerCase().slice(1);
        const outputPath = generateOutputPath(inputPath, ext, config.convertedDir);

        const resolutions = {
            '4k': '3840x2160',
            '1080p': '1920x1080',
            '720p': '1280x720',
            '480p': '854x480',
            '360p': '640x360'
        };

        const size = resolutions[resolution] || resolution;

        ffmpeg(inputPath)
            .size(size)
            .on('end', () => {
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                reject(new Error(`Resolution change failed: ${err.message}`));
            })
            .save(outputPath);
    });
};

const getVideoMetadata = (inputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(new Error(`Failed to get video metadata: ${err.message}`));
                return;
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            resolve({
                duration: metadata.format.duration,
                bitrate: metadata.format.bit_rate,
                format: metadata.format.format_name,
                width: videoStream ? videoStream.width : null,
                height: videoStream ? videoStream.height : null,
                fps: videoStream ? eval(videoStream.r_frame_rate) : null,
                videoCodec: videoStream ? videoStream.codec_name : null,
                audioCodec: audioStream ? audioStream.codec_name : null
            });
        });
    });
};

module.exports = {
    convertVideo,
    compressVideo,
    trimVideo,
    extractAudio,
    changeResolution,
    getVideoMetadata
};
