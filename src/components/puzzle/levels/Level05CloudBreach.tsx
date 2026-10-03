import React, { useState } from 'react';
import { Cloud, File } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
}

export const Level05CloudBreach: React.FC<PuzzleProps> = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-bold">AWS S3 / CLOUD STORAGE BUCKET EXPLORER</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px]">
            PUBLIC ACL: READABLE BY ANYONE
          </span>
        </div>

        <div className="text-slate-400">URI: s3://omega-backup-vault-public-2026/</div>

        <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div
            onClick={() => setSelectedFile('policy.json')}
            className={`p-2 rounded cursor-pointer flex items-center gap-2 ${selectedFile === 'policy.json' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-850'}`}
          >
            <File className="w-4 h-4 text-cyan-400" /> bucket-policy.json
          </div>
          <div
            onClick={() => setSelectedFile('credentials.env')}
            className={`p-2 rounded cursor-pointer flex items-center gap-2 font-bold ${selectedFile === 'credentials.env' ? 'bg-slate-800 text-amber-300' : 'text-amber-400 hover:bg-slate-850'}`}
          >
            <File className="w-4 h-4 text-amber-400" /> credentials-vault-exfil.env
          </div>
        </div>

        {selectedFile === 'policy.json' && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 space-y-1">
            <pre className="text-[11px] text-cyan-300">
{`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::omega-backup-vault-public-2026/*"
  }]
}`}
            </pre>
          </div>
        )}

        {selectedFile === 'credentials.env' && (
          <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/50 text-slate-300 space-y-1">
            <div className="text-rose-400 font-bold mb-1">EXFILTRATED SECRETS DUMP:</div>
            <div>AWS_ACCESS_KEY_ID=<span className="text-emerald-400 font-bold">AKIA-OMEGA-EXFIL-9482</span></div>
            <div>AWS_SECRET_ACCESS_KEY=9aF7xL90Qp...[REDACTED]</div>
            <div>REGION=us-east-1</div>
            <div className="text-[10px] text-slate-500 pt-1">
              Objective: Submit the compromised 20-character AWS Access Key ID.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
