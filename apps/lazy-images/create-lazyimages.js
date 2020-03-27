const AWS = require("aws-sdk");
const IM = require('imagemagick');
const FS = require('fs');
const secret = require('./inc/secret.json');
const compressedJpegFileQuality = 0.2;
const compressedPngFileQuality = 0.95;

exports.handler = (event, context, callback) => {
  console.log(event);
  var quality = '';
  const s3 = new AWS.S3();
  const sourceBucket = secret.sourceBucket;
  const destinationBucket = secret.destinationBucket;
  const objectKey = event.Records[0].s3.object.key;
  const splitKey = event.Records[0].s3.object.key.split('/');
  const resizedFileName = '/tmp/' + splitKey[splitKey.length-1];

  const getObjectParams = {
    Bucket: sourceBucket,
    Key: objectKey
  };
  s3.getObject(getObjectParams, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      console.log("S3 object retrieval get successful.");

      if (resizedFileName.toLowerCase().includes("png")) {
        quality = compressedPngFileQuality;
      } else {
        quality = compressedJpegFileQuality;
      }
      const resize_req = {
        width: "60",
        height: "60",
        srcData: data.Body,
        dstPath: resizedFileName,
        quality: quality,
        progressive: true,
        strip: true
      };
      IM.resize(resize_req, function(err, stdout) {
        if (err) {
          throw err;
        }
        console.log('stdout:', stdout);
        const content = new Buffer(FS.readFileSync(resizedFileName));
        const uploadParams = {
          Bucket: destinationBucket,
          Key: objectKey,
          Body: content,
          ContentType: data.ContentType,
          StorageClass: "STANDARD"
        };
        s3.upload(uploadParams, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
            console.log("S3 compressed object upload successful.");
          }
        });
      });
    }
  });
};