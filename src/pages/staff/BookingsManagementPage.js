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
  message 
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  PrinterOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { bookingService } from '../../services/api';
import '../style/BookingsManagementPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const BookingsManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [pagination.current, pagination.pageSize, filterStatus, filterDateRange]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // In a real application, we would use API params for filtering
      // Here we'll simulate it by fetching all and filtering client-side
      const response = await bookingService.getAll();
      
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error('Không thể tải lịch sử đặt vé');
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

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleDeleteBooking = (bookingId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa đơn đặt vé này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await bookingService.delete(bookingId);
          message.success('Xóa đơn đặt vé thành công');
          fetchBookings();
        } catch (error) {
          console.error("Error deleting booking:", error);
          message.error('Xóa đơn đặt vé thất bại');
        }
      },
    });
  };

  const handlePrintTicket = (booking) => {
    // In a real application, this would trigger a print function
    message.success('Đã gửi lệnh in vé');
  };

  // Apply filters to bookings
  const filteredBookings = bookings.filter(booking => {
    // Search text filter (by booking code, customer name, phone, email)
    const searchFilter = 
      searchText === '' || 
      booking.bookingCode?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.customerName?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.customerPhone?.includes(searchText) ||
      booking.customerEmail?.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.projection?.film?.title.toLowerCase().includes(searchText.toLowerCase());
    
    // Status filter
    const statusFilter = !filterStatus || booking.status === filterStatus;
    
    // Date range filter
    let dateFilter = true;
    if (filterDateRange && filterDateRange.length === 2 && filterDateRange[0] && filterDateRange[1]) {
      const bookingDate = new Date(booking.bookingTime);
      const startDate = filterDateRange[0].startOf('day').toDate();
      const endDate = filterDateRange[1].endOf('day').toDate();
      
      dateFilter = bookingDate >= startDate && bookingDate <= endDate;
    }
    
    return searchFilter && statusFilter && dateFilter;
  });

  const getStatusTag = (status) => {
    switch (status) {
      case 'Completed':
        return <Tag color="green">Đã thanh toán</Tag>;
      case 'Cancelled':
        return <Tag color="red">Đã hủy</Tag>;
      case 'Pending':
        return <Tag color="orange">Chờ thanh toán</Tag>;
      case 'Confirmed':
        return <Tag color="blue">Đã xác nhận</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const formatDateTime = (dateTimeString) => {
    return moment(dateTimeString).format('DD/MM/YYYY HH:mm');
  };

  const calculateTotalAmount = (booking) => {
    const seatCount = booking.seats ? booking.seats.length : 0;
    return seatCount * booking.projection.price;
  };

  const columns = [
    {
      title: 'Mã đặt vé',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="customer-contact">{record.customerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Phim',
      dataIndex: ['projection', 'film', 'title'],
      key: 'film',
      render: (text, record) => (
        record.projection?.film ? record.projection.film.title : 'N/A'
      ),
    },
    {
      title: 'Suất chiếu',
      key: 'showtime',
      render: (_, record) => (
        record.projection ? formatDateTime(record.projection.startTime) : 'N/A'
      ),
      sorter: (a, b) => 
        new Date(a.projection?.startTime || 0) - new Date(b.projection?.startTime || 0),
    },
    {
      title: 'Số ghế',
      key: 'seats',
      render: (_, record) => (
        <Badge count={record.seats?.length || 0} showZero color="#108ee9" />
      ),
      sorter: (a, b) => (a.seats?.length || 0) - (b.seats?.length || 0),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      render: (_, record) => (
        record.projection ? 
        `${calculateTotalAmount(record).toLocaleString('vi-VN')} VNĐ` : 
        'N/A'
      ),
      sorter: (a, b) => calculateTotalAmount(a) - calculateTotalAmount(b),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'bookingTime',
      key: 'bookingTime',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.bookingTime) - new Date(b.bookingTime),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
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
              onClick={() => handleDeleteBooking(record.id)}
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
      </div>
      
      <div className="filters-container">
        <div className="search-filter">
          <Input
            placeholder="Tìm kiếm theo mã đặt vé, tên khách hàng, phim..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="advanced-filters">
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            onChange={handleFilterStatus}
            allowClear
          >
            <Option value="Completed">Đã thanh toán</Option>
            <Option value="Cancelled">Đã hủy</Option>
            <Option value="Pending">Chờ thanh toán</Option>
            <Option value="Confirmed">Đã xác nhận</Option>
          </Select>
          
          <RangePicker 
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={handleFilterDateRange}
            format="DD/MM/YYYY"
          />
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="id"
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
            onClick={() => handlePrintTicket(selectedBooking)}
          >
            In vé
          </Button>,
        ]}
      >
        {selectedBooking && (
          <div className="booking-detail">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card 
                  className="booking-status-card" 
                  bordered={false}
                  bodyStyle={{ 
                    backgroundColor: 
                      selectedBooking.status === 'Completed' ? '#f6ffed' : 
                      selectedBooking.status === 'Cancelled' ? '#fff1f0' : 
                      selectedBooking.status === 'Pending' ? '#fff7e6' : '#e6f7ff'
                  }}
                >
                  <div className="booking-code">
                    Mã đặt vé: <Text strong>{selectedBooking.bookingCode}</Text>
                  </div>
                  <div className="booking-status">
                    {getStatusTag(selectedBooking.status)}
                  </div>
                </Card>
              </Col>
              
              <Col span={24} md={12}>
                <div className="detail-section">
                  <Title level={5}>Thông tin khách hàng</Title>
                  <div className="detail-item">
                    <UserOutlined /> <Text strong>{selectedBooking.customerName}</Text>
                  </div>
                  <div className="detail-item">
                    <PhoneOutlined /> {selectedBooking.customerPhone}
                  </div>
                  <div className="detail-item">
                    <MailOutlined /> {selectedBooking.customerEmail}
                  </div>
                </div>
              </Col>
              
              <Col span={24} md={12}>
                <div className="detail-section">
                  <Title level={5}>Thông tin đặt vé</Title>
                  <div className="detail-item">
                    <CalendarOutlined /> Thời gian đặt: {formatDateTime(selectedBooking.bookingTime)}
                  </div>
                  <div className="detail-item">
                    <Text>Phương thức thanh toán: {selectedBooking.paymentMethod || 'Không xác định'}</Text>
                  </div>
                </div>
              </Col>
              
              <Col span={24}>
                <Divider style={{ margin: '8px 0' }} />
              </Col>
              
              <Col span={24}>
                <div className="detail-section">
                  <Title level={5}>Thông tin suất chiếu</Title>
                  {selectedBooking.projection && (
                    <>
                      <div className="detail-item">
                        <Text strong>{selectedBooking.projection.film?.title}</Text>
                      </div>
                      <div className="detail-item">
                        <FieldTimeOutlined /> Suất chiếu: {formatDateTime(selectedBooking.projection.startTime)}
                      </div>
                      <div className="detail-item">
                        <Text>Phòng chiếu: {selectedBooking.projection.room?.name}</Text>
                      </div>
                      <div className="detail-item">
                        <Text>Ghế: {selectedBooking.seats?.join(', ') || 'Không có'}</Text>
                      </div>
                    </>
                  )}
                </div>
              </Col>
              
              <Col span={24}>
                <Divider style={{ margin: '8px 0' }} />
              </Col>
              
              <Col span={24}>
                <div className="detail-section payment-summary">
                  <div className="payment-row">
                    <Text>Giá vé:</Text>
                    <Text>{selectedBooking.projection?.price.toLocaleString('vi-VN')} VNĐ</Text>
                  </div>
                  <div className="payment-row">
                    <Text>Số lượng ghế:</Text>
                    <Text>{selectedBooking.seats?.length || 0}</Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div className="payment-row total">
                    <Text strong>Tổng thanh toán:</Text>
                    <Text strong>
                      {calculateTotalAmount(selectedBooking).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingsManagementPage;