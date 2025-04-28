import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  TimePicker, 
  InputNumber,
  Typography, 
  Divider, 
  Row,
  Col,
  Spin,
  message,
  Alert
} from 'antd';
import { 
  SaveOutlined, 
  RollbackOutlined, 
  FieldTimeOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment';
import { movieService, roomService, projectionService } from '../../services/api';
import '../style/ProjectionForm.css';

const { Title, Text } = Typography;
const { Option } = Select;

const ProjectionForm = ({ mode = 'add' }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [films, setFilms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [calculatedEndTime, setCalculatedEndTime] = useState(null);
  
  useEffect(() => {
    fetchFilms();
    fetchRooms();
    
    if (mode === 'edit' && id) {
      fetchProjectionDetails(id);
    } else {
      // Set default values for add mode
      form.setFieldsValue({
        price: 75000, // Default price
      });
    }
  }, [mode, id]);
  
  // Calculate end time whenever film, date or time changes
  useEffect(() => {
    if (selectedFilm && selectedDate && selectedTime) {
      calculateEndTime();
    }
  }, [selectedFilm, selectedDate, selectedTime]);
  
  const fetchFilms = async () => {
    try {
      const response = await movieService.getAll();
      setFilms(response.data.filter(film => film.status !== 'Ngừng chiếu'));
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
  
  const fetchProjectionDetails = async (projectionId) => {
    try {
      setLoading(true);
      const response = await projectionService.getById(projectionId);
      const projection = response.data;
      
      // Format the data for the form
      const startDateTime = moment(projection.startTime);
      const formData = {
        filmId: projection.filmId,
        roomId: projection.roomId,
        date: startDateTime,
        time: startDateTime,
        price: projection.price,
      };
      
      form.setFieldsValue(formData);
      
      // Set selected values for calculations
      setSelectedFilm(projection.film);
      setSelectedRoom(projection.room);
      setSelectedDate(startDateTime);
      setSelectedTime(startDateTime);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projection details:", error);
      message.error('Không thể tải thông tin suất chiếu');
      setLoading(false);
    }
  };
  
  const calculateEndTime = () => {
    if (!selectedFilm || !selectedFilm.duration || !selectedDate || !selectedTime) {
      setCalculatedEndTime(null);
      return;
    }
    
    const startDateTime = moment(selectedDate)
      .hour(selectedTime.hour())
      .minute(selectedTime.minute())
      .second(0);
    
    const endDateTime = moment(startDateTime).add(selectedFilm.duration, 'minutes');
    setCalculatedEndTime(endDateTime);
  };
  
  const handleFilmChange = async (filmId) => {
    try {
      const response = await movieService.getById(filmId);
      setSelectedFilm(response.data);
    } catch (error) {
      console.error("Error fetching film details:", error);
    }
  };
  
  const handleRoomChange = async (roomId) => {
    try {
      const response = await roomService.getById(roomId);
      setSelectedRoom(response.data);
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };
  
  const checkTimeConflicts = async (values) => {
    // In a real application, we would check if the time slot is available
    // For this example, we'll just simulate it
    return false; // No conflicts
  };
  
  const handleSubmit = async (values) => {
    try {
      // Check for time conflicts
      const hasConflicts = await checkTimeConflicts(values);
      if (hasConflicts) {
        message.error('Đã có suất chiếu khác trong khung giờ này!');
        return;
      }
      
      setSubmitting(true);
      
      // Combine date and time into a single datetime
      const startDateTime = moment(values.date)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .format('YYYY-MM-DDTHH:mm:ss');
      
      // Calculate end time based on film duration
      const endDateTime = calculatedEndTime.format('YYYY-MM-DDTHH:mm:ss');
      
      // Prepare data for submission
      const projectionData = {
        filmId: values.filmId,
        roomId: values.roomId,
        startTime: startDateTime,
        endTime: endDateTime,
        price: values.price,
      };
      
      let response;
      if (mode === 'add') {
        response = await projectionService.create(projectionData);
        message.success('Thêm suất chiếu mới thành công!');
      } else {
        response = await projectionService.update(id, projectionData);
        message.success('Cập nhật suất chiếu thành công!');
      }
      
      setSubmitting(false);
      navigate('/staff/projections');
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/staff/projections');
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải thông tin suất chiếu...</Text>
      </div>
    );
  }
  
  return (
    <div className="projection-form-container">
      <div className="form-header">
        <Title level={3}>
          {mode === 'add' ? 'Thêm suất chiếu mới' : 'Chỉnh sửa suất chiếu'}
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
        className="projection-form"
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="filmId"
              label="Chọn phim"
              rules={[{ required: true, message: 'Vui lòng chọn phim' }]}
            >
              <Select
                placeholder="Chọn phim"
                onChange={handleFilmChange}
                showSearch
                optionFilterProp="children"
              >
                {films.map(film => (
                  <Option key={film.id} value={film.id}>
                    {film.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="roomId"
              label="Chọn phòng chiếu"
              rules={[{ required: true, message: 'Vui lòng chọn phòng chiếu' }]}
            >
              <Select
                placeholder="Chọn phòng chiếu"
                onChange={handleRoomChange}
              >
                {rooms.map(room => (
                  <Option key={room.id} value={room.id}>
                    {room.name} - {room.capacity} ghế
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="date"
              label="Ngày chiếu"
              rules={[{ required: true, message: 'Vui lòng chọn ngày chiếu' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                format="DD/MM/YYYY"
                onChange={handleDateChange}
                disabledDate={(current) => {
                  // Disable dates before today
                  return current && current < moment().startOf('day');
                }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="time"
              label="Giờ bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}
            >
              <TimePicker 
                style={{ width: '100%' }} 
                format="HH:mm"
                minuteStep={5}
                onChange={handleTimeChange}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="price"
              label="Giá vé (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá vé' }]}
            >
              <InputNumber 
                style={{ width: '100%' }}
                min={0}
                step={5000}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                prefix={<DollarOutlined />}
              />
            </Form.Item>
          </Col>
          
          {calculatedEndTime && (
            <Col xs={24} sm={12}>
              <div className="calculated-end-time">
                <Text strong>Thời gian kết thúc:</Text>
                <Text> {calculatedEndTime.format('DD/MM/YYYY HH:mm')}</Text>
              </div>
            </Col>
          )}
        </Row>
        
        {selectedFilm && selectedRoom && (
          <div className="projection-info">
            <Alert
              message="Thông tin suất chiếu"
              description={
                <div>
                  <p><strong>Phim:</strong> {selectedFilm.title} ({selectedFilm.duration} phút)</p>
                  <p><strong>Phòng chiếu:</strong> {selectedRoom.name} - {selectedRoom.capacity} ghế</p>
                  {calculatedEndTime && (
                    <p><strong>Thời gian chiếu:</strong> {selectedTime?.format('HH:mm')} - {calculatedEndTime.format('HH:mm')}</p>
                  )}
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}
        
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
            {mode === 'add' ? 'Thêm suất chiếu' : 'Cập nhật suất chiếu'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectionForm;