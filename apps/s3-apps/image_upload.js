import aws from 'aws-sdk';
import { success, failure } from '../../inc/response';
import sha1 from 'sha1';
const s3 = new aws.S3();
const moment = require('moment');
const unixTime = require('unix-time')
const fileType = require('file-type');

//getFile function
let getFile = function(fileMime, buffer) {
    let fileExt = fileMime.ext
    let hash = sha1(new Buffer(new Date().toString()))
    let now = moment().format('YYYY-MM-DD HH:mm:ss')

    let filePath = hash + '/'
    let fileName = unixTime(now) + '.' + fileExt
    let fileFullName = filePath + fileName
    let fileFullPath = '/' + fileFullName

    let params = {
      Bucket: 'YOUR_BUCCKET',
      Key: fileFullName,
      Body: buffer
    }

    let uploadFile = {
      size: buffer.toString('ascii').length,
      type: fileMime.mime,
      name: fileName,
      full_path: fileFullPath,
    }
    return {
      'params': params,
      'uploadFile': uploadFile
    }
}
// main function
export function main(event, context, callback) {

  console.log(event);
  
  let request = JSON.parse(event.body)
  let base64String = request.base64String
  let buffer = new Buffer(base64String, 'base64')
  let fileMime = fileType(buffer)

  if(fileMime == null) {
    callback(failure({ status: false, message: "not supported file type" }))
  }
  
  let file = getFile(fileMime, buffer)
  let params = file.params

  s3.putObject(params, function(err, data) {
    if(err) {
      console.log(err);
      callback(failure({ status: false, message: err }))
    }
    else {
      console.log(data);
      callback(success({ status: true, message: data }))
    }
  })
}