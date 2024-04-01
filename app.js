const CustomWriteStream = require("./customWriteable");

const writeStream = new CustomWriteStream({
  highWaterMark: 8,
  fileName: "./empty.txt",
});

let curFileNumber = 1;
let maxNumber = 10000000;
let stream;
const writeToFile = () => {
  while (curFileNumber <= maxNumber) {
    const buff = Buffer.from(`${curFileNumber} `, "utf-8");

    curFileNumber++;

    //   `cur size ${stream.writableLength} and buff size is ${buff.length} and ${curFileNumber}`
    // );
    if (curFileNumber === maxNumber + 1) {
      return stream.end(buff);
    }

    // stream.write will return false if the buffer is full, thus we will return and wait for the drain event to empty the buffer

    if (!stream.write(buff)) {
      return;
    }
    //console.log(stream.writableLength);
  }
};
async function writeNumbersToFile(filePath) {
  let fd;
  try {
    stream = writeStream;

    stream.on("drain", () => {
      console.log("drain event called");
      writeToFile();
    });

    stream.on("finish", () => {
      console.timeEnd("writeToFile");
      fd.close();
    });

    writeToFile();

    // const internalBufferSize = stream.writableHighWaterMark;
    // const bufferBytesFilled = stream.writableLength;
    //console.timeEnd("writeMany");
  } catch (err) {
    console.error(err);
  }
}

// Usage
console.time("writeToFile");
writeNumbersToFile("./empty.txt");
