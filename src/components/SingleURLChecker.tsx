import { useState } from "react";
import { Search, Shield, ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { analyzeSingleEntry, SecurityEvent, LogEntry } from "@/lib/logAnalyzer";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: { color: 'bg-destructive text-destructive-foreground', icon: ShieldAlert },
  high: { color: 'bg-destructive/80 text-destructive-foreground', icon: ShieldAlert },
  medium: { color: 'bg-warning text-warning-foreground', icon: AlertTriangle },
  low: { color: 'bg-muted text-muted-foreground', icon: Shield },
};

export function SingleURLChecker() {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<{
    isValid: boolean;
    entry: LogEntry | null;
    threats: SecurityEvent[];
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    if (!inputValue.trim()) return;
    
    setIsChecking(true);
    // Simulate brief delay for UX
    setTimeout(() => {
      const analysisResult = analyzeSingleEntry(inputValue);
      setResult(analysisResult);
      setIsChecking(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheck();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setResult(null);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" />
          Single URL Checker
        </CardTitle>
        <CardDescription>
          Check a single log entry for security threats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder='192.168.1.1 - - [10/Oct/2025:08:00:00] "GET /page HTTP/1.1" 200 1234'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="font-mono text-xs"
          />
          <Button onClick={handleCheck} disabled={!inputValue.trim() || isChecking}>
            {isChecking ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 pt-2">
            {!result.isValid ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Invalid Log Format</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Please enter a valid Apache/Nginx log entry in combined format.
                </p>
              </div>
            ) : (
              <>
                {/* Log Entry Details */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="text-sm font-medium mb-3">Parsed Log Entry</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">IP Address:</span>
                      <span className="ml-2 font-mono">{result.entry?.ip}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <span className="ml-2 font-mono">{result.entry?.method}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">URL:</span>
                      <span className="ml-2 font-mono break-all">{result.entry?.url}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={result.entry?.status === 200 ? 'outline' : 'destructive'} className="ml-2">
                        {result.entry?.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <span className="ml-2 font-mono">{result.entry?.size} bytes</span>
                    </div>
                  </div>
                </div>

                {/* Threat Assessment */}
                <div className={cn(
                  "p-4 rounded-lg border",
                  result.threats.length > 0
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-success/10 border-success/20"
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    {result.threats.length > 0 ? (
                      <>
                        <ShieldAlert className="h-5 w-5 text-destructive" />
                        <span className="font-medium text-destructive">
                          {result.threats.length} Threat{result.threats.length > 1 ? 's' : ''} Detected
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 text-success" />
                        <span className="font-medium text-success">No Threats Detected</span>
                      </>
                    )}
                  </div>
                  
                  {result.threats.length > 0 && (
                    <div className="space-y-2">
                      {result.threats.map((threat, index) => {
                        const config = severityConfig[threat.severity];
                        const Icon = config.icon;
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/50">
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="text-sm font-medium">{threat.event}</span>
                            <Badge className={cn("ml-auto text-xs", config.color)}>
                              {threat.severity}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            <Button variant="outline" onClick={handleClear} className="w-full">
              Check Another Entry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
