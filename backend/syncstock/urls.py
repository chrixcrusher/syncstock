from django.urls import path, include
from . import views
from .views import *
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, CategoryViewSet, InventoryItemViewSet, StockAdjustmentListCreateView, StockTransferCreateView, AggregatedInventoryItemView


router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'inventory-items', InventoryItemViewSet)


urlpatterns = [
    # Company Registration API
    path('api/company/register/', views.register_company, name='register-company'),
    # register, login, logout
    path("api/register/", views.UserRegisterView.as_view(), name="register"),
    path('api/login/', views.UserLoginView.as_view(), name='login'),
    path('api/logout/', views.UserLogoutView.as_view(), name='logout'),
    path('api/user-details/', UserDetailView.as_view(), name='user-detail'),
    path('api/profile-picture/', ProfilePictureUploadView.as_view(), name='profile_picture'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # Stock adjustment
    path('api/stock-adjustments/', StockAdjustmentListCreateView.as_view(), name='stock-adjustment-list'),
    path('api/stock-adjustments/<int:pk>/', StockAdjustmentDetailView.as_view(), name='stock-adjustment-detail'),
    
    # Stock transfer
    path('api/stock-transfers/', StockTransferCreateView.as_view(), name='stock-transfer-list'),
    path('api/stock-transfers/<int:pk>/', StockTransferDetailView.as_view(), name='stock-transfer-detail'),


    path('api/total-current-inventory/', TotalCurrentInventoryView.as_view(), name='total-current-inventory'),

    # Include the router's URLs for Location and Category management
    path('', include(router.urls)),
    path('api/', include(router.urls)),
    
    path('api/filters/', FilterChoicesView.as_view(), name='filter-choices'),

    path('api/aggregated-inventory-items/', AggregatedInventoryItemView.as_view(), name='aggregate-inventory-items'),
    path('api/aggregated-stock-adjusments/', AggregatedStockAdjustmentView.as_view(), name='aggregate-stock-adjustments'),
    path('api/aggregated-stock-transfers/', AggregatedStockTransferView.as_view, name='aggregated-stock-transfers'),

]


