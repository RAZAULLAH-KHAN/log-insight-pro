import { useState } from "react";
import { Shield, ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Search } from "lucide-react";
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
import { SecurityEvent } from "@/lib/logAnalyzer";
import { cn } from "@/lib/utils";

interface ThreatTableProps {
  events: SecurityEvent[];
}

const severityConfig = {
  critical: { color: 'bg-destructive text-destructive-foreground', priority: 1 },
  high: { color: 'bg-destructive/80 text-destructive-foreground', priority: 2 },
  medium: { color: 'bg-warning text-warning-foreground', priority: 3 },
  low: { color: 'bg-muted text-muted-foreground', priority: 4 },
};

export function ThreatTable({ events }: ThreatTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'severity' | 'ip'>('severity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredEvents = events.filter(event =>
    event.ip.includes(searchTerm) ||
    event.event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'severity') {
      const diff = severityConfig[a.severity].priority - severityConfig[b.severity].priority;
      return sortOrder === 'asc' ? diff : -diff;
    } else {
      return sortOrder === 'asc' ? a.ip.localeCompare(b.ip) : b.ip.localeCompare(a.ip);
    }
  });

  const displayedEvents = sortedEvents.slice(0, visibleCount);

  const toggleSort = (column: 'severity' | 'ip') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: 'severity' | 'ip' }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-3 w-3 ml-1 inline" /> : 
      <ChevronDown className="h-3 w-3 ml-1 inline" />;
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Security Events
            </CardTitle>
            <CardDescription>
              {events.length} security events detected
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by IP or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-success mb-4" />
            <h3 className="text-lg font-medium text-foreground">All Clear!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No security threats detected in the analyzed logs.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('ip')}
                    >
                      IP Address <SortIcon column="ip" />
                    </TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => toggleSort('severity')}
                    >
                      Severity <SortIcon column="severity" />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Raw Log</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedEvents.map((event, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{event.ip}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.severity === 'critical' || event.severity === 'high' ? (
                            <ShieldAlert className="h-4 w-4 text-destructive flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                          )}
                          <span className="text-sm">{event.event}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", severityConfig[event.severity].color)}>
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <code className="text-xs text-muted-foreground truncate block max-w-xs">
                          {event.rawLog.substring(0, 60)}...
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {sortedEvents.length > visibleCount && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 20)}
                >
                  Load More ({sortedEvents.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
