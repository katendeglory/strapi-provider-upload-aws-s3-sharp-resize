'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk');
const Sharp = require('sharp');

module.exports = {
  init({ optimize, ...config }) {

    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise(async (resolve, reject) => {

          let buffer = file.buffer;

          //resize with sharp
          if (optimize.resize) {
            console.log(`🔃 Resizing... ${file.name}`);
            buffer = await Sharp(file.buffer)
              .toFormat('jpeg')
              .jpeg({ quality: 90, progressive: true })
              .resize({ width: optimize.width, height: optimize.height })
              .toBuffer();
            console.log("✅ Resizing Done...");
          }

          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          console.log(`🔃 Uploading ${path}${file.hash}${file.ext}...`);

          S3.upload(
            {
              Key: `${path}${file.hash}${file.ext}`,
              Body: Buffer.from(buffer, 'binary'),
              ACL: 'public-read',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) return reject(err);
              // set the bucket file url
              file.url = data.Location;
              console.log("✅ Uploading Done...");
              resolve();
            }
          );

        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            { Key: `${path}${file.hash}${file.ext}`, ...customParams, },
            (err, data) => {
              if (err) return reject(err);
              S3.deleteObject(
                { Key: `thumbnail_${path}${file.hash}${file.ext}`, ...customParams, },
                (err, data) => {
                  if (err) return reject(err);
                  resolve();
                }
              );
            }
          );
        });
      },
    };
  },
};