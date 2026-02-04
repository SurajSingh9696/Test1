const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const config = require('../config/config');
const { generateOutputPath } = require('../utils/fileUtils');

const convertVideo = (inputPath, outputFormat, options = {}) => {
    return new Promise((resolve, reject) => {
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

        let command = ffmpeg(inputPath);

        // Resolution settings
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

        // Format-specific optimizations for faster encoding
        const format = outputFormat.toLowerCase();

        if (format === 'webm') {
            // WebM: Use libvpx with fast encoding settings
            command = command
                .videoCodec('libvpx')
                .audioCodec('libvorbis')
                .outputOptions([
                    '-cpu-used 4',        // Faster encoding (0-5, higher = faster)
                    '-deadline realtime', // Fastest encoding mode
                    '-crf 30',            // Quality (lower = better, 10-63)
                    '-b:v 1M'             // Video bitrate
                ]);
        } else if (format === 'mp4') {
            // MP4: Use fast H.264 encoding
            command = command
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-preset fast',       // Faster encoding preset
                    '-crf 23',            // Quality
                    '-movflags +faststart' // Web optimization
                ]);
        } else if (format === 'mkv') {
            // MKV: Use fast H.264 encoding
            command = command
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-preset fast',
                    '-crf 23'
                ]);
        } else if (format === 'avi') {
            // AVI: Use fast MPEG4 encoding
            command = command
                .videoCodec('mpeg4')
                .audioCodec('mp3')
                .outputOptions(['-q:v 5']);
        }

        command
            .toFormat(outputFormat)
            .on('start', (cmdLine) => {
                console.log(`[convertVideo] Starting: ${cmdLine}`);
            })
            .on('progress', (progress) => {
                console.log(`[convertVideo] Processing: ${progress.percent?.toFixed(1)}% done`);
            })
            .on('end', () => {
                console.log(`[convertVideo] Completed: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err) => {
                console.error(`[convertVideo] Error: ${err.message}`);
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
        const fs = require('fs');
        const outputPath = generateOutputPath(inputPath, outputFormat, config.convertedDir);

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log(`[extractAudio] Input: ${inputPath}`);
        console.log(`[extractAudio] Output: ${outputPath}`);
        console.log(`[extractAudio] Format: ${outputFormat}`);

        // Map format to audio codec
        const codecMap = {
            'mp3': 'libmp3lame',
            'aac': 'aac',
            'm4a': 'aac',
            'wav': 'pcm_s16le',
            'ogg': 'libvorbis',
            'flac': 'flac'
        };

        const audioCodec = codecMap[outputFormat.toLowerCase()] || 'libmp3lame';

        let command = ffmpeg(inputPath)
            .noVideo()
            .audioCodec(audioCodec)
            .audioBitrate('192k');

        // For MP3, set the output format explicitly
        if (outputFormat.toLowerCase() === 'mp3') {
            command = command.format('mp3');
        } else {
            command = command.toFormat(outputFormat);
        }

        command
            .on('start', (cmdLine) => {
                console.log(`[extractAudio] FFmpeg command: ${cmdLine}`);
            })
            .on('progress', (progress) => {
                console.log(`[extractAudio] Processing: ${progress.percent?.toFixed(1)}% done`);
            })
            .on('end', () => {
                console.log(`[extractAudio] Completed: ${outputPath}`);
                resolve({
                    success: true,
                    outputPath: outputPath,
                    filename: path.basename(outputPath)
                });
            })
            .on('error', (err, stdout, stderr) => {
                console.error(`[extractAudio] Error: ${err.message}`);
                console.error(`[extractAudio] stderr: ${stderr}`);
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
