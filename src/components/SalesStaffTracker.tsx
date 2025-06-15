
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, BarChart3, Calendar, Download, Edit } from 'lucide-react';
import DailySalesEntry from './sales-tracker/DailySalesEntry';
import StaffAttendanceEntry from './sales-tracker/StaffAttendanceEntry';
import SalesAnalytics from './sales-tracker/SalesAnalytics';
import AttendanceAnalytics from './sales-tracker/AttendanceAnalytics';
import ReportsExport from './sales-tracker/ReportsExport';
import SalesEdit from './sales-tracker/SalesEdit';

const SalesStaffTracker = () => {
  const [activeTab, setActiveTab] = useState('daily-entry');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-sage-800 mb-2">
            Sales & Staff Tracker
          </h1>
          <p className="text-sage-600">
            Comprehensive daily sales reporting and staff attendance management system
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          Active Tracking
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="daily-entry" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Daily Entry
          </TabsTrigger>
          <TabsTrigger value="edit-sales" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Sales
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Staff Attendance
          </TabsTrigger>
          <TabsTrigger value="sales-analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Sales Analytics
          </TabsTrigger>
          <TabsTrigger value="attendance-analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Staff Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-entry">
          <DailySalesEntry />
        </TabsContent>

        <TabsContent value="edit-sales">
          <SalesEdit />
        </TabsContent>

        <TabsContent value="attendance">
          <StaffAttendanceEntry />
        </TabsContent>

        <TabsContent value="sales-analytics">
          <SalesAnalytics />
        </TabsContent>

        <TabsContent value="attendance-analytics">
          <AttendanceAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SalesStaffTracker;
