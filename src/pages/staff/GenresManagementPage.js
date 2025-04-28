import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Input, 
  Modal, 
  Form, 
  message,
  Tooltip,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  ExclamationCircleOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { genreService } from '../../services/api';
import '../style/GenresManagementPage.css';

const { Title } = Typography;
const { confirm } = Modal;

// Add FilmGenre service for counting films per genre
const filmGenreService = {
  getAll: () => {
    return fetch('https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api/FilmGenre')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      });
  }
};

const GenresManagementPage = () => {
  const [genres, setGenres] = useState([]);
  const [filmGenres, setFilmGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Thêm thể loại mới');
  const [editingGenre, setEditingGenre] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch genres and film genres in parallel
      const [genresResponse, filmGenresResponse] = await Promise.all([
        genreService.getAll(),
        filmGenreService.getAll()
      ]);
      
      // Store film genres data
      setFilmGenres(filmGenresResponse);
      
      // Process genres with film counts
      const genresWithFilmCounts = genresResponse.data.map(genre => {
        // Count films associated with this genre
        const count = filmGenresResponse.filter(fg => fg.genreId === genre.id).length;
        return {
          ...genre,
          filmCount: count
        };
      });
      
      setGenres(genresWithFilmCounts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error('Không thể tải dữ liệu thể loại');
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const showAddModal = () => {
    setModalTitle('Thêm thể loại mới');
    setEditingGenre(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (genre) => {
    setModalTitle('Chỉnh sửa thể loại');
    setEditingGenre(genre);
    form.setFieldsValue({
      name: genre.name,
      description: genre.description
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      if (editingGenre) {
        // Update existing genre
        await genreService.update(editingGenre.id, values);
        message.success('Cập nhật thể loại thành công');
      } else {
        // Create new genre
        await genreService.create(values);
        message.success('Thêm thể loại mới thành công');
      }

      setModalVisible(false);
      fetchData(); // Fetch all data again to update film counts
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting genre:", error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      setSubmitting(false);
    }
  };

  const handleDeleteGenre = (genreId) => {
    // Check if this genre has associated films
    const filmCount = filmGenres.filter(fg => fg.genreId === genreId).length;
    
    // Create warning message based on film count
    const warningMessage = filmCount > 0 
      ? `Thể loại này đang được sử dụng bởi ${filmCount} phim. Việc xóa có thể ảnh hưởng đến các phim này.`
      : 'Bạn có chắc chắn muốn xóa thể loại này?';
    
    confirm({
      title: 'Xóa thể loại',
      icon: <ExclamationCircleOutlined />,
      content: warningMessage,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await genreService.delete(genreId);
          message.success('Xóa thể loại thành công');
          fetchData(); // Fetch all data again to update film counts
        } catch (error) {
          console.error("Error deleting genre:", error);
          message.error('Xóa thể loại thất bại');
        }
      },
    });
  };

  const filteredGenres = genres.filter(genre => {
    return genre.name.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'Tên thể loại',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số phim',
      dataIndex: 'filmCount',
      key: 'filmCount',
      render: (filmCount) => (
        <Badge 
          count={filmCount} 
          style={{ backgroundColor: filmCount > 0 ? '#108ee9' : '#d9d9d9' }} 
          showZero 
        />
      ),
      sorter: (a, b) => a.filmCount - b.filmCount,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleDeleteGenre(record.id)}
              // Disable delete button if genre has associated films
              // disabled={record.filmCount > 0}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="genres-management">
      <div className="page-header">
        <Title level={3}>Quản lý thể loại phim</Title>
        <Space>
          <Input
            placeholder="Tìm kiếm thể loại"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm thể loại
          </Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredGenres}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        loading={loading}
        className="genres-table"
      />
      
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting}
            onClick={handleModalSubmit}
          >
            {editingGenre ? 'Cập nhật' : 'Thêm'}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên thể loại"
            rules={[{ required: true, message: 'Vui lòng nhập tên thể loại' }]}
          >
            <Input placeholder="Nhập tên thể loại" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả thể loại" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GenresManagementPage;