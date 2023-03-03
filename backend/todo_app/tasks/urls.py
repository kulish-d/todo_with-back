from django.urls import path, include
from rest_framework import routers
from tasks.views import TasksViewSet


router = routers.DefaultRouter()
router.register(r'tasks', TasksViewSet, basename='tasks')

urlpatterns = router.urls
