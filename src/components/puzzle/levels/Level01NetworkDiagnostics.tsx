import React, { useState } from 'react';
import { Terminal as TerminalIcon, Wifi } from 'lucide-react';

interface PuzzleProps {
  onSolve?: (code: string) => void;
  isCompleted?: boolean;
}

export const Level01NetworkDiagnostics: React.FC<PuzzleProps> = ({ isCompleted }) => {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'SYSTEM OMEGA [NET-DIAG v4.19]',
    'SECTOR 01: TELEMETRY DOWNLINK DISRUPTED',
    'Type "help" for available diagnostic utilities.',
  ]);
  const [commandInput, setCommandInput] = useState('');
  const [activeDnsFix, setActiveDnsFix] = useState(false);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...terminalHistory, `$ ${commandInput}`];

    if (cmd === 'help') {
      newHistory.push(
        'Available commands:',
        '  ping <host>       - Probe endpoint connectivity',
        '  traceroute <host> - Trace route hops to target',
        '  nslookup <domain> - Query name server records',
        '  arp -a            - Dump ARP routing cache table',
        '  cat resolv.conf   - View local DNS resolver configuration',
        '  fix-gateway       - Restore poisoned ARP gateway mapping',
        '  clear             - Clear diagnostic screen'
      );
    } else if (cmd === 'clear') {
      setTerminalHistory(['SYSTEM OMEGA [NET-DIAG v4.19]']);
      setCommandInput('');
      return;
    } else if (cmd.startsWith('ping')) {
      newHistory.push(
        'PING omega-core.internal (10.0.0.1): 56 data bytes',
        'Request timeout for icmp_seq 0',
        'Destination Host Unreachable: Corrupted ARP gateway routing table (MAC collision).'
      );
    } else if (cmd.startsWith('traceroute')) {
      newHistory.push(
        'traceroute to 10.0.0.1 (10.0.0.1), 30 hops max',
        ' 1  192.168.1.1 (gateway) 1.205 ms [ROUTING LOOP DETECTED]',
        ' 2  192.168.1.254 (rogue-router) 2.450 ms [PACKET DROPPED]',
        ' 3  * * * Host Unreachable'
      );
    } else if (cmd.startsWith('nslookup') || cmd === 'cat resolv.conf') {
      newHistory.push(
        'Server:    127.0.0.53',
        'Address:   127.0.0.53#53',
        'nameserver 192.168.1.254 [ROGUE GATEWAY POISONING]',
        'DNS Resolver poisoned! Required authoritative gateway: 192.168.1.1',
        'Run: "fix-gateway" to flush poisoned ARP table and restore downlink.'
      );
    } else if (cmd === 'arp -a') {
      newHistory.push(
        '? (192.168.1.1) at 00:1a:2b:3c:4d:5e [ether] on eth0',
        '? (192.168.1.254) at 00:1a:2b:3c:4d:5e [POISONED DUPLICATE MAC]',
        'Notice: Gateway 192.168.1.1 is being hijacked by rogue node 192.168.1.254!'
      );
    } else if (cmd === 'fix-gateway') {
      setActiveDnsFix(true);
      newHistory.push(
        '[OK] ARP cache flushed successfully.',
        '[OK] Gateway MAC locked to static 192.168.1.1.',
        '[OK] Telemetry downlink re-established to 10.0.0.1.',
        '[DIAGNOSTIC RESTORED] Verification Token: FIX-GATEWAY-192.168.1.1'
      );
    } else {
      newHistory.push(`command not found: ${commandInput}. Type "help" for commands.`);
    }

    setTerminalHistory(newHistory);
    setCommandInput('');
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-bold">CONTAINMENT NETWORK TERMINAL</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          activeDnsFix || isCompleted ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
        }`}>
          {activeDnsFix || isCompleted ? 'GATEWAY RESTORED' : 'PACKET LOSS: 100%'}
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto space-y-1">
        {terminalHistory.map((line, i) => (
          <div key={i} className={line.startsWith('$') ? 'text-cyan-400' : line.includes('DIAGNOSTIC RESTORED') ? 'text-emerald-400 font-bold bg-emerald-950/40 p-1 rounded' : 'text-slate-300'}>
            {line}
          </div>
        ))}
      </div>

      <form onSubmit={handleCommand} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-cyan-400 font-bold">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type 'help', 'traceroute', 'arp -a', or 'fix-gateway'..."
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
        >
          EXECUTE
        </button>
      </form>
    </div>
  );
};
