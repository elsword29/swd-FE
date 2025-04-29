import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  DatePicker, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  message, 
  Spin,
  Image 
} from 'antd';
import { 
  SaveOutlined, 
  RollbackOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { movieService } from '../../services/api';
import '../style/FilmForm.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const FilmForm = ({ mode = 'add' }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [posterPreview, setPosterPreview] = useState('');
  
  // Status options for a film with values matching API requirements
  const statusOptions = [
    { value: 0, label: 'Sắp chiếu' },
    { value: 1, label: 'Đang chiếu' },
    { value: 3, label: 'Ngừng chiếu' },
  ];

  useEffect(() => {
    // If in edit mode, fetch film details
    if (mode === 'edit' && id) {
      fetchFilmDetails(id);
    }
  }, [mode, id]);

  const fetchFilmDetails = async (filmId) => {
    try {
      setLoading(true);
      const response = await movieService.getById(filmId);
      const film = response.data;
      
      // Format the data for the form
      const formData = {
        ...film,
        releaseDate: film.releaseDate ? moment(film.releaseDate) : null,
        // Convert status to number if it's not already
        status: typeof film.status === 'number' ? film.status : 
                 film.status === 'Sắp chiếu' ? 0 : 
                 film.status === 'Đang chiếu' ? 1 : 
                 film.status === 'Ngừng chiếu' ? 3 : 0
      };
      
      form.setFieldsValue(formData);
      
      if (film.imageURL) {
        setPosterPreview(film.imageURL);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching film details:", error);
      message.error('Không thể tải thông tin phim');
      setLoading(false);
    }
  };

  const handlePosterUrlChange = (e) => {
    const url = e.target.value;
    setPosterPreview(url);
    form.setFieldsValue({ imageURL: url });
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Prepare data for submission
      const filmData = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
        // Make sure status is a number
        status: Number(values.status),
        // Set filmGenres to empty string as per API sample
        filmGenres: ""
      };

      let response;
      
      if (mode === 'add') {
        response = await movieService.create(filmData);
        message.success('Thêm phim mới thành công!');
      } else {
        response = await movieService.update(id, filmData);
        message.success('Cập nhật phim thành công!');
      }
      
      setSubmitting(false);
      navigate('/staff/films');
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/staff/films');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải thông tin phim...</Text>
      </div>
    );
  }

  return (
    <div className="film-form-container">
      <div className="form-header">
        <Title level={3}>
          {mode === 'add' ? 'Thêm phim mới' : 'Chỉnh sửa phim'}
        </Title>
        <div className="form-actions">
          <Button 
            icon={<RollbackOutlined />}
            onClick={handleCancel}
          >
            Quay lại
          </Button>
        </div>
      </div>
      
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="film-form"
        initialValues={{
          status: 0,
          duration: 90,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={24} md={16} lg={18}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Tên phim"
                  rules={[{ 
                    required: true, 
                    message: 'Vui lòng nhập tên phim' 
                  }]}
                >
                  <Input placeholder="Nhập tên phim" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="originalTitle"
                  label="Tên gốc"
                >
                  <Input placeholder="Nhập tên gốc (nếu có)" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="director"
                  label="Đạo diễn"
                >
                  <Input placeholder="Nhập tên đạo diễn" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item
                  name="duration"
                  label="Thời lượng (phút)"
                  rules={[{ 
                    required: true, 
                    message: 'Vui lòng nhập thời lượng phim' 
                  }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item
                  name="releaseYear"
                  label="Năm sản xuất"
                  rules={[{ 
                    required: true, 
                    message: 'Vui lòng nhập năm sản xuất' 
                  }]}
                >
                  <InputNumber 
                    min={1900} 
                    max={new Date().getFullYear() + 5} 
                    style={{ width: '100%' }} 
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={8}>
                <Form.Item
                  name="releaseDate"
                  label="Ngày khởi chiếu"
                >
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ 
                    required: true, 
                    message: 'Vui lòng chọn trạng thái' 
                  }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    {statusOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Tóm tắt nội dung"
                >
                  <TextArea rows={4} placeholder="Nhập tóm tắt nội dung phim" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="trailerURL"
                  label="URL Trailer"
                >
                  <Input placeholder="Nhập URL trailer (YouTube)" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="cast"
                  label="Diễn viên"
                >
                  <Input placeholder="Nhập danh sách diễn viên chính" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          
          <Col xs={24} sm={24} md={8} lg={6}>
            <Form.Item
              name="imageURL"
              label="URL Poster phim"
              rules={[{ 
                required: true, 
                message: 'Vui lòng nhập URL poster phim' 
              }]}
            >
              <Input 
                placeholder="Nhập URL hình ảnh poster" 
                onChange={handlePosterUrlChange}
              />
            </Form.Item>
            
            {posterPreview && (
              <div className="poster-preview" style={{ marginTop: '16px' }}>
                <Image
                  src={posterPreview}
                  alt="Poster preview"
                  style={{ maxWidth: '100%' }}
                  fallback="https://via.placeholder.com/500x750?text=Image+Error"
                />
              </div>
            )}
            
            <Text type="secondary" className="upload-hint" style={{ display: 'block', marginTop: '8px' }}>
              Kích thước khuyến nghị: 500x750 pixel
            </Text>
          </Col>
        </Row>
        
        <Divider />
        
        <Form.Item className="form-submit-buttons">
          <Button 
            type="default" 
            icon={<RollbackOutlined />} 
            onClick={handleCancel}
            style={{ marginRight: 8 }}
          >
            Hủy
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<SaveOutlined />}
            loading={submitting}
          >
            {mode === 'add' ? 'Thêm phim' : 'Cập nhật phim'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FilmForm;