import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from '@/utils/csvExport';
import { useSettings } from '@/utils/SettingsContext';

interface ReportData {
  changesByStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    rejected: number;
  };
  changesByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  recentChanges: Array<{
    id: string;
    title: string;
    status: string;
    requestedBy: {
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  periodStart: string;
  periodEnd: string;
}

const Reports: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [period, setPeriod] = useState('thisMonth');
    const [reportData, setReportData] = useState<ReportData | null>(null);

  const fetchReportData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load report data",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(period);
  }, [period]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await fetch(`/api/reports/export?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `change-report-${period}-${date}`;

      // Export to CSV
      exportToCSV(data, filename);

      toast({
        title: "Success",
        description: "Report exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export report",
      });
    } finally {
      setExporting(false);
    }
  };

  const { formatDate } = useSettings();

  const getStatusClassName = (status: string) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No report data available
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="lastQuarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={exporting || loading || !reportData}
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(reportData.changesByStatus).reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reportData.changesByStatus.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportData.changesByStatus.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              High Priority Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {reportData.changesByPriority.high}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Changes</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.recentChanges.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No changes found for the selected period
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.recentChanges.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">{change.title}</TableCell>
                    <TableCell>
                      <span className={getStatusClassName(change.status)}>
                        {change.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>{change.requestedBy.name}</TableCell>
                    <TableCell>{formatDate(new Date(change.createdAt))}</TableCell>
                    <TableCell>{formatDate(new Date(change.updatedAt))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;