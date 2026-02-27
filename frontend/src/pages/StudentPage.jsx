import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import StudentTemplateSolver from "../components/StudentTemplateSolver";
import { getStudentTemplate } from "../services/api";

export default function StudentPage() {
  const { templateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setTemplate(null);
      try {
        const res = await getStudentTemplate(templateId);
        if (!active) return;
        setTemplate(res.template);
      } catch (e) {
        if (!active) return;
        setError(e?.response?.data?.message || "Invalid or missing problem link.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [templateId]);

  if (loading) {
    return (
      <div className="page-wrap">
        <h2 className="page-title">Student Mode</h2>
        <p>Loading problem...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="page-wrap">
        <h2 className="page-title">Student Mode</h2>
        <p style={{ color: "#ad2338" }}>
          {error || "Invalid or missing problem link. Please ask your teacher for the correct link."}
        </p>
        <Link to="/author">Go to Author Mode</Link>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 className="page-title">Student Mode</h2>
      <StudentTemplateSolver templateId={templateId} template={template} />
    </div>
  );
}
