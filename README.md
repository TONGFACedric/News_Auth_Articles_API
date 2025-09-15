# API Project

This project is an API that provides endpoints for managing articles and users. It uses Express.js as the web framework and MongoDB as the database.

## Installation

1. Clone the repository: `git clone https://github.com/your-username/api-project.git`
2. Install the dependencies: `npm install`
3. Create a `.env` file and set the following environment variables:
    - `MONGODB_URI`: The URI of your MongoDB database
    - `JWT_SECRET`: The secret key for JWT authentication
4. Start the server: `npm start`

## Usage

### Endpoints

#### Articles

- `GET /api/v1/articles`: Get a list of articles (paginated)
- `GET /api/v1/articles/id/{articleId}`: Get an article by ID
- `GET /api/v1/articles/title/{title}`: Get articles by title
- `POST /api/v1/articles`: Create a new article
- `PUT /api/v1/articles/{articleId}`: Update an article by ID
- `DELETE /api/v1/articles/{articleId}`: Delete an article by ID

#### Users

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get a token
- `GET /api/v1/auth/logout`: Logout and invalidate the token
- `GET /api/v1/auth/me`: Get the currently logged in user's information

#### Admin

- `GET /api/v1/admin`: Only accessible to admin users

### Authentication

All endpoints except for `POST /api/v1/auth/register` and `POST /api/v1/auth/login` require authentication. To authenticate, include the `Authorization` header with a valid JWT token.

### WebSocket

The API also supports real-time updates via WebSocket. To connect to the WebSocket, use the following URL: `ws://localhost:3000/ws`. Once connected, you can send and receive messages to/from the server.

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md) when submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).
