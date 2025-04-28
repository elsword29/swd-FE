# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
Cinema Booking - Trang web đặt vé xem phim
Dự án Cinema Booking là một trang web đặt vé xem phim được xây dựng bằng React, cho phép người dùng duyệt phim, chọn suất chiếu, đặt vé và thanh toán trực tuyến.
Tính năng

Đăng ký và đăng nhập tài khoản
Xem danh sách phim đang chiếu và sắp chiếu
Tìm kiếm và lọc phim theo thể loại
Xem chi tiết phim và lịch chiếu
Chọn rạp, suất chiếu
Chọn ghế ngồi (với sơ đồ ghế trực quan)
Thanh toán vé với nhiều phương thức thanh toán
Quản lý thông tin cá nhân và lịch sử đặt vé

Công nghệ sử dụng

React: Thư viện JavaScript để xây dựng giao diện người dùng
React Router: Điều hướng trong ứng dụng React
Context API: Quản lý trạng thái ứng dụng
Styled Components: CSS-in-JS để viết CSS cho component
Axios: Thực hiện các HTTP request
JSON Server: Giả lập REST API để phát triển
React Icons: Thư viện icons

Cài đặt và chạy dự án
Yêu cầu môi trường

Node.js (v14.0.0 trở lên)
npm (v6.0.0 trở lên)

Các bước cài đặt

Clone dự án:

bashgit clone <repository-url>
cd cinema-booking

Cài đặt các package:

bashnpm install

Cài đặt JSON Server:

bashnpm install -g json-server

Chạy JSON Server để giả lập API:

bashjson-server --watch db.json --port 3001

Chạy ứng dụng React:

bashnpm start
Sau khi chạy lệnh trên, ứng dụng sẽ được khởi chạy tại http://localhost:3000.
Cấu trúc dự án
src/
├── assets/                  # Ảnh, font, và các tài nguyên tĩnh khác
├── components/              # Các component có thể tái sử dụng
│   ├── common/              # Component chung (Button, Header, Footer, ...)
│   ├── movie/               # Component liên quan đến phim
│   └── booking/             # Component liên quan đến đặt vé
├── context/                 # Context API để quản lý trạng thái
│   ├── AuthContext.js       # Xử lý đăng nhập/đăng ký
│   └── BookingContext.js    # Quản lý quá trình đặt vé
├── pages/                   # Các trang chính của ứng dụng
├── services/                # Services giao tiếp với API
├── utils/                   # Các hàm tiện ích và các hằng số
├── App.js                   # Component gốc của ứng dụng
└── index.js                 # Điểm khởi chạy của ứng dụng
API Endpoints
Dưới đây là các API endpoints được giả lập bởi JSON Server:

Phim

GET /movies: Lấy danh sách tất cả phim
GET /movies/:id: Lấy thông tin chi tiết phim


Rạp chiếu

GET /cinemas: Lấy danh sách tất cả rạp
GET /cinemas/:id: Lấy thông tin chi tiết rạp


Suất chiếu

GET /showTimes: Lấy danh sách tất cả suất chiếu
GET /showTimes?movieId=:id: Lấy danh sách suất chiếu của một phim
GET /showTimes?cinemaId=:id: Lấy danh sách suất chiếu của một rạp
GET /showTimes?date=:date: Lấy danh sách suất chiếu theo ngày


Ghế ngồi

GET /seats?showTimeId=:id: Lấy danh sách ghế của một suất chiếu
PATCH /seats/:id: Cập nhật trạng thái ghế


Đặt vé

GET /bookings?userId=:id: Lấy danh sách đặt vé của người dùng
POST /bookings: Tạo đơn đặt vé mới


Người dùng

POST /users: Đăng ký người dùng mới
GET /users/:id: Lấy thông tin người dùng