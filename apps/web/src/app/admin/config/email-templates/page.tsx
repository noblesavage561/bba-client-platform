const mockTemplates = [
  { id: "t1", name: "Welcome Email", trigger: "client_registered", subject: "Welcome to BBA – Let's Build Your Future", active: true, variables: ["clientName", "portalUrl"] },
  { id: "t2", name: "Intake Confirmation", trigger: "intake_submitted", subject: "Application Received – Next Steps", active: true, variables: ["clientName", "applicationId"] },
  { id: "t3", name: "Document Request", trigger: "document_requested", subject: "Action Required: Upload Documents", active: true, variables: ["clientName", "documentList", "portalUrl"] },
  { id: "t4", name: "Stage Advancement", trigger: "stage_changed", subject: "Great News – You've Advanced to {stage}", active: true, variables: ["clientName", "newStage", "advisorName"] },
  { id: "t5", name: "Task Reminder", trigger: "task_due", subject: "Reminder: {taskTitle} is Due Soon", active: true, variables: ["clientName", "taskTitle", "dueDate"] },
  { id: "t6", name: "Document Processed", trigger: "document_processed", subject: "Your Document Has Been Processed", active: true, variables: ["clientName", "documentName"] },
  { id: "t7", name: "Funding Approved", trigger: "funded", subject: "🎉 Congratulations – You're Funded!", active: true, variables: ["clientName", "fundingAmount", "advisorName"] },
  { id: "t8", name: "Monthly Check-in", trigger: "monthly_checkin", subject: "Monthly Update from Your BBA Advisor", active: false, variables: ["clientName", "advisorName", "progressSummary"] },
];

export default function EmailTemplatesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-blue">Email Templates</h1>
          <p className="text-gray-500 mt-1">Manage automated emails sent to clients at key milestones.</p>
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-blue-light transition-colors">
          + New Template
        </button>
      </div>

      <div className="grid gap-4">
        {mockTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-brand-blue">{template.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${template.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {template.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Trigger:</span>{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{template.trigger}</code>
                </div>
                <div className="text-sm text-gray-600 italic">"{template.subject}"</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.variables.map((v) => (
                    <span key={v} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                      {"{" + v + "}"}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="text-sm text-brand-blue border border-brand-blue px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  Edit
                </button>
                <button className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
