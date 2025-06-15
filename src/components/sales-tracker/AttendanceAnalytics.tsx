
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Calendar, Award } from 'lucide-react';

interface AttendanceData {
  staff_name: string;
  present_days: number;
  total_days: number;
  attendance_rate: number;
  total_sales: number;
  average_daily_sales: number;
  bni_days: number;
}

interface DailyAttendance {
  date: string;
  present_count: number;
  total_staff: number;
  attendance_rate: number;
}

const AttendanceAnalytics = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttendanceData();
  }, [timeRange]);

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Process staff-wise attendance data
      const staffStats: { [key: string]: any } = {};
      const dailyStats: { [key: string]: any } = {};

      data?.forEach(record => {
        // Staff-wise processing
        if (!staffStats[record.staff_name]) {
          staffStats[record.staff_name] = {
            staff_name: record.staff_name,
            present_days: 0,
            total_days: 0,
            total_sales: 0,
            bni_days: 0
          };
        }

        staffStats[record.staff_name].total_days++;
        if (record.attendance_status === 'present') {
          staffStats[record.staff_name].present_days++;
        }
        staffStats[record.staff_name].total_sales += record.daily_sales || 0;
        if (record.is_bni_day) {
          staffStats[record.staff_name].bni_days++;
        }

        // Daily processing
        if (!dailyStats[record.date]) {
          dailyStats[record.date] = {
            date: record.date,
            present_count: 0,
            total_staff: 0
          };
        }

        dailyStats[record.date].total_staff++;
        if (record.attendance_status === 'present') {
          dailyStats[record.date].present_count++;
        }
      });

      // Calculate final metrics
      const processedStaffData = Object.values(staffStats).map((staff: any) => ({
        ...staff,
        attendance_rate: staff.total_days > 0 ? (staff.present_days / staff.total_days) * 100 : 0,
        average_daily_sales: staff.present_days > 0 ? staff.total_sales / staff.present_days : 0
      }));

      const processedDailyData = Object.values(dailyStats).map((day: any) => ({
        ...day,
        attendance_rate: day.total_staff > 0 ? (day.present_count / day.total_staff) * 100 : 0
      }));

      setAttendanceData(processedStaffData);
      setDailyAttendance(processedDailyData);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const averageAttendanceRate = attendanceData.length > 0 
    ? attendanceData.reduce((sum, staff) => sum + staff.attendance_rate, 0) / attendanceData.length 
    : 0;

  const topPerformer = attendanceData.reduce((top, current) => 
    current.total_sales > top.total_sales ? current : top, 
    { staff_name: '', total_sales: 0 }
  );

  const attendanceDistribution = [
    { name: 'Excellent (>95%)', value: attendanceData.filter(s => s.attendance_rate > 95).length, color: '#10B981' },
    { name: 'Good (80-95%)', value: attendanceData.filter(s => s.attendance_rate >= 80 && s.attendance_rate <= 95).length, color: '#3B82F6' },
    { name: 'Fair (60-80%)', value: attendanceData.filter(s => s.attendance_rate >= 60 && s.attendance_rate < 80).length, color: '#F59E0B' },
    { name: 'Poor (<60%)', value: attendanceData.filter(s => s.attendance_rate < 60).length, color: '#EF4444' },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return <div>Loading attendance analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Staff Analytics</h2>
          <p className="text-muted-foreground">Comprehensive staff performance and attendance analysis</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Team average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Sales Performer</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{topPerformer.staff_name}</div>
            <p className="text-xs text-muted-foreground">
              LKR {topPerformer.total_sales.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Attendance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData.filter(s => s.attendance_rate === 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BNI Participation</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceData.reduce((sum, staff) => sum + staff.bni_days, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total BNI days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Staff Performance</CardTitle>
          <CardDescription>Detailed breakdown by staff member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attendanceData
              .sort((a, b) => b.attendance_rate - a.attendance_rate)
              .map((staff) => (
                <div key={staff.staff_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{staff.staff_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {staff.present_days}/{staff.total_days} days present
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">Attendance Rate</p>
                      <Badge 
                        className={
                          staff.attendance_rate > 95 ? 'bg-green-100 text-green-800' :
                          staff.attendance_rate >= 80 ? 'bg-blue-100 text-blue-800' :
                          staff.attendance_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {staff.attendance_rate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">Total Sales</p>
                      <p className="text-lg font-bold">LKR {staff.total_sales.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">Avg Daily Sales</p>
                      <p className="text-lg font-bold">LKR {staff.average_daily_sales.toFixed(2)}</p>
                    </div>

                    {staff.bni_days > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium">BNI Days</p>
                        <Badge className="bg-purple-100 text-purple-800">
                          {staff.bni_days}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Attendance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Trend</CardTitle>
            <CardDescription>Team attendance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value}%`, 'Attendance Rate']} />
                <Legend />
                <Bar dataKey="attendance_rate" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Staff categorized by attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Performance by Staff */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Performance Comparison</CardTitle>
            <CardDescription>Individual sales performance across the team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData.sort((a, b) => b.total_sales - a.total_sales)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="staff_name" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`LKR ${value}`, 'Total Sales']} />
                <Legend />
                <Bar dataKey="total_sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
