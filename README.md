# Miles Unisex Salon Management System

A comprehensive salon management system for Miles Unisex Salon, featuring staff management, service booking, and admin dashboard.

## Features

- **Two-Step Admin Authentication**
  - Secure login with username/password
  - Email verification code
  - 5-minute code expiry

- **Staff Management**
  - Barber Section: Julius, Simon, Emma, Rasta
  - Ladies Hair Section: Joy
  - Nail Section: Michael, Justine, Rony, Angella

- **Service Management**
  - Add/Edit services
  - Pricing management
  - Service categories

- **Booking System**
  - Online appointment booking
  - Staff availability tracking
  - Service scheduling

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/MilesSaloon.git
   ```

2. Navigate to the project directory:
   ```bash
   cd MilesSaloon
   ```

3. Open `index.html` in your web browser to access the main site.

4. For admin access:
   - Navigate to `/admin/index.html`
   - Login credentials:
     - Username: admin
     - Password: admin123

## Project Structure

```
MilesSaloon/
├── public/
│   ├── admin/           # Admin dashboard and management
│   ├── images/          # Image assets
│   └── styles/          # CSS files
├── database/            # JSON database files
└── README.md           # Project documentation
```

## Admin Access

Default admin credentials:
- Username: admin
- Password: admin123
- Admin Email: gideoneumu@gmail.com

## Database

The project uses a JSON-based database structure stored in `database/db.json`. This includes:
- Staff information
- Services
- Bookings
- System settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 