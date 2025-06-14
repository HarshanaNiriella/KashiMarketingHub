
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database, Calendar, Users, MessageSquare, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportAllData, exportTableData } from '@/utils/dataExport';
import { Database as DatabaseTypes } from '@/integrations/supabase/types';

type TableName = keyof DatabaseTypes['public']['Tables'];

const DataExport = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'table'>('all');
  const [selectedTable, setSelectedTable] = useState<TableName | ''>('');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const tableOptions = [
    { value: 'staff' as TableName, label: 'Staff Members', icon: Users },
    { value: 'social_posts' as TableName, label: 'Social Media Posts', icon: MessageSquare },
    { value: 'meeting_minutes' as TableName, label: 'Meeting Minutes', icon: Calendar },
    { value: 'action_items' as TableName, label: 'Action Items', icon: CheckSquare }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportType === 'all') {
        await exportAllData(exportFormat);
        toast({
          title: "Export Successful",
          description: `All data exported as ${exportFormat.toUpperCase()} files.`,
        });
      } else if (selectedTable) {
        await exportTableData(selectedTable as TableName, exportFormat);
        const tableName = tableOptions.find(t => t.value === selectedTable)?.label || selectedTable;
        toast({
          title: "Export Successful",
          description: `${tableName} exported as ${exportFormat.toUpperCase()}.`,
        });
      }
      setShowExportDialog(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-sage-800">📊 Data Export</h2>
        <Button 
          onClick={() => setShowExportDialog(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="h-4 w-4 mr-1" />
          Export Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tableOptions.map((table) => {
          const Icon = table.icon;
          return (
            <Card key={table.value} className="p-4 border-sage-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-medium text-sage-800">{table.label}</h3>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setExportType('table');
                    setSelectedTable(table.value);
                    setShowExportDialog(true);
                  }}
                  className="w-full border-sage-200 text-sage-700 hover:bg-sage-50"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 border-sage-200">
        <h3 className="text-lg font-semibold text-sage-800 mb-4">📋 Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sage-700">Complete Backup</h4>
            <p className="text-sm text-sage-600">Export all data including staff, social posts, meeting minutes, and action items.</p>
            <Button
              variant="outline"
              onClick={() => {
                setExportType('all');
                setShowExportDialog(true);
              }}
              className="border-sage-200 text-sage-700 hover:bg-sage-50"
            >
              <Database className="h-4 w-4 mr-1" />
              Full Export
            </Button>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-sage-700">Format Options</h4>
            <div className="flex space-x-2">
              <Badge className="bg-blue-100 text-blue-700">JSON - Complete data structure</Badge>
            </div>
            <div className="flex space-x-2">
              <Badge className="bg-green-100 text-green-700">CSV - Spreadsheet compatible</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Export Type</label>
              <Select value={exportType} onValueChange={(value: 'all' | 'table') => setExportType(value)}>
                <SelectTrigger className="border-sage-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Data (Complete Backup)</SelectItem>
                  <SelectItem value="table">Specific Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType === 'table' && (
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-1">Select Table</label>
                <Select value={selectedTable} onValueChange={(value: TableName) => setSelectedTable(value)}>
                  <SelectTrigger className="border-sage-200">
                    <SelectValue placeholder="Choose a table to export" />
                  </SelectTrigger>
                  <SelectContent>
                    {tableOptions.map((table) => (
                      <SelectItem key={table.value} value={table.value}>
                        {table.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-sage-700 mb-1">Format</label>
              <Select value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
                <SelectTrigger className="border-sage-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Complete structure)</SelectItem>
                  <SelectItem value="csv">CSV (Spreadsheet format)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-sage-50 p-3 rounded-lg">
              <p className="text-sm text-sage-600">
                <strong>Note:</strong> {exportFormat === 'json' 
                  ? 'JSON format preserves complete data structure and relationships.'
                  : 'CSV format creates separate files for each table, suitable for spreadsheet applications.'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                className="border-sage-200"
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isExporting || (exportType === 'table' && !selectedTable)}
              >
                {isExporting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting...</span>
                  </div>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataExport;
