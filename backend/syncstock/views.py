from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseForbidden, JsonResponse
from django.urls import reverse

from django.db import IntegrityError
from django.contrib.auth.models import User, Group
from django.contrib.auth.decorators import login_required, permission_required
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db.models import Sum
from django.db.models import F
from django.core.cache import cache
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncYear
from django.core.files.storage import default_storage
from django.contrib.auth import update_session_auth_hash


import django_filters
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import status, generics, serializers
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView 


from .serializers import UserRegistrationSerializer, UserLoginSerializer, CompanyRegistrationSerializer, UserLogoutSerializer, UserUpdateSerializer, ChangePasswordSerializer, ProfilePictureSerializer
from .serializers import InventoryItemSerializer
from .serializers import StockAdjustmentSerializer, StockTransferSerializer
from .serializers import LocationSerializer, CategorySerializer

from .serializers import TotalCurrentInventorySerializer

from .models import InventoryItem, User, Company, Location, Category
from .models import StockAdjustment, StockTransfer
from .models import TotalCurrentInventory

from .filters import InventoryItemFilterSet, StockAdjustmentFilterSet, StockTransferFilterSet, TotalCurrentInventoryFilterSet
from .forms import StockLevelsFilterForm

import pandas as pd
import plotly.express as px
import plotly.io as pio
import openpyxl
import uuid
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import timedelta
import logging

# Handles company registration
@api_view(['POST'])
def register_company(request):
    serializer = CompanyRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        company = serializer.save()
        # Generate and assign a unique company code
        company.company_code = uuid.uuid4()
        company.save()
        return Response({
            'message': 'Company registered successfully',
            'company_code': str(company.company_code),
            'company_email': company.company_email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Handles user registration
class UserRegisterView(generics.ListCreateAPIView):
    serializer_class = UserRegistrationSerializer

    def get_queryset(self):
        # Return an empty queryset for registration purposes
        return User.objects.none()

    def post (self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED, headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Login view: Authenticates the user and returns an authentication token if successful.
class UserLoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            token_data = serializer.create(data)
            return Response(token_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Logout view: Deletes the authentication token associated with the user.
class UserLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserLogoutSerializer(data=request.data)
        if serializer.is_valid():
            token_key = serializer.validated_data.get('token')
            try:
                # Invalidate the specific token
                token = Token.objects.get(key=token_key)
                token.delete()
                return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
            except Token.DoesNotExist:
                return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.GenericAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        user = request.user
        data = request.data.copy()
        # Remove profile_picture from the data to prevent it from being updated here
        data.pop('profile_picture', None)
        serializer = self.get_serializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        # Debugging information
        print("PUT request data:", data)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfilePictureUploadView(APIView):
    
    def get(self, request, *args, **kwargs):
        """Handle GET requests to retrieve the profile picture."""
        user = request.user  # Assuming the user is authenticated
        serializer = ProfilePictureSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        """Handle PUT requests to update the profile picture."""
        user = request.user  # Assuming the user is authenticated
        serializer = ProfilePictureSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            # Delete the old profile picture if it exists
            old_picture = user.profile_picture
            if old_picture and default_storage.exists(old_picture.name):
                default_storage.delete(old_picture.name)

            serializer.save()  # Save the new picture
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        """Handle DELETE requests to remove the profile picture."""
        user = request.user  # Assuming the user is authenticated
        old_picture = user.profile_picture
        if old_picture and default_storage.exists(old_picture.name):
            default_storage.delete(old_picture.name)
        user.profile_picture = None
        user.save()
        return Response({'message': 'Profile picture deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

logger = logging.getLogger(__name__)

class ChangePasswordView(UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        # Log request data
        logger.debug(f"Request data: {request.data}")

        if serializer.is_valid():
            old_password = serializer.data.get("old_password")
            new_password = serializer.data.get("new_password")

            # Check old password
            if not self.object.check_password(old_password):
                print("Wrong password.")
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            # Check if new password is not the same as old password
            if old_password == new_password:
                print("New password cannot be the same as the old password.")
                return Response({"new_password": ["New password cannot be the same as the old password."]}, status=status.HTTP_400_BAD_REQUEST)

            # Set and save new password
            self.object.set_password(new_password)
            self.object.save()

            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)

        # Log serializer errors
        logger.debug(f"Serializer errors: {serializer.errors}")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# FIlter Choice
class FilterChoicesView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        company = request.user.company

        # Get date parameters from the request
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Parse date strings into date objects
        start_date = parse_date(start_date) if start_date else None
        end_date = parse_date(end_date) if end_date else None

        # Get categories and locations for the company
        categories = Category.objects.filter(company=company)
        locations = Location.objects.filter(company=company)
        
        # Filter InventoryItems by date range if provided
        items = InventoryItem.objects.filter(company=company)
        if start_date and end_date:
            items = items.filter(inventory_date__range=[start_date, end_date])
        elif start_date:
            items = items.filter(inventory_date__gte=start_date)
        elif end_date:
            items = items.filter(inventory_date__lte=end_date)

        # Serialize the data
        category_serializer = CategorySerializer(categories, many=True)
        location_serializer = LocationSerializer(locations, many=True)
        item_serializer = InventoryItemSerializer(items, many=True)

        # Prepare the filter choices for FROM and TO locations
        from_location = location_serializer.data
        to_location = location_serializer.data

        # Return as JSON
        return Response({
            'categories': category_serializer.data,
            'locations': location_serializer.data,  # This will include all locations
            'items': item_serializer.data,
            'from_locations': from_location,  # Same list for FROM location
            'to_locations': to_location,      # Same list for TO location
        })

# Inventory
class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = InventoryItemFilterSet
    search_fields = ['item_name', 'supplier_name', 'sku', 'product_code']
    ordering_fields = ['inventory_date']
    ordering = ['-inventory_date']
    
    def get_queryset(self):
        company = self.request.user.company
        queryset = InventoryItem.objects.filter(company=company).order_by('inventory_date')
        for backend in self.filter_backends:
            if hasattr(backend, 'filter_queryset'):
                queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

# Location manager
class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name'] 
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        company = user.company  # Assuming the user has a company attribute
        return Location.objects.filter(company=company)
    
    def perform_update(self, serializer):
        # Ensure that the company field is not changed
        serializer.save()

# Category manager
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        company = user.company  # Assuming the user has a company attribute
        return Category.objects.filter(company=company)

    def perform_update(self, serializer):
        # Ensure that the company field is not changed
        serializer.save()

# Stock Adjustment
class StockAdjustmentListCreateView(generics.ListCreateAPIView):
    serializer_class = StockAdjustmentSerializer
    filterset_class = StockAdjustmentFilterSet
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item__item_name', 'item__sku', 'item__product_code']  # Include product_code in search
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        company = self.request.user.company
        return StockAdjustment.objects.filter(item__company=company).order_by('date')

    def perform_create(self, serializer):
        # Save the StockAdjustment instance, which will trigger the signal to create InventoryItem
        if serializer.is_valid():
            serializer.save(
                company=self.request.user.company,
                user=self.request.user
                )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
             
# Stock Adjustment Detail View
class StockAdjustmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StockAdjustmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company = self.request.user.company
        return StockAdjustment.objects.filter(item__company=company)

# Stock Transfer
class StockTransferCreateView(generics.ListCreateAPIView):
    serializer_class = StockTransferSerializer
    filterset_class = StockTransferFilterSet
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item__item_name', 'item__sku', 'item__product_code', 'date']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        company = self.request.user.company
        return StockTransfer.objects.filter(company=company).order_by('-date')

    def perform_create(self, serializer):
        item = serializer.validated_data.get('item')
        category = item.category if item else None
        # Save the StockTransfer instance, which will trigger the signal to create StockAdjustment and InventoryItem
        serializer.save(
            company=self.request.user.company,
            user=self.request.user,
            category = category
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class StockTransferDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StockTransferSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        company = self.request.user.company
        return StockTransfer.objects.filter(company=company)

    def perform_update(self, serializer):
        # Save the updated StockTransfer instance
        stock_transfer = serializer.save()
        

        # If you need to manually handle updates to related records, you can do it here.
        # However, typically, these updates should be handled by the signal.

    def perform_destroy(self, instance):
        # Handle any additional logic needed before deleting the StockTransfer instance.
        # The deletion of StockAdjustment and InventoryItem records can be handled by signals.
        instance.delete()



class TotalCurrentInventoryView(generics.ListAPIView):
    serializer_class = TotalCurrentInventorySerializer
    filterset_class = TotalCurrentInventoryFilterSet
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['item_name', 'sku', 'product_code']
    ordering_fields = ['total_current_inventory']
    ordering = ['total_current_inventory']

    def get_queryset(self):
        company = self.request.user.company
        return TotalCurrentInventory.objects.filter(company=company)




# Aggregated Inventory Item View for Chartjs
class AggregatedInventoryItemView(generics.GenericAPIView):
    filter_backends = (DjangoFilterBackend,)
    filterset_class = InventoryItemFilterSet

    def get(self, request, *args, **kwargs):
        company = request.user.company
        group_by = request.query_params.get('group_by', '')

        # Create a filterset instance
        filterset = self.filterset_class(request.GET, request=request)

        # Check if the filterset is valid
        if not filterset.is_valid():
            return JsonResponse({'error': 'Invalid filter parameters'}, status=400)

        # Get filtered queryset
        items = filterset.qs

        # Filter items by the current user's company
        items = items.filter(company=company)

        # Aggregate data based on group_by parameter
        if group_by == 'daily':
            items = items.annotate(trunc_date=TruncDay('inventory_date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'weekly':
            items = items.annotate(trunc_date=TruncWeek('inventory_date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'monthly':
            items = items.annotate(trunc_date=TruncMonth('inventory_date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'yearly':
            items = items.annotate(trunc_date=TruncYear('inventory_date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        else:
            items = items.values('inventory_date').annotate(total_quantity=Sum('quantity')).order_by('inventory_date')

        # Format the data for response
        response_data = [
            {
                'trunc_date': item['trunc_date'] if group_by in ['daily', 'weekly', 'monthly', 'yearly'] else item['inventory_date'],
                'total_quantity': item['total_quantity']
            } for item in items
        ]

        return JsonResponse(response_data, safe=False)


# Aggregated Stock Adjustment Item View for Chartjs
class AggregatedStockAdjustmentView(generics.GenericAPIView):
    filter_backends = (DjangoFilterBackend,)
    filterset_class = StockAdjustmentFilterSet

    def get(self, request, *args, **kwargs):
        company = request.user.company
        group_by = request.query_params.get('group_by', '')

        # Create a filterset instance
        filterset = self.filterset_class(request.GET, request=request)

        # Check if the filterset is valid
        if not filterset.is_valid():
            return JsonResponse({'error': 'Invalid filter parameters'}, status=400)

        # Get filtered queryset
        items = filterset.qs

        # Filter items by the current user's company
        items = items.filter(company=company)


        # Aggregate data based on group_by parameter
        if group_by == 'daily':
            items = items.annotate(trunc_date=TruncDay('date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'weekly':
            items = items.annotate(trunc_date=TruncWeek('date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'monthly':
            items = items.annotate(trunc_date=TruncMonth('date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        elif group_by == 'yearly':
            items = items.annotate(trunc_date=TruncYear('date')).values('trunc_date').annotate(total_quantity=Sum('quantity')).order_by('trunc_date')
        else:
            items = items.values('date').annotate(total_quantity=Sum('quantity')).order_by('date')

        # Format the data for response
        response_data = [
            {
                'trunc_date': item['trunc_date'] if group_by in ['daily', 'weekly', 'monthly', 'yearly'] else item['date'],
                'total_quantity': item['total_quantity']
            } for item in items
        ]

        return JsonResponse(response_data, safe=False)

# Aggregated Stock Transfer Item View for Chart.js
class AggregatedStockTransferView(generics.GenericAPIView):
    # Specify the filter backend and the filter set class to be used
    filter_backends = (DjangoFilterBackend,)
    filterset_class = StockTransferFilterSet

    def get(self, request, *args, **kwargs):
        # Retrieve the company associated with the current user
        company = request.user.company
        
        # Get the 'group_by' parameter from the query string (default to an empty string if not provided)
        group_by = request.query_params.get('group_by', '')

        # Create an instance of the filterset with the request data
        filterset = self.filterset_class(request.GET, request=request)

        # Validate the filterset to ensure that all filters are correctly applied
        if not filterset.is_valid():
            return JsonResponse({'error': 'Invalid filter parameters'}, status=400)

        # Retrieve the filtered queryset of items
        items = filterset.qs

        # Filter items by the current user's company
        items = items.filter(company=company)


        # Aggregate data based on the 'group_by' parameter
        if group_by == 'daily':
            # Annotate each item with the truncated day (TruncDay) and calculate the sum of quantities per day
            items = items.annotate(trunc_date=TruncDay('date')) \
                         .values('trunc_date') \
                         .annotate(total_quantity=Sum('quantity')) \
                         .order_by('trunc_date')
        elif group_by == 'weekly':
            # Annotate each item with the truncated week (TruncWeek) and calculate the sum of quantities per week
            items = items.annotate(trunc_date=TruncWeek('date')) \
                         .values('trunc_date') \
                         .annotate(total_quantity=Sum('quantity')) \
                         .order_by('trunc_date')
        elif group_by == 'monthly':
            # Annotate each item with the truncated month (TruncMonth) and calculate the sum of quantities per month
            items = items.annotate(trunc_date=TruncMonth('date')) \
                         .values('trunc_date') \
                         .annotate(total_quantity=Sum('quantity')) \
                         .order_by('trunc_date')
        elif group_by == 'yearly':
            # Annotate each item with the truncated year (TruncYear) and calculate the sum of quantities per year
            items = items.annotate(trunc_date=TruncYear('date')) \
                         .values('trunc_date') \
                         .annotate(total_quantity=Sum('quantity')) \
                         .order_by('trunc_date')
        else:
            # If no 'group_by' parameter is provided, group by the exact date
            items = items.values('date') \
                         .annotate(total_quantity=Sum('quantity')) \
                         .order_by('date')

        # Prepare the response data, formatting the date and total quantity
        response_data = [
            {
                'trunc_date': item['trunc_date'] if group_by in ['daily', 'weekly', 'monthly', 'yearly'] else item['date'],
                'total_quantity': item['total_quantity'],

            } for item in items
        ]

        # Return the aggregated data as a JSON response
        return JsonResponse(response_data, safe=False)



