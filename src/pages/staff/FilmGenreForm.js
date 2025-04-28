import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Select, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  message, 
  Spin,
  Card,
  Tag,
  Space,
  Modal 
} from 'antd';
import { 
  SaveOutlined, 
  RollbackOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { movieService, genreService } from '../../services/api';
import '../style/FilmGenreForm.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// Function to make API calls to the FilmGenre endpoint
const filmGenreService = {
  create: (data) => {
    // Using your Galaxy Cinema API endpoint
    return fetch('https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api/FilmGenre', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    });
  },
  delete: (filmId, genreId) => {
    // Adjust this endpoint according to your API for deleting film genres
    return fetch(`https://galaxycinema-a6eeaze9afbagaft.southeastasia-01.azurewebsites.net/api/Genre?filmId=${filmId}&genreId=${genreId}`, {
      method: 'DELETE',
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response;
    });
  }
};

const FilmGenreForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams(); // Film ID from URL
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [genres, setGenres] = useState([]);
  const [film, setFilm] = useState(null);
  const [filmGenres, setFilmGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    // Fetch both the film details and available genres
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch film details
        const filmResponse = await movieService.getById(id);
        setFilm(filmResponse.data);
        
        // Fetch all genres
        const genresResponse = await genreService.getAll();
        setGenres(genresResponse.data);
        
        // Extract existing film genres from the film data
        const existingGenres = [];
        
        // Handle different possible formats of film.filmGenres
        if (filmResponse.data.filmGenres) {
          if (typeof filmResponse.data.filmGenres === 'string') {
            // If filmGenres is a comma-separated string
            const genreNames = filmResponse.data.filmGenres.split(',').map(g => g.trim());
            // Find matching genres from the genres list
            genresResponse.data.forEach(genre => {
              if (genreNames.includes(genre.name)) {
                existingGenres.push({
                  genreId: genre.id,
                  filmId: id,
                  genre: genre
                });
              }
            });
          } else if (Array.isArray(filmResponse.data.filmGenres)) {
            // If filmGenres is an array of objects
            filmResponse.data.filmGenres.forEach(fg => {
              const genreId = fg.genreId || (fg.genre && fg.genre.id);
              if (genreId) {
                const genre = genresResponse.data.find(g => g.id === genreId);
                if (genre) {
                  existingGenres.push({
                    genreId: genreId,
                    filmId: id,
                    genre: genre
                  });
                }
              }
            });
          }
        }
        
        setFilmGenres(existingGenres);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error('Không thể tải dữ liệu cần thiết');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    } else {
      message.error('Không tìm thấy ID phim');
      navigate('/staff/films');
    }
  }, [id, navigate]);

  const handleAddGenre = async () => {
    if (!selectedGenre) {
      message.warning('Vui lòng chọn thể loại để thêm');
      return;
    }

    setSubmitting(true);
    try {
      // Create the film-genre association using the expected format
      await filmGenreService.create({
        filmId: id,
        genreId: selectedGenre
      });
      
      // Find the genre details for display
      const addedGenre = genres.find(g => g.id === selectedGenre);
      
      // Update the local state with the new genre
      setFilmGenres([...filmGenres, {
        genreId: selectedGenre,
        filmId: id,
        genre: addedGenre // Include the genre details
      }]);
      
      message.success('Thêm thể loại thành công');
      setSelectedGenre(null); // Reset selected genre
      form.resetFields();
    } catch (error) {
      console.error("Error adding genre:", error);
      message.error('Không thể thêm thể loại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveGenre = (genreId) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa thể loại này khỏi phim?',
      icon: <DeleteOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await filmGenreService.delete(id, genreId);
          
          // Update the local state by removing the genre
          setFilmGenres(filmGenres.filter(fg => fg.genreId !== genreId));
          
          message.success('Xóa thể loại thành công');
        } catch (error) {
          console.error("Error removing genre:", error);
          message.error('Không thể xóa thể loại. Vui lòng thử lại.');
        }
      },
    });
  };

  const handleCancel = () => {
    navigate('/staff/films');
  };

  // Filter out genres that are already added to the film
  const availableGenres = genres.filter(genre => 
    !filmGenres.some(fg => fg.genreId === genre.id)
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Đang tải thông tin phim và thể loại...</Text>
      </div>
    );
  }

  return (
    <div className="film-genre-form-container">
      <div className="form-header">
        <Title level={3}>
          Quản lý thể loại cho phim
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
      
      {film && (
        <Card className="film-info-card" style={{ marginBottom: 20 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} md={6}>
              {film.imageURL && (
                <img 
                  src={film.imageURL} 
                  alt={film.title}
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain' }}
                />
              )}
            </Col>
            <Col xs={24} md={18}>
              <Title level={4}>{film.title}</Title>
              <Text>{film.director && `Đạo diễn: ${film.director}`}</Text>
              <div style={{ marginTop: 8 }}>
                <Text>Thời lượng: {film.duration} phút</Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text>Trạng thái: </Text>
                <Tag color={
                  film.status === 0 ? 'geekblue' : 
                  film.status === 1 ? 'green' : 
                  film.status === 3 ? 'volcano' : 'default'
                }>
                  {film.status === 0 ? 'Sắp chiếu' :
                   film.status === 1 ? 'Đang chiếu' :
                   film.status === 3 ? 'Ngừng chiếu' : 'Không xác định'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>
      )}
      
      <Title level={4}>Các thể loại hiện tại</Title>
      <div className="current-genres" style={{ marginBottom: 20 }}>
        {filmGenres.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {filmGenres.map(filmGenre => (
              <Tag 
                key={filmGenre.genreId} 
                closable
                onClose={() => handleRemoveGenre(filmGenre.genreId)}
                style={{ fontSize: '14px', padding: '5px 10px', marginBottom: '8px' }}
                color="blue"
              >
                {filmGenre.genre ? filmGenre.genre.name : 'Thể loại không xác định'}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">Phim chưa có thể loại nào</Text>
        )}
      </div>
      
      <Divider />
      
      <Title level={4}>Thêm thể loại mới</Title>
      <Form
        form={form}
        layout="horizontal"
        className="add-genre-form"
      >
        <Row gutter={16}>
          <Col xs={24} sm={18}>
            <Form.Item
              name="genreId"
              label="Thể loại"
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder="Chọn thể loại để thêm"
                style={{ width: '100%' }}
                value={selectedGenre}
                onChange={setSelectedGenre}
                disabled={availableGenres.length === 0}
              >
                {availableGenres.map(genre => (
                  <Option key={genre.id} value={genre.id}>
                    {genre.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={6}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddGenre}
              loading={submitting}
              disabled={!selectedGenre || availableGenres.length === 0}
              style={{ width: '100%' }}
            >
              Thêm thể loại
            </Button>
          </Col>
        </Row>
        
        {availableGenres.length === 0 && (
          <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            Đã thêm tất cả thể loại hiện có
          </Text>
        )}
      </Form>
      
      <Divider />
      
      <div className="form-footer">
        <Button 
          type="primary" 
          icon={<RollbackOutlined />} 
          onClick={handleCancel}
        >
          Hoàn tất
        </Button>
      </div>
    </div>
  );
};

export default FilmGenreForm;