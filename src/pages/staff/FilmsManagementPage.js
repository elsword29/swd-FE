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
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/api';
import '../style/FilmsManagementPage.css';

const { Title } = Typography;
const { confirm } = Modal;

const FilmsManagementPage = () => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchFilms();
  }, [pagination.current, pagination.pageSize]);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const response = await movieService.getAll();
      
      // Process the response data to format it for the table
      const filmsData = response.data.map(film => ({
        ...film,
        key: film.id,
        genreNames: film.filmGenres ? film.filmGenres.map(fg => fg.genre.name) : []
      }));
      
      setFilms(filmsData);
      setPagination({
        ...pagination,
        total: response.data.length // Should come from API pagination in real app
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
          await movieService.delete(filmId);
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
    return (
      film.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (film.genreNames && film.genreNames.some(genre => 
        genre.toLowerCase().includes(searchText.toLowerCase())
      ))
    );
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
          {genreNames && genreNames.map(genre => (
            <Tag color="blue" key={genre}>
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
      render: (status) => {
        let color = status === 'Đang chiếu' ? 'green' : 
                    status === 'Sắp chiếu' ? 'geekblue' : 'volcano';
        return (
          <Tag color={color}>
            {status || 'Không xác định'}
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
            <Link to={`/staff/films/edit/${record.id}`}>
              <Button type="primary" icon={<EditOutlined />} size="small" />
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
        <Title level={3}>Quản lý phim</Title>
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