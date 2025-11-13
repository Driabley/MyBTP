# BTP Platform - Construction Management System

A comprehensive Django web application for managing construction projects, workforce, planning, and leads for BTP (construction) companies.

## Features

- **Dashboard**: Overview with KPIs, revenue charts, and acquisition metrics
- **Planning**: Full workforce scheduling system for assigning workers to construction sites
- **Chantiers**: Construction project management with tracking and status updates
- **Team**: Employee management with team organization
- **Pistes**: Leads and prospects management system
- **Map**: Geographic visualization of construction sites
- **Fleet**: Equipment and material fleet management

## Technology Stack

- **Backend**: Django 4.2+
- **Frontend**: Vanilla JavaScript, CSS3 (no framework)
- **Database**: SQLite (default, can be changed to PostgreSQL)
- **Authentication**: Django Session Authentication

## Installation

### Prerequisites

- Python 3.11+
- pip
- virtualenv (recommended)

### Setup Steps

1. **Navigate to the project directory**:
   ```bash
   cd /home/yann/Documents/Myy
   ```

2. **Create and activate virtual environment** (if not already done):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser**:
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create an admin user.

6. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

7. **Access the application**:
   - Frontend: http://localhost:8000/
   - Admin panel: http://localhost:8000/admin/

## Project Structure

```
Myy/
├── accounts/          # User management app
├── teams/            # Team management app
├── projects/         # Construction projects (Chantiers) app
├── planning/         # Workforce scheduling app
│   └── signals.py    # Django signals for automatic updates
├── lead/             # Leads management (Pistes) app
├── stock/            # Fleet/equipment management app
├── btp_platform/     # Main Django project settings
├── templates/        # HTML templates
├── static/           # CSS, JavaScript, and static files
│   ├── css/
│   └── js/
└── design.json       # Design system configuration
```

## Models

### User (Custom)
- Email as username
- User types: Admin, Secrétaire, Chef d'équipe, Employé
- Hourly and daily rates
- Skills and driving licenses (JSON fields)
- Team assignment

### Equipe (Team)
- Team name
- Team leader (Chef d'équipe)
- Members (Many-to-Many)
- Color code for display

### Chantiers (Construction Project)
- Auto-generated project name (CH-YYYY-####)
- Address and coordinates
- Client type (Professional/Particular)
- Progress tracking
- Cost calculations
- Project manager assignment

### Planning
- User assignment to construction sites
- Date and time slots
- Automatic cost calculation
- Overlap validation

### Pistes (Leads)
- Client information
- Status tracking
- Estimated amount and probability
- Follow-up dates

### Commandes (Orders)
- Reference number
- Supplier information
- Linked to construction projects
- Status tracking

## Django Signals

The application uses Django signals to automatically update planning costs when user hourly rates change. See `SIGNALS_EXPLANATION.md` for details.

**Important**: Signals are NOT API-related - they're a core Django feature for maintaining data consistency.

## Design System

The application uses a custom design system defined in `design.json`:
- Primary color: #6C63FF (lavender/blue)
- Clean, data-focused UI
- Minimal shadows and gradients
- Responsive design

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
```

### Applying Migrations
```bash
python manage.py migrate
```

## Data Management

All data management is done through:
1. **Django Admin**: Full admin interface at `/admin/`
2. **Django Forms**: Can be added for custom data entry forms
3. **Django Views**: Traditional Django views for page rendering

## Production Deployment

1. Set `DEBUG = False` in settings.py
2. Update `ALLOWED_HOSTS` with your domain
3. Set up a production database (PostgreSQL recommended)
4. Configure static files serving
5. Set up SSL/HTTPS
6. Configure proper authentication

## License

This project is proprietary software for BTP construction companies.

## Support

For issues and questions, please contact the development team.

## Additional Documentation

- `SIGNALS_EXPLANATION.md` - Explanation of Django signals
- `API_REMOVAL_SUMMARY.md` - Summary of API removal (if applicable)
- `QUICKSTART.md` - Quick start guide
# MyBTP
