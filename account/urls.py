from django.conf.urls import url
from django.contrib.auth import views as auth_views

app_name = 'account'
urlpatterns = [
    #url(r'^login/$', auth_views.login, {'template_name': 'account/login.html'}, name='login'),
    #url(r'^logout/$', auth_views.logout, {'next_page': '/upload-file'}, name='logout'),
]
