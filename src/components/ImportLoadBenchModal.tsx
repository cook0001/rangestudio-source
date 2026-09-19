import React, { useState } from 'react';
import { X, FileUp, Check } from 'lucide-react';
import { ingestBallisticsPayload, IngestedRecipe } from '../utils/interchange';

interface ImportLoadBenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (recipe: IngestedRecipe) => void;
}

export const ImportLoadBenchModal: React.FC<ImportLoadBenchModalProps> = ({
  isOpen,
  onClose,
  onIngest,
}) => {
  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = () => {
    setErrorMsg(null);
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please paste the contents of a .loadbench or .wildcat file.');
      return;
    }

    const recipe = ingestBallisticsPayload(trimmed);
    if (recipe) {
      onIngest(recipe);
      onClose();
    } else {
      setErrorMsg('Unable to parse file. Please verify it is a valid LoadBench (.loadbench / .ldb) recipe or Wildcat Studio (.wildcat / .wcs) specification.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileUp size={16} color="var(--accent-green)" />
            <span style={{ fontSize: '13px', fontWeight: 700 }}>
              Import Load Recipe (.loadbench / .wildcat)
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Directly import cartridge and projectile parameters from <strong>LoadBench</strong> (<code>.loadbench</code> / <code>.ldb</code>) or <strong>Wildcat Studio</strong> (<code>.wildcat</code> / <code>.wcs</code>) to prefill velocity, BC, and bullet geometry.
          </div>

          <div>
            <label className="input-label">Choose File from Disk:</label>
            <input
              type="file"
              accept=".loadbench,.ldb,.wildcat,.wcs,.json"
              onChange={handleFileUpload}
              style={{ fontSize: '12px', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="input-field">
            <label className="input-label">Or Paste File Contents (JSON):</label>
            <textarea
              className="input-control"
              rows={8}
              style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
              placeholder="Paste .loadbench or .wildcat JSON payload here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--accent-red)', fontSize: '11px' }}>
              {errorMsg}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-action">Cancel</button>
          <button onClick={handleProcess} className="btn-primary">
            <Check size={13} />
            <span>Load into Trajectory Solver</span>
          </button>
        </div>
      </div>
    </div>
  );
};
