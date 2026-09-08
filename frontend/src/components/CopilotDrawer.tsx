import React from 'react';
import { Terminal, X, Code, CheckCircle } from 'lucide-react';
import { ToolCallLog } from '../types';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  toolCalls: ToolCallLog[];
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose, toolCalls }) => {
  if (!isOpen) return null;

  return (
    <div className="copilot_drawer">
      <div className="audit_header">
        <div className="audit_heading">
          <div className="audit_icon">
            <Terminal className="audit_icon_symbol" />
          </div>
          <div className="audit_title_group">
            <h3 className="audit_title">Tool Execution Audit Log</h3>
            <p className="audit_subtitle">Data sources used for this answer</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="drawer_close_button"
          aria-label="Close audit log"
        >
          <X className="drawer_close_icon" />
        </button>
      </div>

      <div className="tool_call_list">
        {toolCalls.length === 0 ? (
          <p className="empty_audit_message">No tool calls recorded for this prompt.</p>
        ) : (
          toolCalls.map((tc, idx) => (
            <div key={idx} className="tool_call_card">
              <div className="tool_call_header">
                <div className="tool_name_group">
                  <CheckCircle className="tool_success_icon" />
                  <span className="tool_name">{tc.tool_name}()</span>
                </div>
                <span className="tool_type_label">Deterministic Tool</span>
              </div>

              <div className="audit_section">
                <span className="audit_label">Parameters:</span>
                <pre className="json_panel parameters_panel">
                  {JSON.stringify(tc.parameters, null, 2)}
                </pre>
              </div>

              <div className="audit_section">
                <span className="audit_label">Returned DB Facts:</span>
                <pre className="json_panel result_panel">
                  {JSON.stringify(tc.result, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
