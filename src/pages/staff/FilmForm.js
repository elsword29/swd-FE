import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  DatePicker, 
  Upload, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  message, 
  Spin 
} from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  RollbackOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { movieService, genreService } from '../../services/api';
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
  const [genres, setGenres] = useState([]);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  
  // Status options for a film
  const statusOptions = [
    { value: 'Đang chiếu', label: 'Đang chiếu' },
    { value: 'Sắp chiếu', label: 'Sắp chiếu' },
    { value: 'Ngừng chiếu', label: 'Ngừng chiếu' },
  ];
  
  // Age rating options
  const ratingOptions = [
    { value: 'P', label: 'P - Phim dành cho mọi lứa tuổi' },
    { value: 'C13', label: 'C13 - Phim cấm khán giả dưới 13 tuổi' },
    { value: 'C16', label: 'C16 - Phim cấm khán giả dưới 16 tuổi' },
    { value: 'C18', label: 'C18 - Phim cấm khán giả dưới 18 tuổi' },
  ];

  useEffect(() => {
    // Fetch genres
    const fetchGenres = async () => {
      try {
        const response = await genreService.getAll();
        setGenres(response.data);
      } catch (error) {
        console.error("Error fetching genres:", error);
        message.error('Không thể tải danh sách thể loại');
      }
    };

    fetchGenres();

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
        genreIds: film.filmGenres ? film.filmGenres.map(fg => fg.genreId) : [],
      };
      
      form.setFieldsValue(formData);
      
      if (film.posterURL) {
        setPosterPreview(film.posterURL);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching film details:", error);
      message.error('Không thể tải thông tin phim');
      setLoading(false);
    }
  };

  const handlePosterChange = info => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      // Get the uploaded file
      setPosterFile(info.file.originFileObj);
      
      // Generate preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Prepare data for submission
      const filmData = {
        ...values,
        releaseDate: values.releaseDate ? values.releaseDate.format('YYYY-MM-DD') : null,
      };

      let response;
      
      // If we have a poster file, we would normally upload it first and get the URL
      // For this example, we'll assume the posterURL is directly set in the form
      // In a real app, you'd handle file uploads separately
      
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
          status: 'Sắp chiếu',
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
              
              <Col xs={24} sm={12}>
                <Form.Item
                  name="rating"
                  label="Phân loại"
                  rules={[{ 
                    required: true, 
                    message: 'Vui lòng chọn phân loại độ tuổi' 
                  }]}
                >
                  <Select placeholder="Chọn phân loại độ tuổi">
                    {ratingOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="genreIds"
                  label="Thể loại"
                  rules={[{ 
                    required: true,
                    message: 'Vui lòng chọn ít nhất một thể loại',
                    type: 'array', 
                  }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn thể loại"
                    style={{ width: '100%' }}
                  >
                    {genres.map(genre => (
                      <Option key={genre.id} value={genre.id}>
                        {genre.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="summary"
                  label="Tóm tắt nội dung"
                >
                  <TextArea rows={4} placeholder="Nhập tóm tắt nội dung phim" />
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="trailerUrl"
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
              name="posterURL"
              label="Poster phim"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
            >
              <div className="poster-upload-container">
                {posterPreview ? (
                  <div className="poster-preview">
                    <img src={posterPreview} alt="Poster preview" />
                    <Button 
                      icon={<DeleteOutlined />} 
                      onClick={() => {
                        setPosterPreview('');
                        setPosterFile(null);
                        form.setFieldsValue({ posterURL: undefined });
                      }}
                      danger
                      className="delete-poster-btn"
                    />
                  </div>
                ) : (
                  <Upload
                    name="poster"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handlePosterChange}
                  >
                    <div className="upload-button">
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  </Upload>
                )}
                <Text type="secondary" className="upload-hint">
                  Kích thước khuyến nghị: 500x750 pixel
                </Text>
              </div>
            </Form.Item>
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