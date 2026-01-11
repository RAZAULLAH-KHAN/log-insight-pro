import { useState } from "react";
import { Globe, AlertCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IPStats } from "@/lib/logAnalyzer";
import { cn } from "@/lib/utils";

interface IPTrafficTableProps {
  ipStats: IPStats[];
}

const statusConfig = {
  normal: { color: 'bg-muted text-muted-foreground', label: 'Normal' },
  suspicious: { color: 'bg-warning text-warning-foreground', label: 'Suspicious' },
  critical: { color: 'bg-destructive text-destructive-foreground', label: 'Critical' },
};

export function IPTrafficTable({ ipStats }: IPTrafficTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [visibleCount, setVisibleCount] = useState(15);

  const filteredStats = ipStats.filter(stat =>
    stat.ip.includes(searchTerm)
  );

  const sortedStats = [...filteredStats].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.requestCount - a.requestCount 
      : a.requestCount - b.requestCount;
  });

  const displayedStats = sortedStats.slice(0, visibleCount);

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              IP Traffic Analysis
            </CardTitle>
            <CardDescription>
              {ipStats.length} unique IPs detected
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>IP Address</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground"
                  onClick={toggleSort}
                >
                  Request Count
                  {sortOrder === 'desc' ? 
                    <ChevronDown className="h-3 w-3 ml-1 inline" /> : 
                    <ChevronUp className="h-3 w-3 ml-1 inline" />
                  }
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Traffic Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedStats.map((stat, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">{stat.ip}</TableCell>
                  <TableCell className="font-mono">
                    {stat.requestCount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-xs", statusConfig[stat.status].color)}>
                      {stat.status === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {statusConfig[stat.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="w-full bg-muted rounded-full h-2 max-w-32">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          stat.status === 'critical' ? 'bg-destructive' :
                          stat.status === 'suspicious' ? 'bg-warning' : 'bg-primary'
                        )}
                        style={{ 
                          width: `${Math.min((stat.requestCount / (ipStats[0]?.requestCount || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {sortedStats.length > visibleCount && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setVisibleCount(prev => prev + 20)}
            >
              Load More ({sortedStats.length - visibleCount} remaining)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
