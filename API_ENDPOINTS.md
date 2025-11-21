# Django REST API Endpoints Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication

**Method:** API Key (Header-based)

**Header Name:** `X-API-KEY`

**Default API Keys** (from settings.py):
- `test-api-key-12345`
- `prod-api-key-67890`

**Configuration:** Set `API_KEYS` environment variable (comma-separated list)

---

## 1. Projects (Chantiers) - `/api/projects/`

### GET `/api/projects/` - List all projects (PUBLIC, no auth required)
```javascript
// fetch()
fetch('http://localhost:8000/api/projects/')
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

response = requests.get('http://localhost:8000/api/projects/')
print(response.json())
```

### GET `/api/projects/{id}/` - Get one project (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/projects/1/', {
  headers: {
    'X-API-KEY': 'test-api-key-12345'
  }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.get('http://localhost:8000/api/projects/1/', headers=headers)
print(response.json())
```

### POST `/api/projects/` - Create a project (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/projects/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    contact: 'Client Name',
    adresse_chantier: '123 Main St',
    ville_chantier: 'Paris',
    cp_ville_chantier: '75001',
    client_final_type: 'Particulier',
    travaux_type: 'Rénovation',
    devis_ht: 50000.00,
    date_debut_chantier: '2024-01-15',
    date_fin_prevue_chantier: '2024-03-15'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {
    'contact': 'Client Name',
    'adresse_chantier': '123 Main St',
    'ville_chantier': 'Paris',
    'cp_ville_chantier': '75001',
    'client_final_type': 'Particulier',
    'travaux_type': 'Rénovation',
    'devis_ht': 50000.00,
    'date_debut_chantier': '2024-01-15',
    'date_fin_prevue_chantier': '2024-03-15'
}
response = requests.post('http://localhost:8000/api/projects/', json=data, headers=headers)
print(response.json())
```

### PUT `/api/projects/{id}/` - Update a project (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/projects/1/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    contact: 'Updated Client Name',
    devis_ht: 55000.00
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {
    'contact': 'Updated Client Name',
    'devis_ht': 55000.00
}
response = requests.put('http://localhost:8000/api/projects/1/', json=data, headers=headers)
print(response.json())
```

### DELETE `/api/projects/{id}/` - Delete a project (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/projects/1/', {
  method: 'DELETE',
  headers: {
    'X-API-KEY': 'test-api-key-12345'
  }
})
  .then(res => res.status === 204 ? 'Deleted' : res.json());
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.delete('http://localhost:8000/api/projects/1/', headers=headers)
print(response.status_code)  # 204 if successful
```

---

## 2. Teams (Équipes) - `/api/teams/`

### GET `/api/teams/` - List all teams (PUBLIC, no auth required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/')
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

response = requests.get('http://localhost:8000/api/teams/')
print(response.json())
```

### GET `/api/teams/{id}/` - Get one team (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/1/', {
  headers: {'X-API-KEY': 'test-api-key-12345'}
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.get('http://localhost:8000/api/teams/1/', headers=headers)
print(response.json())
```

### POST `/api/teams/` - Create a team (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    name: 'Équipe Alpha',
    chef_equipe: 1,  // User ID
    color: '#FF5733'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {
    'name': 'Équipe Alpha',
    'chef_equipe': 1,  # User ID
    'color': '#FF5733'
}
response = requests.post('http://localhost:8000/api/teams/', json=data, headers=headers)
print(response.json())
```

### PUT `/api/teams/{id}/` - Update a team (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/1/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    name: 'Équipe Beta',
    color: '#33FF57'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {'name': 'Équipe Beta', 'color': '#33FF57'}
response = requests.put('http://localhost:8000/api/teams/1/', json=data, headers=headers)
print(response.json())
```

### DELETE `/api/teams/{id}/` - Delete a team (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/1/', {
  method: 'DELETE',
  headers: {'X-API-KEY': 'test-api-key-12345'}
});
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.delete('http://localhost:8000/api/teams/1/', headers=headers)
```

---

## 3. Employees (Users) - `/api/employees/`

### GET `/api/employees/{id}/` - Get one employee (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/employees/1/', {
  headers: {'X-API-KEY': 'test-api-key-12345'}
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.get('http://localhost:8000/api/employees/1/', headers=headers)
print(response.json())
```

### POST `/api/employees/` - Create an employee (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/employees/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    email: 'employee@example.com',
    prenom: 'Jean',
    nom: 'Dupont',
    numero_telephone: '0123456789',
    user_type: 'Employé',
    cout_h: 25.50,
    equipe: 1  // Team ID (optional)
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {
    'email': 'employee@example.com',
    'prenom': 'Jean',
    'nom': 'Dupont',
    'numero_telephone': '0123456789',
    'user_type': 'Employé',
    'cout_h': 25.50,
    'equipe': 1  # Team ID (optional)
}
response = requests.post('http://localhost:8000/api/employees/', json=data, headers=headers)
print(response.json())
```

### PUT `/api/employees/{id}/` - Update an employee (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/employees/1/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    cout_h: 30.00,
    equipe: 2
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {'cout_h': 30.00, 'equipe': 2}
response = requests.put('http://localhost:8000/api/employees/1/', json=data, headers=headers)
print(response.json())
```

### DELETE `/api/employees/{id}/` - Delete an employee (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/employees/1/', {
  method: 'DELETE',
  headers: {'X-API-KEY': 'test-api-key-12345'}
});
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.delete('http://localhost:8000/api/employees/1/', headers=headers)
```

---

## 4. Planning - `/api/planning/`

### POST `/api/planning/` - Create a planning entry (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/planning/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
  },
  body: JSON.stringify({
    user: 1,  // Employee ID
    chantier: 1,  // Project ID
    date: '2024-01-15',
    start_hour: '09:00:00',  // HH:MM:SS format
    end_hour: '17:00:00'     // HH:MM:SS format, must be multiple of 15 minutes
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': 'test-api-key-12345'
}
data = {
    'user': 1,  # Employee ID
    'chantier': 1,  # Project ID
    'date': '2024-01-15',
    'start_hour': '09:00:00',  # HH:MM:SS format
    'end_hour': '17:00:00'     # HH:MM:SS format, must be multiple of 15 minutes
}
response = requests.post('http://localhost:8000/api/planning/', json=data, headers=headers)
print(response.json())
```

**Note:** 
- Hours must be in 15-minute increments (00, 15, 30, 45)
- `end_hour` must be after `start_hour`
- No overlapping time slots for the same employee on the same date
- `cout_planning` is auto-calculated

### GET `/api/planning/` - List all planning entries (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/planning/', {
  headers: {'X-API-KEY': 'test-api-key-12345'}
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.get('http://localhost:8000/api/planning/', headers=headers)
print(response.json())
```

---

## 5. Team Employees - `/api/teams/{team_id}/employees/`

### GET `/api/teams/{team_id}/employees/` - List employees of a team (AUTH required)
```javascript
// fetch()
fetch('http://localhost:8000/api/teams/1/employees/', {
  headers: {'X-API-KEY': 'test-api-key-12345'}
})
  .then(res => res.json())
  .then(data => console.log(data));
```

```python
# Python requests
import requests

headers = {'X-API-KEY': 'test-api-key-12345'}
response = requests.get('http://localhost:8000/api/teams/1/employees/', headers=headers)
print(response.json())
```

---

## Summary Table

| Endpoint | GET List | GET Detail | POST | PUT | DELETE | Auth Required |
|----------|----------|------------|------|-----|--------|---------------|
| `/api/projects/` | ✅ Public | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | List: No, Others: Yes |
| `/api/teams/` | ✅ Public | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | List: No, Others: Yes |
| `/api/employees/` | ❌ | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Yes (all) |
| `/api/planning/` | ✅ Yes | ❌ | ✅ Yes | ❌ | ❌ | Yes (all) |
| `/api/teams/{id}/employees/` | ✅ Yes | ❌ | ❌ | ❌ | ❌ | Yes |

---

## Error Responses

All endpoints return JSON error responses:

```json
{
  "detail": "Invalid or missing API key."
}
```

```json
{
  "field_name": ["Error message"]
}
```

---

## Quick Reference: Authentication Header

**JavaScript/fetch():**
```javascript
headers: {
  'X-API-KEY': 'test-api-key-12345'
}
```

**Python requests:**
```python
headers = {'X-API-KEY': 'test-api-key-12345'}
```

