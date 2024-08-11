import ReactCompareImage from "react-compare-image";
import StegEncode from "./StegEncode";
import { useState } from "react";
import StegDecode from "./StegDecode";

function StegContainer(props) {
  const [coverFilePath, setCoverFilePath] = useState("");
  const [stegoFilePath, setStegoFilePath] = useState("");
  const [decodedMessage, setDecodedMessage] = useState(null);
  const [decodingError, setDecodingError] = useState(null);
  const [encodingError, setEncodingError] = useState(null);

  function EncodeSuccess(data) {
    setCoverFilePath(data.coverFilePath);
    setStegoFilePath(data.stegoFilePath);
    setEncodingError(null);
  }
  function EncodeError(error) {
    setEncodingError(error["error"]);
  }

  function onDecodeSuccess(data) {
    if (data["success"]) {
      setDecodedMessage(data["decodedText"]);
      setDecodingError(null);
    } else {
      setDecodingError(data["reason"]);
      setDecodedMessage(null);
    }
  }
  function onDecodeError(err) {
    alert(err);
  }

  return (
    <div className="p-2">
      <div className="flex flex-col justify-center border border-gray-400 rounded-md p-2 gap-2">
        <div className="bg-gray-50 text-xl font-bold text-gray-700 p-2 rounded-md">
          <h3>{`${props.stegTechnique} based image steganography:`}</h3>
        </div>
        <div className="flex flex-col gap-5 p-2 sm:ml-3">
          <div className="flex flex-col gap-5 p-2 border border-gray-300 rounded-md">
            <h3 className=" text-gray-700 font-bold">Encode</h3>
            <StegEncode
              onEncodeSuccess={EncodeSuccess}
              onEncodeError={EncodeError}
              formActionPath={props.encodeUri}
            />
            {encodingError && (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="pl-3 text-red-600">{encodingError}</p>
              </div>
            )}
            {coverFilePath !== "" && stegoFilePath !== "" && !encodingError && (
              <div className="flex flex-col p-1 border border-gray-300 rounded-md gap-3">
                <div className="flex flex-row items-center py-2">
                  <div className="flex w-full justify-center">
                    Original image
                  </div>
                  <div className="flex w-full justify-center">
                    Encoded image
                  </div>
                </div>
                <div className="flex justify-center w-full">
                  <ReactCompareImage
                    leftImage={coverFilePath}
                    rightImage={stegoFilePath}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <a
                    className="py-2 px-3 border border-gray-700 text-gray-800 hover:bg-gray-500 hover:text-gray-50 rounded-md"
                    href={stegoFilePath}
                    download
                  >
                    Download encoded image
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5 p-2 border border-gray-300 rounded-md">
            <h3 className=" text-gray-700 font-bold">Decode</h3>
            <StegDecode
              formActionPath={props.decodeUri}
              onDecodeSuccess={onDecodeSuccess}
              onDecodeError={onDecodeError}
            />
            {decodingError && (
              <div className="p-3 bg-red-50 rounded-md">
                <p className="pl-3 text-red-600">{decodingError}</p>
              </div>
            )}
            {decodedMessage && (
              <div className="p-3 bg-teal-50 rounded-md">
                <p className="text-teal-700 text-sm pb-2">
                  {"Decoded message:"}
                </p>
                <p className="pl-3 font-bold text-teal-800">{decodedMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StegContainer;
