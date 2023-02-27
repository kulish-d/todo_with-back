from django.urls import path, include
from rest_framework import routers
from tasks import views
from tasks.views import TasksViewSet


router = routers.DefaultRouter()
router.register(r'tasks', TasksViewSet, basename='tasks')


urlpatterns = [
    path('tasks/check_all/', views.TasksViewSet.as_view({'patch': 'partial_update'})),
    path('tasks/delete_all_checked/', views.TasksViewSet.as_view({'delete': 'destroy'})),
    path('', include(router.urls)),
]
