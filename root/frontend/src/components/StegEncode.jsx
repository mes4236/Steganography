import { useState } from "react";
import axios from "axios";

function StegEncode(props) {
  const [file, setFile] = useState(null);
  const [fileInputError, setFileInputError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(null);
  const [stegoKey, setStegoKey] = useState("");
  const [stegoKeyError, setStegoKeyError] = useState(null);
  const [encodingStatus, setEncodingSttus] = useState(false);

  function handleFileChange(e) {
    const supported_file_formats = ["jpg", "jpeg", "png"];
    if (e.target.files[0]) {
      if (
        !supported_file_formats.includes(e.target.files[0].type.split("/")[1])
      ) {
        setFile(null);
        setFileInputError("Unsupported file format.");
      } else if (e.target.files[0].size > 10000000) {
        setFile(null);
        setFileInputError("File too big.");
      } else {
        setFileInputError(null);
        setFile(e.target.files[0]);
      }
    }
  }
  function handleMessageChange(e) {
    setMessage(e.target.value);
    if (e.target.value) {
      setMessageError(null);
    }
  }
  function handleStegoKeyChange(e) {
    setStegoKey(e.target.value);
    if (e.target.value) {
      setStegoKeyError(null);
    }
  }

  function handleFormSubmit(e) {
    setEncodingSttus(true);
    e.preventDefault();
    if (!file) {
      setFileInputError("Please choose an image file!");
      setEncodingSttus(false);
      return;
    } else if (!message) {
      setMessageError("Please enter the message to encode!");
      setEncodingSttus(false);

      return;
    } else if (!stegoKey) {
      setStegoKeyError("Please enter the Stegokey!");
      setEncodingSttus(false);
      return;
    }
    const url = props.formActionPath;
    const formData = new FormData();
    formData.append("coverFile", file);
    formData.append("message", message);
    formData.append("stegoKey", stegoKey);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };
    axios
      .post(url, formData, config)
      .then((response) => {
        if (response["data"]["success"]) {
          props.onEncodeSuccess(response["data"]);
        } else {
          props.onEncodeError(response["data"]);
        }
        setEncodingSttus(false);
      })
      .catch((error) => {
        props.onEncodeError({ success: false, error: error });
        setEncodingSttus(false);
      });
  }

  return (
    <div className="w-full h-full flex justify-center mx-auto">
      <form className="flex flex-col items-center p-1 sm:p-5 gap-5">
        <div className="p-3 px-3 bg-gray-100 rounded-md w-full group">
          <label
            className="block text-gray-600 text-sm font-bold mb-2 group-hover:text-gray-800"
            htmlFor="coverFile"
          >
            Cover image file ( .jpg, .jpeg, .png )
          </label>
          <input
            type="file"
            name="coverFile"
            onChange={handleFileChange}
            className="w-full border border-gray-500 bg-gray-50 p-2 rounded-md "
          ></input>
          <p
            className={
              fileInputError ? `block text-red-500 text-sm pt-2` : `hidden`
            }
          >
            {fileInputError}
          </p>
        </div>
        <div className="p-3 px-4 bg-gray-100 rounded-md w-full group">
          <label
            className="block text-gray-600 text-sm font-bold mb-2 group-hover:text-gray-800"
            htmlFor="message"
          >
            Message
          </label>
          <input
            type="text"
            name="message"
            value={message}
            onChange={handleMessageChange}
            className="w-full border border-gray-500 rounded-md p-2"
            placeholder="Message..."
          />
          <p className={messageError ? "block text-red-500 text-sm pt-2" : ``}>
            {messageError}
          </p>
        </div>
        <div className="p-3 px-4 bg-gray-100 rounded-md w-full group">
          <label
            className="block text-gray-600 text-sm font-bold mb-2 group-hover:text-gray-800"
            htmlFor="stegoKey"
          >
            Secret key
          </label>
          <input
            type="password"
            name="stegoKey"
            value={stegoKey}
            onChange={handleStegoKeyChange}
            className="w-full border border-gray-500 rounded-md p-2"
            placeholder="Secret key..."
          />
          <p className={stegoKeyError ? `block text-red-500 text-sm pt-2` : ``}>
            {stegoKeyError}
          </p>
        </div>
        <button
          type="button"
          className={`w-full bg-gray-600 p-3 rounded-md text-gray-50 font-bold ${
            encodingStatus ? "cursor-not-allowed" : "hover:bg-gray-800"
          }`}
          disabled={encodingStatus ? true : false}
          onClick={handleFormSubmit}
        >
          {encodingStatus ? "Encoding..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default StegEncode;
