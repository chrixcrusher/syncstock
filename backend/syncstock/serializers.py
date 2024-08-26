from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import User, InventoryItem, StockAdjustment, StockTransfer, Location, Category, Company
from .models import TotalCurrentInventory

class CompanyRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['name', 'company_email', 'company_address']  # Include company_email field
    
    def create(self, validated_data):
        company = Company(
            name=validated_data['name'],
            company_email=validated_data['company_email'],
            company_address=validated_data['company_address']
        )
        company.save()
        return company

# Model Serializers
User = get_user_model()  # Get the custom user model


class UserRegistrationSerializer(serializers.ModelSerializer):

    company_code = serializers.CharField()

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password', 'company_code']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate(self, data):
        company_code = data.get('company_code')
        email = data.get('email')
        # Validate email uniqueness
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already exists."})
        # Check if the company_code is valid
        if not Company.objects.filter(company_code=company_code).exists():
            raise serializers.ValidationError({"company_code": "Invalid company code."})
        return data

    def create(self, validated_data):
        company_code = validated_data.pop('company_code')
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password=make_password(validated_data['password'])
        )
        # Retrieve or create company based on company_code
        company = Company.objects.get(company_code=company_code)
        user.company = company
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username does not exist.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        return data

    def create(self, validated_data):
        user = authenticate(username=validated_data['username'], password=validated_data['password'])
        # Delete any existing tokens for the user
        # Token.objects.filter(user=user).delete()
        # Create a new token
        token = Token.objects.create(user=user)
        return {'token': token.key}

class UserLogoutSerializer(serializers.Serializer):
    token = serializers.CharField()

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email']

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_picture']

    def update(self, instance, validated_data):
        # Update only the profile picture field
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    model = User
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = ['id', 'item_name', 'sku', 'product_code', 'supplier_name', 'additional_description', 'quantity', 'price', 'inventory_date', 'expiration_date', 'category', 'location', 'category_name', 'location_name', 'user', 'company']
        read_only_fields = ['user', 'company']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_location_name(self, obj):
        return obj.location.name if obj.location else None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        request = self.context.get('request')
        if request and request.user and hasattr(request.user, 'company'):
            company = request.user.company
            self.fields['category'].queryset = Category.objects.filter(company=company)
            self.fields['location'].queryset = Location.objects.filter(company=company)



class StockAdjustmentSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    item = serializers.PrimaryKeyRelatedField(
        queryset=InventoryItem.objects.none()
    )
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.none()
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.none()
    )
    sku = serializers.SerializerMethodField(read_only=True)
    product_code = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = StockAdjustment
        fields = ['id', 'adjustment_type', 'category', 'category_name',  'item', 'item_name', 'quantity', 'sku', 'product_code', 'date', 'reason', 'location', 'location_name']
        read_only_fields = ['user', 'company']

    def get_item_name(self, obj):
        return obj.item.item_name if obj.item else None

    def get_location_name(self, obj):
        return obj.location.name if obj.location else None
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_sku(self, obj):
        return obj.item.sku if obj.item else None

    def get_product_code(self, obj):
        return obj.item.product_code if obj.item else None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user and hasattr(request.user, 'company'):
            company = request.user.company
            self.fields['item'].queryset = InventoryItem.objects.filter(company=company)
            self.fields['location'].queryset = Location.objects.filter(company=company)
            self.fields['category'].queryset = Category.objects.filter(company=company)
        else:
            print("Request or company not set correctly")


class StockTransferSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    item = serializers.PrimaryKeyRelatedField(queryset=InventoryItem.objects.none())
    from_location_name = serializers.SerializerMethodField()
    to_location_name = serializers.SerializerMethodField()

    sku = serializers.SerializerMethodField(read_only=True)
    product_code = serializers.SerializerMethodField(read_only=True)
    category = serializers.PrimaryKeyRelatedField(read_only=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = StockTransfer
        fields = ['id', 'item', 'item_name', 'quantity', 'sku', 'product_code', 'date', 'from_location', 'to_location', 'from_location_name', 'to_location_name', 'category', 'supplier_name', 'price', 'expiration_date', 'category_name']
        read_only_fields = ['user', 'company']

    def get_item_name(self, obj):
        return obj.item.item_name if obj.item else None

    def get_sku(self, obj):
        return obj.item.sku if obj.item else None

    def get_product_code(self, obj):
        return obj.item.product_code if obj.item else None

    def get_category(self, obj):
        return obj.item.category if obj.item else None

    def get_category_name(self, obj):
        return obj.item.category.name if obj.item and obj.item.category else None

    def get_from_location_name(self, obj):
        return obj.from_location.name if obj.from_location else None

    def get_to_location_name(self, obj):
        return obj.to_location.name if obj.to_location else None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user and hasattr(request.user, 'company'):
            company = request.user.company

            # Retrieve items filtered by the company
            items = InventoryItem.objects.filter(company=company)

            # Manually filter unique items based on item_name
            unique_items = {}
            for item in items:
                if item.item_name not in unique_items:
                    unique_items[item.item_name] = item

            # Set queryset to include only unique items based on item_name
            self.fields['item'].queryset = InventoryItem.objects.filter(pk__in=[item.pk for item in unique_items.values()])
            
            # Set queryset for locations
            self.fields['from_location'].queryset = Location.objects.filter(company=company)
            self.fields['to_location'].queryset = Location.objects.filter(company=company)

    def validate(self, data):
        """Ensure from_location and to_location are not the same."""
        if data.get('from_location') == data.get('to_location'):
            raise serializers.ValidationError("The from_location and to_location cannot be the same.")
        return data


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'description', 'person_in_charge', 'google_maps_url']

    def create(self, validated_data):
        # Automatically set the company field before saving
        request = self.context.get('request')
        company = request.user.company
        return Location.objects.create(company=company, **validated_data)

    def update(self, instance, validated_data):
        # Ensure the company field is not modified
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'category_image']  # Include 'category_image'

    def create(self, validated_data):
        # Automatically set the company field before saving
        request = self.context.get('request')
        company = request.user.company
        return Category.objects.create(company=company, **validated_data)

    def update(self, instance, validated_data):
        # Ensure the company field is not modified
        for attr, value in validated_data.items():
            if attr != 'company':  # Ensure the company field is not modified
                setattr(instance, attr, value)
        instance.save()
        return instance


class TotalCurrentInventorySerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()

    class Meta:
        model = TotalCurrentInventory
        fields = ['id', 'item_name', 'product_code', 'sku', 'total_current_inventory', 'category_name', 'location_name']
        read_only_fields = ['id', 'item_name', 'product_code', 'sku', 'total_current_inventory', 'category_name', 'location_name']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_location_name(self, obj):
        return obj.location.name if obj.location else None



class AggregatedInventoryItemSerializer(serializers.Serializer):
    trunc_date = serializers.CharField()  # Using CharField to handle various formats like week numbers, month names, and years
    total_quantity = serializers.IntegerField()

class AggregatedStockAdjustmentSerializer(serializers.Serializer):
    trunc_date = serializers.CharField()  # Using CharField to handle various formats like week numbers, month names, and years
    total_quantity = serializers.IntegerField()

class AggregatedStockTransferSerializer(serializers.Serializer):
    trunc_date = serializers.CharField()  # Using CharField to handle various formats like week numbers, month names, and years
    total_quantity = serializers.IntegerField()