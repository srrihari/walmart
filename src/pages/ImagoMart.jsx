import { useState } from "react";
import axios from "axios";
import ImageUpload from "../components/ImageUpload";
import AudioRecord from "../components/AudioRecord";
import SendIcon from "@mui/icons-material/Send";
import QueryResponse from "./Response";

function ImagoMart() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState(null); // now stores structured response
  const [imageFile, setImageFile] = useState(null);
  const [transcription, setTranscription] = useState("");

  async function queryResponse() {
    try {
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log("VITE_TEST_KEY:", import.meta.env.VITE_TEST_KEY);
        console.log("🌍 All envs:", import.meta.env);
        console.log("🔑 IMGBB KEY:", import.meta.env.VITE_IMGBB_API_KEY);

        const imgbbRes = await axios.post(
          `https://api.imgbb.com/1/upload?key=${
            import.meta.env.VITE_IMGBB_API_KEY
          }`,
          formData
        );

        imageUrl = imgbbRes.data.data.url;
        console.log(imageUrl);
      }

      const res = await axios.post("http://localhost:3001/shop", {
        prompt: text,
        imageUrl,
      });

      setResponse(res.data);
      setText("");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setResponse({ error: err.response.data.error });
      } else {
        setResponse({ error: "Something went wrong. Try again." });
      }
    }
  }

  const handleTranscription = (text) => {
    setTranscription(text);
    setText(text); // optional: auto-fill text input with transcript
  };

  return (
    <div
      className="ai-query-bot-container"
      style={{ marginTop: "100px", gap: "10px" }}
    >
      <div
        className="query-input-container"
        style={{ margin: "0", maxWidth: "400px" }}
      >
        <div
          className="image-audio-container"
          style={{ marginTop: "-20px", marginRight: "0" }}
        >
          <ImageUpload onImageSelect={setImageFile} />
          <AudioRecord
            onTranscriptionReady={handleTranscription}
            customStyle={{
              maxWidth: "600px",
              minHeight: "200px",
              background: "#872341",
              margin: "0px",
              padding: 0,
            }}
          />
        </div>
      </div>
      <div>
        <div style={{ overflow: "auto" }}>
          <div className="Response-container">
            <QueryResponse
              response={response}
              transcription={transcription}
              lang="en-IN"
              warning={response?.warning}
              error={response?.error}
            />
          </div>
        </div>
        <div className="input-submit-container">
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
            className="query-input-text-containter"
            style={{ marginLeft: "95px", background: "#872341" }}
          />
          <SendIcon
            onClick={queryResponse}
            className="query-submit-button"
            sx={{ fontSize: 40, color: "#872341" }}
            role="button"
          />
        </div>
      </div>
    </div>
  );
}

export default ImagoMart;
