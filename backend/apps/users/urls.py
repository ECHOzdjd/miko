from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'follows', views.FollowViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('register/', views.UserRegistrationView.as_view(), name='user-registration'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.UserLogoutView.as_view(), name='user-logout'),
    path('<int:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('<int:user_id>/posts/', views.UserPostsView.as_view(), name='user-posts'),
    path('<int:user_id>/liked-posts/', views.UserLikedPostsView.as_view(), name='user-liked-posts'),
    path('<int:user_id>/bookmarked-posts/', views.UserBookmarkedPostsView.as_view(), name='user-bookmarked-posts'),
    path('bookmarked-posts/', views.UserBookmarkedPostsView.as_view(), name='my-bookmarked-posts'),
    path('<int:user_id>/followers/', views.UserFollowersView.as_view(), name='user-followers'),
    path('<int:user_id>/following/', views.UserFollowingView.as_view(), name='user-following'),
]
