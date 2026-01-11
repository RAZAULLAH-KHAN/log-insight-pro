import { useState } from "react";
import { Shield, FileText, Activity, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { LogUploader } from "@/components/LogUploader";
import { SingleURLChecker } from "@/components/SingleURLChecker";
import { ThreatTable } from "@/components/ThreatTable";
import { IPTrafficTable } from "@/components/IPTrafficTable";
import { ThreatChart } from "@/components/ThreatChart";
import { ExportButton } from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeLogs, AnalysisResult } from "@/lib/logAnalyzer";

const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const handleLogsSubmit = (logContent: string) => {
    setIsAnalyzing(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const lines = logContent.split('\n');
      const result = analyzeLogs(lines);
      setAnalysisResult(result);
      setIsAnalyzing(false);
      setActiveTab("results");
    }, 500);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setActiveTab("upload");
  };

  const totalThreats = analysisResult 
    ? analysisResult.threatSummary.critical + analysisResult.threatSummary.high + 
      analysisResult.threatSummary.medium + analysisResult.threatSummary.low
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        {analysisResult && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatsCard
              title="Total Logs"
              value={analysisResult.totalLogs}
              subtitle="Entries analyzed"
              icon={FileText}
              variant="default"
            />
            <StatsCard
              title="Unique IPs"
              value={analysisResult.ipStats.length}
              subtitle="Detected sources"
              icon={Activity}
              variant="accent"
            />
            <StatsCard
              title="Critical"
              value={analysisResult.threatSummary.critical}
              subtitle="Immediate action"
              icon={AlertTriangle}
              variant="destructive"
            />
            <StatsCard
              title="High/Medium"
              value={analysisResult.threatSummary.high + analysisResult.threatSummary.medium}
              subtitle="Investigate soon"
              icon={Shield}
              variant="warning"
            />
            <StatsCard
              title="Status"
              value={totalThreats === 0 ? "Secure" : "At Risk"}
              subtitle={totalThreats === 0 ? "No threats found" : `${totalThreats} threats detected`}
              icon={totalThreats === 0 ? ShieldCheck : AlertTriangle}
              variant={totalThreats === 0 ? "success" : "destructive"}
            />
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="upload" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="check" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">URL Check</span>
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisResult} className="gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Results</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {analysisResult && (
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  New Analysis
                </Button>
              )}
              <ExportButton result={analysisResult} />
            </div>
          </div>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <LogUploader onLogsSubmit={handleLogsSubmit} isAnalyzing={isAnalyzing} />
              
              <div className="space-y-6">
                <div className="p-6 rounded-lg border border-primary/20 bg-primary/5">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    What We Detect
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      SQL Injection attacks (OR 1=1, UNION SELECT)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      Directory Traversal (../../etc/passwd)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      Cross-Site Scripting (XSS) attempts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      Failed authentication attempts (401)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                      Forbidden access attempts (403)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      High-traffic IP anomaly detection
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-lg border border-border bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Log Format
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Supports Apache/Nginx combined log format:
                  </p>
                  <code className="block text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto">
                    192.168.1.1 - - [10/Oct/2025:08:00:00] "GET /page HTTP/1.1" 200 1234
                  </code>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="check">
            <div className="max-w-xl">
              <SingleURLChecker />
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {analysisResult && (
              <>
                <div className="grid lg:grid-cols-2 gap-6">
                  <ThreatChart result={analysisResult} />
                  <IPTrafficTable ipStats={analysisResult.ipStats} />
                </div>
                <ThreatTable events={analysisResult.securityEvents} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>Log Analysis Security Dashboard — Python Script Interface</p>
            <p className="font-mono text-xs">
              Powered by pattern-based threat detection
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
