# Secret Sharing App

Welcome to the Secret Sharing App! This project allows users to share their secrets anonymously. Users can log in using their Google or Facebook accounts to access and post secrets. All secrets are shared anonymously, creating a safe and secure environment for users to express themselves.

## Getting Started

To get started with the Secret Sharing App, follow these steps:

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Clone the Repository

```bash
git clone https://github.com/Desifighter/secret-sharing-app.git
```

### Install Dependencies

```bash
cd secret-sharing-app
npm install
```

### Set Up Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
SESSION_SECRET=your_session_secret
MONGODB_URI=your_mongodb_uri
```

Replace the placeholder values with your actual credentials.

### Run the Application

```bash
npm start
```

Visit [http://localhost:3000](http://localhost:3000) in your browser to access the Secret Sharing App.

## Features

- **Anonymous Secrets:** Users can share their secrets without revealing their identity.
- **Social Login:** Users can log in using their Google or Facebook accounts.
- **Secure Authentication:** Passport.js and Passport strategies provide secure authentication.
- **User-friendly Routes:** The app includes routes for login, register, and the home page.

## Dependencies

- [body-parser](https://www.npmjs.com/package/body-parser)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [ejs](https://www.npmjs.com/package/ejs)
- [express](https://www.npmjs.com/package/express)
- [express-session](https://www.npmjs.com/package/express-session)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [mongoose-findorcreate](https://www.npmjs.com/package/mongoose-findorcreate)
- [passport](https://www.npmjs.com/package/passport)
- [passport-facebook](https://www.npmjs.com/package/passport-facebook)
- [passport-google-oauth20](https://www.npmjs.com/package/passport-google-oauth20)
- [passport-local](https://www.npmjs.com/package/passport-local)
- [passport-local-mongoose](https://www.npmjs.com/package/passport-local-mongoose)

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the Secret Sharing App.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
