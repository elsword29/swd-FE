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
  const [originalProjection, setOriginalProjection] = useState(null);
  
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
      // Filter out films that are not showing if needed
      setFilms(response.data.filter(film => film.status !== 3)); // Assuming 3 is "Ngừng chiếu"
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
      
      console.log("Fetched projection data:", projection);
      setOriginalProjection(projection);
      
      // Find the film and room objects
      const filmObj = films.find(f => f.id === projection.filmId) || projection.film;
      const roomObj = rooms.find(r => r.id === projection.roomId) || projection.room;
      
      setSelectedFilm(filmObj);
      setSelectedRoom(roomObj);
      
      // Format the data for the form
      const startDateTime = moment(projection.startTime);
      
      setSelectedDate(startDateTime);
      setSelectedTime(startDateTime);
      
      const formData = {
        filmId: projection.filmId,
        roomId: projection.roomId,
        date: startDateTime,
        time: startDateTime,
        price: projection.price,
      };
      
      form.setFieldsValue(formData);
      
      // Calculate end time based on film duration
      calculateEndTime();
      
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
      // Find film in existing array first
      let film = films.find(f => f.id === filmId);
      
      if (!film) {
        // If not found, fetch from API
        const response = await movieService.getById(filmId);
        film = response.data;
      }
      
      setSelectedFilm(film);
    } catch (error) {
      console.error("Error fetching film details:", error);
    }
  };
  
  const handleRoomChange = async (roomId) => {
    try {
      // Find room in existing array first
      let room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        // If not found, fetch from API
        const response = await roomService.getById(roomId);
        room = response.data;
      }
      
      setSelectedRoom(room);
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
        filmId: values.filmId.toString(),
        roomId: values.roomId.toString(),
        startTime: startDateTime,
        endTime: endDateTime,
        price: values.price,
      };
      
      console.log("Submitting projection data:", projectionData);
      
      let response;
      if (mode === 'add') {
        response = await projectionService.create(projectionData);
        message.success('Thêm suất chiếu mới thành công!');
      } else {
        console.log()
        response = await projectionService.update(id, projectionData);
        console.log(response.data)
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
                    {room.roomNumber || room.name} - {room.capacity} ghế
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
                  // Disable dates before today in add mode
                  // In edit mode, allow the original date
                  if (mode === 'add') {
                    return current && current < moment().startOf('day');
                  } else if (originalProjection) {
                    const originalDate = moment(originalProjection.startTime).startOf('day');
                    return current && current < moment().startOf('day') && !current.isSame(originalDate, 'day');
                  }
                  return false;
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
                  <p><strong>Phòng chiếu:</strong> {selectedRoom.roomNumber || selectedRoom.name} - {selectedRoom.capacity} ghế</p>
                  {calculatedEndTime && selectedTime && (
                    <p><strong>Thời gian chiếu:</strong> {selectedTime.format('HH:mm')} - {calculatedEndTime.format('HH:mm')}</p>
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