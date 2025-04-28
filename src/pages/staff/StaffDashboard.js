import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Typography, 
  DatePicker, 
  Spin,
  Empty,
  message
} from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  DollarOutlined, 
  ShoppingOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { 
  bookingService, 
  movieService, 
  projectionService 
} from '../../services/api';
import '../style/StaffDashboard.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Define the component
const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeFilms: 0,
    upcomingProjections: 0
  });
  const [popularFilms, setPopularFilms] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(7, 'days').startOf('day'),
    moment().endOf('day')
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all the data we need for the dashboard
      const [bookingsResponse, filmsResponse, projectionsResponse] = await Promise.all([
        bookingService.getAll(),
        movieService.getAll(),
        projectionService.getAll()
      ]);
      
      console.log('Films data:', filmsResponse.data);
      console.log('Projections data:', projectionsResponse.data);
      
      // Get all bookings
      const allBookings = bookingsResponse.data || [];
      
      // Filter bookings by date range
      const filteredBookings = allBookings.filter(booking => {
        const bookingTime = booking.bookingTime || booking.purchaseTime;
        if (!bookingTime) return false;
        
        const bookingDate = moment(bookingTime);
        return bookingDate.isBetween(dateRange[0], dateRange[1], null, '[]');
      });
      
      // Calculate total revenue from bookings
      const totalRevenue = filteredBookings.reduce((sum, booking) => {
        // Check if seats is an array and has length
        const seatCount = Array.isArray(booking.seats) ? booking.seats.length : 1;
        // Get price from projection or directly from booking
        const price = (booking.projection?.price || booking.price || 0);
        return sum + (seatCount * price);
      }, 0);
      
      // Count active films - only count films that have been released but aren't too old
      const films = filmsResponse.data || [];
      const now = moment();
      const sixMonthsAgo = moment().subtract(6, 'months'); // Consider films from the last 6 months as "active"
      
      const activeFilms = films.filter(film => {
        // Skip deleted films if isDeleted is available
        if (film.isDeleted) return false;
        
        // Consider a film "active" if it has already been released (up to today)
        // but isn't too old (released within the last 6 months)
        const releaseDate = moment(film.releaseDate);
        return releaseDate.isBefore(now) && releaseDate.isAfter(sixMonthsAgo);
      }).length;
      
      // Count upcoming projections (future dates)
      const projections = projectionsResponse.data || [];
      const upcomingProjections = projections.filter(projection => {
        // Skip deleted projections if isDeleted is available
        if (projection.isDeleted) return false;
        
        // Check for startTime field
        const startTime = projection.startTime;
        if (!startTime) return false;
        
        return moment(startTime).isAfter(now);
      }).length;
      
      // Get most popular films based on booking count
      const filmBookingCounts = {};
      allBookings.forEach(booking => {
        // Check if projection exists and has filmId
        if (booking.projection && booking.projection.filmId) {
          const filmId = booking.projection.filmId;
          filmBookingCounts[filmId] = (filmBookingCounts[filmId] || 0) + 1;
        } 
        // Check if projection exists and has film object
        else if (booking.projection && booking.projection.film && booking.projection.film.id) {
          const filmId = booking.projection.film.id;
          filmBookingCounts[filmId] = (filmBookingCounts[filmId] || 0) + 1;
        }
        // Check if booking has direct filmId reference
        else if (booking.filmId) {
          const filmId = booking.filmId;
          filmBookingCounts[filmId] = (filmBookingCounts[filmId] || 0) + 1;
        }
        // Check if booking has direct projectionId and we can match it
        else if (booking.projectionId) {
          const projection = projections.find(p => p.id === booking.projectionId);
          if (projection && projection.filmId) {
            const filmId = projection.filmId;
            filmBookingCounts[filmId] = (filmBookingCounts[filmId] || 0) + 1;
          }
        }
      });
      
      const popularFilmsData = Object.entries(filmBookingCounts)
        .map(([filmId, count]) => {
          // Find the film in our films array, handling both string and number IDs
          const film = films.find(f => {
            const fId = f.id?.toString();
            const compareId = filmId?.toString();
            return fId === compareId;
          });
          
          if (!film) return null;
          
          return { 
            film,
            bookingCount: count,
            revenue: allBookings
              .filter(b => {
                // Match booking to film using different possible paths
                const bookingFilmId = (b.projection?.film?.id || b.filmId)?.toString();
                return bookingFilmId === filmId.toString();
              })
              .reduce((sum, b) => {
                const seatCount = Array.isArray(b.seats) ? b.seats.length : 1;
                const price = (b.projection?.price || b.price || 0);
                return sum + (seatCount * price);
              }, 0)
          };
        })
        .filter(item => item !== null) // Filter out null items 
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);
      
      // Get recent bookings
      const recentBookingsData = [...allBookings]
        .sort((a, b) => {
          const dateA = new Date(a.bookingTime || a.purchaseTime || 0);
          const dateB = new Date(b.bookingTime || b.purchaseTime || 0);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      // Update state with all the data
      setStats({
        totalBookings: filteredBookings.length,
        totalRevenue,
        activeFilms,
        upcomingProjections
      });
      
      setPopularFilms(popularFilmsData);
      setRecentBookings(recentBookingsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error('Không thể tải dữ liệu dashboard');
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange([
        dates[0].startOf('day'),
        dates[1].endOf('day')
      ]);
    } else {
      setDateRange([
        moment().subtract(7, 'days').startOf('day'),
        moment().endOf('day')
      ]);
    }
  };

  const formatDateTime = (dateTimeString) => {
    return moment(dateTimeString).format('DD/MM/YYYY HH:mm');
  };

  const popularFilmsColumns = [
    {
      title: 'Phim',
      dataIndex: ['film', 'title'],
      key: 'film',
      render: (text, record) => (
        <Link to={`/staff/films/edit/${record.film.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Lượt đặt',
      dataIndex: 'bookingCount',
      key: 'bookingCount',
      sorter: (a, b) => a.bookingCount - b.bookingCount,
    },
    {
      title: 'Doanh thu (VNĐ)',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => revenue.toLocaleString('vi-VN'),
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  const recentBookingsColumns = [
    {
      title: 'Mã đặt vé',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (text, record) => (
        <Link to={`/staff/bookings?id=${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Phim',
      dataIndex: ['projection', 'film', 'title'],
      key: 'film',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'bookingTime',
      key: 'bookingTime',
      render: (text, record) => formatDateTime(text || record.purchaseTime),
    },
  ];

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <Title level={3}>Dashboard</Title>
        <RangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          format="DD/MM/YYYY"
          ranges={{
            'Hôm nay': [moment().startOf('day'), moment().endOf('day')],
            '7 ngày qua': [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')],
            '30 ngày qua': [moment().subtract(29, 'days').startOf('day'), moment().endOf('day')],
            'Tháng này': [moment().startOf('month'), moment().endOf('month')],
          }}
        />
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng đặt vé"
                value={stats.totalBookings}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="stat-footer">
                <CalendarOutlined /> {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh thu (VNĐ)"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => value.toLocaleString('vi-VN')}
              />
              <div className="stat-footer">
                <CalendarOutlined /> {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Phim đang chiếu"
                value={stats.activeFilms}
                prefix={<VideoCameraOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="stat-footer">
                <Link to="/staff/films">Xem chi tiết</Link>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Suất chiếu sắp tới"
                value={stats.upcomingProjections}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="stat-footer">
                <Link to="/staff/projections">Xem chi tiết</Link>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title="Phim phổ biến nhất" 
              className="dashboard-table-card"
              extra={<Link to="/staff/films">Xem tất cả</Link>}
            >
              {popularFilms.length > 0 ? (
                <Table
                  columns={popularFilmsColumns}
                  dataSource={popularFilms}
                  rowKey={(record) => record.film.id}
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title="Đặt vé gần đây" 
              className="dashboard-table-card"
              extra={<Link to="/staff/bookings">Xem tất cả</Link>}
            >
              {recentBookings.length > 0 ? (
                <Table
                  columns={recentBookingsColumns}
                  dataSource={recentBookings}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

// Export the component
export default StaffDashboard;