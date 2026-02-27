import React, { useState } from "react";
import AuthorProblemForm from "../components/AuthorProblemForm";

export default function AuthorPage() {
  const [shareUrl, setShareUrl] = useState("");

  const onTemplateReady = (data) => {
    const url = `${window.location.origin}/student/${data.id}`;
    setShareUrl(url);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    alert("Student link copied!");
  };

  return (
    <div className="page-wrap">
      <h2 className="page-title">Author Mode (Teacher / Data Entry)</h2>

      <AuthorProblemForm onTemplateReady={onTemplateReady} />

      {shareUrl && (
        <div className="link-box">
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Student Link</div>
          <div className="link-row">{shareUrl}</div>
          <div className="inline-actions">
            <button className="btn btn-secondary" onClick={copy}>
              Copy Link
            </button>
            <a href={shareUrl}>
              <button className="btn btn-primary" type="button">
                Open Student View
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
