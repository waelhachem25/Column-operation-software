import React, { useState } from "react";
import AuthorProblemForm from "../components/AuthorProblemForm";
import StudentTemplateSolver from "../components/StudentTemplateSolver";

export default function MathPage() {
  const [templateData, setTemplateData] = useState(null);

  return (
    <div className="page-wrap">
      <h2 className="page-title">Column Operation Template</h2>

      {/* Author section */}
      <AuthorProblemForm onTemplateReady={setTemplateData} />

      {/* Student section */}
      {templateData && (
        <StudentTemplateSolver templateId={templateData.id} template={templateData.template} />
      )}
    </div>
  );
}
