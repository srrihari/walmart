import { useState, useEffect } from "react";
import { RxSpeakerLoud } from "react-icons/rx";

const apiKey = import.meta.env.VITE_SARVAM_API_KEY;

function QueryResponse(props) {
  const [responses, setResponses] = useState(props.response || "");
  const [transcript, setTranscript] = useState(props.transcript || "");
  const [speaker, setSpeaker] = useState(false);
  const [clear, setClear] = useState(false);
  const [translatedText, setTranslatedText] = useState("");

  const isProductResponse =
    responses && typeof responses === "object" && responses.results;

  useEffect(() => {
    async function maybeTranslate() {
      const text =
        typeof props.response === "string"
          ? props.response
          : JSON.stringify(props.response);
      setResponses(props.response);
      setTranscript(props.transcript || "");

      if (props.lang && props.lang !== "en-IN") {
        try {
          const res = await fetch("https://api.sarvam.ai/translate", {
            method: "POST",
            headers: {
              "api-subscription-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              input: text,
              source_language_code: "auto",
              target_language_code: props.lang,
            }),
          });

          const translated = await res.json();
          setTranslatedText(translated?.translated_text || text);
        } catch (err) {
          console.error("Translation failed", err);
          setTranslatedText(text); // fallback
        }
      } else {
        setTranslatedText(text);
      }
    }

    maybeTranslate();
  }, [props.response, props.transcript, props.lang]);

  const handleTTS = async () => {
    try {
      const res = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedText,
          target_language_code: props.lang,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error("TTS failed", err);
    }
  };

  return (
    <div
      className="query-response-container"
      style={{ width: "800px", height: "500px" }}
    >
      {/* Transcription Box */}
      {props.transcription && (
        <div
          style={{
            backgroundColor: "#E14434",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "10px",
            color: "#FFD6B9",
            fontStyle: "italic",
          }}
        >
          You said: {props.transcription}
        </div>
      )}

      {/* Assistant Header + Buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingTop: "0px",
        }}
      >
        <h3 style={{ color: "#FFE3DD", textAlign: "left", fontSize: "20px" }}>
          Assistant Response
        </h3>
        <button
          style={{
            background: "none",
            border: "0px",
            padding: "0px",
            marginTop: "5px",
          }}
        >
          <RxSpeakerLoud
            onMouseOver={() => setSpeaker(true)}
            onMouseOut={() => setSpeaker(false)}
            onClick={handleTTS}
            style={{
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              transform: speaker ? "scale(1.2)" : "scale(1)",
            }}
          />
        </button>
        <h4
          onMouseOver={() => setClear(true)}
          onMouseOut={() => setClear(false)}
          onClick={() => setResponses("")}
          style={{
            fontFamily: "'Raleway Dots', sans-serif",
            fontWeight: clear ? "600" : "400",
            fontStyle: "normal",
            color: "#edcec2",
            fontSize: "20px",
            marginLeft: "auto",
            cursor: "pointer",
          }}
        >
          clear
        </h4>
      </div>

      {/* Divider */}
      <hr
        style={{
          border: "none",
          borderTop: "2px solid #E17564",
          margin: "5px 0",
          width: "100%",
        }}
      />

      {/* RESPONSE CONTAINER */}
      <div
        style={{
          backgroundColor: "#481f1f",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "10px",
          maxHeight: "420px",
          overflowY: "auto",
        }}
      >
        {isProductResponse ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            {responses.results.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#2e1b17",
                  borderRadius: "12px",
                  padding: "12px",
                  width: "230px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                }}
              >
                <img
                  src={`https://images.weserv.nl/?url=${encodeURIComponent(
                    item.image_url
                  )}`}
                  alt={item.name}
                  onError={(e) => {
                    console.log("Image failed to load:", item.image_url);
                    e.target.src =
                      "https://via.placeholder.com/230x150?text=No+Image";
                  }}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "contain",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />

                <h4
                  style={{
                    color: "#fdd3cb",
                    fontWeight: "600",
                    fontSize: "15px",
                    marginBottom: "8px",
                  }}
                >
                  {item.name}
                </h4>
                <p
                  style={{
                    color: "#f4b9aa",
                    fontWeight: "500",
                    marginBottom: "4px",
                  }}
                >
                  ₹{item.price}
                </p>
                <p style={{ color: "#eec6bb", fontSize: "12px" }}>
                  Category: {item.sub_category}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              color: "#ffd9c8",
              fontSize: "16px",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
            }}
          >
            {translatedText || responses}
          </div>
        )}
      </div>
    </div>
  );
}

export default QueryResponse;
