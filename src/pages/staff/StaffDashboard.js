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
  movieService, 
  projectionService 
} from '../../services/api';
import '../style/StaffDashboard.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Define custom services to access the specific endpoints
const ticketService = {
  getAll: () => {
    return fetch('https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/Ticket/GetTickets/getallticketlist/1/1000')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
  }
};

const projectionDetailService = {
  getById: (id) => {
    return fetch(`https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api/Projection/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
  }
};

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
  const [ticketData, setTicketData] = useState([]);
  const [projectionsData, setProjectionsData] = useState([]);
  const [filmsData, setFilmsData] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (ticketData.length > 0 && filmsData.length > 0 && projectionsData.length > 0) {
      calculateDashboardStats();
    }
  }, [ticketData, filmsData, projectionsData, dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [ticketsResponse, filmsResponse, projectionsResponse] = await Promise.all([
        ticketService.getAll(),
        movieService.getAll(),
        projectionService.getAll()
      ]);
      
      console.log('Tickets data:', ticketsResponse);
      console.log('Films data:', filmsResponse.data);
      console.log('Projections data:', projectionsResponse.data);

      // Store the data in state
      const tickets = ticketsResponse.items || [];
      setTicketData(tickets);
      setFilmsData(filmsResponse.data || []);
      setProjectionsData(projectionsResponse.data || []);
      
      // Data is loaded, now calculateDashboardStats will run through useEffect
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error('Không thể tải dữ liệu dashboard');
      setLoading(false);
    }
  };

  const calculateDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Count total tickets within date range
      const filteredTickets = ticketData.filter(ticket => {
        const ticketDate = moment(ticket.purchaseTime);
        return ticketDate.isBetween(dateRange[0], dateRange[1], null, '[]');
      });
      
      const totalBookings = filteredTickets.length;

      // 2. Calculate total revenue
      // We need to get projection details for each ticket to get the price
      let totalRevenue = 0;
      
      // Use a map to cache projection details we've already fetched
      const projectionCache = new Map();
      
      // For each filtered ticket, get its projection and add the price to the total
      for (const ticket of filteredTickets) {
        if (ticket.projectionId) {
          try {
            let projectionDetail;
            
            // Check if we've already fetched this projection
            if (projectionCache.has(ticket.projectionId)) {
              projectionDetail = projectionCache.get(ticket.projectionId);
            } else {
              // Fetch and cache the projection details
              projectionDetail = await projectionDetailService.getById(ticket.projectionId);
              projectionCache.set(ticket.projectionId, projectionDetail);
            }
            
            // Add the price to the total revenue
            if (projectionDetail && projectionDetail.price) {
              totalRevenue += projectionDetail.price;
            }
          } catch (error) {
            console.error(`Error fetching projection details for ID ${ticket.projectionId}:`, error);
          }
        }
      }

      // 3. Count films with status 1 (Đang chiếu)
      const activeFilms = filmsData.filter(film => film.status === 1).length;

      // 4. Count projections with startTime after 2 days from now
      const twoDaysFromNow = moment().add(2, 'days');
      const upcomingProjections = projectionsData.filter(projection => {
        return moment(projection.startTime).isAfter(twoDaysFromNow);
      }).length;

      // 5. Calculate popular films
      const filmBookingCounts = {};
      const filmRevenueMap = {};
      
      // Count bookings for each film
      for (const ticket of ticketData) {
        // Find the projection for this ticket
        const projection = projectionsData.find(p => p.id === ticket.projectionId);
        
        if (projection && projection.filmId) {
          // Count ticket for this film
          const filmId = projection.filmId;
          filmBookingCounts[filmId] = (filmBookingCounts[filmId] || 0) + 1;
          
          // Add to revenue for this film
          if (!filmRevenueMap[filmId]) {
            filmRevenueMap[filmId] = 0;
          }
          
          // Get projection details for price if not in cache
          if (!projectionCache.has(ticket.projectionId)) {
            try {
              const projectionDetail = await projectionDetailService.getById(ticket.projectionId);
              projectionCache.set(ticket.projectionId, projectionDetail);
              
              if (projectionDetail && projectionDetail.price) {
                filmRevenueMap[filmId] += projectionDetail.price;
              }
            } catch (error) {
              console.error(`Error fetching projection details for ID ${ticket.projectionId}:`, error);
            }
          } else {
            // Use cached projection details
            const projectionDetail = projectionCache.get(ticket.projectionId);
            if (projectionDetail && projectionDetail.price) {
              filmRevenueMap[filmId] += projectionDetail.price;
            }
          }
        }
      }
      
      // Create popular films data
      const popularFilmsData = Object.entries(filmBookingCounts)
        .map(([filmId, count]) => {
          // Find film details
          const film = filmsData.find(f => f.id === filmId);
          if (!film) return null;
          
          return {
            film,
            bookingCount: count,
            revenue: filmRevenueMap[filmId] || 0
          };
        })
        .filter(item => item !== null)
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 5);
      
      // 6. Get recent bookings
      const recentBookingsData = [...ticketData]
        .sort((a, b) => {
          const dateA = new Date(a.purchaseTime || 0);
          const dateB = new Date(b.purchaseTime || 0);
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(ticket => {
          // Find the projection for this ticket
          const projection = projectionsData.find(p => p.id === ticket.projectionId);
          
          // Find the film for this projection
          const film = projection ? filmsData.find(f => f.id === projection.filmId) : null;
          
          return {
            ...ticket,
            bookingCode: ticket.appTransId || ticket.id,
            customerName: ticket.userId || 'Khách hàng',
            projection: {
              ...projection,
              film: film || { title: 'N/A' }
            }
          };
        });

      // Update state with calculated data
      setStats({
        totalBookings,
        totalRevenue,
        activeFilms,
        upcomingProjections
      });
      
      setPopularFilms(popularFilmsData);
      setRecentBookings(recentBookingsData);
      
      setLoading(false);
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      message.error('Lỗi khi tính toán thống kê');
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
      dataIndex: 'purchaseTime',
      key: 'purchaseTime',
      render: (text) => formatDateTime(text),
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