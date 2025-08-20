import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, Search, Calendar, Users, Clock, MapPin, Trash2, RefreshCw } from 'lucide-react';

const AdminPanel = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const API_BASE = 'https://58hpi8cwq0vx.manus.space/api';

  useEffect(() => {
    fetchSearchHistory();
    fetchStatistics();
  }, [currentPage]);

  const fetchSearchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 20,
        sort_by: 'created_at',
        sort_order: 'desc'
      });

      if (dateFilter.start) params.append('start_date', dateFilter.start);
      if (dateFilter.end) params.append('end_date', dateFilter.end);

      const response = await fetch(`${API_BASE}/admin/search-history?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchHistory(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/statistics`);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (dateFilter.start) params.append('start_date', dateFilter.start);
      if (dateFilter.end) params.append('end_date', dateFilter.end);

      const response = await fetch(`${API_BASE}/admin/export-excel?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `travel_time_history_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!confirm('Энэ бичлэгийг устгахдаа итгэлтэй байна уу?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/search-history/${recordId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSearchHistory();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('mn-MN');
  };

  const StatCard = ({ title, value, icon: Icon, description }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ хуудас</h1>
          <p className="text-gray-600">Зорчих цагийн тооцоолуурын хайлтын түүх болон статистик</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Тойм</TabsTrigger>
            <TabsTrigger value="history">Хайлтын түүх</TabsTrigger>
            <TabsTrigger value="analytics">Дүн шинжилгээ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Нийт хайлт"
                value={statistics.total_searches || 0}
                icon={Search}
                description="Бүх цаг хугацаанд"
              />
              <StatCard
                title="Өнөөдрийн хайлт"
                value={statistics.today_searches || 0}
                icon={Calendar}
                description="Өнөөдөр хийгдсэн"
              />
              <StatCard
                title="7 хоногийн хайлт"
                value={statistics.week_searches || 0}
                icon={Users}
                description="Сүүлийн 7 хоногт"
              />
              <StatCard
                title="Дундаж цаг алдалт"
                value={`${statistics.averages?.daily_time_loss || 0} мин`}
                icon={Clock}
                description="Өдөрт"
              />
            </div>

            {statistics.common_addresses && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Түгээмэл гэрийн хаяг</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statistics.common_addresses.home?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1">{item.address}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Түгээмэл ажлын байр</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statistics.common_addresses.work?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1">{item.address}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Түгээмэл сургууль</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {statistics.common_addresses.school?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm truncate flex-1">{item.address}</span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Хайлтын түүх</CardTitle>
                <CardDescription>
                  Хэрэглэгчдийн хийсэн бүх хайлтын дэлгэрэнгүй мэдээлэл
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="Эхлэх огноо"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <Input
                      type="date"
                      placeholder="Дуусах огноо"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchSearchHistory} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Шинэчлэх
                    </Button>
                    <Button onClick={handleExportExcel} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Excel татах
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Гэрийн хаяг</TableHead>
                        <TableHead>Сургуулийн хаяг</TableHead>
                        <TableHead>Ажлын хаяг</TableHead>
                        <TableHead>Цаг алдалт</TableHead>
                        <TableHead>Огноо</TableHead>
                        <TableHead>Үйлдэл</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Ачааллаж байна...
                          </TableCell>
                        </TableRow>
                      ) : searchHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            Хайлтын түүх олдсонгүй
                          </TableCell>
                        </TableRow>
                      ) : (
                        searchHistory.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.id}</TableCell>
                            <TableCell className="max-w-xs truncate" title={record.home_address}>
                              {record.home_address}
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={record.school_address}>
                              {record.school_address}
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={record.work_address}>
                              {record.work_address}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {record.daily_time_loss} мин
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(record.created_at)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRecord(record.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Өмнөх
                    </Button>
                    <span className="flex items-center px-4">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Дараах
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Дундаж үзүүлэлтүүд</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Өдрийн дундаж цаг алдалт:</span>
                      <Badge>{statistics.averages?.daily_time_loss || 0} минут</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Сарын дундаж цаг алдалт:</span>
                      <Badge>{statistics.averages?.monthly_time_loss || 0} цаг</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Жилийн дундаж цаг алдалт:</span>
                      <Badge>{statistics.averages?.yearly_time_loss || 0} өдөр</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Хайлтын статистик</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Нийт хайлт:</span>
                      <Badge variant="secondary">{statistics.total_searches || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Сүүлийн сарын хайлт:</span>
                      <Badge variant="secondary">{statistics.month_searches || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Өнөөдрийн хайлт:</span>
                      <Badge variant="secondary">{statistics.today_searches || 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;

