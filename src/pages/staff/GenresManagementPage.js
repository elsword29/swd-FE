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
  Tooltip
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

const GenresManagementPage = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Thêm thể loại mới');
  const [editingGenre, setEditingGenre] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await genreService.getAll();
      setGenres(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching genres:", error);
      message.error('Không thể tải danh sách thể loại');
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
      fetchGenres();
      setSubmitting(false);
    } catch (error) {
      console.error("Error submitting genre:", error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      setSubmitting(false);
    }
  };

  const handleDeleteGenre = (genreId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa thể loại này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Xóa thể loại có thể ảnh hưởng đến các phim đã sử dụng thể loại này.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await genreService.delete(genreId);
          message.success('Xóa thể loại thành công');
          fetchGenres();
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
      render: (_, record) => record.films ? record.films.length : 0,
      sorter: (a, b) => (a.films ? a.films.length : 0) - (b.films ? b.films.length : 0),
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