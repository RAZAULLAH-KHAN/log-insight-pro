// Log Analysis Engine - TypeScript implementation of Python logic

export interface LogEntry {
  ip: string;
  timestamp: string;
  method: string;
  url: string;
  status: number;
  size: number;
  rawLog: string;
}

export interface SecurityEvent {
  ip: string;
  event: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rawLog: string;
}

export interface IPStats {
  ip: string;
  requestCount: number;
  status: 'normal' | 'suspicious' | 'critical';
}

export interface AnalysisResult {
  totalLogs: number;
  ipStats: IPStats[];
  securityEvents: SecurityEvent[];
  threatSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  attackTypes: {
    type: string;
    count: number;
  }[];
}

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = [
  { pattern: /OR\s+1\s*=\s*1/i, name: 'SQL Injection (OR 1=1)', severity: 'critical' as const },
  { pattern: /UNION\s+SELECT/i, name: 'SQL Injection (UNION)', severity: 'critical' as const },
  { pattern: /\.\.\/.*passwd/i, name: 'Directory Traversal', severity: 'critical' as const },
  { pattern: /<script>/i, name: 'Cross-Site Scripting (XSS)', severity: 'high' as const },
  { pattern: /"\s*401\s*"/i, name: 'Failed Authentication', severity: 'medium' as const },
  { pattern: /"\s*403\s*"/i, name: 'Forbidden Access', severity: 'low' as const },
  { pattern: /etc\/passwd/i, name: 'System File Access', severity: 'critical' as const },
  { pattern: /cmd\.exe|powershell/i, name: 'Command Injection', severity: 'critical' as const },
  { pattern: /SELECT.*FROM.*WHERE/i, name: 'SQL Query Pattern', severity: 'high' as const },
  { pattern: /DROP\s+TABLE/i, name: 'SQL Injection (DROP)', severity: 'critical' as const },
];

const THRESHOLD = 100; // High traffic threshold

// Parse a single log line
export function parseLogLine(line: string): LogEntry | null {
  // Standard Apache/Nginx combined log format
  const regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+-\s+-\s+\[([^\]]+)\]\s+"([A-Z]+)\s+([^\s]+)\s+HTTP\/[^"]+"\s+(\d+)\s+(\d+)/;
  const match = line.match(regex);
  
  if (match) {
    return {
      ip: match[1],
      timestamp: match[2],
      method: match[3],
      url: match[4],
      status: parseInt(match[5], 10),
      size: parseInt(match[6], 10),
      rawLog: line.trim(),
    };
  }
  return null;
}

// Analyze logs for security threats
export function analyzeLogs(lines: string[]): AnalysisResult {
  const ipCounts = new Map<string, number>();
  const securityEvents: SecurityEvent[] = [];
  const attackTypeCounts = new Map<string, number>();
  let totalLogs = 0;

  for (const line of lines) {
    if (!line.trim()) continue;
    totalLogs++;

    // Extract IP from line
    const ipMatch = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    const ip = ipMatch ? ipMatch[1] : 'Unknown';
    
    // Count IP occurrences
    ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);

    // Check for suspicious patterns
    for (const { pattern, name, severity } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(line)) {
        securityEvents.push({
          ip,
          event: name,
          pattern: pattern.source,
          severity,
          rawLog: line.trim(),
        });
        attackTypeCounts.set(name, (attackTypeCounts.get(name) || 0) + 1);
      }
    }
  }

  // Calculate IP stats
  const ipStats: IPStats[] = Array.from(ipCounts.entries()).map(([ip, count]) => ({
    ip,
    requestCount: count,
    status: count > THRESHOLD * 2 ? 'critical' : count > THRESHOLD ? 'suspicious' : 'normal',
  }));

  // Sort by request count descending
  ipStats.sort((a, b) => b.requestCount - a.requestCount);

  // Calculate threat summary
  const threatSummary = {
    critical: securityEvents.filter(e => e.severity === 'critical').length,
    high: securityEvents.filter(e => e.severity === 'high').length,
    medium: securityEvents.filter(e => e.severity === 'medium').length,
    low: securityEvents.filter(e => e.severity === 'low').length,
  };

  // Attack types breakdown
  const attackTypes = Array.from(attackTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLogs,
    ipStats,
    securityEvents,
    threatSummary,
    attackTypes,
  };
}

// Analyze a single URL/log entry
export function analyzeSingleEntry(logEntry: string): {
  isValid: boolean;
  entry: LogEntry | null;
  threats: SecurityEvent[];
} {
  const entry = parseLogLine(logEntry);
  const threats: SecurityEvent[] = [];

  if (!entry) {
    return { isValid: false, entry: null, threats: [] };
  }

  // Check for suspicious patterns
  for (const { pattern, name, severity } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(logEntry)) {
      threats.push({
        ip: entry.ip,
        event: name,
        pattern: pattern.source,
        severity,
        rawLog: logEntry.trim(),
      });
    }
  }

  return { isValid: true, entry, threats };
}

// Export results to CSV format
export function exportToCSV(result: AnalysisResult): string {
  let csv = '--- ANOMALY DETECTION: HIGH TRAFFIC IPS ---\n';
  csv += 'IP Address,Request Count,Status\n';
  
  for (const ip of result.ipStats) {
    csv += `${ip.ip},${ip.requestCount},${ip.status.toUpperCase()}\n`;
  }
  
  csv += '\n--- SECURITY EVENTS DETECTED ---\n';
  csv += 'IP Address,Event Description,Severity,Raw Log Entry\n';
  
  for (const event of result.securityEvents) {
    csv += `${event.ip},"${event.event}",${event.severity.toUpperCase()},"${event.rawLog}"\n`;
  }
  
  return csv;
}
