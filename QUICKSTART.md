# Quick Start Guide

## Initial Setup

1. **Activate virtual environment**:
   ```bash
   source venv/bin/activate
   ```

2. **Create a superuser** (if not already created):
   ```bash
   python manage.py createsuperuser
   ```
   Enter email, password, first name (prenom), and last name (nom) when prompted.

3. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

4. **Access the application**:
   - Frontend: http://localhost:8000/
   - Admin: http://localhost:8000/admin/
   - API: http://localhost:8000/api/

## Testing the Application

### 1. Create a Team
- Go to http://localhost:8000/team/
- Click "Ajouter une Équipe" in the right sidebar
- Enter team name and color
- Click "Créer"

### 2. Create an Employee
- Go to http://localhost:8000/team/
- Click "Ajouter un Employé"
- Fill in the form (email, name, etc.)
- Select user type (Employé or Chef d'équipe)
- Set hourly rate if needed
- Click "Créer"

### 3. Create a Construction Project (Chantier)
- Go to http://localhost:8000/chantiers/
- Click "Ajouter un Chantier"
- Fill in address, city, client type, and estimated cost (devis_ht)
- The project name will be auto-generated (CH-YYYY-####)
- Click "Créer"

### 4. Create Planning Entry
- Go to http://localhost:8000/planning/
- Select date range
- Click on a cell to assign an employee to a construction site
- Set start and end times
- Cost will be calculated automatically

### 5. Create a Lead (Piste)
- Go to http://localhost:8000/pistes/
- Click "Ajouter une Piste"
- Fill in client information, status, estimated amount
- Click "Créer"

### 6. Create an Order (Commande)
- Go to http://localhost:8000/fleet/
- Click "Ajouter une Commande"
- Fill in reference, select chantier, supplier, amount
- Click "Créer"

## API Testing

You can test the API endpoints using:
- Browser: http://localhost:8000/api/users/
- curl: `curl http://localhost:8000/api/users/`
- Postman or similar tools

## Common Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Collect static files (for production)
python manage.py collectstatic

# Run tests
python manage.py test
```

## Troubleshooting

### Migration Issues
If you encounter migration errors:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Static Files Not Loading
Make sure you're running with DEBUG=True in development, or run:
```bash
python manage.py collectstatic
```

### API Not Working
Check that:
- Django REST Framework is installed
- CORS headers are configured
- Permissions are set correctly in settings.py

## Next Steps

1. **Add Authentication**: Currently, the API allows anonymous access. In production, change `AllowAny` to `IsAuthenticated` in settings.py

2. **Add Map Integration**: The map page needs integration with a mapping library (Leaflet, Google Maps, etc.)

3. **Enhance Planning View**: The planning calendar needs full implementation with drag-and-drop functionality

4. **Add Charts**: The dashboard charts need to be implemented with a charting library (Chart.js, etc.)

5. **Add Export Functionality**: Export data to PDF, Excel, etc.

6. **Add Notifications**: Real-time notifications for important events

7. **Add File Uploads**: For documents, images, etc.

8. **Production Deployment**: 
   - Set DEBUG = False
   - Configure ALLOWED_HOSTS
   - Set up PostgreSQL database
   - Configure static files serving
   - Set up SSL/HTTPS
   - Configure proper authentication

