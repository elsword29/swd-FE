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
  Tooltip,
  message,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  CalendarOutlined,
  FilterOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { projectionService, movieService, roomService } from '../../services/api';
import '../style/ProjectionsManagementPage.css';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

const ProjectionsManagementPage = () => {
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterFilm, setFilterFilm] = useState(null);
  const [filterRoom, setFilterRoom] = useState(null);
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    fetchProjections();
    fetchFilms();
    fetchRooms();
  }, [pagination.current, pagination.pageSize, filterFilm, filterRoom, filterDateRange]);

  const fetchProjections = async () => {
    try {
      setLoading(true);
      
      // In a real application, we would use API params for filtering
      // Here we'll simulate it by fetching all and filtering client-side
      const response = await projectionService.getAll();
      
      setProjections(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projections:", error);
      message.error('Không thể tải danh sách suất chiếu');
      setLoading(false);
    }
  };

  const fetchFilms = async () => {
    try {
      const response = await movieService.getAll();
      setFilms(response.data);
    } catch (error) {
      console.error("Error fetching films:", error);
      message.error('Không thể tải danh sách phim');
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAll();
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      message.error('Không thể tải danh sách phòng chiếu');
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleFilterFilm = (value) => {
    setFilterFilm(value);
  };

  const handleFilterRoom = (value) => {
    setFilterRoom(value);
  };

  const handleFilterDateRange = (dates) => {
    setFilterDateRange(dates);
  };

  const handleDeleteProjection = (projectionId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa suất chiếu này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Việc xóa có thể ảnh hưởng đến các đặt vé đã có.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await projectionService.delete(projectionId);
          message.success('Xóa suất chiếu thành công');
          fetchProjections();
        } catch (error) {
          console.error("Error deleting projection:", error);
          message.error('Xóa suất chiếu thất bại');
        }
      },
    });
  };

  // Apply filters to projections
  const filteredProjections = projections.filter(projection => {
    // Search text filter
    const searchFilter = 
      searchText === '' || 
      (projection.film && projection.film.title.toLowerCase().includes(searchText.toLowerCase())) ||
      (projection.room && projection.room.name.toLowerCase().includes(searchText.toLowerCase()));
    
    // Film filter
    const filmFilter = 
      !filterFilm || 
      (projection.film && projection.film.id === filterFilm);
    
    // Room filter
    const roomFilter = 
      !filterRoom || 
      (projection.room && projection.room.id === filterRoom);
    
    // Date range filter
    let dateFilter = true;
    if (filterDateRange && filterDateRange.length === 2 && filterDateRange[0] && filterDateRange[1]) {
      const projectionDate = new Date(projection.startTime);
      const startDate = filterDateRange[0].startOf('day').toDate();
      const endDate = filterDateRange[1].endOf('day').toDate();
      
      dateFilter = projectionDate >= startDate && projectionDate <= endDate;
    }
    
    return searchFilter && filmFilter && roomFilter && dateFilter;
  });

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const columns = [
    {
      title: 'Phim',
      dataIndex: ['film', 'title'],
      key: 'film',
      render: (text, record) => (
        record.film ? record.film.title : 'N/A'
      ),
      sorter: (a, b) => (a.film && b.film) ? a.film.title.localeCompare(b.film.title) : 0,
    },
    {
      title: 'Phòng chiếu',
      dataIndex: ['room', 'name'],
      key: 'room',
      render: (text, record) => (
        record.room ? record.room.name : 'N/A'
      ),
      sorter: (a, b) => (a.room && b.room) ? a.room.name.localeCompare(b.room.name) : 0,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (text) => formatDateTime(text),
      sorter: (a, b) => new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text) => formatDateTime(text),
    },
    {
      title: 'Giá vé (VNĐ)',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price.toLocaleString('vi-VN'),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const now = new Date();
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        
        let status;
        let color;
        
        if (startTime > now) {
          status = 'Sắp chiếu';
          color = 'geekblue';
        } else if (startTime <= now && endTime >= now) {
          status = 'Đang chiếu';
          color = 'green';
        } else {
          status = 'Đã chiếu';
          color = 'volcano';
        }
        
        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Link to={`/staff/projections/edit/${record.id}`}>
              <Button type="primary" icon={<EditOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleDeleteProjection(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="projections-management">
      <div className="page-header">
        <Title level={3}>Quản lý lịch chiếu</Title>
        <Link to="/staff/projections/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm suất chiếu mới
          </Button>
        </Link>
      </div>
      
      <div className="filters-container">
        <div className="search-filter">
          <Input
            placeholder="Tìm kiếm phim, phòng chiếu"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
        </div>
        
        <div className="advanced-filters">
          <Select
            placeholder="Chọn phim"
            style={{ width: 200 }}
            onChange={handleFilterFilm}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {films.map(film => (
              <Option key={film.id} value={film.id}>{film.title}</Option>
            ))}
          </Select>
          
          <Select
            placeholder="Chọn phòng chiếu"
            style={{ width: 150 }}
            onChange={handleFilterRoom}
            allowClear
          >
            {rooms.map(room => (
              <Option key={room.id} value={room.id}>{room.name}</Option>
            ))}
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
        dataSource={filteredProjections}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        className="projections-table"
      />
    </div>
  );
};

export default ProjectionsManagementPage;