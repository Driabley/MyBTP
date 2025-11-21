"""
Django REST Framework serializers for the API
"""
from rest_framework import serializers
from projects.models import Chantiers
from teams.models import Equipe
from accounts.models import User
from planning.models import Planning


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Chantiers (Projects)"""
    
    class Meta:
        model = Chantiers
        fields = [
            'id',
            'name_chantier',
            'contact',
            'date_rdv_technique',
            'travaux_type',
            'client_final_type',
            'adresse_chantier',
            'latitude',
            'longitude',
            'cp_ville_chantier',
            'ville_chantier',
            'avancement_statut',
            'cr_next_step',
            'avancement_chantier',
            'nbr_heures',
            'date_debut_chantier',
            'date_fin_prevue_chantier',
            'annee_periode_construction',
            'chef_chantier',
            'gdrive_urls',
            'brief_url',
            'devis_ht',
            'nombre_de_jours_chantier',
            'telephone_contact',
            'cout_total',
            'number_hour_planned',
            'number_hour_spent_on_project',
            'cost_spent_on_project',
            'va',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'name_chantier',  # Auto-generated
            'created_at',
            'updated_at',
        ]

    def validate(self, data):
        """Validate project data"""
        # Validate dates if both are provided
        date_debut = data.get('date_debut_chantier')
        date_fin = data.get('date_fin_prevue_chantier')
        
        if date_debut and date_fin and date_fin < date_debut:
            raise serializers.ValidationError({
                'date_fin_prevue_chantier': "La date de fin ne peut pas être antérieure à la date de début"
            })
        
        return data


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Equipe (Teams)"""
    
    chef_equipe_name = serializers.CharField(source='chef_equipe.full_name', read_only=True)
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipe
        fields = [
            'id',
            'name',
            'chef_equipe',
            'chef_equipe_name',
            'members_count',
            'color',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        """Return the number of team members"""
        return obj.members.count() if obj.pk else 0


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for User (Employees)"""
    
    full_name = serializers.CharField(read_only=True)
    team_name = serializers.CharField(source='equipe.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'prenom',
            'nom',
            'full_name',
            'numero_telephone',
            'user_type',
            'cout_h',
            'cout_j',
            'competences',
            'permis_de_conduire',
            'equipe',
            'team_name',
            'is_active',
            'date_joined',
        ]
        read_only_fields = [
            'id',
            'full_name',
            'date_joined',
        ]

    def validate_email(self, value):
        """Ensure email is unique"""
        user = self.instance
        if user and user.email == value:
            return value
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        return value


class PlanningSerializer(serializers.ModelSerializer):
    """Serializer for Planning (time slots)"""
    
    employee_name = serializers.CharField(source='user.full_name', read_only=True)
    project_name = serializers.CharField(source='chantier.name_chantier', read_only=True)
    
    class Meta:
        model = Planning
        fields = [
            'id',
            'user',
            'employee_name',
            'chantier',
            'project_name',
            'date',
            'start_hour',
            'end_hour',
            'cout_planning',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'cout_planning',  # Auto-computed
            'created_at',
            'updated_at',
        ]

    def validate(self, data):
        """Validate planning data"""
        start_hour = data.get('start_hour')
        end_hour = data.get('end_hour')
        user = data.get('user')
        chantier = data.get('chantier')
        date = data.get('date')
        
        # Validate end_hour > start_hour
        if start_hour and end_hour and end_hour <= start_hour:
            raise serializers.ValidationError({
                'end_hour': "L'heure de fin doit être postérieure à l'heure de début"
            })
        
        # Validate minutes are in 15-minute increments
        allowed_minutes = [0, 15, 30, 45]
        if start_hour and start_hour.minute not in allowed_minutes:
            raise serializers.ValidationError({
                'start_hour': "L'heure de début doit être un multiple de 15 minutes (00, 15, 30, 45)"
            })
        if end_hour and end_hour.minute not in allowed_minutes:
            raise serializers.ValidationError({
                'end_hour': "L'heure de fin doit être un multiple de 15 minutes (00, 15, 30, 45)"
            })
        
        # Validate user and chantier exist (basic validation, will raise DoesNotExist if invalid)
        if user and not User.objects.filter(pk=user.pk).exists():
            raise serializers.ValidationError({
                'user': "L'employé spécifié n'existe pas"
            })
        
        if chantier and not Chantiers.objects.filter(pk=chantier.pk).exists():
            raise serializers.ValidationError({
                'chantier': "Le chantier spécifié n'existe pas"
            })
        
        # Check for overlaps (only if all required fields are present)
        if user and date and start_hour and end_hour:
            # Use the instance's pk if updating, None if creating
            instance_pk = self.instance.pk if self.instance else None
            
            overlapping = Planning.objects.filter(
                user=user,
                date=date
            )
            
            if instance_pk:
                overlapping = overlapping.exclude(pk=instance_pk)
            
            overlapping = overlapping.filter(
                start_hour__lt=end_hour,
                end_hour__gt=start_hour
            )
            
            if overlapping.exists():
                raise serializers.ValidationError({
                    '__all__': "Conflit de planning détecté pour cet employé à cette date et heure"
                })
        
        return data

