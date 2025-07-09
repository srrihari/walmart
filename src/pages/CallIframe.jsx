import React from "react";

const CallIframe = () => {
  return (
    <iframe
      src="https://srrihariappcall.netlify.app"
      title="Call Interface"
      allow="camera; microphone; fullscreen; display-capture"
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
};

export default CallIframe;
