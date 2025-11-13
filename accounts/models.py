from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError


class UserManager(BaseUserManager):
    """Manager for custom user model"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_type', 'Admin')
        extra_fields.setdefault('prenom', 'Admin')
        extra_fields.setdefault('nom', 'User')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model using email as username"""
    
    USER_TYPE_CHOICES = [
        ('Admin', 'Admin'),
        ('Secrétaire', 'Secrétaire'),
        ('Chef d\'équipe', 'Chef d\'équipe'),
        ('Employé', 'Employé'),
    ]
    
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Le numéro de téléphone doit être au format: '+999999999'. Jusqu'à 15 chiffres autorisés."
    )
    
    email = models.EmailField(unique=True)
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    numero_telephone = models.CharField(
        validators=[phone_regex],
        max_length=32,
        blank=True
    )
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='Employé'
    )
    cout_h = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Coût horaire en euros"
    )
    cout_j = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Coût journalier en euros"
    )
    competences = models.JSONField(default=list, blank=True)
    permis_de_conduire = models.JSONField(default=list, blank=True)
    equipe = models.ForeignKey(
        'teams.Equipe',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members_set'
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['prenom', 'nom']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['user_type']),
        ]
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    @property
    def full_name(self):
        """Return full name"""
        return f"{self.prenom} {self.nom}"
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"
