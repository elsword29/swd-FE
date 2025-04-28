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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState(null);

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

  const handleDeleteClick = (genreId) => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre) {
      message.error('Không tìm thấy thông tin thể loại');
      return;
    }
    setGenreToDelete(genre);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!genreToDelete) return;
    
    try {
      setLoading(true);
      console.log('Deleting genre with ID:', genreToDelete.id);
      
      // Call API to delete the genre
      await genreService.delete(genreToDelete.id);
      
      message.success('Xóa thể loại thành công');
      
      // Close modal and clear selection
      setDeleteModalVisible(false);
      setGenreToDelete(null);
      
      // Refresh the data
      fetchData();
    } catch (error) {
      console.error("Error deleting genre:", error);
      message.error('Xóa thể loại thất bại');
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setGenreToDelete(null);
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
              onClick={() => handleDeleteClick(record.id)}
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
      
      {/* Add/Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa thể loại"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Xóa"
        cancelText="Hủy"
        okType="danger"
      >
        {genreToDelete && (
          <div>
            <p><strong>Tên thể loại:</strong> {genreToDelete.name}</p>
            {genreToDelete.filmCount > 0 ? (
              <p style={{ color: 'red' }}>
                Thể loại này đang được sử dụng bởi {genreToDelete.filmCount} phim. 
                Việc xóa có thể ảnh hưởng đến các phim này.
              </p>
            ) : (
              <p>Bạn có chắc chắn muốn xóa thể loại này?</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GenresManagementPage;