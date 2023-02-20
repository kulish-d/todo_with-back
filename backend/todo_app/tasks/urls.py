from django.urls import path
from rest_framework.routers import DefaultRouter

from tasks import views
from tasks.views import TasksViewSet


router = DefaultRouter()
router.register(r'tasks', TasksViewSet, basename='tasks')


urlpatterns = [
    urlpatterns = router.urls,
    # path('tasks/', views.index),
]
