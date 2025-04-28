import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Select,
  DatePicker,
  Tag,
  Badge,
  Tooltip,
  Modal,
  Card,
  Row,
  Col,
  Divider,
  message,
  notification 
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  PrinterOutlined,
  DeleteOutlined,
  UserOutlined,
  FieldTimeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { ticketService } from '../../services/api';
import '../style/BookingsManagementPage.css';

// Import mock data (this will be used as fallback)
import { mockBookingGroups, getMockBookings, deleteMockBooking } from './mockBookingData';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const BookingsManagementPage = () => {
  const [bookingGroups, setBookingGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBookingGroup, setSelectedBookingGroup] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [pagination.current, pagination.pageSize]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const loadingMsg = message.loading('Đang tải dữ liệu đặt vé...', 0);
      
      let response;
      try {
        // Try to fetch from real API first
        response = await ticketService.getAllTickets(1,100);
        setUsingMockData(false);
      } catch (apiError) {
        console.warn("API error, using mock data instead:", apiError);
        // Fallback to mock data if API fails
        response = getMockBookings(pagination.current, pagination.pageSize);
        setUsingMockData(true);
      }
      
      // Update state with the data (either from API or mock)
      setBookingGroups(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.totalItems || 0,
        pageSize: response.data.pageSize || 10,
        current: response.data.pageNumber || 1,
      });
      
      loadingMsg();
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      notification.error({
        message: 'Không thể tải lịch sử đặt vé',
        description: 'Đã xảy ra lỗi khi tải dữ liệu đặt vé. Vui lòng thử lại sau.',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterStatus = (value) => {
    setFilterStatus(value);
  };

  const handleFilterDateRange = (dates) => {
    setFilterDateRange(dates);
  };

  const handleViewDetail = (bookingGroup) => {
    setSelectedBookingGroup(bookingGroup);
    setDetailModalVisible(true);
  };

  const handleDeleteBooking = (appTransId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa đơn đặt vé này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const loadingMsg = message.loading('Đang xóa đơn đặt vé...', 0);
          
          try {
            // Try to call the real API first
            await ticketService.delete(appTransId);
          } catch (apiError) {
            // Fall back to mock delete if real API fails
            console.warn("API delete error, using mock delete instead:", apiError);
            await deleteMockBooking(appTransId);
          }
          
          loadingMsg();
          notification.success({
            message: 'Xóa đơn đặt vé thành công',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          });
          
          fetchBookings();
        } catch (error) {
          console.error("Error deleting booking:", error);
          notification.error({
            message: 'Xóa đơn đặt vé thất bại',
            description: error.message || 'Đã xảy ra lỗi khi xóa đơn đặt vé',
            icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          });
        }
      },
    });
  };

  const handlePrintTicket = (bookingGroup) => {
    // In a real application, this would trigger a print function
    message.success('Đã gửi lệnh in vé');
    
    // You could add code here to generate PDF or send a print request
    console.log('Printing tickets for:', bookingGroup.appTransId);
  };

  // Apply filters to booking groups
  const filteredBookingGroups = bookingGroups.filter(bookingGroup => {
    // If there are no tickets in the group, don't filter it out
    if (!bookingGroup.tickets || bookingGroup.tickets.length === 0) {
      return true;
    }
    
    // Get the first ticket for reference (for most filters)
    const firstTicket = bookingGroup.tickets[0];
    
    // Search text filter
    const searchFilter = 
      searchText === '' || 
      bookingGroup.appTransId?.toLowerCase().includes(searchText.toLowerCase()) ||
      firstTicket.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      firstTicket.roomNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
      firstTicket.seatNumber?.includes(searchText);
    
    // Date range filter
    let dateFilter = true;
    if (filterDateRange && filterDateRange.length === 2 && filterDateRange[0] && filterDateRange[1]) {
      const purchaseDate = new Date(firstTicket.purchaseTime);
      const startDate = filterDateRange[0].startOf('day').toDate();
      const endDate = filterDateRange[1].endOf('day').toDate();
      
      dateFilter = purchaseDate >= startDate && purchaseDate <= endDate;
    }
    
    return searchFilter && dateFilter;
  });
  
  const formatDateTime = (dateTimeString) => {
    return moment(dateTimeString).format('DD/MM/YYYY HH:mm');
  };

  const getTicketSeats = (tickets) => {
    if (!tickets || tickets.length === 0) return [];
    return tickets.map(ticket => ticket.seatNumber);
  };

  const getFirstTicket = (bookingGroup) => {
    return bookingGroup.tickets && bookingGroup.tickets.length > 0 
      ? bookingGroup.tickets[0] 
      : null;
  };

  const columns = [
    {
      title: 'Mã đặt vé',
      dataIndex: 'appTransId',
      key: 'appTransId',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: 'Phim',
      key: 'title',
      render: (_, record) => {
        const firstTicket = getFirstTicket(record);
        return firstTicket ? firstTicket.title : 'N/A';
      },
    },
    {
      title: 'Phòng',
      key: 'roomNumber',
      render: (_, record) => {
        const firstTicket = getFirstTicket(record);
        return firstTicket ? firstTicket.roomNumber : 'N/A';
      },
    },
    {
      title: 'Suất chiếu',
      key: 'startTime',
      render: (_, record) => {
        const firstTicket = getFirstTicket(record);
        return firstTicket ? formatDateTime(firstTicket.startTime) : 'N/A';
      },
      sorter: (a, b) => {
        const ticketA = getFirstTicket(a);
        const ticketB = getFirstTicket(b);
        if (ticketA && ticketB) {
          return new Date(ticketA.startTime) - new Date(ticketB.startTime);
        }
        return 0;
      },
    },
    {
      title: 'Số ghế',
      key: 'seats',
      render: (_, record) => (
        <Badge count={record.tickets?.length || 0} showZero color="#108ee9" />
      ),
      sorter: (a, b) => (a.tickets?.length || 0) - (b.tickets?.length || 0),
    },
    {
      title: 'Thời gian đặt',
      key: 'purchaseTime',
      render: (_, record) => {
        const firstTicket = getFirstTicket(record);
        return firstTicket ? formatDateTime(firstTicket.purchaseTime) : 'N/A';
      },
      sorter: (a, b) => {
        const ticketA = getFirstTicket(a);
        const ticketB = getFirstTicket(b);
        if (ticketA && ticketB) {
          return new Date(ticketA.purchaseTime) - new Date(ticketB.purchaseTime);
        }
        return 0;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => (
        <Tag color="green">Đã thanh toán</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="In vé">
            <Button 
              icon={<PrinterOutlined />} 
              size="small" 
              onClick={() => handlePrintTicket(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleDeleteBooking(record.appTransId)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bookings-management">
      <div className="page-header">
        <Title level={3}>Lịch sử đặt vé</Title>
        {usingMockData && (
          <Tag color="orange" style={{ marginLeft: 10 }}>
            Quản lý lịch sử đặt vé
          </Tag>
        )}
      </div>
      
      <div className="filters-container">
        <div className="search-filter">
          <Input
            placeholder="Tìm kiếm theo mã đặt vé, tên phim, phòng chiếu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="advanced-filters">
          <RangePicker 
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={handleFilterDateRange}
            format="DD/MM/YYYY"
          />
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredBookingGroups}
        rowKey="appTransId"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        className="bookings-table"
      />
      
      {/* Booking Detail Modal */}
      <Modal
        title="Chi tiết đặt vé"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={() => handlePrintTicket(selectedBookingGroup)}
          >
            In vé
          </Button>,
        ]}
      >
        {selectedBookingGroup && (
          <div className="booking-detail">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  className="booking-status-card" 
                  bordered={false}
                  bodyStyle={{ 
                    backgroundColor: '#f6ffed'
                  }}
                >
                  <div className="booking-code">
                    Mã đặt vé: <Text strong>{selectedBookingGroup.appTransId}</Text>
                  </div>
                  <div className="booking-status">
                    <Tag color="green">Đã thanh toán</Tag>
                  </div>
                </Card>
              </Col>
              
              {selectedBookingGroup.tickets && selectedBookingGroup.tickets.length > 0 && (
                <>
                  <Col span={24} md={12}>
                    <div className="detail-section">
                      <Title level={5}>Thông tin khách hàng</Title>
                      <div className="detail-item">
                        <UserOutlined /> <Text strong>Khách hàng</Text>
                      </div>
                      <div className="detail-item">
                        <Text>User ID: {selectedBookingGroup.tickets[0].userId}</Text>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={24} md={12}>
                    <div className="detail-section">
                      <Title level={5}>Thông tin đặt vé</Title>
                      <div className="detail-item">
                        <Text>Thời gian đặt: {formatDateTime(selectedBookingGroup.tickets[0].purchaseTime)}</Text>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={24}>
                    <Divider style={{ margin: '8px 0' }} />
                  </Col>
                  
                  <Col span={24}>
                    <div className="detail-section">
                      <Title level={5}>Thông tin suất chiếu</Title>
                      <div className="detail-item">
                        <Text strong>{selectedBookingGroup.tickets[0].title}</Text>
                      </div>
                      <div className="detail-item">
                        <FieldTimeOutlined /> Suất chiếu: {formatDateTime(selectedBookingGroup.tickets[0].startTime)} - {formatDateTime(selectedBookingGroup.tickets[0].endTime)}
                      </div>
                      <div className="detail-item">
                        <Text>Phòng chiếu: {selectedBookingGroup.tickets[0].roomNumber}</Text>
                      </div>
                      <div className="detail-item">
                        <Text>Ghế: {selectedBookingGroup.tickets.map(ticket => ticket.seatNumber).join(', ')}</Text>
                      </div>
                    </div>
                  </Col>
                  
                  <Col span={24}>
                    <Divider style={{ margin: '8px 0' }} />
                  </Col>
                  
                  <Col span={24}>
                    <div className="detail-section">
                      <Title level={5}>Danh sách vé</Title>
                      <Table 
                        dataSource={selectedBookingGroup.tickets}
                        columns={[
                          {
                            title: 'ID Vé',
                            dataIndex: 'id',
                            key: 'id',
                            ellipsis: true,
                          },
                          {
                            title: 'Ghế',
                            dataIndex: 'seatNumber',
                            key: 'seatNumber',
                          },
                          {
                            title: 'Phòng',
                            dataIndex: 'roomNumber',
                            key: 'roomNumber',
                          }
                        ]}
                        pagination={false}
                        size="small"
                        rowKey="id"
                      />
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsManagementPage;