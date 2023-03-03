from django.urls import path, include
from rest_framework import routers
from tasks.views import TasksViewSet


router = routers.DefaultRouter()
# router.register(r'tasks/check_all/', TasksViewSet.as_view({'patch': 'partial_update'}), basename='tasks')
# router.register(r'tasks/delete_all_checked/', TasksViewSet.as_view({'delete': 'destroy'}), basename='tasks')
router.register(r'tasks', TasksViewSet, basename='tasks')


urlpatterns = router.urls
