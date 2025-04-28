import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Modal, 
  message, 
  Tag, 
  Image, 
  Tooltip 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ExclamationCircleOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/api';
import '../style/FilmsManagementPage.css';

const { Title } = Typography;
const { confirm } = Modal;

// Mock data for fallback when API fails
//import { mockFilms, getMockFilms, deleteMockFilm } from './mockFilmData';

const FilmsManagementPage = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  //const [usingMockData, setUsingMockData] = useState(false);

  // Function to map status code to display text
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 0:
        return 'Sắp chiếu';
      case 1:
        return 'Đang chiếu';
      case 3:
        return 'Ngừng chiếu';
      default:
        return 'Không xác định';
    }
  };

  // Function to get status color
  const getStatusColor = (statusCode) => {
    switch (statusCode) {
      case 0:
        return 'geekblue'; // Sắp chiếu
      case 1:
        return 'green'; // Đang chiếu
      case 3:
        return 'volcano'; // Ngừng chiếu
      default:
        return 'default';
    }
  };

  useEffect(() => {
    fetchFilms();
  }, [pagination.current, pagination.pageSize]);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      let response;
      
      try {
        // Try to fetch from real API first
        response = await movieService.getAll();
       // setUsingMockData(false);
      } catch (apiError) {
        console.warn("API error, using mock data instead:", apiError);
        // Fallback to mock data if API fails
        //response = { data: mockFilms };
       // setUsingMockData(true);
      }
      
      // Process the response data to format it for the table
      const filmsData = response.data.map(film => {
        // Extract year from releaseDate
        const releaseYear = film.releaseDate ? new Date(film.releaseDate).getFullYear() : null;
        
        // Format genres
        let genreNames = [];
        if (typeof film.filmGenres === 'string') {
          // Handle case where filmGenres is a comma-separated string
          genreNames = film.filmGenres.split(',').map(g => g.trim());
        } else if (Array.isArray(film.filmGenres)) {
          // Handle case where filmGenres is an array of objects
          genreNames = film.filmGenres.map(fg => fg.genre?.name || fg);
        }
        
        return {
          ...film,
          key: film.id,
          posterURL: film.imageURL, // Map imageURL to posterURL for display
          genreNames: genreNames,
          releaseYear: releaseYear,
          statusLabel: getStatusLabel(film.status)
        };
      });
      
      setFilms(filmsData);
      setPagination({
        ...pagination,
        total: response.data.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching films:", error);
      message.error('Không thể tải danh sách phim');
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleDeleteFilm = (filmId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa phim này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          try {
            // Try to call the real API first
            await movieService.delete(filmId);
          } catch (apiError) {
            // Fall back to mock delete if real API fails
            console.warn("API delete error, using mock delete instead:", apiError);
           // await deleteMockFilm(filmId);
          }
          
          message.success('Xóa phim thành công');
          fetchFilms();
        } catch (error) {
          console.error("Error deleting film:", error);
          message.error('Xóa phim thất bại');
        }
      },
    });
  };

  const filteredFilms = films.filter(film => {
    // Filter by title
    const titleMatch = film.title.toLowerCase().includes(searchText.toLowerCase());
    
    // Filter by genres
    const genreMatch = film.genreNames && film.genreNames.some(genre => 
      genre.toLowerCase().includes(searchText.toLowerCase())
    );
    
    return titleMatch || genreMatch;
  });

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'posterURL',
      key: 'posterURL',
      width: 120,
      render: (posterURL) => (
        <Image
          src={posterURL || 'https://via.placeholder.com/120x180?text=No+Image'}
          alt="Poster"
          style={{ width: 80, height: 120, objectFit: 'cover' }}
          fallback="https://via.placeholder.com/120x180?text=Error"
        />
      ),
    },
    {
      title: 'Tên phim',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <Link to={`/staff/films/edit/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Thể loại',
      dataIndex: 'genreNames',
      key: 'genreNames',
      render: (genreNames) => (
        <>
          {genreNames && genreNames.map((genre, index) => (
            <Tag color="blue" key={index}>
              {genre}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Thời lượng',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} phút`,
      sorter: (a, b) => a.duration - b.duration,
    },
    {
      title: 'Năm sản xuất',
      dataIndex: 'releaseYear',
      key: 'releaseYear',
      sorter: (a, b) => a.releaseYear - b.releaseYear,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        return (
          <Tag color={getStatusColor(status)}>
            {record.statusLabel}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180, // Increased width to accommodate the new button
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Link to={`/staff/films/edit/${record.id}`}>
              <Button type="primary" icon={<EditOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Quản lý thể loại">
            <Link to={`/staff/films/${record.id}/genres`}>
              <Button icon={<TagsOutlined />} size="small" style={{ backgroundColor: '#722ed1', color: 'white' }} />
            </Link>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleDeleteFilm(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="films-management">
      <div className="page-header">
        <Title level={3}>
          Quản lý phim
        </Title>
        <Space>
          <Input
            placeholder="Tìm kiếm phim"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Link to="/staff/films/add">
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm phim mới
            </Button>
          </Link>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredFilms}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        className="films-table"
      />
    </div>
  );
};

export default FilmsManagementPage;