import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisResult } from "@/lib/logAnalyzer";
import { PieChartIcon, BarChart3 } from "lucide-react";

interface ThreatChartProps {
  result: AnalysisResult;
}

const SEVERITY_COLORS = {
  critical: 'hsl(0, 72%, 51%)',
  high: 'hsl(0, 72%, 65%)',
  medium: 'hsl(38, 92%, 50%)',
  low: 'hsl(215, 20%, 65%)',
};

const ATTACK_COLORS = [
  'hsl(142, 70%, 45%)',
  'hsl(0, 72%, 51%)',
  'hsl(38, 92%, 50%)',
  'hsl(200, 95%, 50%)',
  'hsl(280, 60%, 60%)',
  'hsl(320, 70%, 50%)',
  'hsl(160, 60%, 45%)',
];

export function ThreatChart({ result }: ThreatChartProps) {
  const severityData = [
    { name: 'Critical', value: result.threatSummary.critical, color: SEVERITY_COLORS.critical },
    { name: 'High', value: result.threatSummary.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: result.threatSummary.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: result.threatSummary.low, color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0);

  const attackTypeData = result.attackTypes.slice(0, 7).map((item, index) => ({
    name: item.type.length > 20 ? item.type.substring(0, 20) + '...' : item.type,
    fullName: item.type,
    count: item.count,
    color: ATTACK_COLORS[index % ATTACK_COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{payload[0].payload.fullName || payload[0].name}</p>
          <p className="text-muted-foreground text-xs">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const totalThreats = result.threatSummary.critical + result.threatSummary.high + 
                       result.threatSummary.medium + result.threatSummary.low;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Threat Visualization</CardTitle>
        <CardDescription>
          Visual breakdown of detected security threats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="severity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="severity" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              By Severity
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              By Attack Type
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="severity">
            {totalThreats === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No threats to display
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="type">
            {attackTypeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No attack types to display
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackTypeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      tick={{ fontSize: 10 }} 
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {attackTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
