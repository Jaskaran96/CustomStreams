const { Writable } = require("node:stream");
const fs = require("node:fs");
class CustomWriteStream extends Writable {
  constructor({ highWaterMark, fileName }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;
    this.chunks = [];
    this.chunksLength = 0;
  }

  //This is run after the constructor is run, none of the other methods of the stream will run unless we call the callback succesfully fron the _construct method
  _construct(callback) {
    //If the callback is called with an error then the stream will close while giving that error otherwise the stream will continue as normal.
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
        return;
      }
      this.fd = fd;
      callback();
    });
  }

  // this method will is used to override the write method of the Writable stream
  //The callback is invoked when the data has been successfully flushed from the stream and if another write method is called before the callback has been executed, the data will be buffered.

  _write(chunk, encoding, callback) {
    //Unless the encoding is mentioned, the chunk will be a buffer
    this.chunks.push(chunk);
    this.chunksLength += chunk.length;
    //console.log(`Called for chunk ${chunk.toString("utf-8")}`);
    if (this.chunksLength >= this.writableHighWaterMark) {
      //console.log(`buffer full for ${chunk.toString("utf-8")}`);
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          callback(err);
          return;
        }
        this.chunks = [];
        this.chunksLength = 0;
        //console.log(`buffer flushed for ${chunk.toString("utf-8")}`);
        callback();
      });
    } else {
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) {
        return callback(err);
      }
      // fs.close(this.fd, (err) => {
      //   if (err) {
      //     return callback(err);
      //   }
      //   //the finish event is emmitted upon calling this callback from _finish method
      //   callback();
      // });
    });
  }

  _destroy(err, callback) {
    console.log("Destroy is called!");
    if (this.fd) {
      fs.close(this.fd, (err) => {
        if (err) {
          return callback(err);
        }
        callback();
      });
    }
  }
}

module.exports = CustomWriteStream;
