from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from manage_app.views import RentMovie, QueryMovies, ManageMovies, MovieManagementView, MakeRent, RentMoviesFinal
import manage_app.views as views
from django.contrib.auth import views as auth_views

app_name = 'manage_app'
urlpatterns = [
    url(r'^rent_a_movie/$', login_required(RentMovie.as_view()), name='rent_a_movie'),
    url(r'^movies/$', login_required(MovieManagementView.as_view()), name='movies'),
    url(r'^query_movies/$', QueryMovies.as_view(), name='query_movies'),
    url(r'^manage_movie/$', ManageMovies.as_view(), name='manage_movie'),
    url(r'^make_a_rent/$', MakeRent.as_view(), name='make_a_rent'),
    url(r'^rent_movies_final/$', RentMoviesFinal.as_view(), name='rent_movies_final'),

    # Login
    url(r'^$', login_required(views.login_success), name='login_success'),
    url(r'login_success/$', views.login_success, name='login_success'),
    url(r'^login/$', auth_views.login, {'template_name': 'account/login_admin.html'}, name='login'),
    url(r'^logout/$', auth_views.logout, {'next_page': '/login'}, name='logout'),
]
