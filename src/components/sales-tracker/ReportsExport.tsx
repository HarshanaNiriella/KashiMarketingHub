
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

const ReportsExport = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');

  const generateDailyReport = async (date: string) => {
    try {
      // Get sales data
      const { data: salesData, error: salesError } = await supabase
        .from('daily_sales_reports')
        .select('*')
        .eq('date', date)
        .single();

      // Get attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('date', date);

      if (salesError && salesError.code !== 'PGRST116') throw salesError;
      if (attendanceError) throw attendanceError;

      // Calculate totals
      const totalPayment = salesData ? 
        (salesData.thyaga || 0) + (salesData.mintpay || 0) + (salesData.feelo || 0) + 
        (salesData.unionpay || 0) + (salesData.online_transfer || 0) + (salesData.card_amex || 0) + 
        (salesData.card_visa || 0) + (salesData.card_master || 0) + (salesData.cash || 0) + 
        (salesData.gift_card_redemptions || 0) : 0;

      const totalSales = salesData ? 
        (salesData.services || 0) + (salesData.products || 0) + (salesData.gift_cards || 0) : 0;

      const todayGenerated = totalPayment - (salesData?.gift_card_redemptions || 0);

      const presentStaff = attendanceData?.filter(staff => staff.attendance_status === 'present').length || 0;
      const totalStaff = attendanceData?.length || 0;

      const report = `
📊 KASHI WELLNESS RETREAT - DAILY REPORT
📅 Date: ${date}
⏰ Generated: ${new Date().toLocaleString()}

💰 SALES SUMMARY
═══════════════════════════════════════
💵 Total Payment Collected: LKR ${totalPayment.toFixed(2)}
💼 Total Sales: LKR ${totalSales.toFixed(2)}
✨ Today Sales Generated: LKR ${todayGenerated.toFixed(2)}

📊 PAYMENT BREAKDOWN
═══════════════════════════════════════
• Thyaga: LKR ${salesData?.thyaga?.toFixed(2) || '0.00'}
• Mintpay: LKR ${salesData?.mintpay?.toFixed(2) || '0.00'}
• Feelo: LKR ${salesData?.feelo?.toFixed(2) || '0.00'}
• UnionPay: LKR ${salesData?.unionpay?.toFixed(2) || '0.00'}
• Online Transfer: LKR ${salesData?.online_transfer?.toFixed(2) || '0.00'}
• Card (Amex): LKR ${salesData?.card_amex?.toFixed(2) || '0.00'}
• Card (Visa): LKR ${salesData?.card_visa?.toFixed(2) || '0.00'}
• Card (Master): LKR ${salesData?.card_master?.toFixed(2) || '0.00'}
• Cash: LKR ${salesData?.cash?.toFixed(2) || '0.00'}
• Gift Card Redemptions: LKR ${salesData?.gift_card_redemptions?.toFixed(2) || '0.00'}

🛍️ TRANSACTION SUMMARY
═══════════════════════════════════════
• Services: LKR ${salesData?.services?.toFixed(2) || '0.00'}
• Products: LKR ${salesData?.products?.toFixed(2) || '0.00'}
• Gift Cards: LKR ${salesData?.gift_cards?.toFixed(2) || '0.00'}

👥 STAFF ATTENDANCE
═══════════════════════════════════════
📊 Present: ${presentStaff}/${totalStaff} staff members (${totalStaff > 0 ? ((presentStaff/totalStaff)*100).toFixed(1) : 0}%)

${attendanceData?.map(staff => {
  const statusEmoji = staff.attendance_status === 'present' ? '✅' : 
                     staff.attendance_status === 'approved_leave' ? '📝' :
                     staff.attendance_status === 'sick_leave' ? '🤒' :
                     staff.attendance_status === 'half_day' ? '⏰' : '❌';
  
  const bniText = staff.is_bni_day ? ' (BNI Day)' : '';
  const salesText = staff.daily_sales > 0 ? ` - Sales: LKR ${staff.daily_sales.toFixed(2)}` : '';
  
  return `${statusEmoji} ${staff.staff_name}: ${staff.attendance_status.replace('_', ' ').toUpperCase()}${bniText}${salesText}`;
}).join('\n') || 'No attendance data recorded'}

═══════════════════════════════════════
🌿 Kashi Wellness Retreat
📧 Report generated automatically
📱 WhatsApp ready format
      `.trim();

      return report;
    } catch (error) {
      console.error('Error generating daily report:', error);
      throw error;
    }
  };

  const generateWeeklyReport = async (startDate: string, endDate: string) => {
    try {
      // Get sales data for the period
      const { data: salesData, error: salesError } = await supabase
        .from('daily_sales_reports')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');

      // Get attendance data for the period
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('staff_attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (salesError) throw salesError;
      if (attendanceError) throw attendanceError;

      // Calculate totals
      const totalSales = salesData?.reduce((sum, day) => 
        sum + (day.services || 0) + (day.products || 0) + (day.gift_cards || 0), 0) || 0;

      const totalCash = salesData?.reduce((sum, day) => sum + (day.cash || 0), 0) || 0;
      const totalCards = salesData?.reduce((sum, day) => 
        sum + (day.card_amex || 0) + (day.card_visa || 0) + (day.card_master || 0), 0) || 0;

      // Staff performance
      const staffStats: { [key: string]: any } = {};
      attendanceData?.forEach(record => {
        if (!staffStats[record.staff_name]) {
          staffStats[record.staff_name] = { present: 0, total: 0, sales: 0 };
        }
        staffStats[record.staff_name].total++;
        if (record.attendance_status === 'present') {
          staffStats[record.staff_name].present++;
        }
        staffStats[record.staff_name].sales += record.daily_sales || 0;
      });

      const report = `
📊 KASHI WELLNESS RETREAT - WEEKLY REPORT
📅 Period: ${startDate} to ${endDate}
⏰ Generated: ${new Date().toLocaleString()}

💰 WEEKLY SALES SUMMARY
═══════════════════════════════════════
💼 Total Sales: LKR ${totalSales.toFixed(2)}
💵 Cash Sales: LKR ${totalCash.toFixed(2)} (${totalSales > 0 ? ((totalCash/totalSales)*100).toFixed(1) : 0}%)
💳 Card Sales: LKR ${totalCards.toFixed(2)} (${totalSales > 0 ? ((totalCards/totalSales)*100).toFixed(1) : 0}%)
📊 Average Daily Sales: LKR ${salesData?.length ? (totalSales/salesData.length).toFixed(2) : '0.00'}

📈 DAILY BREAKDOWN
═══════════════════════════════════════
${salesData?.map(day => {
  const dayTotal = (day.services || 0) + (day.products || 0) + (day.gift_cards || 0);
  return `📅 ${day.date}: LKR ${dayTotal.toFixed(2)}`;
}).join('\n') || 'No sales data available'}

👥 STAFF PERFORMANCE
═══════════════════════════════════════
${Object.entries(staffStats).map(([name, stats]: [string, any]) => {
  const attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : '0.0';
  return `👤 ${name}: ${stats.present}/${stats.total} days (${attendanceRate}%) - Sales: LKR ${stats.sales.toFixed(2)}`;
}).join('\n') || 'No attendance data available'}

═══════════════════════════════════════
🌿 Kashi Wellness Retreat
📧 Weekly summary report
📱 WhatsApp ready format
      `.trim();

      return report;
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw error;
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      let report = '';
      
      if (reportType === 'daily') {
        report = await generateDailyReport(startDate);
      } else if (reportType === 'weekly') {
        report = await generateWeeklyReport(startDate, endDate);
      }

      setGeneratedReport(report);
      
      toast({
        title: "Report Generated",
        description: "Report has been generated successfully and is ready for export.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReport);
    toast({
      title: "Copied to Clipboard",
      description: "Report has been copied to clipboard. Ready to paste in WhatsApp!",
    });
  };

  const downloadReport = () => {
    const blob = new Blob([generatedReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kashi-report-${reportType}-${startDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports & Export</h2>
        <p className="text-muted-foreground">Generate WhatsApp-ready reports for management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>
              Configure your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start-date">
                {reportType === 'daily' ? 'Date' : 'Start Date'}
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {reportType === 'weekly' && (
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Report Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Generated Report Preview
            </CardTitle>
            <CardDescription>
              WhatsApp-ready format report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedReport}
              readOnly
              placeholder="Generated report will appear here..."
              className="min-h-[400px] font-mono text-sm"
            />
            
            {generatedReport && (
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Copy for WhatsApp
                </Button>
                <Button onClick={downloadReport} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common report generation shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setReportType('daily');
                setStartDate(new Date().toISOString().split('T')[0]);
                handleGenerateReport();
              }}
              disabled={isGenerating}
            >
              Today's Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                setReportType('daily');
                setStartDate(yesterday.toISOString().split('T')[0]);
                handleGenerateReport();
              }}
              disabled={isGenerating}
            >
              Yesterday's Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                setReportType('weekly');
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
                handleGenerateReport();
              }}
              disabled={isGenerating}
            >
              Last 7 Days
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsExport;
