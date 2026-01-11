import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LogUploaderProps {
  onLogsSubmit: (logs: string) => void;
  isAnalyzing: boolean;
}

export function LogUploader({ onLogsSubmit, isAnalyzing }: LogUploaderProps) {
  const [logContent, setLogContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain" || file?.name.endsWith('.log')) {
      readFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLogContent(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setLogContent("");
    setFileName(null);
  };

  const handleAnalyze = () => {
    if (logContent.trim()) {
      onLogsSubmit(logContent);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Upload Log File
        </CardTitle>
        <CardDescription>
          Drag & drop a log file or paste log entries directly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept=".log,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className={cn(
              "h-10 w-10 mx-auto mb-3 transition-colors",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
            <p className="text-sm font-medium text-foreground">
              {fileName ? (
                <span className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {fileName}
                </span>
              ) : (
                "Drop log file here or click to browse"
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports .log and .txt files
            </p>
          </label>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Or paste log entries:
            </label>
            {logContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Textarea
            placeholder="192.168.1.1 - - [10/Oct/2025:08:00:00] &quot;GET /index.html HTTP/1.1&quot; 200 2370"
            value={logContent}
            onChange={(e) => setLogContent(e.target.value)}
            className="font-mono text-xs h-32 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {logContent ? `${logContent.split('\n').filter(l => l.trim()).length} log entries` : 'Paste Apache/Nginx combined log format'}
          </p>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!logContent.trim() || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
              Analyzing Logs...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Analyze Logs
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
